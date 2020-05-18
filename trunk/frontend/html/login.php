<?php
	include_once( __DIR__ . '/include/php/config.php' );

	# ============================================================
	# PASSWORDS
	# ============================================================
	# The password file is in the root directory for the tournament
	# data (e.g. backend/data/test/passwd.json)
	#
	# The password can be set per tournament, per ring, per role,
	# and even for individual judges.
	# 
	# The algorithm matches the broadest applicable password first,
	# so if there is a tournament-wide password, that password will
	# work regardless of the ring, role, and judge number.
	#
	# For lowest security, simply delete the passwd.json file and
	# no passwords will be needed.
	#
	# For highest security, set the passwords for each individual
	# role, and specifically for each judge. 
	#
	# A reasonable middle-of-the road approach would have ring-level
	# passwords and reset the passwords every day of the tournament.
	# ------------------------------------------------------------

	function read_passwd_file( $file ) {
		$string = file_get_contents( $file ) or die( "Can't read password file '$file'" );
		$passwd = json_decode( $string, true );
		return $passwd;
	}

	function authenticate() {
		$_SESSION[ 'auth' ] = true;
		echo( "Authenticated" );
		exit();
	}

	function logout() {
		$_SESSION[ 'auth' ] = false;
		echo( "Logged Out" );
		exit();
	}

	function get_arg( $key ) {
		$arg = null;
		if( isset( $_COOKIE[ $key ])) { $arg = $_COOKIE[ $key ]; }
		if( isset( $_GET[ $key ]))    { $arg = $_GET[ $key ]; } # overrides cookies
		if( $key == 'ring' && $arg != 'staging' ) {
			$arg = sprintf( "ring%02d", $arg );
		}
		if( $key == 'judge' ) {
			if( $arg = 0 ) { $arg = 'r'; }
			else { $arg = 'j' . (intval( $arg ) + 1); }
		}
		return $arg;
	}

	function match_password( $passwd, $given ) {
		if( ! is_array( $passwd ))                     { return false; }
		if( ! array_key_exists( 'password', $passwd )) { return false; }
		return( $passwd[ 'password' ] == $given );
	}

	function validate( $given, $passwd, $keys = [] ) {
		if( ! is_string( $given )) { return false; }
		if( ! $given )             { return false; }
		if( is_string( $passwd ))  { return false; }
		if( ! is_array( $passwd )) { return false; }

		# Tournament-level global password
		if( match_password( $passwd, $given )) { return true; }

		$ref = $passwd;
		foreach ($keys as &$key) {
			if( ! is_array( $ref ))               { return false; }
			if( ! array_key_exists( $ref, $key )) { return false; }
			$ref = $ref[ $key ];
			if( match_password( $ref, $given ))   { return true; }
		}

		return false;
	}

	$passwd_file = '/usr/local/freescore/data/' . json_decode( $tournament )->db . '/passwd.json';

	# ===== NO PASSWORD FILE
	if( ! file_exists( $passwd_file )) { authenticate(); }

	# ===== LOGOUT REQUEST
	if( isset( $_GET[ 'logout' ]))     { logout(); }

	$passwd = read_passwd_file( $passwd_file );
	$ring   = get_arg( 'ring' );
	$role   = get_arg( 'role' );
	$judge  = get_arg( 'judge' );

	if( isset( $_POST[ 'passcode' ])) { 
		$given  = $_POST[ 'passcode' ];
		$valid  = null;

		# ===== HANDLE LOGIN REQUEST
		$keys = [];
		if( $ring )  { array_push( $keys, $ring ); }
		if( $role )  { array_push( $keys, $role ); }
		if( $judge ) { array_push( $keys, $judge ); }

		$valid = get_pass( $valid, $passwd, $keys );

		if( $valid && $given == $valid ) { authenticate(); }
	}
?>
