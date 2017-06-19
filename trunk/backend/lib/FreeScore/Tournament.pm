package FreeScore::Tournament;
use JSON::XS;

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
	my $self   = shift;
	$self->{ config } = '/var/www/html/freescore/include/php/config.php';
	if( -e $self->{ config } ) {
		my $json = new JSON::XS();
		my $php = `(cat $self->{ config } && echo '<?php echo "[\\"", \$host, "\\",", \$tournament, "]"; ?>') | php`;
		my ($host, $tournament) = @{ $json->decode( $php )};
		$self->{ host }       = $host;
		$self->{ tournament } = $tournament;
		$self->{ json }       = $json;
	} else {
		die "Can't find Tournament Configuration File '$self->{ config }' $!";
	}
}

# ============================================================
sub write {
# ============================================================
	my $self  = shift;
	my $rings = $self->rings();
	open FILE, ">$self->{ config }" or die "Can't write to '$self->{ config }' $!";
	print FILE<<EOF;
<?php
	function get_ring_number( \$n ) {
		if( ! preg_match( '/ring/', \$n )) { return null; }
		\$n = preg_replace( '/ring/', '', \$n );
		return intval( \$n );
	};

	\$host       = "freescore.net";
	\$tournament = [ 
		"name" => "$self->{ name }",
		"db"   => "$self->{ db }", 
	];
	\$rings = [];
	\$rings[ 'grassroots' ] = preg_grep( '/^\./', scandir( '/usr/local/freescore/data/' . \$tournament[ 'db' ] . '/forms-grassroots' ), PREG_GREP_INVERT );
	\$rings[ 'worldclass' ] = preg_grep( '/^\./', scandir( '/usr/local/freescore/data/' . \$tournament[ 'db' ] . '/forms-worldclass' ), PREG_GREP_INVERT );
	\$rings[ 'freestyle' ]  = preg_grep( '/^\./', scandir( '/usr/local/freescore/data/' . \$tournament[ 'db' ] . '/forms-freestyle'  ), PREG_GREP_INVERT );
	\$rings = array_values( array_filter( array_map( 'get_ring_number', array_unique( array_merge( \$rings[ 'grassroots' ], \$rings[ 'worldclass' ], \$rings[ 'freestyle' ] )))));
	asort( \$rings );
	\$tournament[ 'rings' ] = \$rings;
	\$tournament = json_encode( \$tournament );
?>
EOF
	close FILE;
}

1;
