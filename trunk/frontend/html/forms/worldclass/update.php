<?php
	include( '../../include/php/config.php' );
	date_default_timezone_set( 'America/Los_Angeles' );
	header('Content-Type: text/event-stream');
	header('Cache-Control: no-cache');

	$ring        = sprintf( "ring%02d", intval( $_GET[ "ring" ] ) ?: 1 );
	$json        = json_decode( $tournament );
	$db          = $json->db;
	$source_path = "/Volumes/ramdisk/$db/forms-worldclass/$ring";

	// ============================================================
	function criteria( $string ) {
	// ============================================================
		$score = array();
		$score[ 'major'  ]  = -1.0;
		$score[ 'minor'  ]  = -1.0;
		$score[ 'rhythm' ]  = -1.0;
		$score[ 'power'  ]  = -1.0;
		$score[ 'ki'     ]  = -1.0;
		if( $criteria = preg_split( '/\//', $string )) {
			$score[ 'major'  ] = array_shift( $criteria );
			$score[ 'minor'  ] = array_shift( $criteria );
			$score[ 'rhythm' ] = array_shift( $criteria );
			$score[ 'power'  ] = array_shift( $criteria );
			$score[ 'ki'     ] = array_shift( $criteria );
		}
		return $score;
	}

	// ============================================================
	function read_division( $path, $div_id ) {
	// ============================================================
		$division = array();
		$division[ 'athletes' ] = array();

		$file = "$path/div.$div_id.txt";
		if( $handle = @fopen( $file, "r" )) {
			while( $line = fgets( $handle )) {
				$line = trim( $line );
				if( preg_match( '/^#\s+(\w+)=(.*)$/', $line, $matches )) {
					$key   = $matches[ 1 ];
					$value = $matches[ 2 ];
					$division[ $key ] = $value;
				} else {
					$athlete = array();
					$data = preg_split( "/\t/", $line );
					$athlete[ 'name' ]   = array_shift( $data );
					$athlete[ 'belt' ]   = array_shift( $data );
					$athlete[ 'scores' ] = array_map( 'criteria', $data );
					$division[ 'athletes' ][] = $athlete;
				}
			}
		}

		return $division;
	}

	// ============================================================
	function read_progress( $path ) {
	// ============================================================
		$progress  = array();

		// ===== FIND ALL CURRENTLY AVAILABLE DIVISIONS
		$progress[ 'divisions' ] = array();
		if( $handle = opendir( $path )) {
			while( false !== ($entry = readdir( $handle ))) {
				if( preg_match( '/^div\.(-?\w+)\.txt$/', $entry, $matches )) {
					$progress[ 'divisions' ][] = $matches[ 1 ];
				}
			}
		}

		// ===== FIND CURRENT PROGRESS
		$file = "$path/progress.txt";
		if( $handle = @fopen( $file, "r" )) {
			while( $line = fgets( $handle )) {
				rtrim( $line );
				if( preg_match( '/^#\s+(\w+)=(.*)$/', $line, $matches )) {
					$key   = $matches[ 1 ];
					$value = $matches[ 2 ];
					$progress[ $key ] = $value;
				}
			}
		} else {
			$progress[ 'current' ] = $progress[ 'divisions' ][ 0 ];
		}
		$division = read_division( $path, $progress[ 'current' ] );
		$progress[ 'id' ]       = $progress[ 'current' ]  ?: 0;
		$progress[ 'current' ]  = $division[ 'current' ]  ?: 0;
		$progress[ 'state' ]    = $division[ 'state' ]    ?: 'display';
		$progress[ 'athletes' ] = $division[ 'athletes' ];
		return $progress;
	}

	// ============================================================
	function update( $id, $progress, $previous ) {
	// ============================================================

		// ===== COMPARE PREVIOUS UPDATE CYCLE DATA WITH CURRENT DATA
		$copy    = $progress;
		unset( $copy[ 'state' ] ); // Score/display state shouldn't affect current object state
		$current = md5( json_encode( $copy ));
		if( $current == $previous ) { $progress[ 'updated' ] = false; }
		else                        { $progress[ 'updated' ] = true;  }

		$data     = json_encode( $progress );
		$previous = $current;

		echo "id: $id"     . PHP_EOL;
		echo "data: $data" . PHP_EOL;
		echo PHP_EOL;
		ob_flush();
		flush();
		return $current;
	}

	// ============================================================
	// SERVER SENT EVENT LOOP
	// ============================================================
	$state = null;
	while( true ) { 
		$id = time();
		$progress = read_progress( $source_path );
		$state = update( $id, $progress, $state );
		usleep( 500000 );
	}
?>
