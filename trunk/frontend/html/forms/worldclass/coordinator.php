<?php 
	if( ! isset( $_COOKIE[ 'ring' ]) || ! isset( $_COOKIE[ 'role' ] )) { header( 'Location: ../../setup/register.php?referer=../forms/worldclass/coordinator.php' ); exit(); }
	include( "../../include/php/config.php" ); 
?>
<html>
	<head>
		<title>World Class Coordinator</title>
		<link href="../../include/jquery/mobile/jquery.mobile-1.4.5.min.css" rel="stylesheet" />
		<link href="../../include/css/dialog.css" rel="stylesheet" />
		<link href="../../include/css/forms/worldclass/coordinator.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/mobile/jquery.mobile-1.4.5.min.js"></script>
		<script src="../../include/jquery/js/jquery.nodoubletapzoom.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.ui.touch-punch.min.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/jquery/js/jquery.timer.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/jquery.popupdialog.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.coordinatorController.js"></script>
	</head>
	<body>
		<?php include( "../../include/php/dialog.php" ) ?>
		<div id="coordinatorController"></div>
		<script type="text/javascript">
			$( '#coordinatorController' ).coordinatorController( { server : '<?= $host ?>', tournament : <?= $tournament ?> });
		</script>
	</body>
</html>
