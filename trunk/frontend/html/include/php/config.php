<?php
	function get_ring_number( $n ) {
		if( ! preg_match( '/ring/', $n )) { return null; }
		$n = preg_replace( '/ring/', '', $n );
		return intval( $n );
	};

	function read_config() {
		$paths = [ '/var/www/html/include/php', '/var/www/include/php' ];
		foreach( $paths as $path ) {
			$file = "{$path}/config.json";
			if( ! file_exists( $file )) { continue; }
			$text = file_get_contents( $file );
			$data = json_decode( $text, true );
			return $data;
		}
		return null;
	}

	$config     = read_config();
	$host       = $config[ 'host' ];
	$tournament = $config[ 'tournament' ];
	$rings = [];
	$rings[ 'grassroots' ] = preg_grep( '/ring|staging/', scandir( '/usr/local/freescore/data/' . $tournament[ 'db' ] . '/forms-grassroots' ));
	$rings[ 'worldclass' ] = preg_grep( '/ring|staging/', scandir( '/usr/local/freescore/data/' . $tournament[ 'db' ] . '/forms-worldclass' ));
	$rings[ 'freestyle' ]  = preg_grep( '/ring|staging/', scandir( '/usr/local/freescore/data/' . $tournament[ 'db' ] . '/forms-freestyle'  ));
	$rings = array_values( array_filter( array_map( 'get_ring_number', array_unique( array_merge( $rings[ 'grassroots' ], $rings[ 'worldclass' ], $rings[ 'freestyle' ] )))));
	asort( $rings );
	$tournament[ 'rings' ] = $rings;
	$tournament = json_encode( $tournament );
?>
