<?php 
	if( ! isset( $_COOKIE[ 'ring' ]) || ! isset( $_COOKIE[ 'role' ] )) { header( 'Location: ../../setup/register.php?referer=../forms/worldclass/coordinator.php' ); exit(); }
	include( "../../include/php/config.php" ); 
?>
<html>
	<head>
		<link href="http://freescore.net/freescore/images/icons/apps/forms-worldclass/apple-touch-icon.png"             rel="apple-touch-icon" />
		<link href="http://freescore.net/freescore/images/icons/apps/forms-worldclass/apple-touch-icon-60x60.png"       rel="apple-touch-icon" sizes="60x60" />
		<link href="http://freescore.net/freescore/images/icons/apps/forms-worldclass/apple-touch-icon-76x76.png"       rel="apple-touch-icon" sizes="76x76" />
		<link href="http://freescore.net/freescore/images/icons/apps/forms-worldclass/apple-touch-icon-120x120.png"     rel="apple-touch-icon" sizes="120x120" />
		<link href="http://freescore.net/freescore/images/icons/apps/forms-worldclass/apple-touch-icon-152x152.png"     rel="apple-touch-icon" sizes="152x152" />
		<link href="http://freescore.net/freescore/images/icons/apps/forms-worldclass/apple-touch-icon-precomposed.png" rel="apple-touch-icon-precomposed" />
		<link href="../../include/css/ajaxbutton.css" rel="stylesheet" />
		<link href="../../include/css/flippable.css" rel="stylesheet" />
		<link href="../../include/css/forms/worldclass/coordinator.css" rel="stylesheet" />
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
		<script src="../../include/js/forms/worldclass/jquery.coordinatorController.js"></script>
	</head>
	<body>
		<div id="coordinatorController"></div>
		<script type="text/javascript">
			$( '#coordinatorController' ).coordinatorController( { server : '<?= $host ?>', tournament : <?= $tournament ?> });
		</script>
	</body>
</html>
