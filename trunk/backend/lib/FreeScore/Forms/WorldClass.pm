package FreeScore::Forms::WorldClass;
use FreeScore;
use FreeScore::Forms;
use FreeScore::Forms::WorldClass::Division;
use base qw( FreeScore::Forms );
use Data::Dumper;

# ============================================================
sub init {
# ============================================================
	my $self       = shift;
	my $tournament = shift;
	my $ring       = shift;
	my $subdir     = "forms-worldclass";

	if( defined $ring ) { 
		# ===== LOAD THE DIVISIONS IN THE SPECiFiED RING
		$self->{ path } = sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $subdir, $ring ); 
		my $divisions = $self->load_ring( $ring );
		$self->{ divisions } = [];
		foreach my $id (@$divisions) {
			push @{ $self->{ divisions }}, new FreeScore::Forms::WorldClass::Division( $self->{ path }, $id, $ring );
		}

	} else { 
		# ==== LOAD THE DIVISIONS IN STAGING
		$self->{ path } = sprintf( "%s/%s/%s", $FreeScore::PATH, $tournament, $subdir ); 
		my ($divisions, $rings) = $self->load_all();
		my $loaded = [];
		foreach my $id (@$divisions) {
			my $division = new FreeScore::Forms::WorldClass::Division( "$self->{ path }/staging", $id );
			$division->{ ring } = 'staging';
			push @$loaded, 
		}

		# ===== LOAD THE DIVISIONS IN EACH RING
		foreach my $ring (@$rings) {
			$self->{ path } = sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $subdir, $ring ); 
			my $ring_divisions = $self->load_ring( $ring );
			foreach my $id (@$ring_divisions) {
				my $division = new FreeScore::Forms::WorldClass::Division( $self->{ path }, $id );
				$division->{ ring } = int( $ring );
				push @$loaded, $division;
			}
		}
		$self->{ divisions } = $loaded;

		# ===== RESTORE THE CURRENT PATH
		$self->{ path } = sprintf( "%s/%s/%s", $FreeScore::PATH, $tournament, $subdir ); 
	}
}

# ============================================================
sub get_only {
# ============================================================
	my $self     = shift;
	my $judge    = shift;
	my $i        = $self->{ current };
	my $division = $self->{ divisions }[ $i ];
	$self->{ divisions } = [ $division ];
	$division->get_only( $judge );
}

# ============================================================
sub navigate {
# ============================================================
	my $self  = shift;
	my $value = shift;
	$self->{ current } = $value;
}

# ============================================================
sub next { 
# ============================================================
	my $self = shift; 
	my $i = $self->{ current }; 
	my $division = $self->current();
	$i = ($i + 1) % int(@{ $self->{ divisions }}); 
	$self->{ current } = $i; 
}

# ============================================================
sub previous { 
# ============================================================
	my $self = shift; 
	my $i = $self->{ current }; 
	$i = ($i - 1) >= 0 ? ($i -1) : $#{ $self->{ divisions }}; 
	$self->{ current } = $i; 
}

1;
