<?php
	function get_ring_number( $n ) {
		if( ! preg_match( '/ring/', $n )) { return null; }
		$n = preg_replace( '/ring/', '', $n );
		return intval( $n );
	}

	function read_config() {
		$locations = [ '/home/ubuntu/freescore/trunk/frontend/html/include/php/config.json', '/var/www/html/freescore/include/php/config.json', '/var/www/html/include/php/config.json', '/var/www/include/php/config.json', '/var/www/freescore/include/php/config.json' ];
		foreach( $locations as $i => $file ) {
			if( ! file_exists( $file )) { continue; }
			$string = file_get_contents( $file );
			$config = json_decode( $string, true );
			return $config;
		}
	}

	function init_event( $event ) {
		mkdir( $event, 0777, true )           or die( "Can't create directory '$event'" );
		mkdir( "$event/ring01", 0777, true )  or die( "Can't create directory '$event/ring01'" );
		mkdir( "$event/staging", 0777, true ) or die( "Can't create directory '$event/staging'" );
	}

	function read_rings( $tournament ) {
		$grassroots = '/usr/local/freescore/data/' . $tournament[ 'db' ] . '/forms-grassroots';
		$worldclass = '/usr/local/freescore/data/' . $tournament[ 'db' ] . '/forms-worldclass';
		$para       = '/usr/local/freescore/data/' . $tournament[ 'db' ] . '/forms-para';
		$freestyle  = '/usr/local/freescore/data/' . $tournament[ 'db' ] . '/forms-freestyle';
		$vsparring  = '/usr/local/freescore/data/' . $tournament[ 'db' ] . '/virtual-sparring';
		$speedkick  = '/usr/local/freescore/data/' . $tournament[ 'db' ] . '/speed-kicking';

		if( ! file_exists( $grassroots )) { init_event( $grassroots ); }
		if( ! file_exists( $worldclass )) { init_event( $worldclass ); }
		if( ! file_exists( $para       )) { init_event( $para       ); }
		if( ! file_exists( $freestyle  )) { init_event( $freestyle  ); }
		if( ! file_exists( $vsparring  )) { init_event( $vsparring  ); }
		if( ! file_exists( $speedkick  )) { init_event( $speedkick  ); }

		$rings = [];
		$rings[ 'grassroots' ] = preg_grep( '/ring|staging/', scandir( $grassroots ));
		$rings[ 'worldclass' ] = preg_grep( '/ring|staging/', scandir( $worldclass ));
		$rings[ 'para' ]       = preg_grep( '/ring|staging/', scandir( $para       ));
		$rings[ 'freestyle' ]  = preg_grep( '/ring|staging/', scandir( $freestyle  ));
		$rings[ 'vsparring' ]  = preg_grep( '/ring|staging/', scandir( $vsparring  ));
		$rings[ 'speedkick' ]  = preg_grep( '/ring|staging/', scandir( $speedkick  ));
		$rings = array_values( array_filter( array_map( 'get_ring_number', array_unique( array_merge( $rings[ 'grassroots' ], $rings[ 'worldclass' ], $rings[ 'para' ], $rings[ 'freestyle' ], $rings[ 'vsparring' ], $rings[ 'speedkick' ] )))));
		asort( $rings );
		$tournament[ 'rings' ] = $rings;
		$tournament = json_encode( $tournament );

		return $tournament;
	}

	$config     = read_config();
	$host       = $config[ 'host' ];
	$tournament = read_rings( $config[ 'tournament' ]);

?>
