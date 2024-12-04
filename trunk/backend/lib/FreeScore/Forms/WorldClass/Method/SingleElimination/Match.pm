package FreeScore::Forms::WorldClass::Method::SingleElimination::Match;
use List::Util qw( all any );

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $self = shift;
	bless $self, $class;
	return $self;
}

# ============================================================
sub chung {
# ============================================================
	my $self = shift;
	return undef if $self->empty();
	return undef if $self->[ 0 ] < 0;
	return $self->[ 0 ];
}

# ============================================================
sub contested {
# ============================================================
	my $self = shift;
	return 0 if any { $_ < 0 } @$self;
	return 0 if int( @$self ) <= 1;

	return 1;
}

# ============================================================
sub empty {
# ============================================================
	my $self = shift;
	return 1 if int( @$self ) == 0;
	return 1 if all { $_ < 0 } @$self;

	return 0;
}

# ============================================================
sub first_athlete {
# ============================================================
	my $self = shift;
	return undef if $self->empty();
	return undef if $self->[ 0 ] < 0 && int( @$self ) == 1;
	return $self->[ 0 ] if $self->[ 0 ] >= 0;
	return $self->[ 1 ];
}

# ============================================================
sub has {
# ============================================================
	my $self = shift;
	my $i    = shift;
	return any { $_ == $i } @$self;
}

# ============================================================
sub hong {
# ============================================================
	my $self = shift;
	return undef if $self->empty();
	return undef if int( @$self ) == 1;
	return undef if $self->[ 1 ] < 0;
	return $self->[ 1 ];
}

# ============================================================
sub last_athlete {
# ============================================================
	my $self = shift;
	return undef if $self->empty();
	return undef if $self->[ 0 ] < 0 && int( @$self ) == 1;
	return $self->[ 1 ] if $self->[ 1 ] >= 0;
	return $self->[ 0 ];
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
	my $self = shift;
	return undef unless $self->uncontested();

	return $self->[ 0 ] if( int( @$self ) == 1 && all { $_ >= 0 } @$self);
	if( int( @$self ) == 2 ) {
		return $self->[ 0 ] if( $self->[ 1 ] < 0 );
		return $self->[ 1 ] if( $self->[ 0 ] < 0 );
	}

	return undef;
}

# ============================================================
sub valid {
# ============================================================
	my $self = shift;
	return ! $self->empty();
}

1
