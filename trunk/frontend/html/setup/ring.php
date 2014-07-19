<?php 
	$referer = $_GET[ 'referer' ];
	include( "../include/php/config.php" ); 
?>
<html>
	<head>
		<link href="../include/css/setup/ring.css" rel="stylesheet" />
		<script src="../include/jquery/js/jQuery.js"></script>
		<script src="../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../include/jquery/js/jquery.cookie.js"></script>
		<script src="../include/js/setup/jquery.ring.js"></script>
	</head>
	<body>
		<div id="setup"></div>
		<script type="text/javascript">
			$( '#setup' ).ring({ tournament : <?= $tournament ?> });
		</script>
	</body>
</html>
