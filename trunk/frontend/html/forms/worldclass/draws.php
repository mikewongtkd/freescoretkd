<?php
	include "../../include/php/version.php";
	include "../../include/php/config.php";
?>
<html>
	<head>
		<title>Sport Poomsae Draws</title>
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/css/forms/worldclass/coordinator.css" rel="stylesheet" />
		<link href="../../include/bootstrap/add-ons/bootstrap-select.min.css" rel="stylesheet" />
		<link href="../../include/bootstrap/add-ons/bootstrap-toggle.min.css" rel="stylesheet" />
		<link href="../../include/page-transitions/css/animations.css" rel="stylesheet" type="text/css" />
		<link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
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
			table { width: 100%; background: transparent; }
			table th, td { padding-left: 2px; padding-right: 2px; font-size: 10pt; }
		</style>
	</head>
	<body>
		<div id="pt-main" class="pt-perspective">
			<div class="pt-page pt-page-1">
				<div class="container">
					<div class="page-header"> Sport Poomsae Draws </div>

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
													<label class="btn btn-default active"><input type="radio" name="competition-format" value="cutoff" checked>Cutoff</label>
													<label class="btn btn-default"><input type="radio" name="competition-format" value="combination">Combination</label>
													<label class="btn btn-default"><input type="radio" name="competition-format" value="team-trials">Team Trials</label>
												</div>
											</div>
										</div>
										<div class="row">
											<label for="gender-draw" class="col-xs-4 col-form-label">Male and Female divisions have:</label>
											<div class="col-xs-8"><input type="checkbox" class="gender" data-toggle="toggle" id="gender-draw" data-on="Different Forms" data-onstyle="success" data-off="Same Forms" data-offstyle="primary"></div>
										</div>
									</div>
									<div class="col-xs-6">
										<div class="row">
											<label for="prelim-count" class="col-xs-4 col-form-label">Preliminary Round</label>
											<div class="col-xs-8"><input type="checkbox" class="count" data-toggle="toggle" id="prelim-count" data-on="2 Forms" data-onstyle="success" data-off="1 Form" data-offstyle="primary" data-size="small"></div>
										</div>
										<div class="row">
											<label for="semfin-count" class="col-xs-4 col-form-label">Semi-Final Round</label>
											<div class="col-xs-8"><input type="checkbox" class="count" data-toggle="toggle" id="semfin-count" data-on="2 Forms" data-onstyle="success" data-off="1 Form" data-offstyle="primary" data-size="small"></div>
										</div>
										<div class="row">
											<label for="finals-count" class="col-xs-4 col-form-label">Final Round</label>
											<div class="col-xs-8"><input type="checkbox" class="count" data-toggle="toggle" id="finals-count" data-on="2 Forms" data-onstyle="success" data-off="1 Form" data-offstyle="primary" data-size="small"></div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="clearfix">
							<button type="button draw" id="instant-draw" class="btn btn-primary pull-right">Instant Draw</button> 
							<button type="button draw" id="slow-draw" class="btn btn-primary pull-right" style="margin-right: 40px;">Slow Draw</button> 
							<button type="button draw" id="select-manually" class="btn btn-primary pull-right" style="margin-right: 40px;">Select Manually</button> 
							<button type="button" id="cancel" class="btn btn-danger  pull-right" style="margin-right: 40px;">Cancel</button> 
						</div>
					</form>
				</div>
			</div>
			<div class="pt-page pt-page-2">
				<div class="container">
					<div class="page-header"> <a id="back-to-draws" class="btn btn-warning"><span class="glyphicon glyphicon-menu-left"></span> Re-draw </a> <span id="page-2-title">Instant Draw Results</span></div>

					<div class="panel panel-primary" id="draws">
						<div class="panel-heading">
							<h1 class="panel-title">Designated Poomsae Draws</h1>
						</div>
						<div class="panel-body">
							<table class="individual female" id="individual-female" style="display: none;">
							</table>
							<table class="individual male" id="individual-male" style="display: none;">
							</table>
							<table class="individual" id="individual">
							</table>
						</div>
					</div>
					<div class="clearfix">
						<button type="button" id="accept" class="btn btn-success pull-right">Accept</button> 
						<button type="button" id="cancel" class="btn btn-danger  pull-right" style="margin-right: 40px;">Cancel</button> 
					</div>
				</div>
			</div>
		</div>
		<script src="../../include/page-transitions/js/pagetransitions.js"></script>
		<script>

