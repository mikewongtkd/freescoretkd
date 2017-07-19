<?php
	function get_ring_number( $n ) {
		if( ! preg_match( '/ring/', $n )) { return null; }
		$n = preg_replace( '/ring/', '', $n );
		return intval( $n );
	};

	$host       = "freescore.net";
	$tournament = [ 
		"name" => "FreeScore",
		"db"   => "test", 
	];
	$rings = [];
	$rings[ 'grassroots' ] = preg_grep( '/ring|staging/', scandir( '/usr/local/freescore/data/' . $tournament[ 'db' ] . '/forms-grassroots' ));
	$rings[ 'worldclass' ] = preg_grep( '/ring|staging/', scandir( '/usr/local/freescore/data/' . $tournament[ 'db' ] . '/forms-worldclass' ));
	$rings[ 'freestyle' ]  = preg_grep( '/ring|staging/', scandir( '/usr/local/freescore/data/' . $tournament[ 'db' ] . '/forms-freestyle'  ));
	$rings = array_values( array_filter( array_map( 'get_ring_number', array_unique( array_merge( $rings[ 'grassroots' ], $rings[ 'worldclass' ], $rings[ 'freestyle' ] )))));
	asort( $rings );
	$tournament[ 'rings' ] = $rings;
	$tournament = json_encode( $tournament );
?>
