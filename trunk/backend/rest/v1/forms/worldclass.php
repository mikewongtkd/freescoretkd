<?php

include_once( __DIR__ . '/worldclass/division.php' );

class Worldclass extends REST {
	private $divid = null;
	private $ring  = null;
	private $db    = null;
	const SUBDIR   = 'forms-worldclass';

	function __construct( $request ) {
		
		$ring = $this->get_param( 'ring' );
		if( intval( $ring )) { $ring = sprintf( "ring%02d", $ring ); }

		$this->divid = isset( $request[ 'id' ]) ? $request[ 'id' ] : $this->get_param( 'divid' );
		$this->ring  = $ring;
		$this->db    = $this->get_param( 'db', 'test' );
		$this->path  = "/usr/local/freescore/data/{$this->db}/" . self::SUBDIR;
	}

	function delete() {
	}

	function get() {
		return $this->divisions();
	}

	function patch( $data ) { 
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
				$division = new Division( "{$this->path}/{$ring}/{$file}" );
				$divisions[ $found ] = $division->data();
			}
		}
		return $divisions;
	}

}

?>
