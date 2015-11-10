<?php include( "../../../include/php/config.php" ); ?>
<html>
	<head>
		<title>Division Editor</title>
		<link href="../../../include/jquery/mobile/jquery.mobile-1.4.5.min.css" rel="stylesheet" />
		<link href="../../../include/css/forms/worldclass/divisions.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/mobile/jquery.mobile-1.4.5.min.js"></script>
		<script src="../../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../../include/js/freescore.js"></script>
		<script src="../../../include/js/forms/worldclass/divisions/editor/header/jquery.descriptor.js"></script>
		<script src="../../../include/js/forms/worldclass/divisions/editor/header/jquery.forms.js"></script>
		<script src="../../../include/js/forms/worldclass/divisions/editor/jquery.header.js"></script>
		<script src="../../../include/js/forms/worldclass/divisions/editor/jquery.athletes.js"></script>
		<script src="../../../include/js/forms/worldclass/divisions/jquery.editor.js"></script>
	</head>
	<body>
		<div id="division"></div>
		<script type="text/javascript">
			$( '#division' ).editor( { server : '<?= $host ?>', tournament : <?= $tournament ?>, ring : <?= $_GET[ 'ring' ] ?>, divindex : <?= $_GET[ 'divindex' ] ?> });
		</script>
	</body>
</html>
