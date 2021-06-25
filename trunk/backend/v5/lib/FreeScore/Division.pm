package FreeScore::Division;
use base qw( FreeScore::Clonable );
use FreeScore;
use FreeScore::Athlete;
use FreeScore::Clock;
use FreeScore::DB;
use FreeScore::Form;
use FreeScore::Round;

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $self = bless {}, $class;
	$self->init( @_ );

	return $self;
}

# ============================================================
sub init {
# ============================================================
	my $self   = shift;

	# Default values
	$self->{ event }  = 'recognized' unless $self->{ event };
	$self->{ method } = 'cutoff'     unless $self->{ method };

	$self->{ _athlete } = new FreeScore::Athlete( $self );
	$self->{ _event }   = FreeScore::Event->factory( $self );
	$self->{ _info }    = FreeScore::Info( $self );
	$self->{ _method }  = FreeScore::Method->factory( $self );

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
