<?php
	// Extend the Standard PHP Library (SPL) to enable autoloading classes
	spl_autoload_register( function ( $class_name ) { include_once "/usr/local/freescore/api/{$class_name}.php"; });

	list( $class, $uuid ) = parse_http_request();
	$object               = factory_instantiate( $class );

	send_rest_response( $object, $uuid );
	exit();


	// ============================================================
	function parse_http_request() {
	// ============================================================
	// Parse the HTTP Request to identify which class is requested
	// ------------------------------------------------------------
		$paths = explode( '/', $_SERVER[ 'REQUEST_URI' ]);
		array_shift( $paths ); # Empty path, since URI starts with /
		array_shift( $paths ); # api
		array_shift( $paths ); # version
		$class = array_shift( $paths ); # class definition filename
		$uuid  = null;

		if( ! preg_match( '/^api$/',  $api     ) { http_response_code( 400 ); die(); }
		if( ! preg_match( '/^v\d+$/', $version ) { http_response_code( 400 ); die(); }

		// If there is one additional argument, it's a UUID
		if( count( $paths ) == 1 ) {
			$uuid = array_shift( $paths );

		// If there are more than one remaining arguments, the request is malformed
		} else if( count( $paths ) > 1 ) {
			http_response_code( 400 );
			die();
		}
		return [ $class, $uuid ];
	}

	// ============================================================
	function factory_instantiate( $class, $version ) {
	// ============================================================
		$classes = array_filter( scandir( "/usr/local/freescore/api/{$version}" ), function ( $item ) { return preg_match( '/\.php$/i', $item ); });
		$classes = array_map( function( $item ) { return preg_replace( '/\.php$/i', '', $item ); }, $classes );

		if( ! in_array( $class, $classes )) {
			http_response_code( 404 );
			die();
		}

		include_once( "/usr/local/freescore/api/{$class}.php" );
		$classes = get_declared_classes();
		$object  = null;
		foreach( $classes as $candidate ) {
			$reflector = new ReflectionClass( $candidate );
			$filename  = $reflector->getFileName();
			if( ! $filename ) { continue; } // Built-in classes do not have a filename

			if( $filename == "/usr/local/freescore/api/{$class}.php" ) {
				$factory = $candidate;
				$object  = new $factory();
			}
		}

		return $object;
	}

	// ============================================================
	function send_rest_response( $object, $uuid ) {
	// ============================================================
		$method = strtolower( $_SERVER[ 'REQUEST_METHOD' ]);
		if( ! preg_match( '/^(?:delete|get|patch|post)$/i', $method )) {
			http_response_code( 500 );
			die();
		}

		if( $object === null ) {
			http_response_code( 404 );
			die();
		}

		switch( $method ) {
			case 'delete':
				$object->delete( $uuid );
				http_response_code( 204 );
				break;

			case 'get':
				$rows = $object->get( $_GET, $uuid );
				http_response_code( 200 );
				header( 'Content-Type: application/json; charset=utf-8' );
				echo( json_encode( $rows ));
				break;

			case 'patch':
				$data = file_get_contents( 'php://input' );
				$object->patch( $data, $uuid );
				http_response_code( 204 );
				break;

			case 'post':
				$object->post( $_POST, $uuid );
				http_response_code( 200 );
				break;
		}
	}

?>
