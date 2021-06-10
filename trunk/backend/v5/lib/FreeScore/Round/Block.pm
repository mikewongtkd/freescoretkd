package FreeScore::Round::Block;
use base qw( FreeScore::Component );

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	$self->SUPER::init( $parent );
	my $rid    = shift;
	my $above  = shift || [];
	my $below  = shift || [];
	my $next   = shift || undef;
	my $prev   = shift || undef;

	$self->{ above } = $above;
	$self->{ below } = $below;
	$self->{ next }  = $next;
	$self->{ prev }  = $prev;
}

1;
