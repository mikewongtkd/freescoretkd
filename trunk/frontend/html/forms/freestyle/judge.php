<?php 
	if( ! isset( $_COOKIE[ 'ring' ]) || ! isset( $_COOKIE[ 'role' ] ) || ! isset( $_COOKIE[ 'judge' ] )) { header( 'Location: ../../setup/register.php?referer=../forms/worldclass/judge.php' ); exit(); }
	include( "../../include/php/config.php" ); 
?>
<html>
	<head>
		<link href="../../include/css/ajaxbutton.css" rel="stylesheet" />
		<link href="../../include/css/flippable.css" rel="stylesheet" />
		<link href="../../include/css/forms/freestyle/judgeController.css" rel="stylesheet" />
		<link href="../../include/jquery/css/smoothness/jquery-ui.css" rel="stylesheet" />
		<link href="../../include/jquery/css/smoothness/smoothness.min.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery.tappy.js"></script>
		<script src="../../include/jquery/js/jquery.nodoubletapzoom.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.ui.touch-punch.min.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/jquery/js/jquery.timer.js"></script>
		<script src="../../include/jquery/js/jquery.totemticker.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/jquery.ajaxbutton.js"></script>
		<script src="../../include/js/forms/freestyle/jquery.judgeController.js"></script>
	</head>
	<body>
		<div id="judgeController"></div>
		<script type="text/javascript">
			$( '#judgeController' ).judgeController( { server : '<?= $host ?>', tournament : <?= $tournament ?> });
		</script>
	</body>
</html>
