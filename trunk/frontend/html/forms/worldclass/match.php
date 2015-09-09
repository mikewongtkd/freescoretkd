<?php 
	include( "../../include/php/config.php" ); 
?>
<html>
	<head>
		<link href="../../include/css/forms/worldclass/match.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/jquery/js/jquery.totemticker.min.js"></script>
 		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.match.js"></script>
	</head>
	<body>
		<div id="match"></div>
		<script type="text/javascript">
			$( '#match' ).match({ tournament : <?= $tournament ?> });
		</script>
	</body>
</html>
