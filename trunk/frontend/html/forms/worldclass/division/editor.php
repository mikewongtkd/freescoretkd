<?php
	include "../../../include/php/config.php";
	global $config;
	global $tournament;

	$db    = $tournament->db;
	$rnum  = 'staging';
	$divid = 'new';
	$file  = null;
	if( isset( $_GET[ 'ring' ]))  { $rnum  = $_GET[ 'ring' ]; }
	if( isset( $_GET[ 'divid' ])) { $divid = $_GET[ 'divid' ]; }
	if( isset( $_GET[ 'file' ])) {
		[ $db, $rnum, $divid ] = explode( '/', $_GET[ 'file' ]);
	}
	$url   = $config->websocket( 'worldclass', $rnum, 'computer+operator' );
	$title = $divid == 'new' ? 'Creating New Division' : "Editing " . strtoupper( $divid );
?>
<html>
	<head>
		<title><?= $title ?></title>
		<link href="../../../include/jquery/css/smoothness/jquery-ui.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/css/bootstrap-theme.min.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/add-ons/bootstrap-select.min.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/add-ons/bootstrap-switch.min.css" rel="stylesheet" />
		<link href="../../../include/opt/codemirror/lib/codemirror.css" rel="stylesheet" />
		<link href="../../../include/css/forms/worldclass/division/editor.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/themes/default.min.css" rel="stylesheet" />
		<link href="../../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootbox.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-select.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-switch.min.js"></script>
		<script src="../../../include/alertify/alertify.min.js"></script>
		<script src="../../../include/opt/codemirror/lib/codemirror.js"></script>
		<script src="../../../include/opt/codemirror/mode/freescore/freescore.js"></script>
		<script src="../../../include/js/freescore.js"></script>
		<script src="../../../include/js/uuid.js"></script>
		<script src="../../../include/js/websocket.js"></script>
		<script src="../../../include/js/sound.js"></script>
		<script src="../../../include/js/event.js"></script>
		<script src="../../../include/js/app.js"></script>
		<script src="../../../include/js/widget.js"></script>
		<script src="../../../include/js/ioc.js"></script>
		<script src="./widgets/description.js"></script>
		<script src="./widgets/settings.js"></script>
		<script src="./widgets/forms.js"></script>
		<script src="./widgets/draws.js"></script>
		<script src="./widgets/athletes.js"></script>
		<script src="../../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../../include/js/forms/worldclass/division.class.js"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1"></meta>
		<style>
.CodeMirror .cm-tab {
	width: 5em;
}
		</style>
	</head>
	<body>
		<div class="container">
			<div id="display-description"></div>
			<div id="display-settings"></div>
			<div id="display-forms"></div>
			<div id="display-draws"></div>
			<div id="display-athletes"></div>
		</div>

		<script>
			alertify.defaults.theme.ok     = "btn btn-danger";
			alertify.defaults.theme.cancel = "btn btn-warning";

			let tournament = <?= $tournament ?>;
			let ring       = { num: <?= $rnum == 'staging' ? "'staging'" : $rnum ?> };
			let html       = FreeScore.html;
			let app        = new FreeScore.App( ring.num );

			// ===== NETWORK CONNECT
<?php if( $divid == 'new' ): ?>
			app.on.connect( '<?= $url ?>' ).read.ring();
<?php else: ?>
			app.on.connect( '<?= $url ?>' ).read.division( '<?= $divid ?>' );
