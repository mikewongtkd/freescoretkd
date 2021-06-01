package FreeScore::Method::SingleElimination;
use base qw( FreeScore::Method );

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	$self->SUPER::init( $parent );
	$self->{ name }   = 'single-elim';
	$self->{ rounds } = [ qw( ro256 ro128 ro64 ro32 ro16 ro8 ro4 ro2 )];
}

1;
