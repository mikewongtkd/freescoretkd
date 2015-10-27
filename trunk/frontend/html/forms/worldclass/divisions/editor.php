<?php include( "../../../include/php/config.php" ); ?>
<html>
	<head>
		<title>World Class Divisions</title>
		<link href="../../../include/jquery/mobile/jquery.mobile-1.4.5.min.css" rel="stylesheet" />
		<link href="../../../include/css/forms/worldclass/divisions.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/mobile/jquery.mobile-1.4.5.min.js"></script>
		<script src="../../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../../include/js/freescore.js"></script>
		<script src="../../../include/js/jquery.errormessage.js"></script>
		<script src="../../../include/js/forms/worldclass/divisions/jquery.divisions.js"></script>
		<script src="../../../include/js/forms/worldclass/divisions/jquery.divisionDescriptor.js"></script>
		<script src="../../../include/js/forms/worldclass/divisions/jquery.formSelector.js"></script>
		<script src="../../../include/js/forms/worldclass/divisions/jquery.divisionHeader.js"></script>
		<script src="../../../include/js/forms/worldclass/divisions/jquery.divisionEditor.js"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body>
		<div data-role="page" id="editorPage">
			<div id="division"></div>
			<script type="text/javascript">
				$( '#division' ).editor( { server : '<?= $host ?>', tournament : <?= $tournament ?>, ring : <?= $_GET[ 'ring' ] ?>, division : <?= $_GET[ 'division' ] ?> });
			</script>
		</div>
	</body>
</html>
