<?php
	include "../../include/php/version.php";
	include "../../include/php/config.php";
?>
<html>
	<head>
		<title>Sport Poomsae Draws</title>
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/bootstrap/add-ons/bootstrap-select.min.css" rel="stylesheet" />
		<link href="../../include/bootstrap/add-ons/bootstrap-toggle.min.css" rel="stylesheet" />
		<link href="../../include/bootstrap/css/freescore-theme.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootstrap-select.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootstrap-toggle.min.js"></script>
		<script src="../../include/alertify/alertify.min.js"></script>
		<script src="../../include/js/freescore.js"></script>

		<meta name="viewport" content="width=device-width, initial-scale=1">
		<style type="text/css">
			@font-face {
			  font-family: Nimbus;
			  src: url("include/fonts/nimbus-sans-l_bold-condensed.ttf"); }
			@font-face {
			  font-family: Biolinum;
			  font-weight: bold;
			  src: url("include/fonts/LinBiolinum_Rah.ttf"); }
			.page-footer { text-align: center; }
			.btn-default.active {
				background-color: #77b300;
				border-color: #558000;
			}
			.pill {
				padding: 4px;
				border-radius: 4px;
			}
			label.disabled {
				pointer-events: none;
			}

			.row { margin-bottom: 8px; }
		</style>
	</head>
	<body>
		<div class="container">
			<div class="page-header">
				<h1>Sport Poomsae Draws</h1>
			</div>

			<form>
				<div class="panel panel-primary" id="format">
					<div class="panel-heading">
						<h1 class="panel-title">Competition Format</h1>
					</div>
					<div class="panel-body">
						<div class="form-group row">
							<div class="col-xs-6">
								<div class="row">
									<label for="rings" class="col-xs-4 col-form-label">Format</label>
									<div class="col-xs-8">
										<div class="btn-group format" data-toggle="buttons" id="competition-format">
											<label class="btn btn-default"><input type="radio" name="competition-format" value="cutoff">Cutoff</label>
											<label class="btn btn-default"><input type="radio" name="competition-format" value="combination">Combination</label>
											<label class="btn btn-default"><input type="radio" name="competition-format" value="team-trials">Team Trials</label>
										</div>
									</div>
								</div>
								<div class="row">
									<label for="gender-draw" class="col-xs-4 col-form-label">Separate Draws for Male and Female?</label>
									<div class="col-xs-8"><input type="checkbox" data-toggle="toggle" id="gender-draw" data-on="Yes" data-onstyle="success" data-off="No" data-offstyle="primary"></div>
								</div>
							</div>
							<div class="col-xs-6">
								<div class="row">
									<label for="prelim-count" class="col-xs-4 col-form-label">Preliminary Round</label>
									<div class="col-xs-8"><input type="checkbox" data-toggle="toggle" id="prelim-count" data-on="2 Forms" data-onstyle="success" data-off="1 Form" data-offstyle="primary"></div>
								</div>
								<div class="row">
									<label for="semfin-count" class="col-xs-4 col-form-label">Semi-Final Round</label>
									<div class="col-xs-8"><input type="checkbox" data-toggle="toggle" id="semfin-count" data-on="2 Forms" data-onstyle="success" data-off="1 Form" data-offstyle="primary"></div>
								</div>
								<div class="row">
									<label for="finals-count" class="col-xs-4 col-form-label">Final Round</label>
									<div class="col-xs-8"><input type="checkbox" data-toggle="toggle" id="finals-count" data-on="2 Forms" data-onstyle="success" data-off="1 Form" data-offstyle="primary"></div>
								</div>
							</div>
						</div>
						<div class="form-group row">
							<div class="clearfix">
								<button type="button draw" id="instant-draw" class="btn btn-primary pull-right" style="margin-right: 20px;">Instant Draw</button> 
								<button type="button draw" id="slow-draw"    class="btn btn-primary pull-left"  style="margin-left: 20px;">Slow Draw</button> 
							</div>
						</div>
					</div>
				</div>

				<div class="clearfix">
					<button type="button" id="accept" class="btn btn-success pull-right">Accept</button> 
					<button type="button" id="cancel" class="btn btn-danger  pull-right" style="margin-right: 40px;">Cancel</button> 
				</div>
			</form>
		</div>
		<script>

var sound = {
	send      : new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg"   ]}),
	confirmed : new Howl({ urls: [ "../../sounds/received.mp3", "../../sounds/received.ogg" ]}),
	next      : new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"     ]}),
};

$( '.list-group a' ).click( function( ev ) { 
	ev.preventDefault(); 
	sound.next.play(); 
	var href = $( this ).attr( 'href' );
	setTimeout( function() { window.location = href }, 300 );
});

var host       = '<?= $host ?>';
var tournament = <?= $tournament ?>;
var draws      = {};
var method     = undefined;
var count      = {};

