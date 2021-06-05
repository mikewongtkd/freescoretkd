package FreeScore::Event::Recognized;
use base qw( FreeScore::Event );

use FreeScore::Event::Recognized::Ranking;
use FreeScore::Event::Recognized::Score;

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	$self->SUPER::init( $parent );
	$self->{ _form }    = new FreeScore::Event::Recognized::Form( $self );
	$self->{ _ranking } = new FreeScore::Event::Recognized::Ranking( $self );
	$self->{ _score }   = new FreeScore::Event::Recognized::Score( $self );
}

# ============================================================
# COMPONENTS
# ============================================================
sub form    { my $self = shift; return $self->{ _form };    }
sub ranking { my $self = shift; return $self->{ _ranking }; }
sub score   { my $self = shift; return $self->{ _score };   }
}

1;
