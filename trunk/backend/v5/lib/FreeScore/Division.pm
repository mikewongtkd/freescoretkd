package FreeScore::Division;
use FreeScore::Athlete;
use FreeScore::Form;
use FreeScore::Round;

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $self = bless {}, $class;
	$self->init( @_ );

	$self->{ _athlete } = new FreeScore::Athlete( $self );
	$self->{ _form }    = new FreeScore::Form( $self );
	$self->{ _round }   = new FreeScore::Round( $self );

	return $self;
}

# ============================================================
sub athlete {
# ============================================================
	return $self->{ _athlete };
}

# ============================================================
sub form {
# ============================================================
	return $self->{ _form };
}

# ============================================================
sub round {
# ============================================================
	return $self->{ _round };
}

1;
