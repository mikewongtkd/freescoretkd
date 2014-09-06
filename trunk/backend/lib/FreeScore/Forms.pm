package FreeScore::Forms;
use FreeScore;
use FreeScore::Forms::Division;

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $self = bless {}, $class;
	$self->{ divisions } = [];
	$self->init( @_ );
	return $self;
}

# ============================================================
sub load_ring {
# ============================================================
	my $self       = shift;
	my $ring       = shift;

	$self->{ file } = "$self->{ path }/progress.txt";

	if( -e $self->{ file } ) {
		open FILE, $self->{ file };
		while( <FILE> ) {
			chomp;
			next if /^\s*$/;

			# ===== READ DIVISION PROGRESS STATE INFORMATION
			if( /^#/ ) {
				s/^#\s+//;
				my ($key, $value) = split /=/;
				$self->{ $key } = $value;
				next;
			}
		}
		close FILE;
	}

	# ===== FIND ALL DIVISIONS
	opendir DIR, $self->{ path } or die "Can't open directory '$self->{ path }' $!";
	my @divisions = map { /^div\.(\w+)\.txt$/; } grep { /^div\.\w+\.txt$/ } readdir DIR;
	closedir DIR;

	$self->{ current } ||= 0;
	return [ @divisions ];
}

# ============================================================
sub load_all {
# ============================================================
	my $self = shift;
	
	opendir DIR, $self->{ path } or die "Can't open directory '$self->{ path }' $!";
	my @contents = readdir DIR;
	closedir DIR;

	# ===== FIND ALL DIVISIONS AND RINGS
	my @divisions = map { /^div\.(\w+)\.txt$/; } grep { /^div\.\w+\.txt$/ } @contents;
	my @rings     = map { /^ring(\d+)$/;       } grep { /^ring\d+$/       } @contents;

	return ([ @divisions ], [ @rings ]);
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;

	open FILE, ">$self->{ file }" or die "Can't write '$self->{ file }' $!";
	print FILE "# current=$self->{ current }\n";
	close FILE;
}

sub current  { my $self = shift; return $self->{ divisions }[ $self->{ current }]; }
sub next     { my $self = shift; my $i = $self->{ current }; $i = ($i + 1) % int(@{ $self->{ divisions }}); $self->{ current } = $i; }
sub previous { my $self = shift; my $i = $self->{ current }; $i = ($i - 1) >= 0 ? ($i -1) : $#{ $self->{ divisions }}; $self->{ current } = $i; }
sub TO_JSON  { my $self = shift; return { %$self }; }
1;
