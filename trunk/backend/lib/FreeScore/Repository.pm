package FreeScore::Repository;
use Data::Dumper;
use Date::Manip;
use Cwd qw( getcwd );

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

	my $cwd    = getcwd();
	my $pi     = "/home/pi/freescore/trunk";
	my $devel  = "~/devel/freescore/trunk";
	my $local0 = "$cwd/freescore/trunk";
	my $local1 = "$cwd/../freescore/trunk";
	my $local2 = "$cwd/../../freescore/trunk";
	my $local3 = "$cwd/../../../freescore/trunk";

	($self->{ _local }) = grep { -e $_ } ( $pi, $local0, $local1, $local2, $local3, $devel );
}

# ============================================================
sub connect {
# ============================================================
	my $self    = shift;
	my $network = '/etc/network/interfaces';

	my $can_connect = sub {
		`ping -c 1 github.com > /dev/null`;
		return $? ? 0 : 1;
	};

	return $can_connect->() if( ! -e $network);

	my $wap = {
		rpi  => `grep wlan $network | grep static`,
		eth0 => `grep eth0 $network | grep static`
	};

	# Is the Raspberry Pi is the Wifi Access Point
	if( $wap->{ rpi }) { return $can_connect->(); }

	# Nope, and the Wifi Access Point isn't on eth0 either
	elsif( ! $wap->{ eth0 }) { return 0; }

	`ifdown eth0`;
	`cp $network $network.fswifi`;
	open FILE, ">$network" or die "Can't write to '/etc/network/interfaces' to go to update mode";

	return 0;
}

# ============================================================
sub disconnect {
# ============================================================
	my $self = shift;
}

# ============================================================
sub log {
# ============================================================
	my $self = shift;
	system( "cd $self->{ _local } \&\& git fetch --all 2>\&1" );
	my $response = `cd $self->{ _local } \&\& git log origin/HEAD`;

	# Parse the log
	my @lines = split /\n/, $response;
	my $log   = [];
	my $entry = undef;
	my $old   = new Date::Manip::Date( '-6 months' );
	foreach $line (@lines) {
		chomp $line;
		if      ( $line =~ /^commit\s(\w+)/ ) {
			my $hash = $1;
			push @$log, $entry if( defined $entry );
			$entry = { hash => $hash };

		} elsif ( $line =~ /^Date:\s+(\w[\w\s\-:]+)/ ) {
			my $date = $1;

			$entry->{ datetime } = new Date::Manip::Date( $date );
			last if( @$log > 5 && $entry->{ datetime }->cmp( $old ) < 0 ); # Always show the latest 5 versions
		}
	}

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
