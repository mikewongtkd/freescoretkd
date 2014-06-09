<?php
	include( '../../include/php/config.php' );
	date_default_timezone_set( 'America/Los_Angeles' );
	header('Content-Type: text/event-stream');
	header('Cache-Control: no-cache');

	$source_path = "/Volumes/ramdisk/$tournament/forms-worldclass";

	// ============================================================
	function accuracy_presentation( $string ) {
	// ============================================================
		$score = array();
		$score[ 'accuracy' ]     = -1.0;
		$score[ 'presentation' ] = -1.0;
		if( preg_match( '/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/', $string, $matches )) {
			$score[ 'accuracy' ]     = $matches[ 1 ];
			$score[ 'presentation' ] = $matches[ 2 ];
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
					$athlete[ 'scores' ] = array_map( 'accuracy_presentation', $data );
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
	function update( $id, $data ) {
	// ============================================================
		echo "id: $id"     . PHP_EOL;
		echo "data: $data" . PHP_EOL;
		echo PHP_EOL;
		ob_flush();
		flush();
	}

	// ============================================================
	// SERVER SENT EVENT LOOP
	// ============================================================
	while( true ) {
		$id = time();
		$progress = read_progress( $source_path );
		update( $id, json_encode( $progress ) );
		usleep( 500000 );
	}
?>
