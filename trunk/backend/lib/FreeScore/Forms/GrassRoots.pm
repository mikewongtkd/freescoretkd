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
	my $division   = shift;

	$self->{ state } = 'ready';

	$self->{ file } = "$FreeScore::PATH/$tournament/forms-grassroots/div$division.txt";
	open FILE, $self->{ file } or die "Can't read '$self->{ file }' $!";
	while( <FILE> ) {
		chomp;
		next if /^\s*$/;

		# ===== READ DIVISION STATE INFORMATION
		if( /^#/ ) {
			s/^#\s+//;
			my ($key, $value) = split /=/;
			$self->{ $key } = $value;
			next;
		}

		# ===== READ DIVISION ATHLETE INFORMATION
		my @columns = split /\t/;
		my $athlete = shift @columns;
		my $rank    = shift @columns;
		my $n       = $#columns < 2 ? 2 : $#columns;
		my @scores  = ();
		foreach my $i ( 0 .. $n ) {
			$scores[ $i ] = $columns[ $i ] eq '' ? -1.0 : $columns[ $i ];
		}
		push @{ $self->{ division }}, { name => $athlete, rank => $rank, scores => [ @scores ] };
	}
	close FILE;
}

# ============================================================
sub write {
# ============================================================
	my $self = shift;

	open FILE, ">$self->{ file }" or die "Can't write '$self->{ file }' $!";
	print FILE "# state=$self->{ state }\n";
	foreach my $athlete (@{ $self->{ division }}) {
		print FILE join( "\t", @{ $athlete }{ qw( name rank ) }, @{ $athlete->{ scores }} ), "\n";
	}
	close FILE;
}

sub ready { my $self = shift; $self->{ state } = 'ready'; }
sub next  { my $self = shift; $self->{ state } = 'next';  }

sub is_ready { my $self = shift; return $self->{ state } eq 'ready'; }
sub is_next  { my $self = shift; return $self->{ state } eq 'next';  }

1;
