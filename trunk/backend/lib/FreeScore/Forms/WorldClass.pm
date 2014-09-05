package FreeScore::Forms::WorldClass;
use FreeScore;
use FreeScore::Forms;
use FreeScore::Forms::WorldClass::Division;
use base qw( FreeScore::Forms );

# ============================================================
sub init {
# ============================================================
	my $self       = shift;
	my $tournament = shift;
	my $ring       = shift;
	my $subdir     = "forms-worldclass";
	if( defined $ring ) { $self->{ path } = sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $subdir, $ring ); }
	else                { $self->{ path } = sprintf( "%s/%s/%s",          $FreeScore::PATH, $tournament, $subdir        ); }
	$self->pre_init( $tournament, $ring );
	@{ $self->{ divisions }} = map {
		new FreeScore::Forms::WorldClass::Division( $self->{ path }, $_ );
	} @{ $self->{ divisions }};
}

1;
