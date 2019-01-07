package FreeScore::Repository;
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
sub init {
# ============================================================
	my $self = shift;

	$self->{ _url } = "https://github.com/mikewongtkd/freescoretkd.git";

	my $pi    = "/home/pi/freescore/trunk";
	my $devel = "~/devel/freescore/trunk";
	my $local = `pwd` . "/freescore/trunk";

	($self->{ _local }) = grep { -e $_ } ( $pi, $local, $devel );
}

# ============================================================
sub log {
# ============================================================
	my $self     = shift;
	my $response = `cd $self->{ _local } && git fetch --all && git log 2>&1`;

	if( $response =~ /\bfatal\b/ ) { chomp $response; die "Network error \"$response\"$!" ; }

	# Parse the log
	my @lines = split /\n/, $response;
	my $log   = [];
	my $entry = undef;
	local $_;
	foreach $_ (@lines) {
		chomp;
		if      ( /^commit\s(\w+)/ ) {
			my $hash = $1;
			push @$log, $entry if( defined $entry );
			$entry = { hash => $hash };

		} elsif ( /^Date:\s+(\w[\w\s\-:]+)/ ) {
			my $date = $1;

			$entry->{ datetime } = $date;
		}
	}
	push @$log, $entry;

	return $log;
}

# ============================================================
sub installed_version {
# ============================================================
	$self        = shift;
	my $response = `cd $self->{ _local } && git rev-parse HEAD`;

	chomp $response;
	if( $response =~ /\bfatal\b/ ) { die "Error: \"$response\"$!"; }

	return $response;
}

# ============================================================
sub install_latest {
# ============================================================
	my $self   = shift;

	my $response = `cd $self->{ _local } && git pull 2>&1`;
	if( $response =~ /\bfatal\b/ ) { chomp $response; die "Error: \"$response\"$!"; }
}

# ============================================================
sub install_revision {
# ============================================================
	my $self = shift;
	my $hash = shift;

	my $response = `cd $self->{ _local } && git reset --hard $hash 2>&1`;
	if( $response =~ /\bfatal\b/ ) { chomp $response; die "Error: \"$response\"$!"; }
}

1;
