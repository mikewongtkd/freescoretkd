package FreeScore::Division;
use base qw( FreeScore::Division::File );
use FreeScore::Athlete;
use FreeScore::Clock;
use FreeScore::Form;
use FreeScore::Round;

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $self = bless {}, $class;
	$self->init( @_ );

	$self->{ _athlete } = new FreeScore::Athlete( $self );
	$self->{ _clock }   = new FreeScore::Clock( $self );
	$self->{ _event }   = FreeScore::Event->event( $self );
	$self->{ _form }    = new FreeScore::Form( $self );
	$self->{ _round }   = new FreeScore::Round( $self );

	return $self;
}

# ============================================================
sub athlete {
# ============================================================
	my $self = shift;
	return $self->{ _athlete };
}

# ============================================================
sub form {
# ============================================================
	my $self = shift;
	return $self->{ _form };
}

# ============================================================
sub round {
# ============================================================
	my $self = shift;
	return $self->{ _round };
}

# ============================================================
sub update {
# ============================================================
	my $self   = shift;
	my $round  = $self->{ _round };
	my $method = $self->{ _method };
	my $rid    = $self->{ current }{ round };

	if( $self->form->complete()) {
		$self->{ placement }{ $round } = $round->placements();
	}

	if( $self->round->complete()) {
		my $nrid                  = $self->round->next(); # next round ID
		$self->{ order }{ $nrid } = $round->advance();
	}
}

1;
