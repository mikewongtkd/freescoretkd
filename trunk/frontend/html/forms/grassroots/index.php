<?php include( "../../include/php/config.php" ); ?>
<html>
	<head>
		<link href="../../include/css/forms/grassrootsApp.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jQuery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.grassroots.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.leaderBoard.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.scoreKeeper.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.judgeScore.js"></script>
	</head>
	<body>
		<div id="grassroots"></div>
		<script type="text/javascript">
			$( '#grassroots' ).grassroots( { tournament : '<?php echo $tournament ?>' });
		</script>
	</body>
</html>
