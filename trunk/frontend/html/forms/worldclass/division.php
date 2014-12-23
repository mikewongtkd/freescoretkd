<?php include( "../../include/php/config.php" ); ?>
<html>
	<head>
		<link href="../../include/css/ajaxbutton.css" rel="stylesheet" />
		<link href="../../include/css/forms/division.css" rel="stylesheet" />
		<link href="../../include/css/forms/worldclass/judgeController.css" rel="stylesheet" />
		<link href="../../include/jquery/css/smoothness/jquery-ui.css" rel="stylesheet" />
		<link href="../../include/jquery/css/smoothness/smoothness.min.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jQuery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/jquery.ajaxbutton.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.division.js"></script>
	</head>
	<body>
		<div id="division"></div>
		<script type="text/javascript">
			$( '#division' ).division( { server : '<?= $host ?>', tournament : '<?= $tournament ?>' });
		</script>
	</body>
</html>
