<?php
	session_name( 'freescore-session' );
	session_save_path( '/usr/local/freescore/sessions' );
	session_start();

	class Session {
		static function authenticate() {
			$referrer = null;

			// If already authorized, do nothing
			if( isset( $_SESSION[ 'is_auth' ]) && $_SESSION[ 'is_auth' ]) { return; }

			// Set referrer
			if( isset( $_GET[ 'referrer' ])) { $referrer = $_GET[ 'referrer' ]; }
			if( ! isset( $referrer )) { $referrer = Session::urlencode( $_SERVER[ 'HTTP_REFERER' ]); }

			Session::error( 'Unauthorized', $referrer );
		}

		static function login( $password = null ) {
			$ring     = null;
			$referrer = null;

			// If already authorized, do nothing
			if( isset( $_SESSION[ 'is_auth' ]) && $_SESSION[ 'is_auth' ]) { return; }

			// Set referrer
			if( isset( $_GET[ 'referrer' ])) { $referrer = $_GET[ 'referrer' ]; }
			if( ! isset( $referrer )) { $referrer = Session::urlencode( $_SERVER[ 'HTTP_REFERER' ]); }

			// Get password
			if( ! isset( $password ) && ! isset( $_POST[ 'password' ])) {
				Session::error( 'Please provide a password', $referrer );
			}
			$password = $_POST[ 'password' ];

			// Get ring
			if     ( isset( $_GET[ 'ring' ]))  { $ring = $_GET[ 'ring' ];  $ring = $ring == 'staging' ? $ring : sprintf( 'ring%02d', $ring ); }
			else if( isset( $_POST[ 'ring' ])) { $ring = $_POST[ 'ring' ]; $ring = $ring == 'staging' ? $ring : sprintf( 'ring%02d', $ring ); }

			$correct = $config->password( $ring );

			if( $password != $correct ) {
				Session::error( 'Password does not match our records' );
			}

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
			if( isset( $referrer )) {
				$referrer = Session::urlencode( $referrer );
				$message  = Session::urlencode( $message );
				header( "Location: {$host}/login.php?referrer={$referrer}&message={$message}" );
			} else {
				header( "Location: {$host}/login.php?message={$message}" );
			}
			exit();
		}

		static function urlencode( $string ) {
			return urlencode( base64_encode( $string ));
		}

		static function urldecode( $string ) {
			return base64_decode( urldecode( $string ));
		}
	}
?>
