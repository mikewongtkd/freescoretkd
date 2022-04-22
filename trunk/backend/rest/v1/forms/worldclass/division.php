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

	// ============================================================
	private function calculate_placements() {
	// ============================================================
		$division  = &$this->data;
		$placement = [];
		foreach( Division::ROUNDS as $rid ) {
			if( ! array_key_exists( $rid, $division[ 'order' ])) { continue; }
			$round_placements = array_filter( $division[ 'order' ][ $rid ], function( $aid ) use ( $division, $rid ) { return $division[ 'athletes' ][ $aid ][ 'scores' ][ $rid ][ 'complete' ]; });
			usort( $round_placements, function( $a, $b ) use ( $division, $rid ) {
				$scorea = $division[ 'athletes' ][ $a ][ 'scores' ][ $rid ];
				$scoreb = $division[ 'athletes' ][ $b ][ 'scores' ][ $rid ];
				$namea  = $division[ 'athletes' ][ $a ][ 'name' ];
				$nameb  = $division[ 'athletes' ][ $b ][ 'name' ];

				$deca = isset( $scorea[ 'decision' ]);
				$decb = isset( $scoreb[ 'decision' ]);

				$adjtot = $scoreb[ 'adjusted' ][ 'total' ]        <=> $scorea[ 'adjusted' ][ 'total' ];
				$adjpre = $scoreb[ 'adjusted' ][ 'presentation' ] <=> $scorea[ 'adjusted' ][ 'presentation' ];
				$oritot = $scoreb[ 'original' ][ 'total' ]        <=> $scorea[ 'original' ][ 'total' ];
				$cmp    = $adjtot == 0 ? ($adjpre == 0 ? ($oritot == 0 ? 0 : $oritot) : $adjpre) : $adjtot;

				if( ! $deca && ! $decb ) { return	$cmp; } else 
				if(   $deca && ! $decb ) { return  1;   } else 
				if( ! $deca &&   $decb ) { return -1;   } else 
				if(   $deca &&   $decb ) {
					$dsqa = isset( $scorea[ 'decision' ][ 'disqualify' ]);
					$dsqb = isset( $scoreb[ 'decision' ][ 'disqualify' ]);
					$wdra = isset( $scorea[ 'decision' ][ 'withdraw' ]);
					$wdrb = isset( $scoreb[ 'decision' ][ 'withdraw' ]);
					$name = strcmp( $namea, $nameb );

					if( $dsqa && $dsqb ) { return $name; } else
					if( $wdra && $dsqb ) { return -1;    } else
					if( $dsqa && $wdrb ) { return  1;    } else
					if( $wdra && $wdrb ) { return $name; }
				}
			});

			$placement[ $rid ] = $round_placements;
		}
		$division[ 'placement' ] = $placement;

		$results = [];
		foreach( Division::ROUNDS as $rid ) {
			if( ! array_key_exists( $rid, $placement )) { continue; }
			$results[ $rid ] = [];
			$round_placements = $placement[ $rid ];
			$n = count( $round_placements ) - 1;

			foreach( range( 0, $n ) as $place ) {
				$aid   = $round_placements[ $place ];
				$score = $division[ 'athletes' ][ $aid ][ 'scores' ][ $rid ];

				$dsq = isset( $score[ 'decision' ]) && isset( $score[ 'decision' ][ 'disqualify' ]);
				$wdr = isset( $score[ 'decision' ]) && isset( $score[ 'decision' ][ 'withdraw' ]);

				if( $dsq ) { $results[ $rid ][ $place ] = [ 'aid' => $aid, 'total' => 'DSQ' ]; } else
				if( $wdr ) { $results[ $rid ][ $place ] = [ 'aid' => $aid, 'total' => 'WDR' ]; } else
						       { $results[ $rid ][ $place ] = [ 'aid' => $aid, 'total' => $score[ 'adjusted' ][ 'total' ]]; }
			}

			if( $n <= 1 ) { continue; }
			foreach( range( 0, $n - 1 ) as $place ) {
				$next   = $place + 1;
				$aida   = $round_placements[ $place ];
				$aidb   = $round_placements[ $next ];
				$scorea = $division[ 'athletes' ][ $aida ][ 'scores' ][ $rid ];
				$scoreb = $division[ 'athletes' ][ $aidb ][ 'scores' ][ $rid ];

				$dec    = isset( $scorea[ 'decision' ]);

				$tied   = floatval( sprintf( "%.3f", $scoreb[ 'adjusted' ][ 'total' ]        - $scorea[ 'adjusted' ][ 'total' ])) == 0;
				$tb1    = floatval( sprintf( "%.3f", $scoreb[ 'adjusted' ][ 'presentation' ] - $scorea[ 'adjusted' ][ 'presentation' ])) == 0;

				if( $tied && ! $dec ) {
					$results[ $rid ][ $place ][ 'tb1' ] = $scorea[ 'adjusted' ][ 'presentation' ];
					$results[ $rid ][ $next  ][ 'tb1' ] = $scoreb[ 'adjusted' ][ 'presentation' ];

					if( $tb1 ) {
						$results[ $rid ][ $place ][ 'tb2' ] = $scorea[ 'original' ][ 'total' ];
						$results[ $rid ][ $next  ][ 'tb2' ] = $scoreb[ 'original' ][ 'total' ];
					}
				}
			}
		}
		$division[ 'results' ] = $results;
	}

	// ============================================================
	private function calculate_scores() {
	// ============================================================

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
					$n = $division[ 'judges' ];
					$form[ 'original' ] = [];
					$form[ 'original' ][ 'accuracy' ]     = floatval( sprintf( "%.2f", floatval( array_sum( array_map( function( $s ) { return $s[ 'acc' ]; }, $form[ 'judge' ])) / $n )));
					$form[ 'original' ][ 'presentation' ] = floatval( sprintf( "%.2f", floatval( array_sum( array_map( function( $s ) { return $s[ 'pre' ]; }, $form[ 'judge' ])) / $n )));
					$form[ 'original' ][ 'total' ]        = floatval( sprintf( "%.2f", $form[ 'original' ][ 'accuracy' ] + $form[ 'original' ][ 'presentation' ]));

					$maxmin = [];
					foreach( [ 'acc', 'pre' ] as $category ) {
							$scores = $form[ 'judge' ];
							$values = array_map( function( $s ) use ( $category ) { return $s[ $category ]; }, $scores );
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
						$form[ 'adjusted' ][ 'accuracy' ]     = floatval( sprintf( "%.2f", (floatval( array_sum( array_map( function( $s ) { return $s[ 'acc' ]; }, $form[ 'judge' ]))) - ($maxmin[ 'acc' ][ 'min' ][ 'value' ] + $maxmin[ 'acc' ][ 'max' ][ 'value' ])) / $m ));
						$form[ 'adjusted' ][ 'presentation' ] = floatval( sprintf( "%.2f", (floatval( array_sum( array_map( function( $s ) { return $s[ 'pre' ]; }, $form[ 'judge' ]))) - ($maxmin[ 'pre' ][ 'min' ][ 'value' ] + $maxmin[ 'pre' ][ 'max' ][ 'value' ])) / $m ));
						$form[ 'adjusted' ][ 'total' ]        = floatval( sprintf( "%.2f", $form[ 'adjusted' ][ 'accuracy' ] + $form[ 'adjusted' ][ 'presentation' ]));
					}
				}
				$decisions = array_map( function( $form ) { return $form[ 'decision' ]; }, array_filter( $round[ 'forms' ], function( $form ) { return isset( $form[ 'decision' ]); }));
				if( count( $decisions ) > 0 ) { $round[ 'decision' ] = $decisions[ 0 ]; }

				$round[ 'complete' ] = array_product( array_map( function( $x ) { return $x[ 'complete' ]; }, $round[ 'forms' ])) ? 1 : 0;
				$round[ 'complete' ] = $round[ 'complete' ] || count( $decisions ) > 0 ? 1 : 0;
				if( $round[ 'complete' ]) {
						$n = count( $round[ 'forms' ]);
						$round[ 'original' ][ 'accuracy' ]     = floatval( sprintf( "%.3f", floatval( array_sum( array_map( function( $form ) { return $form[ 'original' ][ 'accuracy' ];     }, $round[ 'forms' ])) / $n)));
						$round[ 'original' ][ 'presentation' ] = floatval( sprintf( "%.3f", floatval( array_sum( array_map( function( $form ) { return $form[ 'original' ][ 'presentation' ]; }, $round[ 'forms' ])) / $n)));
						$round[ 'original' ][ 'total' ]        = floatval( sprintf( "%.3f", $round[ 'original' ][ 'accuracy' ] + $round[ 'original' ][ 'presentation' ]));
						$round[ 'adjusted' ][ 'accuracy' ]     = floatval( sprintf( "%.3f", floatval( array_sum( array_map( function( $form ) { return $form[ 'adjusted' ][ 'accuracy' ];     }, $round[ 'forms' ])) / $n)));
						$round[ 'adjusted' ][ 'presentation' ] = floatval( sprintf( "%.3f", floatval( array_sum( array_map( function( $form ) { return $form[ 'adjusted' ][ 'presentation' ]; }, $round[ 'forms' ])) / $n)));
						$round[ 'adjusted' ][ 'total' ]        = floatval( sprintf( "%.3f", $round[ 'adjusted' ][ 'accuracy' ] + $round[ 'adjusted' ][ 'presentation' ]));
				}
			}
		}
	}

	// ============================================================
	public function data() { return $this->data; }
	// ============================================================

	// ============================================================
	private function encode_metadata( $meta, $type = null ) {
	// ============================================================
		switch( $type ) {
			case 'flight':
				$group  = implode( ',', $meta[ 'group' ]);
				$flight = sprintf( "id:%s;group:%s;state:%s", $meta[ 'id' ], $group, $meta[ 'state' ] );
				return $flight;

			case 'dict':
				$list = [];
				foreach( array_keys( $meta ) as $key ) {
					$list []= $key . ":" . implode( ',', $meta[ $key ]);
				}
				return implode( ';', $list );

			case 'json':
				return json_encode( $meta );

			default:
				return null;
		}
	}

	// ============================================================
	private function parse_metadata( $meta, $type = null ) {
	// ============================================================
		switch( $type ) {
			case 'flight':
				list( $id, $group, $state ) = preg_split( '/\s*;\s*/', $meta );
				list( $key, $id ) = preg_split( '/\s*:\s*/', $id );
				list( $key, $group ) = preg_split( '/\s*:\s*/', $group );
				$group = preg_split( '/\s*,\s*/', $group );
				list( $key, $state ) = preg_split( '/\s*:\s*/', $state );
				return [ 'id' => $id, 'group' => $group, 'state' => $state ];

			case 'dict':
				$keyvalues  = preg_split( '/\s*;\s*/', $meta );
				$dict = [];
				foreach( $keyvalues as $keyvalue ) {
					list( $key, $value ) = preg_split( '/\s*:\s*/', $keyvalue );
					$list = preg_split( '/\s*,\s*/', $value );
					$dict[ $key ] = $list;
				}
				return $dict;

			case 'json':
				return json_decode( $meta, true );

			default:
				return null;
		}
	}

	// ============================================================
	private function read( $file ) {
	// ============================================================
		$division = [ 'athletes' => [], 'file' => $file ];
		$athletes = [];
		$athlete  = [];
		$round    = null;

		$add_athlete = function ( $athlete, $round ) use ( &$division, &$athletes ) {
			if( ! isset( $athlete[ 'name' ])) { return; }
			if( ! isset( $round )) { return; }
			$name = $athlete[ 'name' ];
			if( ! isset( $athletes[ $name ])) { $athletes[ $name ] = $athlete; }
			$division[ 'order' ][ $round ] []= $athlete[ 'name' ];
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

					$matches = [];
					$regex   = implode( '|', Division::ROUNDS );
					preg_match( "/({$regex})/", $line, $matches );
					if( isset( $matches[ 1 ])) {
						$athlete = $add_athlete( $athlete, $round );
						$round = $matches[ 1 ];
						if( ! isset( $division[ 'round' ])) { $division[ 'round' ] = $round; }
					}
				}
			} else if( preg_match( '/^\w/', $line )) {

				$add_athlete( $athlete, $round );

				$info = explode( "\t", $line );
				$name = array_shift( $info );

				if( array_key_exists( $name, $athletes )) { 
					$athlete = &$athletes[ $name ]; 

				} else {
					$athlete = [];
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
				$record = array_shift( $info );

				$fid = intval( substr( $form, 1, 1 )) - 1;

				if( ! isset( $athlete[ 'scores' ]))                                          { $athlete[ 'scores' ]                                          = []; }
				if( ! isset( $athlete[ 'scores' ][ $sround ]))                               { $athlete[ 'scores' ][ $sround ]                               = []; }
				if( ! isset( $athlete[ 'scores' ][ $sround ][ 'forms' ]))                    { $athlete[ 'scores' ][ $sround ][ 'forms' ]                    = []; }
				if( ! isset( $athlete[ 'scores' ][ $sround ][ 'forms' ][ $fid ]))            { $athlete[ 'scores' ][ $sround ][ 'forms' ][ $fid ]            = []; }
				if( ! isset( $athlete[ 'scores' ][ $sround ][ 'forms' ][ $fid ][ 'judge' ])) { $athlete[ 'scores' ][ $sround ][ 'forms' ][ $fid ][ 'judge' ] = []; }

				if( preg_match( '/^[jr]/', $record )) {
					$jid   = $record == 'r' ? 0 : intval( substr( $record, 1, 1 ));
					$score = [];
					foreach( Division::SCORE_CRITERIA as $key ) {
						$score[ $key ] = floatval( array_shift( $info ));
					}
					$athlete[ 'scores' ][ $sround ][ 'forms' ][ $fid ][ 'judge' ][ $jid ] = $score;

				} else if( preg_match( '/^p/', $record )) {
					$penalties  = [];
					foreach( Division::SCORE_CRITERIA as $key ) {
						$penalties[ $key ] = array_shift( $info );
					}
					$athlete[ 'scores' ][ $sround ][ 'forms' ][ $fid ][ 'penalty' ] = $penalties;

				} else if( preg_match( '/^s/', $record )) {
					foreach( $info as $decision ) {
						list( $type, $value ) = explode( '=', $decision, 2 );
						$athlete[ 'scores' ][ $sround ][ 'forms' ][ $fid ][ 'decision' ][ $type ] = 1;
					}
				}
				if( $sround == 'finals' && $fid == 1 && $jid == 4 ) { 
					$name = $athlete[ 'name' ];
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

	// ============================================================
	public function update( $data ) {
	// ============================================================
		$this->data = $data;
	}

	// ============================================================
	public function write() {
	// ============================================================
		$division = $this->data;

		$this->calculate_scores();
		$this->calculate_placements();

		$fp = fopen( $division[ 'file' ], 'w' );
		if( ! $fp ) { return null; }

		fprintf( $fp, "# state=%s\n", $division[ 'state' ] );
		fprintf( $fp, "# current=%s\n", $division[ 'current' ] );
		fprintf( $fp, "# form=%s\n", $division[ 'form' ] );
		fprintf( $fp, "# round=%s\n", $division[ 'round' ] );
		fprintf( $fp, "# judges=%s\n", $division[ 'judges' ] );
		if( isset( $division[ 'autopilot' ])) { fprintf( $fp, "# autopilot=%s\n", $division[ 'autopilot' ]); }
		if( isset( $division[ 'method' ])) { fprintf( $fp, "# autopilot=%s\n", $division[ 'method' ]); }
		fprintf( $fp, "# description=%s\n", $division[ 'description' ]);
		fprintf( $fp, "# forms=%s\n", $this->encode_meta( $division[ 'forms' ], 'dict' ));
		if( isset( $division[ 'placement' ])) { fprintf( $fp, "# forms=%s\n", $this->encode_meta( $division[ 'placement' ], 'dict' )); }
		if( isset( $division[ 'flight' ])) { fprintf( $fp, "# forms=%s\n", $this->encode_meta( $division[ 'flight' ], 'flight' )); }

		foreach( Division::ROUNDS as $rid ) {
			if( ! array_key_exists( $rid, $division[ 'order' ])) { continue; }
			$order = $division[ 'order' ][ $rid ];
			if( ! isset( $order )) { continue; }

			fprintf( $fp, "# ------------------------------------------------------------\n" );
			fprintf( $fp, "# %s\n", $rid );
			fprintf( $fp, "# ------------------------------------------------------------\n" );

			$forms = intval( $division[ 'forms' ][ $rid ]);

			foreach( $order as $aid ) {
				$athlete = $division[ 'athletes' ][ $aid ];
				$info    = implode( "\t", array_map( function( $meta ) { return encode_meta( $meta, 'json' ); }, $athlete[ 'info' ]));
				fprintf( $fp, "%s\t%s\n", $athlete[ 'name' ], $info );

				foreach( $athlete[ 'scores' ][ $rid ][ 'forms' ] as $f => $form ) {
					$fid = $f + 1;
					if( isset( $form[ 'decision' ])) {
						if( isset( $form[ 'decision' ][ 'disqualify' ])) {
							fprintf( $fp, "\t%s\tf%d\ts\t%s\n", $rid, $fid, "disqualify=1" );

						} else if( isset( $form[ 'decision' ][ 'withdraw' ])) {
							fprintf( $fp, "\t%s\tf%d\ts\t%s\n", $rid, $fid, "withdraw=1" );
						}
					}

					if( isset( $form[ 'penalty' ])) {
						$penalty = $form[ 'penalty' ];
						$string  = vsprintf( "%.1f\t%.1f\t%.1f\t%d\t%s", array_map( function( $x ) use ( $penalty ) { return $penalty[ $x ]; }, Division::PENALTIES ));
						fprintf( $fp,"\t%s\tf%d\tp\t%s\n", $rid, $fid, $string );
					}

					foreach( $form[ 'judge' ] as $j => $score ) {
						$jid    = $j == 0 ? 'r' : "j{$j}";
						$string = vsprintf( $fp, "%.1f\t%.1f\t%.1f\t%.1f\t%.1f", array_map( function( $x ) use ( $score ) { return $score[ $x ]; }, Division::SCORE_CRITERIA ));
						fprintf( $fp, "\t%s\tf%d\t%s\t%s\n", $rid, $fid, $jid, $string );
					}
				}
			}
		}
	}
}

?>
