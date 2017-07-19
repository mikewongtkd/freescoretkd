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
	my @search = ( '/var/www/html/include/php/config.php', '/var/www/html/freescore/include/php/config.php' );
	($self->{ config }) = grep { -e } @search;
	if( -e $self->{ config } ) {
		my $json = new JSON::XS();
		my $php = `(cat $self->{ config } && echo '<?php echo "[\\"", \$host, "\\",", \$tournament, "]"; ?>') | php`;
		my ($host, $tournament) = @{ $json->decode( $php )};
		$self->{ host }       = $host;
		$self->{ tournament } = $tournament;
	} else {
		die "Can't find Tournament Configuration File '$self->{ config }' $!";
	}
}

# ============================================================
sub write {
# ============================================================
	my $self  = shift;
	open FILE, ">$self->{ config }" or die "Can't write to '$self->{ config }' $!";
	print FILE<<EOF;
<?php
	function get_ring_number( \$n ) {
		if( ! preg_match( '/ring/', \$n )) { return null; }
		\$n = preg_replace( '/ring/', '', \$n );
		return intval( \$n );
	};

	\$host       = "$self->{ host }";
	\$tournament = [ 
		"name" => "$self->{ tournament }{ name }",
		"db"   => "$self->{ tournament }{ db }", 
	];
	\$rings = [];
	\$rings[ 'grassroots' ] = preg_grep( '/ring|staging/', scandir( '/usr/local/freescore/data/' . \$tournament[ 'db' ] . '/forms-grassroots' ));
	\$rings[ 'worldclass' ] = preg_grep( '/ring|staging/', scandir( '/usr/local/freescore/data/' . \$tournament[ 'db' ] . '/forms-worldclass' ));
	\$rings[ 'freestyle' ]  = preg_grep( '/ring|staging/', scandir( '/usr/local/freescore/data/' . \$tournament[ 'db' ] . '/forms-freestyle'  ));
	\$rings = array_values( array_filter( array_map( 'get_ring_number', array_unique( array_merge( \$rings[ 'grassroots' ], \$rings[ 'worldclass' ], \$rings[ 'freestyle' ] )))));
	asort( \$rings );
	\$tournament[ 'rings' ] = \$rings;
	\$tournament = json_encode( \$tournament );
?>
EOF
	close FILE;
}

1;
