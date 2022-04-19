<?php

class Division {
	const ROUNDS         = [ 'prelim', 'semfin', 'finals' ];
	const SCORE_CRITERIA = [ 'major', 'minor', 'power', 'rhythm', 'ki' ];
	const ACCURACY       = [ 'major', 'minor' ];
	const PRESENTATION   = [ 'power', 'rhythm', 'ki' ];
	const PENALTIES      = [ 'bounds', 'timelimit', 'restart', 'misconduct', 'time' ];
	private $data = [];

	function __construct( $file ) {
		if( file_exists( $file )) {
			$this->data = $this->read( $file );
			$this->calculate_scores();
			$this->calculate_placements();
		}
	}

	private function calculate_placements() {
	}

	private function calculate_scores() {

		$division = &$this->data;
		foreach( Division::ROUNDS as $rid ) {
			if( ! array_key_exists( $rid, $division[ 'order' ])) { continue; }
			foreach( $division[ 'order' ][ $rid ] as $aid ) {
				$athlete = &$division[ 'athletes' ][ $aid ];
				$round   = &$athlete[ 'scores' ][ $rid ];

				foreach( $round[ 'forms' ] as $fid => &$form ) {
					$complete     = [];
					$accuracy     = [];
					$presentation = [];

					foreach( $form[ 'judge' ] as $jid => &$score ) {
						$complete[ $jid ]     = array_product( array_map( function( $x ) use ( $score ) { return floatval( $score[ $x ]) != 0.0; }, Division::PRESENTATION)) ? 1 : 0;
						$complete[ $jid ]     = $complete[ $jid ] && (floatval( $score[ 'major' ]) > 0 || floatval( $score[ 'minor' ]) > 0) ? 1 : 0; // In practice, perfect accuracy is not allowed
						$accuracy[ $jid ]     = floatval( sprintf( "%.1f", 4.0 - array_sum( array_map( function( $x ) use( $score ) { return floatval( $score[ $x ]); }, Division::ACCURACY ))));
						$presentation[ $jid ] = floatval( sprintf( "%.1f", array_sum( array_map( function( $x ) use( $score ) { return floatval( $score[ $x ]); }, Division::PRESENTATION ))));
						$score[ 'complete' ]  = $complete[ $jid ];

						if( $score[ 'complete' ]) {
								$score[ 'acc' ]   = $accuracy[ $jid ];
								$score[ 'pre' ]   = $presentation[ $jid ];
								$score[ 'total' ] = floatval( sprintf( "%.1f", $accuracy[ $jid ] + $presentation[ $jid ]));
						}
					}
					$form[ 'complete' ] = array_product( $complete ) ? 1 : 0;
					$form[ 'complete' ] = $form[ 'complete' ] || isset( $form[ 'decision' ]) ? 1 : 0;

					if( ! $form[ 'complete' ]) { continue; }
					$n = count( $form[ 'judge' ]);
					$form[ 'original' ] = [];
					$form[ 'original' ][ 'accuracy' ]     = floatval( sprintf( "%.2f", floatval( array_sum( array_map( function( $score ) { return $score[ 'acc' ]; }, $form[ 'judge' ])) / $n )));
					$form[ 'original' ][ 'presentation' ] = floatval( sprintf( "%.2f", floatval( array_sum( array_map( function( $score ) { return $score[ 'pre' ]; }, $form[ 'judge' ])) / $n )));
					$form[ 'original' ][ 'total' ]        = floatval( sprintf( "%.2f", $form[ 'original' ][ 'accuracy' ] + $form[ 'original' ][ 'presentation' ]));

					$maxmin = [];
					foreach( [ 'acc', 'pre' ] as $category ) {
							$scores = $form[ 'judge' ];
							$values = array_map( function( $score ) use ( $category ) { return $score[ $category ]; }, $scores );
							$maxs = array_keys( $values, max( $values ));
							$mins = array_keys( $values, min( $values ));

							$max = min( $maxs );
							$min = min( $mins );
							if( $max == $min ) { $min = $max + 1; }

							$minval = $scores[ $min ][ $category ] === null ? 0.0 : $scores[ $min ][ $category ];
							$maxval = $scores[ $max ][ $category ] === null ? 0.0 : $scores[ $max ][ $category ];

							$maxmin[ $category ] = [ 'min' => [ 'index' => $min, 'value' => $minval ], 'max' => [ 'index' => $max, 'value' => $maxval ]];
					}

					$form[ 'maxmin' ] = $maxmin;
					if( $n <= 3 ) {
						$form[ 'adjusted' ][ 'accuracy' ]     = $form[ 'original' ][ 'accuracy' ];
						$form[ 'adjusted' ][ 'presentation' ] = $form[ 'original' ][ 'presentation' ];
						$form[ 'adjusted' ][ 'total' ]        = $form[ 'original' ][ 'total' ];

					} else if( $n >= 4 ) {
						$m = $n - 2;
						$form[ 'adjusted' ][ 'accuracy' ]     = floatval( sprintf( "%.2f", floatval( array_sum( array_map( function( $score ) { return $score[ 'acc' ]; }, $form[ 'judge' ]))) - ($maxmin[ 'acc' ][ 'min' ][ 'value' ] + $maxmin[ 'acc' ][ 'max' ][ 'value' ]) / $m ));
						$form[ 'adjusted' ][ 'presentation' ] = floatval( sprintf( "%.2f", floatval( array_sum( array_map( function( $score ) { return $score[ 'pre' ]; }, $form[ 'judge' ]))) - ($maxmin[ 'pre' ][ 'min' ][ 'value' ] + $maxmin[ 'pre' ][ 'max' ][ 'value' ]) / $m ));
						$form[ 'adjusted' ][ 'total' ]        = floatval( sprintf( "%.2f", $form[ 'adjusted' ][ 'accuracy' ] + $form[ 'adjusted' ][ 'presentation' ]));
					}
				}

				$round[ 'complete' ] = array_product( array_map( function( $x ) { return $x[ 'complete' ]; }, $round[ 'forms' ])) ? 1 : 0;
				$round[ 'complete' ] = $round[ 'complete' ] || count( array_filter( $round[ 'forms' ], function( $form ) { return isset( $form[ 'decision' ]); })) > 0 ? 1 : 0;
				if( $round[ 'complete' ]) {
						$n = count( $round[ 'forms' ]);
						$round[ 'original' ][ 'accuracy' ]     = floatval( sprintf( "%.3f", floatval( array_sum( array_map( function( $form ) { return $form[ 'original' ][ 'accuracy' ];     }, $round[ 'forms' ])) / $n)));
						$round[ 'original' ][ 'presentation' ] = floatval( sprintf( "%.3f", floatval( array_sum( array_map( function( $form ) { return $form[ 'original' ][ 'presentation' ]; }, $round[ 'forms' ])) / $n)));
				}
			}
		}
	}

