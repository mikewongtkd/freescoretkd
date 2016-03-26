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

			<div class="modal fade" id="modal-edit-forms" tabindex="-1" role="dialog" data-backdrop="static">
				<div class="modal-dialog">
					<div class="modal-content panel-primary">
						<div class="modal-header panel-heading">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h4 class="modal-title">Edit Poomsae Selection</h4>
						</div>
						<div class="modal-body">
							<div class="input-group" style="margin-bottom: 10px;">
								<div class="input-group-btn">
									<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 200px; text-align: left;">
									Preliminary Round <span class="caret" style="float: right; margin-top:8px;"></span></button>
									<ul class="dropdown-menu"> <li><a href="#">None</a></li> <li role="separator" class="divider"></li> <li><a href="#">Taegeuk 1</a></li> <li><a href="#">Taegeuk 2</a></li> <li><a href="#">Taegeuk 3</a></li> <li><a href="#">Taegeuk 4</a></li> <li><a href="#">Taegeuk 5</a></li> <li><a href="#">Taegeuk 6</a></li> <li><a href="#">Taegeuk 7</a></li> <li><a href="#">Taegeuk 8</a></li> <li role="separator" class="divider"></li> <li><a href="#">Koryo</a></li> <li><a href="#">Keumgang</a></li> <li><a href="#">Taebaek</a></li> <li><a href="#">Pyongwon</a></li> <li><a href="#">Sipjin</a></li> <li><a href="#">Jitae</a></li> <li><a href="#">Chongkwon</a></li> <li><a href="#">Hansu</a></li> </ul>
								</div>
								<input type="text" class="form-control" aria-label="poomsae selection">
							</div>

							<div class="input-group" style="margin-bottom: 10px;">
								<div class="input-group-btn">
									<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 200px; text-align: left;">
									Semi-finals Round <span class="caret" style="float: right; margin-top:8px;"></span></button>
									<ul class="dropdown-menu"> <li><a href="#">None</a></li> <li role="separator" class="divider"></li> <li><a href="#">Taegeuk 1</a></li> <li><a href="#">Taegeuk 2</a></li> <li><a href="#">Taegeuk 3</a></li> <li><a href="#">Taegeuk 4</a></li> <li><a href="#">Taegeuk 5</a></li> <li><a href="#">Taegeuk 6</a></li> <li><a href="#">Taegeuk 7</a></li> <li><a href="#">Taegeuk 8</a></li> <li role="separator" class="divider"></li> <li><a href="#">Koryo</a></li> <li><a href="#">Keumgang</a></li> <li><a href="#">Taebaek</a></li> <li><a href="#">Pyongwon</a></li> <li><a href="#">Sipjin</a></li> <li><a href="#">Jitae</a></li> <li><a href="#">Chongkwon</a></li> <li><a href="#">Hansu</a></li> </ul>
								</div>
								<input type="text" class="form-control" aria-label="poomsae selection">
							</div>

							<div class="input-group" style="margin-bottom: 10px;">
								<div class="input-group-btn">
									<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 200px; text-align: left;">
									Finals Round 1st Form <span class="caret" style="float: right; margin-top:8px;"></span></button>
									<ul class="dropdown-menu"> <li><a href="#">None</a></li> <li role="separator" class="divider"></li> <li><a href="#">Taegeuk 1</a></li> <li><a href="#">Taegeuk 2</a></li> <li><a href="#">Taegeuk 3</a></li> <li><a href="#">Taegeuk 4</a></li> <li><a href="#">Taegeuk 5</a></li> <li><a href="#">Taegeuk 6</a></li> <li><a href="#">Taegeuk 7</a></li> <li><a href="#">Taegeuk 8</a></li> <li role="separator" class="divider"></li> <li><a href="#">Koryo</a></li> <li><a href="#">Keumgang</a></li> <li><a href="#">Taebaek</a></li> <li><a href="#">Pyongwon</a></li> <li><a href="#">Sipjin</a></li> <li><a href="#">Jitae</a></li> <li><a href="#">Chongkwon</a></li> <li><a href="#">Hansu</a></li> </ul>
								</div>
								<input type="text" class="form-control" aria-label="poomsae selection">
							</div>

							<div class="input-group" style="margin-bottom: 10px;">
								<div class="input-group-btn">
									<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="width: 200px; text-align: left;">
									Finals Round 2nd Form <span class="caret" style="float: right; margin-top:8px;"></span></button>
									<ul class="dropdown-menu"> <li><a href="#">None</a></li> <li role="separator" class="divider"></li> <li><a href="#">Taegeuk 1</a></li> <li><a href="#">Taegeuk 2</a></li> <li><a href="#">Taegeuk 3</a></li> <li><a href="#">Taegeuk 4</a></li> <li><a href="#">Taegeuk 5</a></li> <li><a href="#">Taegeuk 6</a></li> <li><a href="#">Taegeuk 7</a></li> <li><a href="#">Taegeuk 8</a></li> <li role="separator" class="divider"></li> <li><a href="#">Koryo</a></li> <li><a href="#">Keumgang</a></li> <li><a href="#">Taebaek</a></li> <li><a href="#">Pyongwon</a></li> <li><a href="#">Sipjin</a></li> <li><a href="#">Jitae</a></li> <li><a href="#">Chongkwon</a></li> <li><a href="#">Hansu</a></li> </ul>
								</div>
								<input type="text" class="form-control" aria-label="poomsae selection">
							</div>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
							<button type="button" class="btn btn-primary">Save Changes</button>
						</div>
					</div><!-- /.modal-content -->
				</div><!-- /.modal-dialog -->
			</div><!-- /.modal -->
		</div>
	</body>
</html>
