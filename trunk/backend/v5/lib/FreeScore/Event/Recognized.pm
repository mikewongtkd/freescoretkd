package FreeScore::Event::Recognized;
use base qw( FreeScore::Event );

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	$self->SUPER::init( $parent );
	$self->{ _score } = new FreeScore::Event::Recognized::Score( $self );
}

# ============================================================
sub score {
# ============================================================
}

1;
