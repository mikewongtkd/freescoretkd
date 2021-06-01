package FreeScore::Method::Combination;
use base qw( FreeScore::Method );

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	$self->SUPER::init( $parent );
	$self->{ name }   = 'combination';
	$self->{ rounds } = [ qw( prelim semfin r08 r04 r02 )];
}
1;
