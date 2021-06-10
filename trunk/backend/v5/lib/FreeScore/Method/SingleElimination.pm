package FreeScore::Method::SingleElimination;
use base qw( FreeScore::Method );
use POSIX qw( ceil floor );
use FreeScore::Round::Block;

# ============================================================
sub init {
# ============================================================
	my $self   = shift;
	my $parent = shift;
	$self->SUPER::init( $parent );
	$self->{ name } = 'single-elim';
}

# ============================================================
sub build_brackets {
# ============================================================
	my $self     = shift;
	my $division = $self->parent();
	my $athletes = $division->{ athletes };
	my $n        = int( @$athletes );

	die "Division configuration error: No athletes assigned to division $!" unless $n > 0;

	my $depth    = ceil( log( $n ) / log( 2 ));
	my $start    = 2 ** $depth;
	my $blocks   = 2 ** ($depth - 1);
	my $root     = undef;

	foreach my $y ( 0 .. ($depth - 1)) {
		my $parent   = [];
		my $children = [];
		my $width    = 2 ** ($depth - ($y + 1));
		my $count    = 2 ** ($depth - $y);
		my $prev     = undef;

		foreach my $x ( 0 .. ($width - 1 )) {
			my $group = chr( ord( 'a' ) + $x );
			my $bid   = sprintf( "ro%d%s", $count, $group ); # e.g. ro8a, ro8b, etc.

			# MW Connect up the blocks

			$root = $block if( $depth == $y + 1 );
		}
	}
	$self->{ rounds } = $root;
}

1;
