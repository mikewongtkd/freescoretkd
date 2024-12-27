package FreeScore::Forms::WorldClass::Method::SingleElimination::Match;
use List::Util qw( all any );
use FreeScore::Forms::WorldClass::Division::Round;

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
	my $method   = shift;

	$self->{ order }  = $athletes;
	$self->{ chung  } = $athletes->[ 0 ];
	$self->{ hong  }  = $athletes->[ 1 ];
	$self->{ number } = $number;
	$self->{ method } = $method;
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
sub contested {
# ============================================================
	my $self  = shift;
	my $order = $self->{ order };
	return 0 if any { $_ < 0 } @$order;
	return 0 if int( @$order ) <= 1;

	return 1;
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
	return undef unless $self->uncontested();

	return $order->[ 0 ] if( int( @$order ) == 1 && all { $_ >= 0 } @$order);
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
	my $method = $self->{ method };
	my $order  = $self->{ order };
	my $round  = $method->round();
	my $rcode  = $round->{ code };
	my $div    = $method->division();

	if( $self->uncontested()) {
		print STDERR "Match is uncontested \n";
		return $self->uncontested_winner();
	}

	my ($winner, $loser) = sort {
		my $x = $div->reinstantiate_round( $rcode, $a );
		my $y = $div->reinstantiate_round( $rcode, $b );

		$x->compare( $y );
	} @$order;

	if( $div->reinstantiate_round( $rcode, $winner )->any_punitative_decision()) {
		return -1 if $loser < 0;
		return -1 if( $div->reinstantiate_round( $rcode, $loser )->any_punitative_decision());

		return $loser if( $loser >= 0 );
	}

	return $winner;
}

1
