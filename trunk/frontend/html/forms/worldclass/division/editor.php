<?php
	$file     = '/Volumes/ramdisk/test/forms-worldclass/' . $_GET[ 'file' ];
	$lines    = file( $file );
	$header   = preg_grep( "/^#/", $lines );
	$setting  = [];
	foreach( $header as $line ) {
		$line = rtrim( $line );
		$line = preg_replace( '/^#\s*/', '', $line );
		$keyvalue = preg_split( "/=/", $line, 2 );
		$setting[ $keyvalue[0] ] = $keyvalue[1];
	}
	$header   = join( "", $header );
	$athletes = preg_grep( "/^#/", $lines, true ); 
	$athletes = join( "", $athletes );
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
				var athletes = { textarea : document.getElementById( 'athletes' ) };
				athletes.editor = CodeMirror.fromTextArea( athletes.textarea, { lineNumbers: true, mode : 'freescore' });
				athletes.editor.setSize( '100%', '600px' );

				$( '#edit-forms' ).click( function() { $( '#modal-edit-forms' ).modal( 'show' ); });
			});
		</script>
	</head>
	<body>
		<div class="container">
			<h1>Editing Division</h1>

			<!-- <p><pre><?php var_dump( $setting ) ?></pre></p> -->

			<div class="panel panel-primary">
				<div class="panel-heading">
					<h4 class="panel-title">Division Settings</h4>
				</div>
				<div class="panel-body">
					<button type="button" id="edit-forms" class="btn btn-primary">Edit Poomsae Selection</button>
				</div>
			</div>

			<div class="panel panel-primary">
				<div class="panel-heading">
					<h4 class="panel-title">Athletes</h4>
				</div>
				<textarea id="athletes" class="panel-body"><?= $athletes?></textarea>
			</div>

			<button type="button" class="btn btn-success">Save Changes</button>

			<?php include( "dialog/poomsae-selection.php" ) ?>

		</div>
	</body>
</html>