// ===== BUSINESS LOGIC
var draw = () => {
	// ------------------------------------------------------------
	if( method == 'cutoff' ) {
	// ------------------------------------------------------------
		var events  = FreeScore.rulesUSAT.poomsaeEvents();
		events.forEach(( ev ) => {
			var genders = [];
			var rank    = 'k'; // Black belt
			if( ev == 'Pair' ) { genders.push( 'Male & Female' ); }
			else               { genders.push( 'Female', 'Male' ); }
			var ages    = FreeScore.rulesUSAT.ageGroups( ev );

			ages.forEach(( age ) => {
				var choices = FreeScore.rulesUSAT.recognizedPoomsae( ev, age, rank );
				var rounds  = [ 'prelim', 'semfin', 'finals' ];
				var pool    = choices.slice( 0 ); // clone the choices

				rounds.forEach(( round ) => {
					if( round == 'finals' ) { pool = choices.slice( 0 ); } // Refresh the pool for the Finals
					if( ! defined( draws[ ev ] )) { draws[ ev ] = {}; }
					if( ! defined( draws[ ev ][ age ] )) { draws[ ev ][ age ] = {}; }
					if( ! defined( draws[ ev ][ age ][ round ] )) { draws[ ev ][ age ][ round ] = []; }
					for( var i = 0; i < count[ round ]; i++ ) {
						var j = Math.floor( Math.random() * pool.length );
						draws[ ev ][ age ][ round ].push( pool.splice( j, 1 )[ 0 ]);
					}
				});
			});
		});

	// ------------------------------------------------------------
	} else if( method == 'combination' ) {
	// ------------------------------------------------------------
		var events  = FreeScore.rulesUSAT.poomsaeEvents();
		events.forEach(( ev ) => {
			var genders = [];
			var rank    = 'k'; // Black belt
			if( ev == 'Pair' ) { genders.push( 'Male & Female' ); }
			else               { genders.push( 'Female', 'Male' ); }
			var ages    = FreeScore.rulesUSAT.ageGroups( ev );

			ages.forEach(( age ) => {
				var choices = FreeScore.rulesUSAT.recognizedPoomsae( ev, age, rank );
				var rounds  = [ 'prelim', 'semfin', 'ro8', 'ro4', 'ro2' ];
				var pool    = choices.slice( 0 ); // clone the choices

				rounds.forEach(( round ) => {
					if( round == 'ro8' ) { pool = choices.slice( 0 ); } // Refresh the pool for the Finals
					if( ! defined( draws[ ev ] )) { draws[ ev ] = {}; }
					if( ! defined( draws[ ev ][ age ] )) { draws[ ev ][ age ] = {}; }
					if( ! defined( draws[ ev ][ age ][ round ] )) { draws[ ev ][ age ][ round ] = []; }

					var r = round.match( /prelim|semfin/ ) ? round : 'finals';
					var n = count[ r ];

					for( var i = 0; i < n; i++ ) {
						var j = Math.floor( Math.random() * pool.length );
						draws[ ev ][ age ][ round ].push( pool.splice( j, 1 )[ 0 ]);
					}
				});
			});
		});

	}
	console.log( draws );
};

// ===== INITIALIZE FORM
$( 'label' ).removeClass( 'active' );

// ===== FORM ELEMENT BEHAVIOR
$( '.format label' ).off( 'click' ).click(( ev ) => { 
	var clicked = $( ev.target ).find( 'input[type=radio]' );
	method      = clicked.val();
});

$( '.count label' ).off( 'click' ).click(( ev ) => {
	var clicked = $( ev.target ).find( 'input[type=radio]' );
	var name    = clicked.attr( 'name' );
	var value   = parseInt( clicked.val());
	count[ name ] = value;
});

$( '#instant-draw' ).off( 'click' ).click(( el ) => { el.preventDefault(); draw() });

$( '#cancel' ).off( 'click' ).click(() => { 
	sound.next.play();
	setTimeout( function() { window.location = 'index.php' }, 500 ); 
});
$( '#accept' ).off( 'click' ).click(() => { 
	var request  = { data : { type : 'setup', action : 'write', edits : { draws: draws }}};
	request.json = JSON.stringify( request.data );
	console.log( request.json ); 
	ws.send( request.json );
});

// ===== SERVER COMMUNICATION
var ws = new WebSocket( 'ws://' + host + ':3085/setup/' + tournament.db );

ws.onopen = function() {
	var request;

	request = { data : { type : 'setup', action : 'read' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
};

ws.onmessage = function( response ) {
	var update = JSON.parse( response.data );
	console.log( update );
	if( update.type == 'setup' ) {
		if( defined( update.request ) && update.request.action == 'write' ) {
			alertify.success( 'Sport Poomsae Draws Saved.' );
			sound.send.play();
			setTimeout( function() { window.location = '../../index.php' }, 5000 );
		}
	}
};

		</script>
	</body>
</html>
