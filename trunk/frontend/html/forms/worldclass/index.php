<?php 
	$clear_cookie = time() - 3600; # set cookie expiration data to an hour ago (expire immediately)
	include( "../../include/php/config.php" ); 
	$ring = isset( $_GET[ 'ring' ] ) ? $_GET[ 'ring' ] : $_COOKIE[ 'ring' ];
	$k = in_array( $ring, json_decode( $tournament )->rings );
	$warning = "";
	if( $ring == 'staging' || (ctype_digit( $ring ) && (integer) $ring >= 1 && (integer) $ring <= $k)) { 
		setcookie( 'ring', $ring, 0, '/' ); 
		$cookie_set = true;
	} else {
		$warning = "Ring number invalid.";
		# header( 'Location: ../../forms/worldclass/register.php?referer=../forms/worldclass/index.php' ); exit(); 
	}
	if( ! ($cookie_set || isset( $_COOKIE[ 'ring' ]))) { echo "Ring number not set."; }
	# if( ! isset( $_COOKIE[ 'ring' ])) { header( 'Location: ../../forms/worldclass/register.php?referer=../forms/worldclass/index.php' ); exit(); }
	setcookie( 'judge', '', $clear_cookie, '/' );
	setcookie( 'role', 'display', 0, '/' );
	if( $warning ) { echo $warning; }
?>
<html>
	<head>
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/css/forms/worldclass/worldclassApp.css" rel="stylesheet" />
		<link href="../../include/css/flippable.css" rel="stylesheet" />
		<link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/themes/default.min.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/mobile/jquery.mobile-1.4.5.min.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/jquery/js/jquery.totemticker.min.js"></script>
		<script src="../../include/jquery/js/jquery.fittext.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
 		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
 		<script src="../../include/jquery/js/screenfull.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/alertify/alertify.min.js"></script>
		<script src="../../include/js/jquery.errormessage.js"></script>
		<script src="../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../include/js/forms/worldclass/division.class.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.worldclass.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.leaderBoard.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.judgeScore.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.scoreBoard.js"></script>
	</head>
	<body>
		<div id="worldclass"></div>
		<script type="text/javascript">
			$( '#worldclass' ).worldclass({ server: '<?= $host ?>', tournament : <?= $tournament ?>, ring : <?= $ring ?> });
			$( 'body' ).click( function() {
				if( screenfull.enabled ) { screenfull.toggle(); }
			});
		</script>
	</body>
</html>