	public function data() { return $this->data; }

	private function parse_metadata( $meta, $type = null ) {
		switch( $type ) {
			case 'flight':
				list( $id, $group, $state ) = preg_split( '/\s*;\s*/', $meta );
				list( $key, $id ) = preg_split( '/\s*:\s*/', $id );
				list( $key, $group ) = preg_split( '/\s*:\s*/', $group );
				$group = preg_split( '/\s*,\s*/', $group );
				list( $key, $state ) = preg_split( '/\s*:\s*/', $state );
				return [ 'id' => $id, 'group' => $group, 'state' => $state ];

			case 'dict':
				$dicts  = preg_split( '/\s*;\s*/', $meta );
				$rounds = [];
				foreach( $dicts as $dict ) {
					list( $round, $list ) = preg_split( '/\s*:\s*/', $dict );
					$list = preg_split( '/\s*,\s*/', $list );
					$rounds[ $round ] = $list;
				}
				return $rounds;

			case 'json':
				return json_decode( $meta, true );

			default:
				return null;
		}
	}

	private function read( $file ) {
		$division = [ 'athletes' => []];
		$athletes = [];
		$athlete  = [];
		$round    = null;

		$add_athlete = function ( &$athlete, $round ) use ( &$division, &$athletes ) {
			if( ! isset( $round )) { return; }
			if( ! isset( $athlete[ 'name' ])) { return; }
			if( ! isset( $athletes[ $athlete[ 'name' ]])) { $athletes[ $athlete[ 'name' ]] = $athlete; }
			$division[ 'order' ][ $round ] []= $athlete[ 'name' ];
			$athlete = [];
		};

		$fp = fopen( $file, 'r' );
		if( ! $fp ) { return null; }

		while(( $line = fgets( $fp )) !== false ) {
			$line = rtrim( $line );
			if( preg_match( '/^#/', $line )) {
				if( preg_match( '/=/', $line )) {
					$line = preg_replace( '/^#\s*/', '', $line );
					list( $key, $value ) = preg_split( '/\s*=\s*/', $line );
					$meta = null;
					switch( $key ) {
						case 'flight':
							$meta = $this->parse_metadata( $value, 'flight' );
							break;

						case 'forms':
						case 'tiebreakers':
						case 'places':
						case 'placement':
							$meta = $this->parse_metadata( $value, 'dict' );
							break;

						default:
							$meta = $value;
							break;
					}
					$division[ $key ] = $meta;

				} else {
					$add_athlete( $athlete, $round );

					$matches = [];
					$regex   = implode( '|', Division::ROUNDS );
					preg_match( "/({$regex})/", $line, $matches );
					if( isset( $matches[ 1 ])) {
						$round = $matches[ 1 ];
						if( ! isset( $division[ 'round' ])) { $division[ 'round' ] = $round; }
					}
				}
			} else if( preg_match( '/^\w/', $line )) {

				$add_athlete( $athlete, $round );

				if( array_key_exists( $athlete[ 'name' ], $athletes )) {
					$athlete = $athletes[ $athlete[ 'name' ]];

				} else {
					$info = explode( "\t", $line );
					$name = array_shift( $info );

					$athlete[ 'name' ] = $name;
					if( count( $info ) > 0 ) { $athlete[ 'info' ] = []; }
					foreach( $info as $keyvalue ) {
						list( $key, $value ) = explode( '=', $keyvalue, 2 );
						$athlete[ 'info' ][ $key ] = $value;
					}
				}

			} else if( preg_match( '/^\t\w/', $line )) {
				$line   = ltrim( $line );
				$info   = explode( "\t", $line );
				$sround = array_shift( $info );
				$form   = array_shift( $info );
				$judge  = array_shift( $info );

				$f = intval( substr( $form, 1, 1 )) - 1;
				$j = $judge == 'r' ? 0 : intval( substr( $judge, 1, 1 ));
				if( ! isset( $athlete[ 'scores' ]))                                       { $athlete[ 'scores' ]                                       = []; }
				if( ! isset( $athlete[ 'scores' ][ $round ]))                             { $athlete[ 'scores' ][ $round ]                             = []; }
				if( ! isset( $athlete[ 'scores' ][ $round ][ 'forms' ]))                  { $athlete[ 'scores' ][ $round ][ 'forms' ]                  = []; }
				if( ! isset( $athlete[ 'scores' ][ $round ][ 'forms' ][ $f ]))            { $athlete[ 'scores' ][ $round ][ 'forms' ][ $f ]            = []; }
				if( ! isset( $athlete[ 'scores' ][ $round ][ 'forms' ][ $f ][ 'judge' ])) { $athlete[ 'scores' ][ $round ][ 'forms' ][ $f ][ 'judge' ] = []; }

				if( preg_match( '/^[jr]/', $judge )) {
					$score      = [];
					foreach( Division::SCORE_CRITERIA as $key ) {
						$score[ $key ] = floatval( array_shift( $info ));
					}
					$athlete[ 'scores' ][ $round ][ 'forms' ][ $f ][ 'judge' ][ $j ] = $score;

				} else if( preg_match( '/^p/', $judge )) {
					$penalties  = [];
					foreach( Division::SCORE_CRITERIA as $key ) {
						$penalties[ $key ] = array_shift( $info );
					}
					$athlete[ 'scores' ][ $round ][ 'penalty' ] = $penalties;

				} else if( preg_match( '/^s/', $judge )) {
					foreach( $info as $decision ) {
						list( $type, $value ) = explode( '=', $decision, 2 );
						$athlete[ 'scores' ][ $round ][ 'forms' ][ $f ][ 'decision' ][ $type ] = 1;
					}
				}
			}
		}
		$add_athlete( $athlete, $round );
		$first = null;
		foreach( Division::ROUNDS as $round ) {
			if( array_key_exists( $round, $division[ 'order' ])) { $first = $round; break; }
		}
		$lookup = [];
		foreach( $division[ 'order' ][ $first ] as $name ) {
			$lookup[ $name ] = count( $division[ 'athletes' ]);
			$division[ 'athletes' ] []= $athletes[ $name ];
		}
		foreach( $division[ 'order' ] as $round => &$order ) {
			$order = array_map( function( $name ) use ( $lookup ) { return $lookup[ $name ]; }, $order );
		}

		if( ! feof( $fp )) { die( "Error in reading file '{$file}' $!" ); }

		fclose( $fp );
		return $division;
	}

	public function update( $data ) {
		$this->data = $data;
	}

	public function write() {
	}
}

?>
