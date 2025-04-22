<?php
class App {
	public $addons;
	public $cwd;
	public $parameter;
	public $url;
	public $title;

	public function __construct( $ring = null, $role = null ) {
		$this->get_parameters([ "ring" => $ring, "role" => $role ]);
		$this->cwd       = preg_replace( '/var/www/html/', '', getcwd() );
		$this->url       = $config->websocket( 'worldclass', $this->ring, $role );
		$this->externals = json_decode( file_get_contents( 'externals.json' ));
	}

	public function add_external( $name, $css, $js, $requires ) {
		$css      = is_array( $css )      ? $css      : [ $css ];
		$js       = is_array( $js )       ? $js       : [ $js ];
		$requires = is_array( $requires ) ? $requires : [ $requires ];
		$this->externals->{ $name } = [ "css" => $css, "js" => $js, "requires" => $requires ];
	}

	public function get_parameters( $default ) {
		$parameters = [
			"divid" => [ "regex" => "/\w+\d+(?:\w+)?/" ],
			"flip"  => [ "values" => [ 0, 1 ]],
			"judge" => [ "values" => [ range( 0, 6 )]],
			"ring"  => [ "values" => [ range( 1, 30 ), "staging" ]],
			"role"  => [ "values" => [ "admin", "computer+operator", "display", "judge", "judge0", "judge1", "judge2", "judge3", "judge4", "judge5", "judge6" ]]
		];

		$this->parameter = [];

		foreach( $parameters as $name => $parameter ) {
			if( isset( $_GET[ $name ]))    { $value = $_GET[ $name ];    } else 
			if( isset( $_COOKIE[ $name ])) { $value = $_COOKIE[ $name ]; }

			if( isset( $parameter[ "values" ]) && in_array( $value, $parameter[ "values" ])) {
				$this->parameter[ $name ] = is_numeric( $value ) ? intval( $value ) : $value;

			} else if( isset( $parameter[ "regex" ]) && preg_match( $parameter[ "regex" ], $value )) {
				$this->parameter[ $name ] = $value;

			} else if( isset( $default[ $name ])) {
				$this->parameter[ $name ] = $default[ $name ];
			}
		}
	}

	public function header() {
		include( "/include/php/config.php" ); 
		include( '/session.php' );
		$html = [
			"css" => [],
			"js"  => []
		];
		$nocache = bin2hex( random_bytes( 16 ));
		foreach( $this->externals as $name => $external ) {
			foreach( $external->css as $css ) { 
				if( isset( $external->cache ) && $external->cache === false ) {
					array_push( $html[ "css" ], "<link href=\"{$css}?{$nocache}\" rel=\"stylesheet\" />\n" ); 
				} else {
					array_push( $html[ "css" ], "<link href=\"{$css}\" rel=\"stylesheet\" />\n" ); 
				}
			}
			foreach( $external->js  as $js )  { 
				if( isset( $external->cache ) && $external->cache === false ) {
					array_push( $html[ "js" ], "<script src=\"{$js}?{$nocache}\"></script>\n" ); 
				} else {
					array_push( $html[ "js" ], "<script src=\"{$js}\"></script>\n" ); 
				}
			}
		}
		return "<html>\n\t<head>\n" . $this->title() . implode( "", $html[ "css" ]) . implode( "", $html[ "js" ]) . "\t</head>\n";
	}

	public function remove_external( $name ) {
		if( ! isset( $name, $this->externals->{ $name })) {
			echo( "External reference to '$name' not found" );
			return;
		}
		unset( $this->externals->{ $name });
	}

	public function title( $text = null ) {
		if( $text === null ) {
			return "\t<title>{$this->title}</title>\n";
		} else {
			$this->title = $text;
		}
	}
}

?>
