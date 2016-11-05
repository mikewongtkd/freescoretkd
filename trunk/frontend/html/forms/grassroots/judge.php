<?php 
	if( ! isset( $_COOKIE[ 'ring' ]) || ! isset( $_COOKIE[ 'role' ] )) { header( 'Location: ../../setup/register.php?referer=../forms/grassroots/judge.php' ); exit(); }
	include( "../../include/php/config.php" ); 
?>
<html>
	<head>
		<link rel="stylesheet" href="../../include/jquery/css/smoothness/jquery-ui-1.10.3.custom.min.css">
		<link rel="stylesheet" href="../../include/jquery/css/smoothness/smoothness.min.css">
		<link rel="stylesheet" href="../../include/css/forms/grassroots/spinwheel.css">
		<link rel="stylesheet" href="../../include/css/forms/grassroots/tiebreaker.css">
		<link rel="stylesheet" href="../../include/css/forms/grassroots/judgeController.css">
		<link rel="stylesheet" href="../../include/css/forms/grassroots/ajaxbutton.css">
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery.ui.touch-punch.min.js"></script>
		<script src="../../include/jquery/js/jquery.nodoubletapzoom.js"></script>
		<script src="../../include/jquery/js/jquery.touchswipe.min.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.ajaxbutton.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.spinwheel.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.tiebreaker.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.judgeNotes.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.judgeController.js"></script>
	</head>
	<body>
		<div id="judgeController"></div>
		<script type="text/javascript">
			$( '#judgeController' ).judgeController( { server : '<?= $host ?>', tournament : <?= $tournament ?> } );
		</script>
	</body>
</html>
