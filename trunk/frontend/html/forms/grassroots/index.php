<?php include( "../../include/php/config.php" ); ?>
<html>
	<head>
		<link href="../../include/css/flippable.css" rel="stylesheet" />
		<link href="../../include/css/forms/grassroots/tiebreaker.css" rel="stylesheet" />
		<link href="../../include/css/forms/grassroots/grassrootsApp.css" rel="stylesheet" />
		<link href="../../include/jquery/css/jquery.bracket.min.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/jquery/js/jquery.bracket.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.grassroots.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.voteDisplay.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.leaderboard.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.scoreboard.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.judgeScore.js"></script>
	</head>
	<body>
		<div id="grassroots"></div>
		<script type="text/javascript">
			$( '#grassroots' ).grassroots( { server : '<?= $host ?>', tournament : <?= $tournament ?> });
		</script>
	</body>
</html>
