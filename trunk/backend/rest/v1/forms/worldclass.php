<?php

class Worldclass extends REST {
	private $divid = null;
	private $ring  = null;
	private $db    = null;
	const SUBDIR   = 'forms-worldclass';

	function __construct( $request ) {
		
		$this->divid = isset( $request[ 'id' ]) ? $request[ 'id' ] : $this->get_param( 'divid' );
		$this->ring  = $this->get_param( 'ring' );
		$this->db    = $this->get_param( 'db', 'test' );
		$this->path  = "/usr/local/freescore/data/{$this->db}/" . self::SUBDIR;
	}

	function delete( $id ) {
	}

	function get( $id = null ) {
		return $this->divisions();
	}

	function patch( $data, $id = null ) { 
	}

	function post( $data ) { 
	}

	private function divisions() {
		$rings     = $this->lsgrep( $this->path, '/^(?:ring\d{2}|staging)$/' );
		$divisions = [];
		foreach( $rings as $ring ) {
			if( isset( $this->ring ) && $ring != $this->ring ) { continue; }

			$files = $this->lsgrep( "{$this->path}/{$ring}", '/^div\.(?:\w+\d+\w*)\.txt$/' );
			foreach( $files as $file ) {
				$matches = [];
				preg_match( '/^(?:div|match)\.(\w+\d+\w*)\.txt$/', $file, $matches );
				$found = $matches[ 1 ];
				if( isset( $this->divid ) && $found != $this->divid ) { continue; }

				if( isset( $divisions[ $found ])) { continue; }
				$divisions[ $found ] = $this->read_division( "{$this->path}/{$ring}/{$file}" );
			}
		}
		return $divisions;
	}

	private function read_division( $file ) {
		$division = [ 'athletes' => []];
		$athletes = [];
		$athlete  = [];
		$round    = null;

		$add_athlete = function ( &$athlete ) use ( &$division, &$athletes, &$round ) {
			if( ! isset( $athlete[ 'name' ])) { return; }
			if( ! isset( $athletes[ $athlete[ 'name' ]])) { $athletes[ $athlete[ 'name' ]] = $athlete; }
			$division[ 'order' ][ $round ] []= $athlete[ 'name' ];
			$athlete = [];
		};

		$fp = fopen( $file, 'r' );
		if( ! $fp ) { return null; }

		while(( $line = fgets( $fp )) !== false ) {
			$line    = rtrim( $line );
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
						case 'placements':
							$meta = $this->parse_metadata( $value, 'dict' );
							break;

						default:
							$meta = $value;
							break;
					}
					$division[ $key ] = $meta;

				} else {
					$matches = [];
					preg_match( '/(prelim|semfin|finals)/', $line, $matches );
					if( isset( $matches[ 1 ])) {
						$round = $matches[ 1 ];
						$division[ 'round' ] = $round;
					}

					$add_athlete( $athlete );
				}
			} else if( preg_match( '/^\w/', $line )) {

				$add_athlete( $athlete );

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
				if( ! isset( $athlete[ 'score' ]))                                       { $athlete[ 'score' ]                                       = []; }
				if( ! isset( $athlete[ 'score' ][ $round ]))                             { $athlete[ 'score' ][ $round ]                             = []; }
				if( ! isset( $athlete[ 'score' ][ $round ][ 'forms' ]))                  { $athlete[ 'score' ][ $round ][ 'forms' ]                  = []; }
				if( ! isset( $athlete[ 'score' ][ $round ][ 'forms' ][ $f ]))            { $athlete[ 'score' ][ $round ][ 'forms' ][ $f ]            = []; }
				if( ! isset( $athlete[ 'score' ][ $round ][ 'forms' ][ $f ][ 'judge' ])) { $athlete[ 'score' ][ $round ][ 'forms' ][ $f ][ 'judge' ] = []; }

				if( preg_match( '/^[jr]/', $judge )) {
					$major      = array_shift( $info );
					$minor      = array_shift( $info );
					$power      = array_shift( $info );
					$rhythm     = array_shift( $info );
					$ki         = array_shift( $info );
					$athlete[ 'score' ][ $round ][ 'forms' ][ $f ][ 'judge' ][ $j ] = [ 'major' => $major, 'minor' => $minor, 'power' => $power, 'rhythm' => $rhythm, 'ki' => $ki ];

				} else if( preg_match( '/^p/', $judge )) {
					$bounds     = array_shift( $info );
					$timelimit  = array_shift( $info );
					$restart    = array_shift( $info );
					$misconduct = array_shift( $info );
					$time       = array_shift( $info );
					$athlete[ 'score' ][ $round ][ 'penalty' ] = [ 'bounds' => $bounds, 'timelimit' => $timelimit, 'restart' => $restart, 'misconduct' => $misconduct, 'time' => $time ];

				} else if( preg_match( '/^s/', $judge )) {
					foreach( $info as $decision ) {
						list( $type, $value ) = explode( '=', $decision, 2 );
						$athlete[ 'score' ][ $round ][ 'forms' ][ $f ][ 'decision' ][ $type ] = 1;
					}
				}
			}
		}
		$add_athlete( $athlete );
		$first = null;
		foreach( [ 'prelim', 'semfin', 'finals' ] as $round ) {
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
}

?>
