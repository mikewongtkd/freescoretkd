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

	$self->{ _local } = -e $pi ? $pi : $devel;
}

# ============================================================
sub latest_release {
# ============================================================
	my $self     = shift;
	my $response = `git ls-remote --tags $self->{ _url } 2>&1`;

	if( $response =~ /\bfatal\b/ ) { chomp $response; die "Network error \"$response\"$!" ; }

	my @versions = split /\n/, $response;

	@versions = sort { $b <=> $a } map { 
		chomp;
		my ($hash, $tag) = split /\t/;
		$tag =~ s/^.*\/v//;
		$tag =~ /^(\d+\.\d+)$/ ? $1 : ();
	} @versions;

	my $latest = shift @versions;

	return $latest;
}

# ============================================================
sub local_version {
# ============================================================
	$self        = shift;
	my $response = `cd $self->{ _local } && git describe --tags --abbrev=0 2>&1`;

	chomp $response;
	if( $response =~ /\bfatal\b/ ) { die "Error: \"$response\"$!"; }

	$response =~ s/^v//;
	return $response;
}

# ============================================================
sub update_local_to_latest {
# ============================================================
	my $self   = shift;

	my $latest   = $self->latest_release();
	my $response = `cd $self->{ _local } && git pull +ref/tags/v$latest 2>&1`;
	if( $response =~ /\bfatal\b/ ) { chomp $response; die "Error: \"$response\"$!"; }
}

1;
