package FreeScore::Config;

use List::Util qw( uniq );
use JSON::XS;
use File::Slurp qw( read_file );

# ============================================================
sub new {
# ============================================================
	my ($class) = map { ref || $_ } shift;
	my $self = bless {}, $class;
	$self->init();
	return $self;
}

# ============================================================
sub init {
# ============================================================
	my $self  = shift;
	my $paths = [ qw( /usr/local/freescore /usr/freescore /home/ubuntu/freescore /freescore /home/root/freescore )];
	foreach my $path (@$paths) {
		my $file = "$path/config.json";
		next unless -e $file;
		my $text = read_file( $file );
		my $json = new JSON::XS();
		my $data = $json->decode( $text );
		$self->{ host }       = $data->{ host };
		$self->{ port }       = $data->{ port } if $data->{ port };
		$self->{ tournament } = $data->{ tournament };
	}
	return unless $self->{ host };

	my $subpath = {
		grassroots => 'forms-grassroots',
		worldclass => 'forms-worldclass',
		freestyle  => 'forms-freestyle',
	};

	my @rings = ();
	foreach my $event (sort keys %$subpath) {
		my $path = "/usr/local/freescore/data/$self->{ tournament }{ db }/$subpath->{ event }";
		next unless -d $path;
		opendir my $dh, $path;
		push @rings, map { /^ring(\d+)$/; int( $1 ); } grep { /^(?:ring)/ } readdir $dh;
		closedir $dh;
	}
	@rings = uniq @rings;
	$self->{ tournament }{ rings } = [ @rings ];
}

# ============================================================
sub host {
# ============================================================
	my $self = shift;
	if( $self->{ port } && int( $self->{ port }) != 80 ) {
		my $port = int( $self->{ port });
		if   ( $port == 80 )  { return "http://$self->{ host }"; } 
		elsif( $port == 443 ) { return "https://$self->{ host }"; } 
		else                  { return "http://$self->{ host }:$self->{ port }"; }
	} else {
		return $self->{ host };
	}
}

# ============================================================
sub password {
# ============================================================
	my $self = shift;
	my $ring = shift;

	$ring = sprintf( 'ring%02d', $ring ) if( $ring =~ /^\d+$/ );
	return undef if( ! exists( $self->{ password }));
	return undef if( ! $self->{ password });
	return undef if( $ring && ! exists( $self->{ password }{ $ring }));

	return $self->{ password }{ $ring };
}

# ============================================================
sub secured {
# ============================================================
	my $self = shift;
	my $ring = shift;

	return exists( $self->{ password });
}

# ============================================================
sub tournament {
# ============================================================
	my $self = shift;
	return $self->{ tournament };
}

1;
