package FreeScore::Forms::GrassRoots;
use FreeScore;

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $self = bless {}, $class;
	$self->init( @_ );
	return $self;
}

# ============================================================
sub init {
# ============================================================
	my $self = shift;
	my $tournament = shift;

	$self->{ path } = "$FreeScore::PATH/$tournament/forms-grassroots";
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

	opendir DIR, $self->{ path } or die "Can't open directory '$self->{ path }' $!";
	my @divisions = map { /^div(-?\w+)\.txt$/; } grep { /^div-?\w+\.txt$/ } readdir DIR;
	closedir DIR;

	$self->{ divisions } = [ @divisions ];
	$self->{ current } ||= $divisions[ 0 ]
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;

	open FILE, ">$self->{ file }" or die "Can't write '$self->{ file }' $!";
	print FILE "# current=$self->{ current }\n";
	close FILE;
}

# ============================================================
sub find_current_index {
# ============================================================
	my $self = shift;
	my $current = $self->{ current };
	my $index   = undefined;
	foreach my $i ( 0 .. $#{$self->{ divisions }} ) {
		my $division = $self->{ divisions }[ $i ];
		if( $current eq $division ) { $index = $i; last; }
	}
	return $index;
}

sub current  { my $self = shift; return $self->{ current }; }
sub next     { my $self = shift; my $i = $self->find_current_index; $i = ($i + 1) % int(@{ $self->{ divisions }}); $self->{ current } = $self->{ divisions }[ $i ]; }
sub previous { my $self = shift; my $i = $self->find_current_index; $i = ($i - 1) >= 0 ? ($i -1) : $#{ $self->{ divisions }}; $self->{ current } = $self->{ divisions }[ $i ]; }

1;
