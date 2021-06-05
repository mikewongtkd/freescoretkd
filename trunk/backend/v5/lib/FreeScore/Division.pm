package FreeScore::Division;
use base qw( FreeScore::Clonable FreeScore::Division::File );
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
	$self->{ _event }   = FreeScore::Event->factory( $self );
	$self->{ _method }  = FreeScore::Method->factory( $self );
	$self->{ _round }   = new FreeScore::Round( $self );

	return $self;
}


# ============================================================
sub judges {
# ============================================================
	my $self = shift;
	return $self->{ judges };
}

# ============================================================
sub update {
# ============================================================
	my $self       = shift;
	my $event      = $self->event();
	my $method     = $self->method();
	my $round      = $self->round->current();
	my $rid        = $round->id();
	my $athletes   = $round->athletes();
	my $placements = [];

	if( $event->form->complete()) {
		$placements = $round->place( $athletes );
		$self->{ placement }{ $rid } = $placements;
	}

	if( $self->round->complete()) {
		my $next = $self->round->next();
		my $nrid = $next->id();

		$self->{ order }{ $nrid } = $next->advance( $placements );
	}
}

# ============================================================
# COMPONENTS
# ============================================================
sub athlete { my $self = shift; return $self->{ _athlete }; }
sub clock   { my $self = shift; return $self->{ _clock };   }
sub event   { my $self = shift; return $self->{ _event };   }
sub method  { my $self = shift; return $self->{ _method };  }
sub round   { my $self = shift; return $self->{ _round };   }

1;
