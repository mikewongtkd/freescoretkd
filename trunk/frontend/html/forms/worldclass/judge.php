<?php 
	if( ! isset( $_COOKIE[ 'ring' ]) || ! isset( $_COOKIE[ 'role' ] ) || ! isset( $_COOKIE[ 'judge' ] )) { header( 'Location: ../../forms/worldclass/register.php?role=judge' ); exit(); }
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
		<link href="../../include/css/flippable.css" rel="stylesheet" />
		<link href="../../include/css/forms/worldclass/judgeController.css" rel="stylesheet" />
		<link href="../../include/css/forms/worldclass/presentationWidgets.css" rel="stylesheet" />
		<link href="../../include/jquery/css/smoothness/jquery-ui.css" rel="stylesheet" />
		<link href="../../include/jquery/css/smoothness/smoothness.min.css" rel="stylesheet" />
		<link href="../../include/jquery/css/jquery.ui.slider-rtl.css" rel="stylesheet" />
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/themes/default.min.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery.tappy.js"></script>
		<script src="../../include/jquery/js/jquery.nodoubletapzoom.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.ui.touch-punch.min.js"></script>
		<script src="../../include/jquery/js/jquery.ui.slider-rtl.min.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/jquery/js/jquery.timer.js"></script>
		<script src="../../include/jquery/js/jquery.totemticker.min.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/alertify/alertify.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../include/js/forms/worldclass/division.class.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.deductions.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.matposition.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.presentationButtons.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.presentationBar.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.judgeNotes.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.judgeController.js"></script>
	</head>
	<body>
		<div id="judgeController"></div>
		<script type="text/javascript">
			$( '#judgeController' ).judgeController( { server : '<?= $host ?>', tournament : <?= $tournament ?> });
		</script>
	</body>
</html>
