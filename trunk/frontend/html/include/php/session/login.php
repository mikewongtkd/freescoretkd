<?php
	include_once( __DIR__ . "/../config.php" );
	include_once( __DIR__ . "/../../../session.php" );


	authenticate();

	function authenticate( $password ) {
		$host     = $config->host();
		$referrer = urlencode( base64_encode( $_SERVER[ 'HTTP_REFERER' ]));
		$message  = urlencode( base64_encode( 'Please provide a password' ));
		if( ! isset( $_POST[ 'password' ])) {
			header( "Location: {$host}/login.php?referrer= {$referrer}&{$message}" );
		}
		$password = $_POST[ 'password' ];
	}
?>
