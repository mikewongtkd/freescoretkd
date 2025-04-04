<?php 
	include( '../../include/php/config.php' ); 
	include( '../../session.php' ); 
	if( ! isset( $_COOKIE[ 'ring' ]) || ! isset( $_COOKIE[ 'judge' ] )) { header( 'Location: ../../register.php?service=worldclass&role=judge' ); exit(); }
	$rnum = intval( $_COOKIE[ 'ring' ]);
	$jid  = intval( $_COOKIE[ 'judge' ]);
	$anticache = $string = bin2hex(random_bytes(10));
?>
<html>
	<head>
		<link href="/images/icons/apps/forms-worldclass/apple-touch-icon.png"             rel="apple-touch-icon" />
		<link href="/images/icons/apps/forms-worldclass/apple-touch-icon-60x60.png"       rel="apple-touch-icon" sizes="60x60" />
		<link href="/images/icons/apps/forms-worldclass/apple-touch-icon-76x76.png"       rel="apple-touch-icon" sizes="76x76" />
		<link href="/images/icons/apps/forms-worldclass/apple-touch-icon-120x120.png"     rel="apple-touch-icon" sizes="120x120" />
		<link href="/images/icons/apps/forms-worldclass/apple-touch-icon-152x152.png"     rel="apple-touch-icon" sizes="152x152" />
		<link href="/images/icons/apps/forms-worldclass/apple-touch-icon-precomposed.png" rel="apple-touch-icon-precomposed" />
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
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/alertify/alertify.min.js"></script>
		<script src="../../include/js/freescore.js?<?= $anticache ?>"></script>
		<script src="../../include/js/forms/worldclass/form.class.js?<?= $anticache ?>"></script>
		<script src="../../include/js/forms/worldclass/score.class.js?<?= $anticache ?>"></script>
		<script src="../../include/js/forms/worldclass/athlete.class.js?<?= $anticache ?>"></script>
		<script src="../../include/js/forms/worldclass/division.class.js?<?= $anticache ?>"></script>
		<script src="../../include/js/forms/worldclass/jquery.deductions.js?<?= $anticache ?>"></script>
		<script src="../../include/js/forms/worldclass/jquery.matposition.js?<?= $anticache ?>"></script>
		<script src="../../include/js/forms/worldclass/jquery.presentationButtons.js?<?= $anticache ?>"></script>
		<script src="../../include/js/forms/worldclass/jquery.presentationBar.js?<?= $anticache ?>"></script>
		<script src="../../include/js/forms/worldclass/jquery.judgeNotes.js?<?= $anticache ?>"></script>
		<script src="../../include/js/forms/worldclass/jquery.judgeController.js?<?= $anticache ?>"></script>
	</head>
	<body>
		<div id="judgeController"></div>
		<script type="text/javascript">
			$( '#judgeController' ).judgeController( { server : '<?= $config->websocket( 'worldclass', $rnum, "judge{$jid}" ) ?>', tournament : <?= $tournament ?> });
		</script>
	</body>
</html>
