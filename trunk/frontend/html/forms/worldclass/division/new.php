<?php
	include "../../../include/php/config.php"
?>
<html>
	<head>
	<title>New Division</title>
		<link href="../../../include/jquery/css/smoothness/jquery-ui.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/css/bootstrap-theme.min.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/add-ons/bootstrap-select.min.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/add-ons/bootstrap-switch.min.css" rel="stylesheet" />
		<link href="../../../include/opt/codemirror/lib/codemirror.css" rel="stylesheet" />
		<link href="../../../include/css/forms/worldclass/division/new.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootbox.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-select.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-switch.min.js"></script>
		<script src="../../../include/opt/codemirror/lib/codemirror.js"></script>
		<script src="../../../include/opt/codemirror/mode/freescore/freescore.js"></script>
		<script src="../../../include/js/freescore.js"></script>
		<script src="../../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../../include/js/forms/worldclass/division.class.js"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1"></meta>
		<style>
		</style>
	</head>
	<body>
		<div class="container">
			<div class="page-header"><h1>New Division</h1></div>

<?php include( "settings.php" ); ?>
<?php include( "description.php" ); ?>
<?php include( "form-selection.php" ); ?>

			<div class="panel panel-primary">
				<div class="panel-heading">
					<h4 class="panel-title">List of Athletes in this Division</h4>
				</div>
				<textarea id="athletes" class="panel-body"></textarea>
				<div class="panel-footer">
					<button type="button" id="save-button" class="btn btn-success pull-right "><span class="glyphicon glyphicon-save"></span> Save and Exit</button>
					<div class="clearfix"></div>
				</div>
			</div>
		</div>

		<script>
			athletes.textarea = $( '#athletes' );
			athletes.editor = CodeMirror.fromTextArea( document.getElementById( 'athletes' ), { lineNumbers: true, autofocus: true, mode : 'freescore' });
			athletes.editor.setSize( '100%', '360px' );
			athletes.doc = athletes.editor.getDoc();

			// ===== BEHAVIOR
			athletes.editor.on( "keyHandled", function( cm, key, ev ) {
				if( key != 'Enter' && key != 'Shift-Enter' && key != 'Backspace' && key != 'Shift-Backspace' ) { return; }
				division.athletes = (athletes.doc.getValue().trim()).split( "\n" );

				var autodetect = $( 'label.active input[value=auto]' ).length > 0;
				if( autodetect ) { first.round.select.autodetect(); }
			});

			$( '#save-button' ).addClass( 'disabled' ) .click( function() { 
				bootbox.prompt({
					title: "Save Division " + (defined( division.description ) ? "&quot;" + division.description + "&quot;" : '' ) + " As?",
					value: (defined( division.name ) ? division.name : "p000"),
					callback: function( result ) {
						if( result === null ) { window.close(); } 
						else {
						}
					}
				});
			});

			// ===== SERVICE COMMUNICATION
			var file       = String( "<?= $_GET[ 'file' ] ?>" ).split( /\// );
			var tournament = file.shift();
			var ring       = file.shift();
			var divId      = file.shift();
			var ws         = new WebSocket( "ws://<?= $host ?>:3088/worldclass/" + tournament + "/" + ring );

			ws.onopen      = function() {
				$( '#save-button' ).removeClass( 'disabled' ) .click( function() { 
					var request  = { data : { type : 'division', action : 'write', division : division }};
					request.json = JSON.stringify( request.data );
					ws.send( request.json );
					window.close(); 
				});
				if( divId != 'new' ) {
					var request = { type : 'division', action : 'read', tournament : tournament, ring : ring, divid : divId };
					var json    = JSON.stringify( request );
					ws.send( json );
				}
			};
			ws.onmessage = function( ev ) {
				var response = JSON.parse( ev.data );
				console.log( response );
				if( response.type == 'division' ) {
					var division = new Division( response.division );
					$( '#division-description' ).html( division.summary() );
					var list = division.athletes();
					var text = ($.map( list, function( element, i ) { return element.name(); })).join( "\n" )
					athletes.doc.setValue( text );
				}
			};
			ws.onclose   = function( reason ) {
			};
		</script>

	</body>
</html>
