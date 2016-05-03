<?php
	$file     = '/Volumes/ramdisk/test/forms-grassroots/' . $_GET[ 'file' ];
	$lines    = file( $file );
	$header   = preg_grep( "/^#/", $lines );
	$lines    = preg_grep( "/^\t/", $lines, true ); # Ignore scores (until I can figure out how to parse them)
	$lines    = preg_grep( "/^\s*$/", $lines, true );  # Ignore empty lines
	$id       = $_GET[ 'file' ]; $id = preg_replace( '/ring\d+\/div\./', '', $id ); $id = preg_replace( '/\.txt/', '', $id );
	$setting  = [];
	foreach( $header as $line ) {
		$line = rtrim( $line );
		$line = preg_replace( '/^#\s*/', '', $line );
		$keyvalue = preg_split( "/=/", $line, 2 );
		$setting[ $keyvalue[0] ] = $keyvalue[1];
	}
	$setting[ 'method' ] = isset( $setting[ 'method' ] ) ? $setting[ 'method' ] : 'cutoff';
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
				$( '.CodeMirror' ).css({ 'border-radius': '6px' });

				var modal = {
					poomsae : '#modal-edit-poomsae-cutoff',
				};

				$( '#show-poomsae-dialog' ).click( function() { $( modal.poomsae ).modal( 'show' ); });
			});
		</script>
	</head>
	<body>
		<div class="container">
			<div class="panel panel-primary">
				<div class="panel-heading">
					<h4 class="panel-title pull-left" style="margin-top: 4px;">
						Division <?= strtoupper( $id ) ?> <?= $setting[ 'description' ] ?>
					</h4>
					<div class="btn-group pull-right">
						<button class="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown" style="border: 0px; background: transparent; -webkit-appearance: none; -webkit-box-shadow: none; outline: none;"><span class="glyphicon glyphicon-menu-hamburger"></span> Settings</button>
						<ul class="dropdown-menu">
							<li><a id="show-settings-dialog">Change Division Description</a></li>
							<li><a id="show-poomsae-dialog">Change Poomsae Selection</a></li>
							<li><a id="show-settings-dialog">Change Division Settings</a></li>
						</ul>
					</div>
					<div class="clearfix"></div>
				</div>
				<textarea id="athletes" class="panel-body"><?= $athletes?></textarea>
			</div>

			<button type="button" class="btn btn-success">Save Changes</button>

		</div>
	</body>
</html>
