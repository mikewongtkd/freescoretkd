package FreeScore::Forms::FreeStyle;
use FreeScore;
use FreeScore::Forms;
use FreeScore::Forms::FreeStyle::Division;
use base qw( FreeScore::Forms );

our $SUBDIR = "forms-freestyle";

# ============================================================
sub init {
# ============================================================
	my $self       = shift;
	my $tournament = shift;
	my $ring       = shift;

	if( defined $ring ) { 
		$self->{ path } = sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $SUBDIR, $ring ); 
		my $divisions = $self->load_ring( $ring ); # reads $self->{ divisions } from ring progress file

		# ===== SUBSTITUTE DIVISION NAMES WITH INFORMATION FROM DIVISION FILES
		$self->{ divisions } = [];
		foreach my $id (@$divisions) {
			push @{ $self->{ divisions }}, new FreeScore::Forms::FreeStyle::Division( $self->{ path }, $id, $ring );
		}

	} else { 
		$self->{ path } = sprintf( "%s/%s/%s", $FreeScore::PATH, $tournament, $SUBDIR ); 
		my ($divisions, $rings) = $self->load_all(); # reads $self->{ divisions } from event progress file

		# ===== SUBSTITUTE DIVISION NAMES WITH INFORMATION FROM DIVISION FILES
		$self->{ divisions } = [];
		foreach my $id (@$divisions) {
			push @{ $self->{ divisions }}, new FreeScore::Forms::FreeStyle::Division( $self->{ path }, $id );
		}

		# ===== LOAD EACH RING
		foreach my $ring (@$rings) {
			$self->{ path } = sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $SUBDIR, $ring ); 
			my $ring_divisions = $self->load_ring( $ring );
			foreach my $id (@$ring_divisions) {
				push @{ $self->{ divisions }}, new FreeScore::Forms::FreeStyle::Division( $self->{ path }, $id, $ring );
			}
		}

		# ===== RESTORE THE CURRENT PATH
		$self->{ path } = sprintf( "%s/%s/%s", $FreeScore::PATH, $tournament, $SUBDIR ); 
	}
}

1;
