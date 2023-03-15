<?php
	session_name( 'freescore-session' );
	session_save_path( '/usr/local/freescore/sessions' );
	session_start();

	class Session {
		static function authenticate( $referrer = null ) {
			global $config;

			// If no password is needed, do nothing
			if( $config->password() === false ) { return; }

			// If already authorized, do nothing
			if( isset( $_SESSION[ 'is_auth' ]) && $_SESSION[ 'is_auth' ]) { return; }

			// Set referrer
			if( isset( $_GET[ 'referrer' ])) { $referrer = $_GET[ 'referrer' ]; }
			if( ! isset( $referrer )) { $referrer = $_SERVER[ 'HTTP_REFERER' ]; }
			if( ! isset( $referrer )) {
				$protocol = (( ! empty( $_SERVER[ 'HTTPS' ]) && $_SERVER[ 'HTTPS' ] != 'off') || $_SERVER[ 'SERVER_PORT' ] == 443) ? "https://" : "http://";
				$url = "{$protocol}{$_SERVER[ 'HTTP_HOST' ]}{$_SERVER[ 'REQUEST_URI' ]}";
				$referrer = $url;
			}

			if( preg_match( '/index.php/', $referrer )) {
				$host = $config->host();
				$referrer = Session::urlencode( $referrer );
				Session::redirect( "{$host}/login.php?referrer=$referrer" );

			} else {
				Session::error( 'Unauthorized', $referrer );
			}
		}

		static function login() {
			global $config;
			$host     = $config->host();
			$ring     = null;

			// Set referrer
			$referrer = "{$host}/index.php";
			if( isset( $_GET[ 'referrer' ])) { $referrer = $_GET[ 'referrer' ]; }

			// If already authorized, go straight to resource
			if( isset( $_SESSION[ 'is_auth' ]) && $_SESSION[ 'is_auth' ]) { Session::redirect( $referrer ); }

			// Get password
			if( ! isset( $_POST[ 'password' ])) { Session::error( 'Please provide a password', $referrer ); }
			$password = $_POST[ 'password' ];
			if( $password == '' ) { Session::error( 'Please provide a valid password', $referrer ); }

			// Get ring
			if     ( isset( $_GET[ 'ring' ]))  { $ring = $_GET[ 'ring' ];  $ring = $ring == 'staging' ? $ring : sprintf( 'ring%02d', $ring ); }
			else if( isset( $_POST[ 'ring' ])) { $ring = $_POST[ 'ring' ]; $ring = $ring == 'staging' ? $ring : sprintf( 'ring%02d', $ring ); }

			$correct = $config->password( $ring );
			if( $correct == '' ) { Session::error( 'Configuration error: invalid password set in configuration' ); }
			if( $password != $correct ) { Session::error( 'Password does not match our records' ); }

			$_SESSION[ 'is_auth' ] = 1;
			Session::redirect( $referrer );
		}

		static function logout() {
			$_SESSION[ 'is_auth' ] = 0;
			session_unset();
			session_destroy();
			Session::redirect();
		}

		static function redirect( $referrer = null ) {
			global $config;
			$host = $config->host();

			if( isset( $_GET[ 'referrer' ])) { $referrer = $_GET[ 'referrer' ]; }
			if( ! isset( $referrer )) { $referrer = "{$host}/login.php"; }
			header( "Location: {$referrer}" );
			exit();
		}

		static function error( $message = null, $referrer = null ) {
			global $config;
			$host = $config->host();
			if( isset( $_GET[ 'referrer' ])) { $referrer = $_GET[ 'referrer' ]; }
			if( ! isset( $message )) { $error = 'Unknown error'; }
			$message  = Session::urlencode( $message );
			if( isset( $referrer )) {
				$referrer = Session::urlencode( $referrer );
				header( "Location: {$host}/login.php?referrer={$referrer}&message={$message}" );
			} else {
				header( "Location: {$host}/login.php?message={$message}" );
			}
			exit();
		}

		static function urlencode( $string ) {
			return rawurlencode( base64_encode( $string ));
		}

		static function urldecode( $string ) {
			return base64_decode( rawurldecode( $string ));
		}
	}
?>
