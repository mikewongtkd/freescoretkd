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
	$self->{ scan } = `which iwlist`;

	$self->read_config()             if -e $self->{ file };
	$self->read_available_channels() if -e $self->{ file };
	$self->read_channels()           if -e $self->{ scan };
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
	my @lines     = split /\n/, `hostapd -dd $self->{ file } | grep -i 'allowed channel'`;
	my $available = [];

	foreach (@lines) { push @$available, $1 if( /chan=(\d+)/ ); }
	$self->{ available } = [ sort { $a <=> $b } @$available ];

	return $self->{ available };
}

# ============================================================
sub read_channels {
# ============================================================
	my $self     = shift;
	my @lines    = split /\n/, `iwlist wlan0 scan`;
	my $channels = [];
	my $entry    = {};
	my $current  = undef;

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
	my $config = {
		interface => 'wlan0',
		driver => 'nl80211',
		ctrl_interface =>'/var/run/hostapd',
		ctrl_interface_group => '0',
		ssid =>'freescore',
		hw_mode => 'g',
		channel => '8',
		wpa => '2',
		wpa_passphrase => 'password',
		wpa_key_mgmt => 'WPA-PSK',
		wpa_pairwise => 'CCMP',
		rsn_pairwise => 'CCMP',
		beacon_int => '100',
		auth_algs => '3',
		wmm_enabled => '1',
	};

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
sub write_config {
# ============================================================
	my $self = shift;
	return unless( -e $self->{ file } );

	open FILE, ">$self->{ file }" or die "Can't write to '$self->{ file }' $!";
	foreach my $key (qw( interface driver ctrl_interface ctrl_interface_group ssid hw_mode channel wpa wpa_passphrase wpa_key_mgmt wpa_pairwise rsn_pairwise beacon_int auth_algs wmm_enabled )) {
		print FILE "$key=$self->{ config }{ $key }\n";
		print FILE "\n" if $key eq "channel"; # Put a newline to separate general wifi config with password/encryption config
	}
	close FILE;
}

1;
