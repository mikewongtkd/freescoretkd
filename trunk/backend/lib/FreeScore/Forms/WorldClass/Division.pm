package FreeScore::Forms::WorldClass::Division;
use FreeScore;

our @criteria = qw( major minor rhythm power ki );

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
	my $ring       = shift;
	my $division   = shift;

	if( $ring =~ /^\d+$/ ) { $ring = sprintf( "ring%02d", $ring ); }

	$self->{ current } = 0;
	$self->{ state }   = 'display';

	$self->{ file } = "$FreeScore::PATH/$tournament/forms-worldclass/$ring/div.$division.txt";

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
		my @columns  = split /\t/;
		my $athlete  = shift @columns;
		my $rank     = shift @columns;
		my $n        = $#columns < 2 ? 2 : $#columns;
		my @scores    = ();
		foreach my $i ( 0 .. $n ) {
			my $score = {};
			@{$score}{ @criteria } = map { sprintf "%.1f", $_; } split /\//, $columns[ $i ] if $columns[ $i ] =~ /\//;
			$score->{ $_ } ||= -1.0 foreach (@criteria);
			$scores[ $i ] = $score;
		}
		push @{ $self->{ division }}, { name => $athlete, rank => $rank, 'index' => $index, scores => [ @scores ] };
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
	foreach my $athlete (@{ $self->{ division }}) {
		my @scores = map { my $score = $_; my $string = join( "/", map { sprintf( "%.1f", $score->{ $_ }); } @criteria ); $string eq "-1.0/-1.0/-1.0/-1.0/-1.0" ? "" : $string } @{ $athlete->{ scores }};
		print FILE join( "\t", @{ $athlete }{ qw( name rank ) }, @scores), "\n";
	}
	close FILE;
}

sub display  { my $self = shift; $self->{ state } = 'display'; }
sub score    { my $self = shift; $self->{ state } = 'score';  }
sub next     { my $self = shift; $self->{ state } = 'score'; $self->{ current } = ($self->{ current } + 1) % int(@{ $self->{ division }}); }
sub previous { my $self = shift; $self->{ state } = 'score'; $self->{ current } = ($self->{ current } - 1) >= 0 ? ($self->{ current } -1) : $#{ $self->{ division }}; }

sub is_display { my $self = shift; return $self->{ state } eq 'display'; }
sub is_score   { my $self = shift; return $self->{ state } eq 'score';  }

1;
