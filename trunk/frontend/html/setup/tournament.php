<?php 
	$referer = $_GET[ 'referer' ];
	include( "../include/php/config.php" ); 
?>
<html>
	<head>
		<link href="../include/jquery/mobile/jquery.mobile-1.4.5.min.css" rel="stylesheet" />
		<link href="../include/css/setup/tournament.css" rel="stylesheet" />
		<script src="../include/jquery/js/jquery.js"></script>
		<script src="../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../include/jquery/mobile/jquery.mobile-1.4.5.min.js"></script>
		<script src="../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../include/jquery/js/jquery.cookie.js"></script>
		<script src="../include/jquery/js/jquery.purl.js"></script>
		<script src="../include/js/freescore.js"></script>
		<script src="../include/js/setup/jquery.tournament.js"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
	</head>
	<body>
		<div id="setup"></div>
		<script type="text/javascript">
			$( '#setup' ).tournament({ server : '<?= $host ?>', tournament : <?= $tournament ?> });
		</script>
	</body>
</html>
