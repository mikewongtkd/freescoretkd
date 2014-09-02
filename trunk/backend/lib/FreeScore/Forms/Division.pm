package FreeScore::Forms::Division;
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
	my $path       = shift;
	my $division   = shift;

	$self->{ current } = 0;
	$self->{ state }   = 'display';

	$self->{ path } = $path;
	$self->{ file } = "$self->{ path }/div.$division.txt";
}

# ============================================================
sub read {
# ============================================================
	my $self  = shift;
	my $index = 0;
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
		push @{ $self->{ athletes }}, { name => $athlete, rank => $rank, 'index' => $index, scores => [ @scores ] };
		$index++;
	}
	close FILE;

}

# ============================================================
sub write {
# ============================================================
	my $self = shift;

	open FILE, ">$self->{ file }" or die "Can't write '$self->{ file }' $!";
	print FILE "# state=$self->{ state }\n";
	print FILE "# current=$self->{ current }\n";
	foreach my $athlete (@{ $self->{ athletes }}) {
		print FILE join( "\t", @{ $athlete }{ qw( name rank ) }, @{ $athlete->{ scores }} ), "\n";
	}
	close FILE;
}

sub display    { my $self = shift; $self->{ state } = 'display'; }
sub score      { my $self = shift; $self->{ state } = 'score';  }
sub next       { my $self = shift; $self->{ state } = 'score'; $self->{ current } = ($self->{ current } + 1) % int(@{ $self->{ athletes }}); }
sub previous   { my $self = shift; $self->{ state } = 'score'; $self->{ current } = ($self->{ current } - 1) >= 0 ? ($self->{ current } -1) : $#{ $self->{ athletes }}; }

sub is_display { my $self = shift; return $self->{ state } eq 'display'; }
sub is_score   { my $self = shift; return $self->{ state } eq 'score';  }
sub TO_JSON    { my $self = shift; return { %$self }; }

1;
