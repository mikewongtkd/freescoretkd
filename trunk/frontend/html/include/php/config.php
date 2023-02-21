<?php
	class Config {
		public $data;

		public function __construct() {
			$paths = [ '/usr/local/freescore', '/usr/freescore', '/home/ubuntu/freescore', '/freescore', '/home/root/freescore' ];
			foreach( $paths as $path ) {
				$file = "{$path}/config.json";
				if( ! file_exists( $file )) { continue; }

				$text = file_get_contents( $file );
				$data = json_decode( $text, true );

				$this->data = $data;
				return;
			}

			$this->data = null;
			die( "No configuration file found" );
		}

		public function host() {
			$config = $this->data;
			if( ! array_key_exists( 'host', $config )) { return 'http://freescore.net'; } # Default
			$http = 'http://';
			$host = $config[ 'host' ];
			$port = '';
			if( array_key_exists( 'protocol', $config ) && preg_match( '/^https/i',   $config[ 'protocol' ])) { $http = 'https://'; } else { $http = 'http://'; } # Default
			if( ! array_key_exists( 'port', $config ) || $config[ 'port' ] == 80 ) { $port = ''; } else { $port = ":{$config[ 'port' ]}"; }

			$url = "{$http}{$host}{$port}";
			return $url;
		}

		public function password( $ring = null ) {
			$config = $this->data;
			if( ! array_key_exists( 'password', $config )) { return null; }

			if( ! is_array( $config[ 'password' ])) { return $config[ 'password' ]; }
			if( is_null( $ring )) { return null; }
			if( ! array_key_exists( $ring, $config[ 'password' ])) { return null; }

			return $config[ 'password' ][ $ring ];
		}

		public function services() {
			$config = $this->data;
			if( ! array_key_exists( 'service', $config )) { return []; }
			return array_keys( $config[ 'service' ]);
		}

		public function tournament() {
			$config = $this->data;
			function get_ring_number( $n ) {
				if( ! preg_match( '/ring/', $n )) { return null; }
				$n = preg_replace( '/ring/', '', $n );
				return intval( $n );
			}
			$tournament = $config[ 'tournament' ];
			$services = [ 
				'worldclass' => 'forms-worldclass', 
				'grassroots' => 'forms-grassroots', 
				'freestyle'  => 'forms-freestyle' 
			];

			$rings = [];
			foreach( $services as $service => $path ) {
				$rings[ $service ] = array_values( preg_grep( '/ring|staging/', scandir( '/usr/local/freescore/data/' . $tournament[ 'db' ] . "/{$path}" )));
			}

			$rings = array_unique( array_merge( ... array_values( $rings )));
			$rings = array_values( array_filter( array_map( 'get_ring_number', $rings )));
			sort( $rings );
			$tournament[ 'rings' ] = $rings;
			$tournament = json_encode( $tournament );

			return $tournament;
		}

		public function websocket( $service ) {
			$config = $this->data;
			$ws     = 'ws://'; # Default
			$port   = '';
			$path   = '';
			if( array_key_exists( 'protocol', $config ) && preg_match( '/^https/i', $config[ 'protocol' ])) { 
				$ws   = 'wss://'; 
				$port = '';
				$path = "/{$service}/request";

			} else if( array_key_exists( 'service', $config ) && array_key_exists( $service, $config[ 'service' ])) {
				$port = ":{$config[ 'service' ][ $service ]}";
				$path = "/{$service}";
				
			}
			$host = $config[ 'host' ];

			$url = "{$ws}{$host}{$port}{$path}";
			return $url;
		}

	}

	$config     = new Config();
	$host       = $config->host();
	$tournament = $config->tournament();
?>
