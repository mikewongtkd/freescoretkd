<?php
	$file = '/Volumes/ramdisk/test/forms-worldclass/' . $_GET[ 'file' ];
	$contents = file_get_contents( $file );
?>
<html>
	<head>
		<title>World Class Divisions</title>
		<link href="../../../include/jquery/css/smoothness/jquery-ui.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/css/bootstrap-theme.min.css" rel="stylesheet" />
		<link href="../../../include/opt/codemirror/lib/codemirror.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../../include/opt/codemirror/lib/codemirror.js"></script>
		<script src="../../../include/opt/codemirror/mode/freescore/freescore.js"></script>
		<script src="../../../include/js/freescore.js"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1"></meta>

		<script>
			$( function() {
				var codemirror = { textarea : document.getElementById( 'codemirror' ) };
				codemirror.app = CodeMirror.fromTextArea( codemirror.textarea, { lineNumbers: true, mode : 'freescore' });
				codemirror.app.setSize( '100%', '600px' );
			});
		</script>
	</head>
	<body>
		<div class="container">
			<h1>Editing Division</h1>

			<div class="panel panel-primary">
				<div class="panel-heading">
					<h4 class="panel-title">Edit the Division</h4>
				</div>
				<textarea id="codemirror" class="panel-body"><?= $contents?></textarea>
			</div>
		</div>
	</body>
</html>
