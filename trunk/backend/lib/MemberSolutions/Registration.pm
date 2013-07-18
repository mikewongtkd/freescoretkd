package MemberSolutions::Registration;
use MemberSolutions::Athlete;
use Text::CSV;

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
	my $file = shift;
	my $csv  = new Text::CSV;

	$self->{ entries } = [];
	open FILE, $file or die "Can't read file '$file' $!";
	local $_ = <FILE>;
	$csv->parse( $_ );
	my @columns = map { s/://; s/\s+\([^\)]+\)//; $_; } $csv->fields();
	my $line = 0;
	while( <FILE> ) {
		chomp;
		next if /^$/;
		$line++;
		my $entry = {};
		$csv->parse( $_ );
		my @values = map { s/\s+\([^\)]+\)//; $_; } $csv->fields();
		foreach my $column (@columns) {
			next if defined $entry->{ $column };
			$entry->{ $column } = shift @values;
		}
		$entry->{ id } = 100 + $line;
		my $error = validate( $entry );
		if( int( keys %$error ) == 0 ) {
			push @{ $self->{ entries }}, bless $entry, 'MemberSolutions::Athlete';
		} else {
			my $invalid = join( ", ", sort keys %$error );
			warn "Athlete '$entry->{ 'First Name' } $entry->{ 'Last Name' }' is invalid (line $line: $invalid)\n";
		}
	}
	close FILE;
}

# ============================================================
sub entries {
# ============================================================
	my $self = shift;
	return @{$self->{ entries }};
}

# ============================================================
sub validate {
# ============================================================
	my $entry = shift;
	my $error = {};

	$error->{ name }   = 1 unless validate_name(   $entry, 'First Name' );
	$error->{ name }   = 1 unless validate_name(   $entry, 'Last Name' );
	$error->{ rank }   = 1 unless validate_rank(   $entry, 'Belt Color' );
	$error->{ events } = 1 unless validate_events( $entry );

	return $error;
}

# ============================================================
sub validate_email {
# ============================================================
	my $entry = shift;
	my $field = shift;
	return ($entry->{ $field } =~ /^[\w.]+\@[\w.]+$/);
}

# ============================================================
sub validate_events {
# ============================================================
	my $entry  = shift;

	my @events = map { s/\s*\([^\)]+\)//; $_; } split /\s*\|\s*/, $entry->{ 'Register for Events' };
	delete $entry->{ 'Register for Events' };
	$entry->{ Events } = [ @events ];
	return 1;
}

# ============================================================
sub validate_name {
# ============================================================
	my $entry = shift;
	my $field = shift;

	if( $entry->{ $field } eq uc $entry->{ $field } ) {
		$entry->{ $field } = ucfirst lc $entry->{ $field };
	} elsif( $entry->{ $field } eq lc $entry->{ $field } ) {
		$entry->{ $field } = ucfirst lc $entry->{ $field };
	}
	return 1;
}

# ============================================================
sub validate_number {
# ============================================================
	my $entry = shift;
	my $field = shift;
	return ($entry->{ $field } =~ /^\d+$/);
}

# ============================================================
sub validate_rank {
# ============================================================
	my $entry = shift;
	my $field = shift;

	$entry->{ Rank } = $entry->{ $field };
	delete $entry->{ $field };
	return 1;
}

1;
