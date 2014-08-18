<?php
	include( '../../include/php/config.php' );
	date_default_timezone_set( 'America/Los_Angeles' );
	header('Content-Type: text/event-stream');
	header('Cache-Control: no-cache');

	$ring        = sprintf( "ring%02d", intval( $_COOKIE[ "ring" ] ) ?: 1 );
	$json        = json_decode( $tournament );
	$db          = $json->db;
	$source_path = "/Volumes/ramdisk/$db/forms-worldclass/$ring";

	// ============================================================
	function parse_scores( $string ) {
	// ============================================================
		$score = array();
		$scoring_criteria = preg_split( '/\//', $string );
		$score[ 'major'  ] = array_shift( $scoring_criteria ) ?: null;
		$score[ 'minor'  ] = array_shift( $scoring_criteria ) ?: null;
		$score[ 'rhythm' ] = array_shift( $scoring_criteria ) ?: null;
		$score[ 'power'  ] = array_shift( $scoring_criteria ) ?: null;
		$score[ 'ki'     ] = array_shift( $scoring_criteria ) ?: null;
		if( 
			is_null( $score[ 'major'  ]) &&
			is_null( $score[ 'minor'  ]) &&
			is_null( $score[ 'rhythm' ]) &&
			is_null( $score[ 'power'  ]) &&
			is_null( $score[ 'ki'     ])
		) {
			return null;
		} else {
			return $score;
		}
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
					$athlete[ 'scores' ] = array_map( 'parse_scores', $data );
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
		$progress[ 'id' ]       = $progress[ 'current' ]  ?: null;
		$progress[ 'current' ]  = $division[ 'current' ]  ?: "0";
		$progress[ 'state' ]    = $division[ 'state' ]    ?: 'display';
		$progress[ 'athletes' ] = $division[ 'athletes' ];
		return $progress;
	}

	// ============================================================
	function update( $id, $progress, $previous_state ) {
	// ============================================================

		// ===== KEEP TRACK OF UPDATES
		$progress[ 'updates' ] = array();
		$current_state         = array();

		// ===== IDENTIFY CHANGE OF CURRENT DIVISION
		$md5 = md5( $progess[ 'id' ]);
		array_push( $current_state, array( 'event' => 'id', 'md5' => $md5 ));
		foreach( $previous_state as $update ) {
			if( $update[ 'event' ] != 'id' ) { continue; }
			if( $update[ 'md5' ]   != $md5 ) { array_push( $progress[ 'updates' ], array( 'event' =>'id' )); }
		}
		// ===== IDENTIFY CHANGE OF CURRENT ATHLETE
		$md5 = md5( $progress[ 'current' ]);
		array_push( $current_state, array( 'event' => 'current', 'md5' => $md5 ));
		foreach( $previous_state as $update ) {
			if( $update[ 'event' ] != 'current' ) { continue; }
			if( $update[ 'md5' ]   != $md5 ) { array_push( $progress[ 'updates' ], array( 'event' =>'current' )); }
		}

		// ===== IDENTIFY UPDATES TO ATHLETE SCORES
		for( $i = 0; $i < count( $progress[ 'athletes' ]); $i++ ) {
			$athlete = $progress[ 'athletes' ][ $i ];

			for( $j = 0; $j < count( $athlete[ 'scores' ]); $j++ ) {
				$judge = $athlete[ 'scores' ][ $j ];
				if( is_null( $judge )) { $md5 = null; }
				else                   { $md5 = md5( json_encode( $judge )); }
				array_push( $current_state, array( 'event' => 'score', 'athlete' => $i, 'judge' => $j, 'md5' => $md5 ));

				foreach( $previous_state as $update ) {
					if( $update[ 'event' ]   != 'score' ) { continue; } // Ignore other update events
					if( $update[ 'athlete' ] != $i      ) { continue; } // Ignore scores for other athletes
					if( $update[ 'judge' ]   != $j      ) { continue; } // Ignore scores for other judges
					if( $update[ 'md5' ]     != $md5    ) { array_push( $progress[ 'updates' ], array( 'event' => 'score', 'athlete' => $i, 'judge' => $j + 1 )); } 
				}
			}
		}

		$data     = json_encode( $progress );

		echo "id: $id"     . PHP_EOL;
		echo "data: $data" . PHP_EOL;
		echo PHP_EOL;
		ob_flush();
		flush();
		return $current_state;
	}

	// ============================================================
	// SERVER SENT EVENT LOOP
	// ============================================================
	$state = array();
	while( true ) { 
		$id       = time();
		$progress = read_progress( $source_path );
		$state    = update( $id, $progress, $state );
		usleep( 500000 );
	}
?>