var sound = {
	send      : new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg"   ]}),
	confirmed : new Howl({ urls: [ "../../sounds/received.mp3", "../../sounds/received.ogg" ]}),
	next      : new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"     ]}),
	prev      : new Howl({ urls: [ "../../sounds/prev.mp3",     "../../sounds/prev.ogg"     ]}),
};

var page = {
	num : 1,
	transition: ( ev ) => { page.num = PageTransitions.nextPage({ animation: page.animation( page.num )}); },
	animation:  ( pn ) => {
		switch( pn ) {
			case 1: return 1;
			case 2: return 2;
		}
	}
};

$( '.list-group a' ).click( function( ev ) { 
	ev.preventDefault(); 
	sound.next.play(); 
	var href = $( this ).attr( 'href' );
	setTimeout( function() { window.location = href }, 300 );
});

var host       = '<?= $host ?>';
var tournament = <?= $tournament ?>;
var draws      = undefined;
var method     = 'cutoff';
var genderdraw = false;
var count      = { prelim : 1, semfin : 1, finals : 1 };

// ===== BUSINESS LOGIC
var draw = () => {
	draws = {};

	var autovivify = ( ev, age, round ) => {
		if( ! defined( draws[ ev ] ))                 { draws[ ev ]                 = {}; }
		if( ! defined( draws[ ev ][ age ] ))          { draws[ ev ][ age ]          = {}; }
		if( ! defined( draws[ ev ][ age ][ round ] )) { draws[ ev ][ age ][ round ] = []; }
	};

	// ------------------------------------------------------------
	if( method == 'cutoff' ) {
	// ------------------------------------------------------------
		var events  = FreeScore.rulesUSAT.poomsaeEvents();
		events.forEach(( ev ) => {
			var genders = [];
			var rank    = 'k'; // Black belt
			var ages    = FreeScore.rulesUSAT.ageGroups( ev );
			if( ev == 'Pair' ) { genders.push( 'Male & Female' );  }
			else               { genders.push( 'Female', 'Male' ); }

			ages.forEach(( age ) => {
				var choices = FreeScore.rulesUSAT.recognizedPoomsae( ev, age, rank );
				var rounds  = [ 'prelim', 'semfin', 'finals' ];
				var pool    = choices.slice( 0 ); // clone the choices

				rounds.forEach(( round ) => {
					if( round == 'finals' ) { pool = choices.slice( 0 ); } // Refresh the pool for the Finals
					autovivify( ev, age, round );

					for( var i = 0; i < count[ round ]; i++ ) {
						var j = Math.floor( Math.random() * pool.length );
						draws[ ev ][ age ][ round ].push( pool.splice( j, 1 )[ 0 ]);
					}
				});
			});
		});

	// ------------------------------------------------------------
	} else { // Combination or Team Trials
	// ------------------------------------------------------------
		var events  = FreeScore.rulesUSAT.poomsaeEvents();
		events.forEach(( ev ) => {
			var genders = [];
			var rank    = 'k'; // Black belt
			var ages    = FreeScore.rulesUSAT.ageGroups( ev );
			if( ev == 'Pair' ) { genders.push( 'Male & Female' );  }
			else               { genders.push( 'Female', 'Male' ); }

			ages.forEach(( age ) => {
				var choices = FreeScore.rulesUSAT.recognizedPoomsae( ev, age, rank );
				var rounds  = [ 'prelim', 'semfin', 'finals1', 'finals2', 'finals3' ];
				var pool    = choices.slice( 0 ); // clone the choices

				rounds.forEach(( round ) => {
					if( round == 'finals1' ) { pool = choices.slice( 0 ); } // Refresh the pool for the Finals
					autovivify( ev, age, round );

					var r = round.match( /prelim|semfin/ ) ? round : 'finals'; // final1, final2, and final3 are all finals
					var n = count[ r ];

					for( var i = 0; i < n; i++ ) {
						var j = Math.floor( Math.random() * pool.length );
						draws[ ev ][ age ][ round ].push( pool.splice( j, 1 )[ 0 ]);
					}
				});
			});
		});

	}
};

