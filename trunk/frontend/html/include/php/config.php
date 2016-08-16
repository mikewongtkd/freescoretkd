<?php
	$host = "freescore.net";
	$tournament = [ 
		"name" => "FreeScore Test Data",
		"db"   => "test", 
	];
	function filter_ring_name( $n ) {
		if( preg_match( '/ring/', $n )) {
			$n = preg_replace( '/ring/', '', $n );
			return intval( $n );
		}
	};
	$rings = [];
	$rings[ 'grassroots' ] = preg_grep( '/^\./', scandir( '/Volumes/ramdisk/' . $tournament[ 'db' ] . '/forms-grassroots' ), PREG_GREP_INVERT );
	$rings[ 'worldclass' ] = preg_grep( '/^\./', scandir( '/Volumes/ramdisk/' . $tournament[ 'db' ] . '/forms-worldclass' ), PREG_GREP_INVERT );
	$rings = array_values( array_filter( array_map( 'filter_ring_name', array_unique( array_merge( $rings[ 'grassroots' ], $rings[ 'worldclass' ] )))));
	$tournament[ 'rings' ] = $rings;
	$tournament = json_encode( $tournament );
?>
