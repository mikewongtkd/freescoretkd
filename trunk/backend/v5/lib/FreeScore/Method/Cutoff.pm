package FreeScore::Method::Cutoff;
use base qw( FreeScore::Method );

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	$self->SUPER::init( $parent );
	$self->{ name }   = 'cutoff';
	$self->{ rounds } = [ qw( prelim semfin finals )];
}

1;
