package FreeScore::Forms;
use FreeScore;
use FreeScore::Forms::Division;

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $self = bless {}, $class;
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

	my @divisions = ();
	opendir DIR, $self->{ path } or die "Can't open directory '$self->{ path }' $!";
	my %assigned = map { /^div\.([\w\.]+)\.txt$/; ( $1 => 1 ); } grep { /^div\.[\w\.]+\.txt$/ } readdir DIR;
	closedir DIR;

	if( exists $self->{ divisions } ) { 
		if( ref $self->{ divisions } ) { @divisions = @{ $self->{ divisions }}; }
		foreach (@divisions) { delete $assigned{ $_ }; }
	}
	push @divisions, sort keys %assigned;

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

	unshift @rings, "staging";

	return ([ @divisions ], [ @rings ]);
}

# ============================================================
sub write_checksum {
# ============================================================
	my $path        = shift;
	my $progress    = "$path/progress.txt";
	my $progress_cs = "$path/progress.chk";

	my @divisions  = ();
	opendir DIR, $path or die "Can't open directory '$path' $!";
	my %assigned = map { /^div\.([\w\.]+)\.txt$/; ( $1 => 1 ); } grep { /^div\.[\w\.]+\.txt$/ } readdir DIR;
	closedir DIR;
	push @divisions, sort keys %assigned;
	my $divisions = join " ", map { my $checksum_file = "$path/div.$_.chk"; -e $checksum_file ? $checksum_file : (); } @divisions;

	my $checksum = `cat $progress $divisions | md5 -q > $progress_cs`;
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;

	open FILE, ">$self->{ file }" or die "Can't write '$self->{ file }' $!";
	foreach my $key (sort keys %$self) {
		if ($key =~ /^divisions$/ ) {
			print FILE "# $key=" . join( ",", map { $_->{ name } } @{ $self->{ divisions }}) . "\n";
		} else {
			print FILE "# $key=$self->{ $key }\n";
		}
	}
	close FILE;

	write_checksum( $self->{ path } );
}

# ============================================================
sub checksum {
# ============================================================
	my $tournament  = shift;
	my $subdir      = shift;
	my $ring        = shift;
	my $path        = sprintf( "%s/%s/%s/ring%02d", $FreeScore::PATH, $tournament, $subdir, $ring );
	my $progress    = "$path/progress.txt";
	my $progress_cs = "$path/progress.chk";
	my $checksum    = undef;

	# ===== PREPARE CHECKSUM IF IT DOESN'T ALREADY EXIST
	write_checksum( $path ) if( ! -e $progress_cs );

	$checksum = `cat $progress_cs`;
	chomp $checksum;

	return $checksum;
}

sub current  { my $self = shift; return $self->{ divisions }[ $self->{ current }]; }
sub next     { my $self = shift; my $i = $self->{ current }; $i = ($i + 1) % int(@{ $self->{ divisions }}); $self->{ current } = $i; }
sub previous { my $self = shift; my $i = $self->{ current }; $i = ($i - 1) >= 0 ? ($i -1) : $#{ $self->{ divisions }}; $self->{ current } = $i; }
sub TO_JSON  { my $self = shift; return { %$self }; }
1;
