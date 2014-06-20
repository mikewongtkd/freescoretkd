<?php include( "../../include/php/config.php" ); ?>
<html>
	<head>
		<link href="../../include/css/forms/worldclass/worldclassApp.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jQuery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.worldclass.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.leaderBoard.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.judgeScore.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.scoreBoard.js"></script>
	</head>
	<body>
		<div id="worldclass"></div>
		<script type="text/javascript">
			$( '#worldclass' ).worldclass({ tournament : '<?= $tournament ?>', judges : 5});
		</script>
	</body>
</html>
