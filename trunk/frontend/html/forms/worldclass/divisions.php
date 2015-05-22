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
		<link href="../../include/opt/codemirror-5.2/lib/codemirror.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/mobile/jquery.mobile-1.4.5.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/opt/codemirror-5.2/lib/codemirror.js"></script>
		<script src="../../include/opt/codemirror-5.2/keymap/vim.js"></script>
		<script src="../../include/opt/codemirror-5.2/mode/freescore/freescore.js"></script>
		<script src="../../include/jquery/js/jquery.codemirror.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/jquery.ajaxbutton.js"></script>
		<script src="../../include/js/jquery.errormessage.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.divisions.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.divisionDescriptor.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.formSelector.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.divisionHeader.js"></script>
		<script src="../../include/js/forms/worldclass/jquery.divisionEditor.js"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body>
		<div id="division"></div>
		<script type="text/javascript">
			$( '#division' ).divisions( { server : '<?= $host ?>', tournament : <?= $tournament ?> });
		</script>
	</body>
</html>
