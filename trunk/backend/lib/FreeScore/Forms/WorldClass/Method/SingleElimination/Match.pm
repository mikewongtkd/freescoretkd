package FreeScore::Forms::WorldClass::Method::SingleElimination::Match;
use List::Util qw( all any none );
use List::MoreUtils qw( first_index );
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

	$self->{ order }   = [ map { int( $_ ) } @$athletes ];
	$self->{ chung  }  = int( $athletes->[ 0 ]);
	$self->{ hong  }   = int( $athletes->[ 1 ]);
	$self->{ number }  = int( $number );
	$self->{ matches } = $matches;

	my $div      = $self->method->division();
	my $rcode    = $self->method->rcode();

	$self->winner() if( $self->complete());
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
	return defined $self->{ chung } && defined $self->{ hong } ? 1 : 0;
}

# ============================================================
sub declare_winner {
# ============================================================
	my $self   = shift;
	my $winner = shift;

	$self->{ winner } = $winner = $winner eq 'none' || ! defined $winner ? undef : int( $winner );

=pod
	my $rcode  = uc $self->method->rcode(); # MW
	print STDERR "----------------------------------------\n"; # MW
	print STDERR "MATCH - DECLARE WINNER - $rcode Match $self->{ number } - $winner\n"; # MW
	print STDERR "----------------------------------------\n"; # MW
=cut

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
	my $div   = $self->method->division();
	return undef if $self->empty();

	my ($first) = grep { defined $_ } ($self->{ chung }, $self->{ hong });
	return $first;
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
	my $div   = $self->method->division();
	return undef if $self->empty();

	my ($last) = grep { defined $_ } ($self->{ hong }, $self->{ chung });

	return $last;
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

	# If no-one advanced from the previous two matches
	return $self->declare_winner( 'none' ) if none { defined $_ } @$order;

	if( ! $self->contested()) {
		return $self->declare_winner( $self->{ chung }) if defined $self->{ chung };
		return $self->declare_winner( $self->{ hong })  if defined $self->{ hong };
		return $self->declare_winner( 'none' );
	}

	my ($winner, $loser) = sort {
		my $x = $div->reinstantiate_round( $rcode, $a );
		my $y = $div->reinstantiate_round( $rcode, $b );

		$x->compare( $y );
	} ($self->{ chung }, $self->{ hong });

	my $punitive = {
		winner => defined $winner ? $div->reinstantiate_round( $rcode, $winner )->any_punitive_decision() : 0,
		loser  => defined $loser  ? $div->reinstantiate_round( $rcode, $loser )->any_punitive_decision()  : 0
	};

	if( $punitive->{ winner }) {
		return $self->declare_winner( 'none' ) unless defined $loser; # Winner DSQ/WDR in this round, loser DSQ/WDR in previous round
		return $self->declare_winner( 'none' ) if $punitive->{ loser }; # Both contestants DSQ/WDR in this round

		return $self->declare_winner( $loser ); # Loser wins if the winner is DSQ'd or WDR'n
	}

	return $self->declare_winner( $winner );
}

1
