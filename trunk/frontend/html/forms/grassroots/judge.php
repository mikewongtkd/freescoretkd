<?php include( "../../include/php/config.php" ); ?>
<html>
	<head>
		<link rel="stylesheet" href="../../include/jquery/css/smoothness/jquery-ui-1.10.3.custom.min.css">
		<link rel="stylesheet" href="../../include/jquery/css/smoothness/smoothness.min.css">
		<link rel="stylesheet" href="../../include/css/forms/grassroots/judgeController.css">
		<link rel="stylesheet" href="../../include/css/ajaxbutton.css">
		<script src="../../include/jquery/js/jQuery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/js/jquery.ajaxbutton.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.judgeNotes.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.judgeController.js"></script>
	</head>
	<body>
		<div id="judgeController"></div>
		<script type="text/javascript">
			$( '#judgeController' ).judgeController( { server : '<?php echo $host ?>', tournament : '<?php echo $tournament ?>' } );
		</script>
	</body>
</html>
