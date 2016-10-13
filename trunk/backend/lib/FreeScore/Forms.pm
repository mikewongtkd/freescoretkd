package FreeScore::Forms;
use FreeScore;
use FreeScore::Forms::Division;
use List::Util qw( first );

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $self = bless {}, $class;
	$self->init( @_ );
	return $self;
}

# ============================================================
sub find {
# ============================================================
	my $self     = shift;
	my $name     = shift;
	my $division = undef;
	
	$division = first { $_->{ name } eq $name } @{ $self->{ divisions }};
	return $division;
}

# ============================================================
sub load_ring {
# ============================================================
	my $self       = shift;

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
	opendir DIR, $self->{ path } or die "Database Read Error: Can't open directory '$self->{ path }' $!";
	my %assigned = map { /^div\.([\w\.]+)\.txt$/ ? ( $1 => 1 ) : (); } readdir DIR;
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
	
	opendir DIR, $self->{ path } or die "Database Read Error: Can't open directory '$self->{ path }' $!";
	my @rings     = map { /^ring(\d+)$/       ? $1 : (); } readdir DIR;
	closedir DIR;

	opendir DIR, "$self->{ path }/staging" or die "Database Read Error: Can't open directory '$self->{ path }/staging' $!";
	my @divisions = map { /^div\.(\w+)\.txt$/ ? $1 : (); } readdir DIR;
	closedir DIR;

	return ([ @divisions ], [ @rings ]);
}

# ============================================================
sub transfer {
# ============================================================
	my $self  = shift;
	my $divid = shift;
	my $to    = shift;

	$to = $to eq 'staging' ? $to : sprintf( "ring%02d", $to );

	my $division        = $self->find( $divid ) || die "Can't find division $divid (found: " . join( ', ', map { $_->{ name }; } @{$self->{ divisions }} ) . ")$!";
	my $source          = $division->{ file };
	$division->{ file } = "$self->{ path }/../$to/div.$divid.txt";
	$division->{ ring } = $to;

	if( $division->write() ) { unlink $source; return 1; }
	else                     { return 0; }
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;

	open FILE, ">$self->{ file }" or die "Database Write Error: Can't write '$self->{ file }' $!";
	foreach my $key (sort keys %$self) {
		next if ($key =~ /^(?:divisions|file|path|staging)$/ );
		print FILE "# $key=$self->{ $key }\n";
	}
	close FILE;

	return 1;
}

sub current  { my $self = shift; return $self->{ divisions }[ $self->{ current }]; }
sub next     { my $self = shift; my $i = $self->{ current }; $i = ($i + 1) % int(@{ $self->{ divisions }}); $self->{ current } = $i; }
sub previous { my $self = shift; my $i = $self->{ current }; $i = ($i - 1) >= 0 ? ($i -1) : $#{ $self->{ divisions }}; $self->{ current } = $i; }

1;
