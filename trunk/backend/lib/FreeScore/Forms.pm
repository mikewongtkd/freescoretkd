package FreeScore::Forms;
use FreeScore;
use FreeScore::Forms::Division;
use List::Util qw( first );
use List::MoreUtils qw( first_index );
use File::Path qw( make_path );
use Data::Dumper;

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

	# ===== READ DIVISION PROGRESS STATE INFORMATION
	if( -e $self->{ file } ) {
		open FILE, $self->{ file };
		while( <FILE> ) { chomp; $self->{ $1 } = $2 if( /^#\s*([^=]+)=(.*)$/ ); }
		close FILE;
	}

	# ===== FIND DIVISIONS AND LIST THEM BY ID
	opendir DIR, $self->{ path } or die "Database Read Error: Can't open directory '$self->{ path }' $!";
	my %assigned = map { /^div\.([\w\.]+)\.txt$/ ? ( $1 => 1 ) : (); } readdir DIR;
	closedir DIR;
	my @divisions = sort keys %assigned;

	$self->{ current } ||= @divisions > 0 ? $divisions[ 0 ] : undef;

	return [ @divisions ];
}

# ============================================================
sub load_all {
# ============================================================
	my $self = shift;
	
	opendir DIR, $self->{ path } or die "Database Read Error: Can't open directory '$self->{ path }' $!";
	my @rings     = map { /^ring(\d+)$/       ? $1 : (); } readdir DIR;
	closedir DIR;

	if( @rings == 0 ) {
		make_path( "$self->{ path }/ring01" );
		@rings = ( 01 );
	}

	my $staging = "$self->{ path }/staging";
	make_path( $staging ) unless -d $staging;
	opendir DIR, $staging or die "Database Read Error: Can't open directory '$staging' $!";
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

	if( $division->write() ) { 
		unlink $source; 
		$self->next() if( $self->{ current } eq $divid );
		my $i = first_index { $_->{ name } eq $divid } @{ $self->{ divisions }};
		splice @{ $self->{ divisions }}, $i, 1 if( $i >= 0 );
		return 1; 
	} else { 
		return 0; 
	}
}

# ============================================================
sub navigate {
# ============================================================
	my $self  = shift;
	my $value = shift;
	$self->{ current } = $value;
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

sub current  { my $self = shift; return first { $_->{ name } eq $self->{ current } } @{$self->{ divisions }; }}
sub next     { my $self = shift; my $i = first_index { $_->{ name } eq $self->{ current }; } @{ $self->{ divisions }}; return undef if $i < 0; $i = ($i + 1) % int(@{ $self->{ divisions }}); $self->{ current } = $self->{ divisions }[ $i ]{ name }; return $self->{ current }; }
sub previous { my $self = shift; my $i = first_index { $_->{ name } eq $self->{ current }; } @{ $self->{ divisions }}; return undef if $i < 0; $i = ($i - 1) >= 0 ? ($i -1) : $#{ $self->{ divisions }}; $self->{ current } = $self->{ divisions }[ $i ]{ name }; return $self->{ current }; }

1;