<?php endif; ?>

			// ============================================================
			// APP COMPOSITION
			// ============================================================
			app.widget = {
				description: { display : new FreeScore.Widget.DEDescription( app, 'display-description' ) },
				settings:    { display : new FreeScore.Widget.DESettings( app, 'display-settings' ) },
				forms:       { display : new FreeScore.Widget.DEForms( app, 'display-forms' ) },
				draws:       { display : new FreeScore.Widget.DEDraws( app, 'display-draws' ) },
				athletes:    { display : new FreeScore.Widget.DEAthletes( app, 'display-athletes' ) }
			};

			// ============================================================
			// APP STATE
			// ============================================================
			app.state.fields   = { required: [ 'name', 'state', 'current', 'form', 'round', 'method', 'description', 'athletes' ]};
			app.state.division = { name: undefined, state: 'score', current: 0, form: 0, round: undefined, method: 'cutoff', description: undefined, forms: null, athletes: []};
			app.state.settings = { divid: null, event: 'individual', method: 'cutoff', rounds: [], gender: null, age: null, rank: null, divcode: null, divnum: null, divid: null, group: null };
			app.state.errors   = [];
			app.state.validate = () => {
				let errors = app.state.errors = [];
				let division = app.state.division;

				app.state.fields.required.forEach( field => {
					if( ! field in division || ! defined( division?.[ field ])) {
						errors.push( `${field} missing or doesn't have a valid value.` );
					}
				});

				if( division.athletes.length == 0 ) {
					errors.push( 'No athletes defined.' );
				} else {
					let athletes   = ((athletes.doc.getValue().trim()).split( "\n" )).map( x => { return { name : x.trim() }});
					let count      = {};
					athletes.forEach( entry => count?.[ entry ] ? count[ entry ]++ : count[ entry ] = 1 );
					let duplicates = Object.keys( count ).filter( entry => count[ entry ] > 1 );
					let plural     = duplicates.length > 1;

					if( athletes.length !== set.size ) {
						errors.push( `Athlete${plural ? 's' : ''}s ${duplicates.join( ', ' )} ha${plural ? 've' : 's'} one or more duplicate entries` );
					}
				}
			};

			// ============================================================
			// REFRESH BEHAVIOR
			// ============================================================
			app.refresh.all = () => {
				app.widget.description.display.refresh.all();
				app.widget.settings.display.refresh.all();
				app.widget.forms.display.refresh.all();
				app.widget.draws.display.refresh.all();
				app.widget.athletes.display.refresh.all();
			};
			app.refresh.rounds = () => {
				let method   = app.state.division.method;
				let rounds   = [];
				let athletes = app.state.division.athletes;
				let n        = athletes.length;

				// Cutoff (which is also the default)
				if( method == 'cutoff' || ! defined( method )) {
					if( n <= 8  ) { rounds = [ 'finals' ];                     } else
					if( n <= 20 ) { rounds = [ 'semfin', 'finals' ];           } else
								  { rounds = [ 'prelim', 'semfin', 'finals' ]; }

				// Single Elimination or Side-by-Side
				} else {
					let d = n <= 1 ? 1 : Math.ceil( Math.log( n )/Math.log( 2 ));
					for( let i = d; i >= 1; i-- ) { rounds.push( `ro${2**i}` ); }
				}

				// Init round and forms
				app.state.division.round  = rounds[ 0 ];
				app.state.settings.rounds = rounds;

				let forms = app.state.division?.forms ? app.state.division.forms : {};
				rounds.forEach( round => {
					if( round in forms ) { return; }
					if( method == 'sbs' ) {
						let age  = app.widget.forms.display.age( app.state.settings.age );
						let form = age ? `draw-${age}` : 'draw';
						forms[ round ] = [ form ];

					} else {
						forms[ round ] = [ 'Choice' ];
					}
				});


				app.widget.forms.display.refresh.all();	
				app.widget.draws.display.refresh.all();	
			}

			app.network.on
				// ============================================================
				.heard( 'ring' )
				// ============================================================
				.command( 'update' )
					.respond( update => {
						if( '<?= $divid ?>' == 'new' ) {
							app.widget.draws.display.dom.hide();
							app.widget.settings.display.refresh.all();
							app.widget.forms.display.refresh.all();
						}
					})
				// ============================================================
				.heard( 'division' )
				// ============================================================
				.command( 'update' )
					.respond( update => {
						let division = update?.division;
						if( ! defined( division ) || division.name != '<?= $divid ?>') { return; }

						division = new Division( division );
						app.state.division = division.data();
						app.refresh.all();

				})
				.command( 'write error' )
					.respond( update => {
						let division = update?.division;
						if( ! defined( division ) || division.name != app.state.division.name ) { return; }

						app.sound.error.play();
						division = new Division( division );
						alertify.confirm( 
							`${division.name().toUpperCase()} file exists. Overwrite?`, 
							`The file for ${division.name().toUpperCase()} exists. Click [OK] to overwrite, [Cancel] to leave the existing file unchanged.`,
							() => {
								division = new Division( app.state.division );

								let message = { type: 'division', action: 'write', division: division.data(), overwrite: true };
								app.network.send( message );
								alertify.message( `Saving division ${division.name().toUpperCase()} ${division.description()}...` );
							},
							() => {}
						);
					})
				.command( 'write ok' )
					.respond( update => {
						let division = update?.division;
						if( ! defined( division ) || division.name != app.state.division.name ) { return; }

						app.sound.ok.play();
						division = new Division( division );
						alertify.success( `Division ${division.summary()} saved.` );
						setTimeout( () => { window.close(); }, 750 );
						app.state.division = division.data();
						app.refresh.all();
				})

		</script>

	</body>
</html>
