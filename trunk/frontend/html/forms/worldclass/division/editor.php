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
		<link href="../../../include/css/forms/worldclass/division/editor.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../../include/jquery/js/jquery.howler.min.js"></script>
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
		<script>
			// ===== APPLICATION GLOBAL VARIABLES
			var sound    = {
				send      : new Howl({ urls: [ "/freescore/sounds/upload.mp3",   "/freescore/sounds/upload.ogg"   ]}),
				confirmed : new Howl({ urls: [ "/freescore/sounds/received.mp3", "/freescore/sounds/received.ogg" ]}),
				error     : new Howl({ urls: [ "/freescore/sounds/quack.mp3",    "/freescore/sounds/quack.ogg"    ]}),
				next      : new Howl({ urls: [ "/freescore/sounds/next.mp3",     "/freescore/sounds/next.ogg"   ]}),
				prev      : new Howl({ urls: [ "/freescore/sounds/prev.mp3",     "/freescore/sounds/prev.ogg"   ]}),
			};

			var division    = { athletes : [], judges : 5, summary : function() { return this.name.toUpperCase() + ' ' + this.description; }};
			var init        = {};
			var settings    = {};
			var description = {};
			var athletes    = {};
			var validate    = {};
		</script>

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
					<span id="user-message">Not enough forms selected. Please select forms.</span>
					<button type="button" id="save-button" class="btn btn-success pull-right disabled"><span class="glyphicon glyphicon-save"></span> Save and Exit</button>
					<div class="clearfix"></div>
				</div>
			</div>
		</div>

		<script>
			// ============================================================
			// ATHLETE LIST (CODEMIRROR)
			// ============================================================
			athletes.textarea = $( '#athletes' );
			athletes.editor = CodeMirror.fromTextArea( document.getElementById( 'athletes' ), { lineNumbers: true, autofocus: true, mode : 'freescore' });
			athletes.editor.setSize( '100%', '360px' );
			athletes.doc = athletes.editor.getDoc();

			// ===== BEHAVIOR
			athletes.editor.on( "change", function( cm, key, ev ) {
				division.athletes = ((athletes.doc.getValue().trim()).split( "\n" )).map((name) => { return { name : name };});

				var autodetect = $( 'label.active input[value=auto]' ).length > 0;
				if( autodetect ) { settings.round.select.autodetect(); }

				validate.input();

			});

			init.athletes = ( division ) => {
				var list = division.athletes();
				var text = list.map( ( element ) => { return element.name(); }).join( "\n" );
				athletes.doc.setValue( text );
			};

			validate.athletes = {};

			validate.athletes.count = function() {
				if( division.athletes.length == 0 ) { return false; }
				return (division.athletes[ 0 ].name);
			}
			validate.athletes.unique = function() {
				var duplicates = [];
				if( division.athletes.length > 1 ) {
					var count = division.athletes
						.map( (athlete) => { return athlete.name; })
						.reduce((uniq, cur) => { uniq[ cur ] = (uniq[ cur ] || 0) + 1; return uniq; }, {});
					duplicates = Object.keys( count ).filter((a) => count[a] > 1 );
				}
				return (duplicates.length == 0);
			}

			validate.input = function() {
				save.disable();
				var ok = true;

				if( validate.athletes.count() && validate.athletes.unique()) {
					$( '#athletes' ).parent().removeClass( "panel-danger" ).addClass( "panel-primary" );

				} else if( ! validate.athletes.count() ) {
					ok = false;
					$( '#athletes' ).parent().removeClass( "panel-primary" ).addClass( "panel-danger" );
					$( '#user-message' ).html( "Not enough athletes. Please add more athletes." );

				} else if( ! validate.athletes.unique() ) {
					ok = false;
					$( '#athletes' ).parent().removeClass( "panel-primary" ).addClass( "panel-danger" );
					$( '#user-message' ).html( "Duplicate athletes. Please resolve athletes with the same name." );
				}

				if ( validate.selection() ) {
					$( '#form-selection' ).parent().removeClass( "panel-danger" ).addClass( "panel-primary" );
				} else {
					ok = false;
					$( '#form-selection' ).parent().addClass( "panel-danger" ).removeClass( "panel-primary" );
					$( '#user-message' ).html( "Not enough forms selected. Please select forms." );
				}
				if( ok ) {
					$( '#user-message' ).html( "" );
					save.enable();
				}
				return ok;
			}

			// ===== SERVICE COMMUNICATION
			var file       = String( "<?= $_GET[ 'file' ] ?>" ).split( /\// );
			var tournament = file.shift();
			var ring       = file.shift();
			var divId      = file.shift();
			var ws         = new WebSocket( "ws://<?= $host ?>:3088/worldclass/" + tournament + "/" + ring );
			var save       = { enable : function() {
				var button = $( '#save-button' );
				button.removeClass( 'disabled' );
				button.off( 'click' ).click( function() { 
					var request  = { data : { type : 'division', action : 'write', division : division }};
					request.json = JSON.stringify( request.data );
					sound.next.play();
					ws.send( request.json );
				});
			}, disable : function() {
				var button = $( '#save-button' );
				button.addClass( 'disabled' );
				button.off( 'click' );
			}}

			ws.onopen      = function() {
				if( divId != 'new' ) {
					var request = { type : 'division', action : 'read', tournament : tournament, ring : ring, divid : divId };
					var json    = JSON.stringify( request );
					ws.send( json );
				}
			};
			ws.onmessage = function( ev ) {
				var response = JSON.parse( ev.data );

				if( response.type == 'division' ) {
					if( response.action == 'update' ) {
						var division = new Division( response.division );
						init.settings( division );
						init.description( division );
						init.forms( division );
						init.athletes( division );

					} else if( response.action == 'write ok' ) {
						var division = response.division;
						sound.send.play();
						bootbox.alert( "Division " + division.name.toUpperCase() + " saved.", () => { window.close(); } );

					} else if( response.action == 'write error' ) {
						var division = response.division;
						sound.next.play();
						bootbox.dialog({
							title : "Division " + division.name.toUpperCase() + " already exists!",
							message: "Do you want to overwrite the existing division " + division.name.toUpperCase() + "?",
							buttons: {
								cancel : {
									label: 'Cancel',
									className: 'btn-danger',
									callback: () => { sound.prev.play(); }
								},
								confirm : {
									label: 'Overwrite',
									className: 'btn-primary',
									callback: () => {
										sound.next.play();
										var request  = { data : { type : 'division', action : 'write', overwrite: true, division : division }};
										request.json = JSON.stringify( request.data );
										ws.send( request.json );
									}
								},
								rename : {
									label: 'Save As...',
									className: 'btn-success',
									callback: () => {
										sound.next.play();
										bootbox.prompt({
											title: 'Save Division As...',
											value: division.name.toUpperCase(),
											callback: ( name ) => {
												if( name === null ) { sound.prev.play(); return; }
												sound.next.play();
												division.name = name.toLowerCase();
												var request  = { data : { type : 'division', action : 'write', division : division }};
												request.json = JSON.stringify( request.data );
												ws.send( request.json );
											}
										});
									}
								},
							},
							closeButton : false,
						});
					}
				}
			};
			ws.onclose   = function( reason ) {
			};
		</script>

	</body>
</html>
