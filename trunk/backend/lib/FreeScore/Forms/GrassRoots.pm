package FreeScore::Forms::GrassRoots;
use FreeScore;
use FreeScore::Forms;
use FreeScore::Forms::GrassRoots::Division;
use base qw( FreeScore::Forms );

our $SUBDIR = "forms-grassroots";

# ============================================================
sub init {
# ============================================================
	my $self       = shift;
	my $tournament = shift;
	my $ring       = shift;

	if( defined $ring ) { 
		$self->{ path } = $ring eq 'staging' ? sprintf( "%s/%s/%s/%s", $FreeScore::PATH, $tournament, $SUBDIR, $ring ) : sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $SUBDIR, $ring ); 
		my $divisions = $self->load_ring( $ring ); # reads $self->{ divisions } from ring progress file

		# ===== SUBSTITUTE DIVISION NAMES WITH INFORMATION FROM DIVISION FILES
		$self->{ divisions } = [];
		foreach my $id (@$divisions) {
			push @{ $self->{ divisions }}, new FreeScore::Forms::GrassRoots::Division( $self->{ path }, $id, $ring );
		}

	} else { 
		$self->{ path } = sprintf( "%s/%s/%s", $FreeScore::PATH, $tournament, $SUBDIR ); 
		my ($divisions, $rings) = $self->load_all(); # reads $self->{ divisions } from event progress file

		# ===== SUBSTITUTE DIVISION NAMES WITH INFORMATION FROM DIVISION FILES
		$self->{ divisions } = [];
		foreach my $id (@$divisions) {
			push @{ $self->{ divisions }}, new FreeScore::Forms::GrassRoots::Division( $self->{ path }, $id );
		}

		# ===== LOAD EACH RING
		foreach my $ring (@$rings) {
			$self->{ path } = sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $SUBDIR, $ring ); 
			my $ring_divisions = $self->load_ring( $ring );
			foreach my $id (@$ring_divisions) {
				push @{ $self->{ divisions }}, new FreeScore::Forms::GrassRoots::Division( $self->{ path }, $id, $ring );
			}
		}

		# ===== RESTORE THE CURRENT PATH
		$self->{ path } = sprintf( "%s/%s/%s", $FreeScore::PATH, $tournament, $SUBDIR ); 
	}
}

# ============================================================
sub create_division {
# ============================================================
	my $self     = shift;
	my $divid    = shift;
	my $division = new FreeScore::Forms::GrassRoots::Division( $self->{ path }, $divid );

	$division->{ file } = "$self->{ path }/div.$divid.txt";

	return $division;
}

1;
