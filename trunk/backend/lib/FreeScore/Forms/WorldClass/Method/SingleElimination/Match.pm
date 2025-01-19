package FreeScore::Forms::WorldClass::Method::SingleElimination::Match;
use List::Util qw( all any none );
use FreeScore::Forms::WorldClass::Division::Round;
use base qw( Clone );
use Data::Dumper;

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $self = {};
	bless $self, $class;
	$self->init( @_ );
	return $self;
}

# ============================================================
sub init {
# ============================================================
	my $self     = shift;
	my $athletes = shift;
	my $number   = shift;
	my $matches  = shift;

	$self->{ order }   = $athletes;
	$self->{ chung  }  = $athletes->[ 0 ];
	$self->{ hong  }   = $athletes->[ 1 ];
	$self->{ number }  = $number;
	$self->{ matches } = $matches;
}

# ============================================================
sub chung {
# ============================================================
	my $self = shift;
	return undef if $self->empty();
	return undef unless exists $self->{ chung } && defined $self->{ chung };
	return $self->{ chung };
}

# ============================================================
sub compare {
# ============================================================
	my $self   = shift;
	my $other  = shift;

	return $other->method->round() cmp $self->method->round() || $self->{ number } <=> $other->{ number };
}

# ============================================================
sub complete {
# ============================================================
	my $self     = shift;
	my $order    = $self->{ order };
	my $rcode    = $self->method->rcode();
	my $div      = $self->method->division();
	my $complete = all { $div->reinstantiate_round( $rcode, $_ )->complete(); } @$order;
	return $complete;
}

# ============================================================
sub contested {
# ============================================================
	my $self  = shift;
	my $order = $self->{ order };
	return 1 if any { defined $_ } @$order;
	return 0 if int( @$order ) <= 1;

	return 1;
}

# ============================================================
sub declare_winner {
# ============================================================
	my $self   = shift;
	my $winner = shift;
	my $rcode  = $self->method->rcode();
	my $div    = $self->method->division();

	if( $winner eq 'none' ) { # MW
		print STDERR "----------------------------------------\n"; # MW
		print STDERR uc( $rcode ) . " Match $self->{ number } -> No winner\n"; # MW
		print STDERR "----------------------------------------\n"; # MW
	} else { # MW
		my $athlete = $div->{ athletes }[ $winner ]; # MW
		print STDERR "----------------------------------------\n"; # MW
		print STDERR uc( $rcode ) . " Match $self->{ number } -> [$winner] $athlete->{ name }\n"; # MW
		print STDERR "----------------------------------------\n"; # MW
	} # MW
	$self->{ winner } = $winner = $winner eq 'none' ? undef : $winner;

	$div->{ matches }{ $rcode } = $self->matches->data() unless exists( $div->{ matches }{ $rcode });

	return $winner;
}

# ============================================================
sub division {
# ============================================================
	my $self = shift;
	my $div  = $self->method->division();
}

# ============================================================
sub empty {
# ============================================================
	my $self  = shift;
	my $order = $self->{ order };
	return 1 if int( @$order ) == 0;
	return 1 if none { defined $_ } @$order;

	return 0;
}

# ============================================================
sub first_athlete {
# ============================================================
	my $self  = shift;
	my $order = $self->{ order };
	return undef if $self->empty();
	return undef if int( @$order ) == 1 && ! defined $order->[ 0 ];
	return $order->[ 0 ] if defined $order->[ 0 ];
	return $order->[ 1 ];
}

# ============================================================
sub has {
# ============================================================
	my $self  = shift;
	my $i     = shift;
	my $order = $self->{ order };
	return any { $_ == $i } @$order;
}

# ============================================================
sub hong {
# ============================================================
	my $self  = shift;
	my $order = $self->{ order };
	return undef if $self->empty();
	return undef if int( @$order ) == 1;
	return undef unless exists $self->{ hong } && defined $self->{ hong };
	return $self->{ hong };
}

# ============================================================
sub is_last {
# ============================================================
	my $self = shift;
	my $last = $self->{ matches }->last();

	return $self->compare( $last ) == 0;
}

