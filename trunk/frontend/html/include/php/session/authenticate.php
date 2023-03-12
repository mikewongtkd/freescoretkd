<?php
	include_once( __DIR__ . "/../config.php" );
	include_once( __DIR__ . "/../../../session.php" );

	verify_authentication( $config );

	function verify_authentication( $config ) {
		// If the app is configured without passwords, then no authentication is necessary
		if( is_null( $config->password())) { return; }

		// Otherwise redirect the user if they are not authorized
		$host = $config->host();
		if( ! array_key_exists( 'is_auth', $_SESSION ) || ! $_SESSION[ 'is_auth' ]) {
			$referrer = urlencode( base64_encode( $_SERVER[ 'HTTP_REFERER' ]));
			$message  = urlencode( base64_encode( 'User is unauthorized' ));
			header( "Location: {$host}/login.php?referrer={$referrer}&{$message}" );
			exit();
		}
	}
?>
