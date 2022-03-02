package FreeScore::Config;

use File::Slurp qw( read_file );
use JSON::XS;

# ============================================================
sub read_config {
# ============================================================
	my $locations = [ '/home/ubuntu/freescore/trunk/frontend/html/include/php/config.json', '/var/www/html/freescore/include/php/config.json', '/var/www/html/include/php/config.json', '/var/www/include/php/config.json', '/var/www/freescore/include/php/config.json' ];
	foreach my $file (@$locations) {
		next unless -e $file;
		my $text = read_file( $file );
		my $json = new JSON::XS();
		my $data = $json->decode( $text );
		return $data;
	}
	die "Configuration file not found! Tried the following locations:\n" . join( '', map { "  $_\n" } @$locations ) . "\n";
}

# ============================================================
sub host {
# ============================================================
	my $config = read_config();
	my $host   = $config->{ host };

	$host = "$host:$config->{ port }" if exists $config->{ port };
	
	if( exists $config->{ secure } && $config->{ secure }) { $host = "https://$host"; }
	else                                                   { $host = "http://$host"; }

	return $host;
}

1;
