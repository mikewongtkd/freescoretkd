<?php
	include "../../../include/php/config.php"
?>
<html>
	<head>
		<title>Division Editor</title>
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
		<script src="../../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../../include/js/forms/worldclass/division.class.js"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1"></meta>
	</head>
	<body>
		<div class="container">
			<h1>Division Editor</h1>
			<p>You can use the editor below to modify the athlete list for
			divisions that haven't completed their first round*. Click on
			the menu icon at the left of the division name to modify the
			division description, forms, or other settings such as the 
			number of judges.
			</p>
			<div class="panel panel-primary">
				<div class="panel-heading">
					<div class="btn-group pull-left">
						<button class="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown" style="border: 0px; background: transparent; -webkit-appearance: none; -webkit-box-shadow: none; outline: none;"><span class="glyphicon glyphicon-menu-hamburger"></span></button>
						<ul class="dropdown-menu">
							<li><a id="show-description-dialog" >Change Description</a></li>
							<li><a id="show-poomsae-dialog"     >Change Poomsae Selection</a></li>
							<li><a id="show-settings-dialog"    >Change Other Settings</a></li>
						</ul>
					</div>
					<h4 class="panel-title pull-left" style="margin-top: 4px;">
						Division <span id="division-description"></span>
					</h4>
					<button type="button" id="save-button" class="btn btn-success pull-right"><span class="glyphicon glyphicon-save"></span> Save and Exit</button>
					<div class="clearfix"></div>
				</div>
				<textarea id="athletes" class="panel-body"></textarea>
			</div>

			<?php include( "dialog/poomsae-cutoff.php" ) ?>
			<?php include( "dialog/poomsae-behavior.php" ) ?>
			<p>* If the first round has been completed, the division must be
			edited in the ring using the coordinator interface. <b>Note</b>
			editing a division that is currently in progress may cause problems
			for that division.  Make sure that the ring stops scoring prior to
			changing a division.
			</p>
		</div>
		<script>
			var division = undefined;
			var athletes = undefined;
			$( function() {
				athletes = { textarea : $( '#athletes' ), editor : undefined };

				var modal = {
					poomsae : '#modal-edit-poomsae-cutoff',
				};

				// ===== BEHAVIOR
				$( '#show-poomsae-dialog' ).click( function() { $( modal.poomsae ).modal( 'show' ); });
				$( '#save-button' ).click( function() {
					window.close();
				});

				// ===== SERVICE COMMUNICATION
				if( ! "WebSocket" in window ) { alert( "Browser does not support communication with the server via websockets." ); return; }
				var ws = new WebSocket( "ws://<?= $host ?>:3088/websocket" );
				ws.onopen    = function() {
					var file    = String( "<?= $_GET[ 'file' ] ?>" ).split( /\// );
					var tournament = file.shift();
					var ring       = file.shift();
					var divId      = file.shift();
					var request = { type : 'division', action : 'read', tournament : tournament, ring : ring, divid : divId };
					var json    = JSON.stringify( request );
					ws.send( json );
				};
				ws.onmessage = function( ev ) {
					var response = JSON.parse( ev.data );
					if( response.type == 'division' ) {
						var division = new Division( response.division );
						$( '#division-description' ).html( division.summary() );
						var athletes = division.athletes();
						var list     = [];
						for( var i = 0; i < athletes.length; i++ ) {
							var athlete = athletes[ i ];
							list.push( athlete.name());
						}
						$( '#athletes' ).val( list.join( "\n" ));

						// ===== INITIALIZE CODEMIRROR WITH THE DIVISION ATHLETES
						athletes.editor = CodeMirror.fromTextArea( document.getElementById( 'athletes' ), { lineNumbers: true, mode : 'freescore' });
						athletes.editor.setSize( '100%', '480px' );
						athletes.editor.focus();
						athletes.editor.setSelection({ line: 0, ch: 0 }, { line: 0 } );
						$( '.CodeMirror' ).css({ 'border-radius': '6px' });
					}
				};
				ws.onclose   = function() {
				};
			});
		</script>

	</body>
</html>
