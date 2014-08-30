package FreeScore::Forms::GrassRoots;
use FreeScore;
use FreeScore::Forms;
our @ISA = qw( FreeScore::Forms );

# ============================================================
sub init {
# ============================================================
	my $self       = shift;
	my $tournament = shift;
	my $ring       = shift;
	my $subdir     = "forms-grassroots";

	if( defined $ring ) { $self->{ path } = sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $subdir, $ring ); }
	else                { $self->{ path } = sprintf( "%s/%s/%s",          $FreeScore::PATH, $tournament, $subdir        ); }
	$self->SUPER::init( $tournament, $ring );
}

1;
