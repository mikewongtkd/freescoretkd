<?php 
	$an_hour_ago = time() - 3600;
	setcookie( 'judge', '', $an_hour_ago, '/' );
	setcookie( 'role',  '', $an_hour_ago, '/' );
	setcookie( 'ring',  '', $an_hour_ago, '/' );
	include( "../../include/php/config.php" ); 
?>
<html>
	<head>
		<title>World Class Divisions</title>
		<link href="../../include/jquery/mobile/jquery.mobile-1.4.5.min.css" rel="stylesheet" />
		<link href="../../include/css/forms/worldclass/divisions.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jQuery.js"></script>
		<script src="../../include/jquery/mobile/jquery.mobile-1.4.5.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/jquery.ajaxbutton.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.divisions.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.divisionEditor.js"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body>
		<div id="division"></div>
		<script type="text/javascript">
			$( '#division' ).divisionEditor( { server : '<?= $host ?>', tournament : <?= $tournament ?> });
		</script>
	</body>
</html>
