package FreeScore::Forms::WorldClass::Method::SingleElimination::Match;
use List::Util qw( all any );
use FreeScore::Forms::WorldClass::Division::Round;
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
	my $round    = $self->method->round();
	my $div      = $self->method->division();
	my $rcode    = $round->{ code };
	my $complete = all { $div->reinstantiate_round( $rcode, $_ )->complete(); } @$order;
	return $complete;
}

# ============================================================
sub contested {
# ============================================================
	my $self  = shift;
	my $order = $self->{ order };
	return 0 if any { $_ < 0 } @$order;
	return 0 if int( @$order ) <= 1;

	return 1;
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
	return 1 if all { $_ < 0 } @$order;

	return 0;
}

# ============================================================
sub first_athlete {
# ============================================================
	my $self  = shift;
	my $order = $self->{ order };
	return undef if $self->empty();
	return undef if $order->[ 0 ] < 0 && int( @$order ) == 1;
	return $order->[ 0 ] if $order->[ 0 ] >= 0;
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
	return undef if $order->[ 0 ] < 0 && int( @$order ) == 1;
	return $order->[ 1 ] if $order->[ 1 ] >= 0;
	return $order->[ 0 ];
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
	return $order->[ 0 ] if( int( @$order ) == 1 && all { $_ >= 0 } @$order);

	# If there's two athletes but one was previously DSQ'd or WDR'n then the other wins
	if( int( @$order ) == 2 ) {
		return $order->[ 0 ] if( $order->[ 1 ] < 0 );
		return $order->[ 1 ] if( $order->[ 0 ] < 0 );
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
	my $self   = shift;
	my $order  = $self->{ order };
	my $round  = $self->method->round();
	my $div    = $self->method->division();

	# If all four athletes from the previous two matches are DSQ'd or WDR'n
	return -1 if all { $_ < 0 } @$order;

	print STDERR "MATCH WINNER STEP 1\n"; # MW
	if( $self->uncontested()) {
		print STDERR "Match is uncontested \n";

		my $winner = $self->uncontested_winner();
		if( $winner ) {
			$self->{ winner } = $winner;
			return $winner;

		} else {
			return -1;
		}
	}

	print STDERR "MATCH WINNER STEP 2\n"; # MW
	my ($winner, $loser) = sort {
		my $x = $div->reinstantiate_round( $round, $a );
		my $y = $div->reinstantiate_round( $round, $b );

		$x->compare( $y );
	} @$order;
	print STDERR "MATCH WINNER winner: $winner, loser: $loser\n"; # MW

	my $punitive = {
		winner => $winner < 0 ? 0 : $div->reinstantiate_round( $round, $winner )->any_punitive_decision(),
		loser  => $loser  < 0 ? 0 : $div->reinstantiate_round( $round, $loser )->any_punitive_decision()
	};
	print STDERR "MATCH WINNER winner punitive: '$punitive->{ winner }', loser punitive: '$punitive->{ loser }'\n"; # MW
	if( $punitive->{ winner }) {
		return -1 if $loser < 0;
		return -1 if( $punitive->{ loser });

		# Loser wins if the winner is DSQ'd or WDR'n
		$self->{ winner } = $loser;
		return $loser;
	}
	print STDERR "MATCH WINNER STEP 3\n"; # MW

	$self->{ winner } = $winner;
	return $winner;
}

1
