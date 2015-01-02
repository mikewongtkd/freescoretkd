package FreeScore::Forms::GrassRoots;
use FreeScore;
use FreeScore::Forms;
use FreeScore::Forms::GrassRoots::Division;
use base qw( FreeScore::Forms );

# ============================================================
sub checksum {
# ============================================================
	my $tournament  = shift;
	my $ring        = shift;
	my $subdir      = "forms-grassroots";
	my $path        = sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $subdir, $ring );
	my $progress    = "$path/progress.txt";
	my $progress_cs = "$path/progress.chk";
	my $checksum    = undef;

	if( -e $progress_cs ) {
		$checksum = `cat $progress_cs`;
		chomp $checksum;

	} else {
		my @divisions  = ();
		opendir DIR, $path or die "Can't open directory '$path' $!";
		my %assigned = map { /^div\.([\w\.]+)\.txt$/; ( $1 => 1 ); } grep { /^div\.[\w\.]+\.txt$/ } readdir DIR;
		closedir DIR;
		push @divisions, sort keys %assigned;
		my $divisions = join " ", map { my $checksum_file = "$path/div.$_.chk"; -e $checksum_file ? $checksum_file : (); } @divisions;

		$checksum = `cat $progress $divisions | md5 -q`;
		chomp $checksum;
	}

	return $checksum;
}

# ============================================================
sub init {
# ============================================================
	my $self       = shift;
	my $tournament = shift;
	my $ring       = shift;
	my $subdir     = "forms-grassroots";

	if( defined $ring ) { 
		$self->{ path } = sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $subdir, $ring ); 
		my $divisions = $self->load_ring( $ring ); # reads $self->{ divisions } from ring progress file

		# ===== SUBSTITUTE DIVISION NAMES WITH INFORMATION FROM DIVISION FILES
		$self->{ divisions } = [];
		foreach my $id (@$divisions) {
			push @{ $self->{ divisions }}, new FreeScore::Forms::GrassRoots::Division( $self->{ path }, $id, $ring );
		}

	} else { 
		$self->{ path } = sprintf( "%s/%s/%s", $FreeScore::PATH, $tournament, $subdir ); 
		my ($divisions, $rings) = $self->load_all(); # reads $self->{ divisions } from event progress file

		# ===== SUBSTITUTE DIVISION NAMES WITH INFORMATION FROM DIVISION FILES
		$self->{ divisions } = [];
		foreach my $id (@$divisions) {
			push @{ $self->{ divisions }}, new FreeScore::Forms::GrassRoots::Division( $self->{ path }, $id );
		}

		# ===== LOAD EACH RING
		foreach my $ring (@$rings) {
			$self->{ path } = sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $subdir, $ring ); 
			my $ring_divisions = $self->load_ring( $ring );
			foreach my $id (@$ring_divisions) {
				push @{ $self->{ divisions }}, new FreeScore::Forms::GrassRoots::Division( $self->{ path }, $id, $ring );
			}
		}

		# ===== RESTORE THE CURRENT PATH
		$self->{ path } = sprintf( "%s/%s/%s", $FreeScore::PATH, $tournament, $subdir ); 
	}
}

1;
