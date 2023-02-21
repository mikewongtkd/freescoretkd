<?php
	include_once( __DIR__ . "/../config.php" );
	include_once( __DIR__ . "/../../../session.php" );

	verify_authentication( $config );

	function verify_authentication( $config ) {
		if( array_key_exists( 'password', $config )) {
			$host = config_host( $config );
			if( ! array_key_exists( 'is_auth', $_SESSION ) || ! $_SESSION[ 'is_auth' ]) {
				header( "Location: {$host}/login.php" )
			}
		}
	}
?>