var show = {
	table : () => {
		var html = FreeScore.html;

		if( genderdraw ) {
			$( '#individual-female' ).show();
			$( '#individual-male' ).show();

		} else {
			var table = $( '#individual' );
			table.show();
			table.empty();

			var individual = draws[ 'Individual' ];
			var header     = [];
			var rows       = [];
			var rounds     = method == 'cutoff' ? [ 'prelim', 'semfin', 'finals' ] : [ 'prelim', 'semfin', 'final1', 'final2', 'final3' ];

			for( var age in individual ) {
				header.push( html.th.clone().text( age ));
			}
			for( var round of rounds ) {
				var row = [ round ];
				for( var age in individual ) {
					var forms = individual[ age ][ round ].join( ', ' );
					row.push( html.td.clone().text( forms ));
				}
				rows.push( row );
			}

			table.append( html.tr.clone().append( html.th.clone().text( 'Age' ), header ));
			for( var row of rows ) {
				var round = { prelim: 'Prelim.', semfin: 'Semi-Fin.', finals: 'Finals', final1 : '1st Finals', final2 : '2nd Finals', final3 : '3rd Finals' }[ row.shift() ];
				table.append( html.tr.clone().append( html.th.clone().text( round ), row ));
			}
		}
	}
};

// ===== FORM ELEMENT BEHAVIOR
$( '.format label' ).off( 'click' ).click(( ev ) => { 
	var clicked = $( ev.target ).find( 'input[type="radio"]' );
	method      = clicked.val();
	sound.next.play();
});

// Draws per round
$( '#gender-draw' ).change(( ev ) => {
	var clicked = $( ev.target );
	var value   = clicked.prop( 'checked' );
	genderdraw  = value;
	sound.next.play();
});

// Draws per round
$( 'input[type="checkbox"].count' ).change(( ev ) => {
	var clicked = $( ev.target );
	var name    = clicked.attr( 'id' ).replace( /\-count$/i, '' );
	var value   = clicked.prop( 'checked' ) ? clicked.attr( 'data-on' ) : clicked.attr( 'data-off' );
	count[ name ] = parseInt( value );
	sound.next.play();
});

// ===== BUTTON BEHAVIOR
$( '#instant-draw' ).off( 'click' ).click(( el ) => { el.preventDefault(); sound.next.play(); draw(); show.table(); page.transition(); });

$( '#back-to-draws' ).off( 'click' ).click(( ev ) => { 
	// ===== SWITCH THE PAGE
	sound.prev.play();
	page.transition(); 
});


$( '#cancel' ).off( 'click' ).click(() => { 
	sound.next.play();
	setTimeout( function() { window.location = 'index.php' }, 500 ); 
});
$( '#accept' ).off( 'click' ).click(() => { 
	var request  = { data : { type : 'ring', action : 'write draws', draws: draws }};
	request.json = JSON.stringify( request.data );
	console.log( request.json ); 
	ws.send( request.json );
});

// ===== SERVER COMMUNICATION
var ws = new WebSocket( 'ws://' + host + ':3088/worldclass/' + tournament.db + '/staging' );

ws.onopen = function() {
	var request;

	request = { data : { type : 'setup', action : 'read' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
};

ws.onmessage = function( response ) {
	var update = JSON.parse( response.data );
	console.log( update );
	if( update.type == 'ring' ) {
		if( defined( update.request ) && update.request.action == 'write draws' ) {
			alertify.success( 'Sport Poomsae Draws Saved.' );
			sound.send.play();
			setTimeout( function() { window.location = '../../index.php' }, 5000 );
		}
	}
};

		</script>
	</body>
</html>