# ============================================================
sub last_athlete {
# ============================================================
	my $self  = shift;
	my $order = $self->{ order };
	return undef if $self->empty();
	return undef if int( @$order ) == 1 && ! defined $order->[ 0 ];
	return $order->[ 1 ] if defined $order->[ 1 ];
	return $order->[ 0 ];
}

# ============================================================
sub matches {
# ============================================================
	my $self = shift;
	return $self->{ matches };
}

# ============================================================
sub method {
# ============================================================
	my $self   = shift;
	my $method = $self->{ matches }{ method };
	return $method;
}

# ============================================================
sub round {
# ============================================================
	my $self  = shift;
	my $round = $self->method->round();
	my $rcode = $round->{ code };

	return $rcode;
}

# ============================================================
sub uncontested {
# ============================================================
	my $self = shift;
	return ! $self->contested();
}

# ============================================================
sub uncontested_winner {
# ============================================================
	my $self  = shift;
	my $order = $self->{ order };
	return undef if $self->contested();

	# If there's only one athlete in the match then that athlete wins
	return $order->[ 0 ] if( int( @$order ) == 1 && all { defined $_ } @$order);

	# If there's two athletes but one was previously DSQ'd or WDR'n then the other wins
	if( int( @$order ) == 2 ) {
		return $order->[ 0 ] unless defined $order->[ 1 ];
		return $order->[ 1 ] unless defined $order->[ 0 ];
	}

	return undef;
}

# ============================================================
sub valid {
# ============================================================
	my $self = shift;
	return ! $self->empty();
}

# ============================================================
sub winner {
# ============================================================
	my $self  = shift;
	my $order = $self->{ order };
	my $rcode = $self->method->rcode();
	my $div   = $self->method->division();

	print STDERR "============================================================\n"; # MW
	print STDERR "MATCH $self->{ number }\n"; # MW
	my $clone = $self->clone(); # MW
	delete $clone->{ matches }; # MW
	print STDERR Dumper $clone; # MW
	print STDERR "MATCH WINNER: STEP 1\n"; # MW
	# If no-one advanced from the previous two matches
	return $self->declare_winner( 'none' ) if none { defined $_ } @$order;

	print STDERR "MATCH WINNER: STEP 2\n"; # MW
	if( $self->uncontested()) {
		my $winner = $self->uncontested_winner();
		if( $winner ) {
			return $self->declare_winner( $winner );

		} else {
			return $self->declare_winner( 'none' );
		}
	}

	print STDERR "MATCH WINNER: STEP 3\n"; # MW
	my ($winner, $loser) = sort {
		my $x = $div->reinstantiate_round( $rcode, $a );
		my $y = $div->reinstantiate_round( $rcode, $b );

		print STDERR Dumper "CHUNG ($a) $div->{ athletes }[ $a ]{ name }:", $x->{ adjusted }, $x->{ total }; # MW
		print STDERR Dumper "HONG ($b) $div->{ athletes }[ $b ]{ name }:", $y->{ adjusted }, $y->{ total }; # MW
		print STDERR "Comparison: '" . $x->compare( $y ) . "'\n"; # MW

		$x->compare( $y );
	} ($self->{ chung }, $self->{ hong });

	print STDERR "winner: '$winner', loser: '$loser'\n"; # MW
	print STDERR "MATCH WINNER: STEP 4\n"; # MW
	my $punitive = {
		winner => defined $winner ? $div->reinstantiate_round( $rcode, $winner )->any_punitive_decision() : 0,
		loser  => defined $loser  ? $div->reinstantiate_round( $rcode, $loser )->any_punitive_decision()  : 0
	};

	print STDERR "MATCH WINNER: STEP 5\n"; # MW
	if( $punitive->{ winner }) {
		return $self->declare_winner( 'none' ) unless defined $loser;
		return $self->declare_winner( 'none' ) if $punitive->{ loser };

		# Loser wins if the winner is DSQ'd or WDR'n
		return $self->declare_winner( $loser );
	}

	print STDERR "MATCH WINNER: STEP 6\n"; # MW
	return $self->declare_winner( $winner );
}

1
