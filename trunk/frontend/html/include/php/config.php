<?php
	function get_ring_number( $n ) {
		if( ! preg_match( '/ring/', $n )) { return null; }
		$n = preg_replace( '/ring/', '', $n );
		return intval( $n );
	};
	date_default_timezone_set( "America/Los_Angeles" );

	$freescore  = [ 'version' => 3.5, 'copyright' => (new DateTime( 'now' ))->format( 'Y' ) ];
	$host       = "freescore.net";
	$tournament = [ 
		"name" => "FreeScore",
		"db"   => "test", 
	];
	$rings = [];
	$rings[ 'grassroots' ] = preg_grep( '/^\./', scandir( '/usr/local/freescore/data/' . $tournament[ 'db' ] . '/forms-grassroots' ), PREG_GREP_INVERT );
	$rings[ 'worldclass' ] = preg_grep( '/^\./', scandir( '/usr/local/freescore/data/' . $tournament[ 'db' ] . '/forms-worldclass' ), PREG_GREP_INVERT );
	$rings = array_values( array_filter( array_map( 'get_ring_number', array_unique( array_merge( $rings[ 'grassroots' ], $rings[ 'worldclass' ] )))));
	$tournament[ 'rings' ] = $rings;
	$tournament = json_encode( $tournament );
?>
