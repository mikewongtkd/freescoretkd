<?php
/*
	Class to read the worldclass data.

	Abandoned when I realized after 2 days of feverish development that this
	only applies to server-side; it can't be used for dynamic editing.
*/
	class Header {
		function parse( $header ) {
			$this->header = [];
			$skip = false;
			foreach( $header as $line ) {
				$line = rtrim( $line );
				if( preg_match( "/^# \-+/", $line )) {
					if( $skip ) { $skip = false; continue; }
					else        { $skip = true;  }
				}
				if( $skip ) { continue; }
				$line = preg_replace( '/^#\s*/', '', $line );
				$keyvalue = preg_split( "/=/", $line, 2 );
				$this->header[ $keyvalue[0] ] = $keyvalue[1];
			}
		}

		function field( $key )   { return $this->header[ $key ]; }
		function order( $order ) { $this->header[ 'order' ] = $order; }
	};

	class Score {
		function __construct() {
			$this->scores   = [];
			$this->started  = false;
			$this->complete = false;
		}

		function append( $score ) {

			// ===== HELPER FUNCTIONS
			// Would like these to be static methods
			$_any = function ( $previous, $current ) { return $previous || $current; };
			$_all = function ( $previous, $current ) { return $previous && $current; };

			array_push( $this->scores, $score );
			$line         = trim( $score );
			if( ! preg_match( "/\b(?:r|j\d)\b/", $line )) { return; }

			// ===== PARSE JUDGE SCORE
			$values       = explode( "\t", $line );
			$round        = array_shift( $values );
			$form         = array_shift( $values );
			$judge        = array_shift( $values );
			$major        = array_shift( $values );
			$minor        = array_shift( $values );
			$presentation = $values;

			$complete = true;
			if( count( $presentation ) == 0 ) { $this->complete = false; return; }
			$this->started  = array_reduce( $presentation, $_any );
			$this->complete = array_reduce( $presentation, $_all );
		}

		function hasStarted() { return $this->started; }
		function isComplete() { return $this->complete; }
	};

	class Athletes {
		function parse( $athletes ) {
			$this->athletes = [];
			$this->order    = [];
			$name           = NULL; 
			$round          = NULL;
			$isRound        = false;


			foreach( $athletes as $line ) {
				$line = rtrim( $line );
				// ===== SKIP HEADER AND ROUND DELIMITERS
				if( preg_match( "/^\s*$/", $line )) { continue; } // Skip empty lines
				if( preg_match( "/^#/", $line )) {
					if( preg_match( "/^# \-+/", $line )) { $isRound = ! $isRound; continue; }
					if( $isRound ) { $round = preg_replace( "/^#\s+/", '', $line ); }
					continue;
				}

				// ===== PARSE ATHLETES, INFO, AND SCORES
				if( preg_match( "/^\t/", $line )) {
					$this->athletes[ $name ][ score ]->append( $line );
				} else {
					$info = explode( "\t", $line );
					$name = array_shift( $info );
					if( ! array_key_exists( $name,  $this->athletes )) { $this->athletes[ $name ] = [ info => $info, score => new Score()]; }
					if( ! array_key_exists( $round, $this->order    )) { $this->order[ $round ]   = []; }
					array_push( $this->order[ $round ], $name );
				}
			}
		}

		function names() {
			$athletes = [];
			foreach( $this->athletes as $name => $data ) {
				array_push( $athletes, $name );
			}
			echo join( "\n", $athletes );
		}

	};

	class Division {
		function __construct( $file ) {
			$this->id       = $file;
			$this->file     = $file;
			$this->id       = preg_replace( "/.*\//", '', $this->id );
			$this->id       = preg_replace( "/div\./i", '', $this->id );
			$this->id       = preg_replace( "/\.txt/i", '', $this->id );
			$this->header   = new Header();
			$this->athletes = new Athletes();
			$this->read( $file );
		}


		function read( $file ) {
			$lines    = file( $file );
			$header   = preg_grep( "/^#/", $lines );
			$this->header->parse( $header );
			$this->athletes->parse( $lines );
		}

		function write( $file ) {
			
		}
	};
?>
