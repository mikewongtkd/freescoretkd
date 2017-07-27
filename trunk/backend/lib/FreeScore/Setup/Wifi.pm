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

	@lines = split /\n/, `hostapd -dd $self->{ file } | grep -i 'allowed channel'`;
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

	return unless `which iwlist`;

	@lines = split /\n/, `iwlist wlan0 scan`;
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
	if   ( `which systemctl` ) { `systemctl restart hostapd`; }
	elsif( `which service`   ) { `service hostapd restart`; }
}

# ============================================================
sub write_config {
# ============================================================
	my $self = shift;
	return unless( -e $self->{ file } );
	my @keys = ( qw( 
		interface 
		driver 
		ctrl_interface 
		ctrl_interface_group 
		ssid 
		hw_mode 
		channel 
		wpa 
		wpa_passphrase 
		wpa_key_mgmt 
		wpa_pairwise 
		rsn_pairwise 
		beacon_int 
		auth_algs 
		wmm_enabled 
	));

	open FILE, ">$self->{ file }" or die "Can't write to '$self->{ file }' $!";
	foreach my $key (@keys) {
		print FILE "$key=$self->{ config }{ $key }\n";
		print FILE "\n" if $key eq "channel"; # Put a newline to separate general wifi config with password/encryption config
	}
	close FILE;
}

1;
