<?php 
	$clear_cookie = time() - 3600; # set cookie expiration data to an hour ago (expire immediately)
	include( "../../include/php/config.php" ); 
	$i = isset( $_GET[ 'ring' ] ) ? $_GET[ 'ring' ] : $_COOKIE[ 'ring' ];
	$k = json_decode( $tournament )->rings->count;
	if( $i == 'staging' || (ctype_digit( $i ) && (integer) $i >= 1 && (integer) $i <= $k)) { 
		setcookie( 'ring', $i, 0, '/' ); 
		$cookie_set = true;
	} else {
		echo "Ring number invalid.";
		# header( 'Location: ../../setup/register.php?referer=../forms/worldclass/index.php' ); exit(); 
	}
	if( ! ($cookie_set || isset( $_COOKIE[ 'ring' ]))) { echo "Ring number not set."; }
	# if( ! isset( $_COOKIE[ 'ring' ])) { header( 'Location: ../../setup/register.php?referer=../forms/worldclass/index.php' ); exit(); }
	setcookie( 'judge', '', $clear_cookie, '/' );
	setcookie( 'role', 'display', 0, '/' );
?>
<html>
	<head>
		<link href="../../include/css/forms/worldclass/worldclassApp.css" rel="stylesheet" />
		<link href="../../include/css/flippable.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/mobile/jquery.mobile-1.4.5.min.js"></script>
		<script src="../../include/jquery/js/jquery.fittext.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/jquery/js/jquery.totemticker.min.js"></script>
 		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/jquery.errormessage.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.worldclass.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.leaderBoard.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.judgeScore.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.scoreBoard.js"></script>
	</head>
	<body>
		<div id="worldclass"></div>
		<script type="text/javascript">
			$( '#worldclass' ).worldclass({ tournament : <?= $tournament ?> });
		</script>
	</body>
</html>
