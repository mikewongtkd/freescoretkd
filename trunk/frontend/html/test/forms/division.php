<?php include( "../../include/php/config.php" ); ?>
<html>
	<head>
		<link href="../../include/css/ajaxbutton.css" rel="stylesheet" />
		<link href="../../include/css/forms/division.css" rel="stylesheet" />
		<link href="../../include/jquery/css/smoothness/jquery-ui.css" rel="stylesheet" />
		<link href="../../include/jquery/css/smoothness/smoothness.min.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jQuery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/js/forms/jquery.division.js"></script>
		<script src="../../include/js/forms/jquery.divisions.js"></script>
	</head>
	<body>
		<div id="divisions"></div>
		<script type="text/javascript">
			$( '#divisions' ).divisions({ server : '<?= $host ?>', tournament : <?= $tournament ?>, event : 'grassroots' });
		</script>
	</body>
</html>
