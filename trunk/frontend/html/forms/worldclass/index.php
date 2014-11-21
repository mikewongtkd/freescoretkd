<?php 
	if( ! isset( $_COOKIE[ 'ring' ])) { header( 'Location: ../../setup/register.php?referer=../forms/worldclass/index.php' ); exit(); }
	$an_hour_ago = time() - 3600;
	setcookie( 'judge', '', $an_hour_ago, '/' );
	setcookie( 'role', 'display', 0, '/' );
	include( "../../include/php/config.php" ); 
?>
<html>
	<head>
		<link href="../../include/css/forms/worldclass/worldclassApp.css" rel="stylesheet" />
		<link href="../../include/css/flippable.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jQuery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/jquery/js/jquery.totemticker.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
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
