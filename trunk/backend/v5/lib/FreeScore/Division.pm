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
	my $event  = $self->{ _event };
	my $method = $self->{ _event };
	my $rid    = $self->{ current }{ round };

	if( $self->form->complete()) {
		$self->{ placement }{ $round } = $event->update_placements();
	}

	if( $self->round->complete()) {
		my $nrid                  = $self->round->next(); # next round ID
		$self->{ order }{ $nrid } = $event->update_advancements();
	}
}

1;
