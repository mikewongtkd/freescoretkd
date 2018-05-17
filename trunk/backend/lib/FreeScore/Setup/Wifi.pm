package FreeScore::Setup::Wifi;

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
	$self->{ file } = '/etc/hostapd/hostapd.conf';

	$self->read_config();
	$self->read_available_channels();
	$self->read_channels();
}

# ============================================================
sub apply_2_4_ghz_config {
# ============================================================
	my $self = shift;
	my $keys = [ qw( interface driver ctrl_interface ctrl_interface_group ssid hw_mode channel wpa wpa_passphrase wpa_key_mgmt wpa_pairwise rsn_pairwise beacon_int auth_algs wmm_enabled )];

	# Remove unnecessary configurations
	delete $self->{ config }{ $_ } foreach( qw( country_code ieee80211d eap_reauth_period ));
	# Apply required configurations specific to 2.4GHz
	$self->{ config }{ wpa_pairwise }      = 'CCMP';
	# Apply configuration for 5GHz
	$self->{ config }{ hw_mode }           = 'g';
	$self->{ config }{ auth_algs }         = 3;
	$self->{ config }{ wpa }               = 2;

	return @$keys;
}

# ============================================================
sub apply_5_ghz_config {
# ============================================================
	my $self = shift;
	my $keys = [ qw( interface country_code driver ctrl_interface ctrl_interface_group ssid hw_mode channel ieee80211d wpa wpa_passphrase wpa_key_mgmt rsn_pairwise beacon_int auth_algs wmm_enabled eap_reauth_period )];

	# Remove unnecessary configurations
	delete $self->{ config }{ wpa_pairwise };
	# Apply required configurations specific to 5GHz
	$self->{ config }{ country_code }      = 'US';
	$self->{ config }{ ieee80211d }        = 1;
	$self->{ config }{ eap_reauth_period } = 360000000;
	# Apply configuration for 5GHz
	$self->{ config }{ hw_mode }           = 'a';
	$self->{ config }{ auth_algs }         = 1;
	$self->{ config }{ wpa }               = 3;

	return @$keys;
}

# ============================================================
sub channels {
# ============================================================
	my $self = shift;
	return $self->{ channels };
}

# ============================================================
sub read_available_channels {
# ============================================================
	my $self      = shift;
	my @lines     = ();
	my $available = [];

	return unless -e $self->{ file };
	my $hostapd = `which hostapd`;
	return unless $hostapd;

	@lines = split /\n/, `$hostapd -dd $self->{ file } | grep -i 'allowed channel'`;
	foreach (@lines) { push @$available, $1 if( /chan=(\d+)/ ); }
	$self->{ available } = [ sort { $a <=> $b } @$available ];

	return $self->{ available };
}

# ============================================================
sub read_channels {
# ============================================================
	my $self     = shift;
	my @lines    = ();
	my $channels = [];
	my $entry    = {};
	my $current  = undef;

	my $iwlist = `which iwlist`;
	return unless $iwlist;

	@lines = split /\n/, `$iwlist wlan0 scan`;
	if( $lines[ 0 ] =~ /no scan results/i ) { $self->{ channels } = undef; }

	foreach (@lines) {
		chomp;
		if( /cell (\d+)/i                   ) { $entry->{ id } = int( $1 ); push @$channels, $entry; $current = $channels->[ -1 ]; $entry = {}; }
		if( /address:\s*([\w:]+)/i          ) { $current->{ address } = $1; next; }
		if( /channel:\s*(\d+)/i             ) { $current->{ channel } = $1; next; }
		if( /frequency:\s*(\d+(?:\.\d+)?)/i ) { $current->{ frequency } = $1; next; }
		if( /quality=\s*(\d+)\/70/i         ) { $current->{ quality } = $1/70; next; }
		if( /essid:\s*"(\w+)"/i             ) { $current->{ ssid } = $1; next; }
	}
	push @$channels, $entry if exists $entry->{ ssid };
	$self->{ channels } = $channels;

	return $channels;
}

# ============================================================
sub read_config {
# ============================================================
	my $self   = shift;
	my $config = {};

	return unless( -e $self->{ file });

	open FILE, $self->{ file } or die "Can't read file '$self->{ file }' $!";
	while( <FILE> ) {
		chomp;
		next if( /^$/ );
		my ($key, $value) = split /=/, $_, 2;
		$config->{ $key } = $value;
	}
	close FILE;
	$self->{ config } = $config;

	return $config;
}

# ============================================================
sub restart {
# ============================================================
	my $self = shift;

	# Try System V or System D commands
	my $systemctl = `which systemctl`;
	my $service   = `which service`;
	if   ( $systemctl ) { `$systemctl restart hostapd`; }
	elsif( $service   ) { `$service hostapd restart`; }

	# Brute force if all else fails
	my $running = grep { /hostapd/ } split /\n/, `ps -ef`;
	my $hostapd = `which hostapd`;
	if( ! $running ) { `$hostapd -B -P /run/hostapd.pid $self->{ file } &`; }
}

# ============================================================
sub write_config {
# ============================================================
	my $self = shift;
	return unless( -e $self->{ file } );
	my @keys        = ();

	my $channel = $self->{ config }{ channel };
	if( $channel >= 1 && $channel <= 11 ) { @keys = $self->apply_2_4_ghz_config(); }
	else                                  { @keys = $self->apply_5_ghz_config(); }

	open FILE, ">$self->{ file }" or die "Can't write to '$self->{ file }' $!";
	foreach my $key (@keys) {
		print FILE "$key=$self->{ config }{ $key }\n";
		print FILE "\n" if $key eq "channel"; # Put a newline to separate general wifi config with password/encryption config
	}
	close FILE;
}

1;
