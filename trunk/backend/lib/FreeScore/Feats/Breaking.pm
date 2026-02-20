package FreeScore::Feats::Breaking;
use FreeScore;
use FreeScore::Feats;
use FreeScore::Feats::Breaking::Division;
use base qw( FreeScore::Feats );

our $SUBDIR = "feats-breaking";

# ============================================================
sub init {
# ============================================================
	my $self       = shift;
	my $tournament = shift;
	my $ring       = shift;

	if( defined $ring ) { 
		$self->{ path } = $ring eq 'staging' ? sprintf( "%s/%s/%s/%s", $FreeScore::PATH, $tournament, $SUBDIR, $ring ) : sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $SUBDIR, $ring ); 
		my $divisions = $self->load_ring(); # reads $self->{ divisions } from ring progress file

		# ===== SUBSTITUTE DIVISION NAMES WITH INFORMATION FROM DIVISION FILES
		$self->{ divisions } = [];
		foreach my $id (@$divisions) {
			push @{ $self->{ divisions }}, new FreeScore::Feats::Breaking::Division( $self->{ path }, $id, $ring );
		}

	} else { 
		$self->{ path } = sprintf( "%s/%s/%s", $FreeScore::PATH, $tournament, $SUBDIR ); 
		my ($divisions, $rings) = $self->load_all(); # reads $self->{ divisions } from event progress file

		# ===== SUBSTITUTE DIVISION NAMES WITH INFORMATION FROM DIVISION FILES
		$self->{ divisions } = [];
		foreach my $id (@$divisions) {
			push @{ $self->{ divisions }}, new FreeScore::Feats::Breaking::Division( $self->{ path }, $id );
		}

		# ===== LOAD EACH RING
		my $current = {};
		foreach my $ring (@$rings) {
			$self->{ path } = sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $SUBDIR, $ring ); 
			my $ring_divisions = $self->load_ring();
			$current->{ $ring } = $self->{ current };
			foreach my $id (@$ring_divisions) {
				push @{ $self->{ divisions }}, new FreeScore::Feats::Breaking::Division( $self->{ path }, $id, $ring );
			}
		}
		$self->{ current } = $current;

		# ===== RESTORE THE CURRENT PATH
		$self->{ path } = sprintf( "%s/%s/%s", $FreeScore::PATH, $tournament, $SUBDIR ); 
	}
}

# ============================================================
sub create_division {
# ============================================================
	my $self     = shift;
	my $divid    = shift;
	my $division = new FreeScore::Feats::Breaking::Division( $self->{ path }, $divid );

	$division->{ file } = "$self->{ path }/div.$divid.txt";

	return $division;
}

1;
