<?php

class BreakingDivision {
	public $divid;
	public $ring;
	public $db;
	public $data;
	
	function __construct( $divid, $ring='staging', $db='test' ) {
		$this->divid = $divid;
		$this->ring  = $ring;
		$this->db    = $db;

		$file = $this->file();
		if( ! file_exists( $file )) { return; }
		$this->read( $file );
	}

	function file() {
		$divid = $this->divid;
		$ring  = $this->ring();
		$db    = $this->db;

		return "/usr/local/freescore/data/{$db}/feats-breaking/{$ring}/div.{$divid}.txt";
	}

	function list() {
		$text = '';
		foreach( $this->data[ 'athletes' ] as $athlete ) {
			$text .= "{$athlete[ 'name' ]}\n";
		}
		return $text;
	}

	function json() {
		return json_encode( $this->data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
	}

	function read( $file ) {
		$lines  = file( $file );
		$header = preg_grep( '/^#/', $lines );
		$lines  = preg_grep( '/^#/', $lines, true ); # Filter header lines
		$lines  = preg_grep( '/^\s*$/', $lines, true ); # Filter empty lines
		$this->data = [ 'name' => $this->divid, 'ring' => $this->ring ];

		function is_valid_json( $data = null ) {
			if( empty( $data )) { return false; }
			@json_decode( $data );
			return (json_last_error() === JSON_ERROR_NONE);
		}

		// Parse Headers
		foreach( $header as $line ) {
			$line = rtrim( $line );
			$line = preg_replace( '/^#\s*/', '', $line );
			list( $key, $value ) = preg_split( '/=/', $line, 2 );
			if( is_valid_json( $value )) { $this->data[ $key ] = json_decode( $value, true ); }
			else                         { $this->data[ $key ] = $value; }       
		}

		// Parse Athletes
		$this->data[ 'athletes' ] = [];
		foreach( $lines as $line ) {
			$athlete = explode( "\t", $line );
			$name    = array_shift( $athlete );
			$info    = array_shift( $athlete );
			$scores  = array_map( function( $data ) { return is_valid_json( $data ) ? json_decode( $data, true ) : ''; }, $athlete );
			$athlete = [ 'name' => $name, 'info' => $info, 'scores' => $scores ];
			array_push( $this->data[ 'athletes' ], $athlete );
		}
	}

	function ring() {
		if( $this->ring == 'staging' ) { return $this->ring; }
		return sprintf( 'ring%02d', $this->ring );
	}
}
