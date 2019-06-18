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
			@media print {
				.btn { display: none; }
				.page-header { display: none; }
				body,.pt-perspective,.pt-page,.container { 
					height: auto !important; 
					overflow-y: auto !important; 
				}
				.pt-perspective {
					position: static !important;
					perspective: none !important;
				}
				.panel {
					page-break-inside: avoid;
				}
			}
			.page-footer { text-align: center; }
			.btn-default.active {
				background-color: #77b300;
				border-color: #558000;
			}
			.pill {
				padding: 4px;
				border-radius: 4px;
			}
			.bootstrap-select { width: 120px !important; }
			label.disabled {
				pointer-events: none;
			}

			.btn-group .btn.active {
				color: white;
			}

			.row { margin-bottom: 8px; }
			table { width: 100%; background: transparent; }
			table tr th { padding-bottom: 4px; }
			table th, td { padding-left: 2px; padding-right: 2px; font-size: 10pt; }
			table tr:nth-child( odd )>th { border-bottom: 1px solid #ccc; }
			table tr:nth-child( odd )>td { border-bottom: 1px solid #ccc; }

			input[type=text].form-draw {
				border: none;
				width: 80px;
			}

			#back-to-draws { margin-top: -4px; }
			#keyboard-shortcuts { margin-top: 4px; }
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
													<label class="btn btn-default active"><input type="radio" name="competition-format" class="text-light" value="cutoff" checked>Cutoff</label>
													<label class="btn btn-default"><input type="radio" name="competition-format" class="text-light" value="combination">Combination</label>
													<label class="btn btn-default"><input type="radio" name="competition-format" class="text-light" value="team-trials">Team Trials</label>
												</div>
											</div>
										</div>
										<div class="row">
											<label for="gender-draw" class="col-xs-4 col-form-label">Male and Female divisions have:</label>
											<div class="col-xs-8"><input type="checkbox" class="gender" data-toggle="toggle" id="gender-draw" data-on="Different Forms" data-onstyle="primary" data-off="Same Forms" data-offstyle="primary"></div>
										</div>
										<div class="row">
											<label for="replacement" class="col-xs-4 col-form-label">Before drawing the forms for the final round:</label>
											<div class="col-xs-8"><input type="checkbox" checked class="replacement" data-toggle="toggle" id="replacement" data-on="Replace" data-onstyle="success" data-off="Do not replace" data-offstyle="danger"></div>
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
											<div class="col-xs-8"><input type="checkbox" class="count" data-toggle="toggle" id="finals-count" data-on="2 Forms" data-onstyle="success" data-off="1 Form" data-offstyle="primary" data-size="small" checked></div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div class="clearfix">
							<button type="button" class="btn btn-danger pull-left cancel" style="margin-right: 40px; width: 180px;">Cancel</button> 
							<button type="button" id="delete" class="btn btn-primary pull-left disabled" style="margin-right: 40px; width: 180px;">Delete Draws</button> 
							<button type="button draw" id="instant-draw" class="btn btn-primary pull-right" style="width: 180px;">Instant Draw</button> 
							<button type="button" id="edit" class="btn btn-primary pull-right" style="margin-right: 40px; width: 180px;">Select Manually</button> 
						</div>
					</form>
				</div>
			</div>
			<div class="pt-page pt-page-2">
				<div class="container">
					<div class="page-header">
						<a id="back-to-draws" class="btn btn-warning"><span class="glyphicon glyphicon-menu-left"></span> Redraw</a>
						<span id="page-2-title">Draw Results</span>
						<a class="btn btn-xs btn-info pull-right" id="keyboard-shortcuts"><span class="fa fa-keyboard-o"></span> Keyboard Shortcuts</a>
					</div>

					<div class="panel panel-primary individual" id="individual-coed">
						<div class="panel-heading">
							<div class="panel-title"> Individual </div>
						</div>
						<div class="panel-body">
							<table>
							</table>
						</div>
					</div>

					<div class="panel panel-primary individual" id="individual-female">
						<div class="panel-heading">
							<div class="panel-title"> Individual Female </div>
						</div>
						<div class="panel-body">
							<table>
							</table>
						</div>
					</div>

					<div class="panel panel-primary individual" id="individual-male">
						<div class="panel-heading">
							<div class="panel-title"> Individual Male </div>
						</div>
						<div class="panel-body">
							<table>
							</table>
						</div>
					</div>

					<div class="panel panel-primary pair" id="pair-coed">
						<div class="panel-heading">
							<div class="panel-title"> Pairs </div>
						</div>
						<div class="panel-body">
							<table>
							</table>
						</div>
					</div>

					<div class="panel panel-primary team" id="team-coed">
						<div class="panel-heading">
							<div class="panel-title"> Team </div>
						</div>
						<div class="panel-body">
							<table>
							</table>
						</div>
					</div>

					<div class="panel panel-primary team" id="team-female">
						<div class="panel-heading">
							<div class="panel-title"> Team Female</div>
						</div>
						<div class="panel-body">
							<table>
							</table>
						</div>
					</div>

					<div class="panel panel-primary team" id="team-male">
						<div class="panel-heading">
							<div class="panel-title"> Team Male</div>
						</div>
						<div class="panel-body">
							<table>
							</table>
						</div>
					</div>

					<div class="clearfix" style="height: 200px;">
						<!-- TODO: Add download PDF or high-res PNG option -->
						<button type="button" class="btn btn-danger pull-left cancel" style="width: 180px;">Cancel</button> 
						<button type="button" id="accept" class="btn btn-success pull-right" style="width: 180px;">Accept</button> 
						<button type="button" id="print" class="btn btn-warning pull-right" style="width: 180px; margin-right: 40px;"><span class="fa fa-print"></span> Print</button> 
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
var count      = { prelim : 1, semfin : 1, finals : 2 };

// ===== BUSINESS LOGIC
var draw = () => {
	draws = {};
	var replacement = $( '#replacement' ).prop( 'checked' );

	var autovivify = ( ev, gender, age, round ) => {
		if( ! defined( draws[ ev ] ))                           { draws[ ev ]                           = {}; }
		if( ! defined( draws[ ev ][ gender ] ))                 { draws[ ev ][ gender ]                 = {}; }
		if( ! defined( draws[ ev ][ gender ][ age ] ))          { draws[ ev ][ gender ][ age ]          = {}; }
		if( ! defined( draws[ ev ][ gender ][ age ][ round ] )) { draws[ ev ][ gender ][ age ][ round ] = []; }
	};

	// ------------------------------------------------------------
	if( method == 'cutoff' ) {
	// ------------------------------------------------------------
		var events  = FreeScore.rulesUSAT.poomsaeEvents();
		events.forEach(( ev ) => {
			var genders = [];
			var rank    = 'k'; // Black belt
			var ages    = FreeScore.rulesUSAT.ageGroups( ev );
			var coed    = ! $( '#gender-draw' ).prop( 'checked' ); 
			var pairs   = ev.match( /pair/i );
			if( pairs || coed ) { genders.push( 'c' );  } else { genders.push( 'f', 'm' ); }

			genders.forEach(( gender ) => {
				ages.forEach(( age ) => {
					var choices = FreeScore.rulesUSAT.recognizedPoomsae( ev, age, rank );
					var rounds  = [ 'prelim', 'semfin', 'finals' ];
					var pool    = choices.slice( 0 ); // clone the choices

					rounds.forEach(( round ) => {
						if( round == 'finals' && replacement ) { pool = choices.slice( 0 ); } // Refresh the pool for the Finals
						autovivify( ev, gender, age, round );

						for( var i = 0; i < count[ round ]; i++ ) {
							var n = pool.length;
							if( round == 'prelim' ) { n = n > 6 ? n - 2 : n; }
							if( round == 'semfin' ) { n = n > 6 ? n - 2 : n; }
							// var j = Math.floor( Math.random() * pool.length );
							var j = Math.floor( Math.random() * n );
							var cutoff = Math.ceil( pool.length / 4 );
							if( round == 'finals' && j < cutoff ) { j = j + cutoff < pool.length ? j + cutoff : pool.length - 1; }
							draws[ ev ][ gender ][ age ][ round ].push( pool.splice( j, 1 )[ 0 ]);
						}
					});
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
			var coed    = $( '#gender-draw' ).val() == 'on'; 
			var pairs   = ev.match( /pair/i );
			if( pairs || coed ) { genders.push( 'c' ); } else  { genders.push( 'f', 'm' ); }

			genders.forEach(( gender ) => { 
				ages.forEach(( age ) => {
					var choices = FreeScore.rulesUSAT.recognizedPoomsae( ev, age, rank );
					var rounds  = [ 'prelim', 'semfin', 'final1', 'final2', 'final3' ];
					var pool    = choices.slice( 0 ); // clone the choices

					rounds.forEach(( round ) => {
						if( round == 'final1' ) { pool = choices.slice( 0 ); } // Refresh the pool for the Finals
						autovivify( ev, gender, age, round );

						var r = round.match( /prelim|semfin/ ) ? round : 'finals'; // final1, final2, and final3 are all finals
						var n = count[ r ];

						for( var i = 0; i < n; i++ ) {
							var j = Math.floor( Math.random() * pool.length );
							draws[ ev ][ gender ][ age ][ round ].push( pool.splice( j, 1 )[ 0 ]);
						}
					});
				});
			});
		});

	}
};

var blank = () => {
	var rules  = FreeScore.rulesUSAT;
	var rounds;
	if( method == 'cutoff' ) { rounds = [ 'prelim', 'semfin', 'finals' ]; } 
	else                     { rounds = [ 'prelim', 'semfin', 'final1', 'final2', 'final3' ]; }
	draws = {};
	for( ev of rules.poomsaeEvents()) {
		draws[ ev ] = {};
		var genders;
		if( ev.match( /pair/i ) || ! genderdraw ) { genders = [ 'c' ]; }
		else if( genderdraw ) { genders = [ 'f', 'm' ] }
		for( gender of genders) { 
			draws[ ev ][ gender ] = {}; 
			for( age of rules.ageGroups( ev )) {
				draws[ ev ][ gender ][ age ] = {};
				for( round of rounds ) {
					draws[ ev ][ gender ][ age ][ round ] = [];
					for( var i = 0; i < count[ round ]; i++ ) {
						draws[ ev ][ gender ][ age ][ round ].push( '' );
					}
				}
			}
		}
	}
}

var sort = { alphabetically: ( x ) => { return Object.keys( x ).sort(); }, numerically: ( x ) => { return Object.keys( x ).sort(( a, b ) => { return parseInt( a ) - parseInt( b ); }); }};

var show = {
	table : () => {
		var html   = FreeScore.html;
		var rounds = method == 'cutoff' ? [ 'prelim', 'semfin', 'finals' ] : [ 'prelim', 'semfin', 'final1', 'final2', 'final3' ];
		var table  = undefined;
		var tables = { c: '-coed', f: '-female', m: '-male' };
		var focus  = undefined;
		var rules  = FreeScore.rulesUSAT;

		for( var ev of rules.poomsaeEvents()) {
			var draw = draws[ ev ];
			var e    = ev.toLowerCase();
			$( '.' + e ).hide();

			var genders = genderdraw ? (ev.match( /pair/i ) ? [ 'c' ] : [ 'f', 'm' ]) : [ 'c' ];
			for( var gender of genders ) {
				var ages       = rules.ageGroups( ev );
				var header     = [];
				var rows       = [];

				$( '#' + e + tables[ gender ] ).show();
				table = $( '#' + e + tables[ gender ] + ' table' );
				table.empty();

				for( var round of rounds ) {
					var text = { prelim: 'Preliminary', semfin: 'Semi-Finals', finals: 'Finals', final1 : '1st Finals', final2 : '2nd Finals', final3 : '3rd Finals' };
					header.push( html.th.clone().attr({ colspan : count[ round ]}).html( text[ round ] ));
				}

				for( var age of ages ) {
					var row = [ html.th.clone().text( age ) ];
					for( var round of rounds ) {
						var forms = [].fill( '', 0, count[ round ] );
						if( defined( draw ) && gender in draw && age in draw[ gender ] && round in draw[ gender ][ age ]) {
							var n = Math.min( draw[ gender ][ age ][ round ].length, count[ round ]);
							for( var i = 0; i < n; i++ ) {
								forms[ i ] = draw[ gender ][ age ][ round ][ i ];
							}
						}
						for( var i = 0; i < count[ round ]; i++ ) {
							var form    = forms[ i ];
							var id      = 'form' + String( parseInt( i ) + 1 ) + '_' + String( parseInt( age )) + '_' + round;
							var choices = JSON.stringify( FreeScore.rulesUSAT.recognizedPoomsae( ev, age, 'k' )); 
							var div     = JSON.stringify( { 'event': ev, gender: gender, age: age, round: round, form: i });
							var input   = html.text.clone().addClass( 'form-draw' ).attr({ id: id, 'data-list': choices, 'data-division': div }).val( form );
							var select  = html.div.clone().addClass( `selected selected-${i+1}` ).html( form ).hide();
							var td    = html.td.clone();

							if( ! defined( focus )) { focus = id; }

							td.append( input, select );
							row.push( td );
						}
					}
					rows.push( row );
				}

				if       ( gender == 'f' ) {
				} else if( gender == 'm' ) {
				}

				table.append( html.tr.clone().append( html.th.clone().html( '&nbsp;' ), header ));
				for( var row of rows ) {
					table.append( html.tr.clone().append( row ));
				}
			}
		}

		// Select all input text when clicked
		$( 'input.form-draw' ).off( 'click' ).click(( ev ) => { 
			var target  = $( ev.target );
			target.select();
		});

		// Update when input changes
		$( 'input.form-draw' ).off( 'change' ).on( 'change', ( ev ) => { 
			var target  = $( ev.target );
			var val     = target.val().toLowerCase();
			var choices = JSON.parse( target.attr( 'data-list' )); choices.push( 'Other' );
			var div     = JSON.parse( target.attr( 'data-division' ));
			var forms   = draws[ div.event ][ div.gender ][ div.age ][ div.round ];
			var draw    = forms[ div.form ]
			var n       = forms.length;
			var map     = { 1: 'Taegeuk 1', 2: 'Taegeuk 2', 3: 'Taegeuk 3', 4: 'Taegeuk 4', 5: 'Taegeuk 5', 6: 'Taegeuk 6', 7: 'Taegeuk 7', 8: 'Taegeuk 8', k: 'Koryo', g: 'Keumgang', t: 'Taebaek', p: 'Pyongwon', s: 'Sipjin', j: 'Jitae', c: 'Chonkwon', h: 'Hansu', o: 'Other' };
			var choice  = map[ val ];
			if( ! defined( choice ) && target.val()) { alertify.confirm( 'Non-Regulation Form Selected', target.val() + ' is not among the list of compulsory forms: ' + choices.join( ', ' ), ( ev ) => {}, ( ev ) => { target.val( draw ); }) }
			else if( choices.includes( choice )) { target.val( choice ); }

			forms[ div.form ] = target.val();
			draws[ div.event ][ div.gender ][ div.age ][ div.round ] = forms.filter(( name ) => { return name; });
			forms = draws[ div.event ][ div.gender ][ div.age ][ div.round ];
		});

		setTimeout(() => { $( '#' + focus ).click(); }, 750 );
	}
};

// ===== FORM ELEMENT BEHAVIOR
$( '.format label' ).off( 'click' ).click(( ev ) => { 
	var clicked = $( ev.target ).find( 'input[type="radio"]' );
	method      = clicked.val();
	sound.next.play();
});

// Draws for each gender
$( '#gender-draw' ).change(( ev ) => {
	var clicked = $( ev.target );
	var value   = clicked.prop( 'checked' );
	genderdraw  = value;
	sound.next.play();
});

$( '#replacement' ).change(( ev ) => {
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

$( '#keyboard-shortcuts' ).off( 'click' ).click(() => {
	alertify.confirm().set({ 
		title:      'Keyboard Shortcuts',
		message:    '<table> <thead> <tr><th>Key</th><th>Form</th></tr> </thead> <tbody> <tr><td>1-8</td><td>Taegeuk 1-8</td></tr> <tr><td>k</td><td>Koryo</td></tr> <tr><td>g</td><td>Keumgang</td></tr> <tr><td>t</td><td>Taebaek</td></tr> <tr><td>p</td><td>Pyongwon</td></tr> <tr><td>s</td><td>Sipjin</td></tr> <tr><td>j</td><td>Jitae</td></tr> <tr><td>c</td><td>Chonkwon</td></tr> <tr><td>h</td><td>Hansu</td></tr> <tr><td>o</td><td>Other</td></tr>  <tr><td>&lt;delete&gt;</td><td>None</td></tr> </tbody> </table>',
		transition: 'zoom'
	}).show();
});

$( '.cancel' ).off( 'click' ).click(() => { 
	sound.prev.play();
	setTimeout( function() { window.location = '../../index.php' }, 500 ); 
});

$( '#delete' ).off( 'click' ).click(() => {
	if( $( '#delete' ).hasClass( 'disabled' )) { return; }
	alertify.confirm( 
		'Delete Poomsae Draws?', 
		'Click <code>Delete</code> to delete the poomsae draws. Deleting cannot be undone!', 
		() => {
			var request;

			request = { data : { type : 'ring', action : 'draws delete' }};
			request.json = JSON.stringify( request.data );
			ws.send( request.json );
		},
		() => {}
	).set( 'labels', { ok: 'Delete', cancel: 'Cancel' });
});

$( '#edit' ).off( 'click' ).click(() => {
	if( $( '#edit' ).text() == 'Select Manually' ) { blank(); }

	sound.next.play();
	show.table();
	page.transition();
});

$( '#accept' ).off( 'click' ).click(() => { 
	var request  = { data : { type : 'ring', action : 'draws write', draws: draws }};
	request.json = JSON.stringify( request.data );
	console.log( request.json ); 
	ws.send( request.json );
});

$( '#print' ).off( 'click' ).click(() => {
	$( '.individual,.pair,.team' ).find( 'input' ).hide();
	$( '.individual,.pair,.team' ).find( '.selected' ).show();
	// window.print();
	// $( '.individual,.pair,.team' ).find( 'input' ).show();
	// $( '.individual,.pair,.team' ).find( '.selected' ).hide();
});

// ===== SERVER COMMUNICATION
var ws = new WebSocket( 'ws://' + host + ':3088/worldclass/' + tournament.db + '/staging' );

ws.onopen = function() {
	var request;

	request = { data : { type : 'ring', action : 'read' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
};

ws.onmessage = function( response ) {
	var update = JSON.parse( response.data );
	console.log( update );
	if( update.type == 'ring' ) {
		if( ! defined( update.request )) { 
			$( '#delete' ).addClass( 'disabled' );
			$( '#edit' ).text( 'Select Manually' );
			return; 
		};

		if( update.request.action == 'read' ) {
			draws = update.ring.draws;
			if( ! defined( draws )) { return; }

			if( Object.keys( draws ).some(( ev ) => { return Object.keys( draws[ ev ] ).some(( g ) => { return g.match( /^[fm]/i ); })})) {
				$( '#gender-draw' ).bootstrapToggle( 'on' );
			}

			$( '#delete' ).removeClass( 'disabled' );
			$( '#edit' ).text( 'Edit' );
			show.table();
			page.transition();

		} else if( update.request.action == 'draws write' ) {
			alertify.success( 'Sport Poomsae Draws Saved.' );
			sound.send.play();
			setTimeout(() => { window.location = '../../index.php' }, 3000 );

		} else if( update.request.action == 'draws delete' ) {
			alertify.success( 'Sport Poomsae Draws Deleted.' );
			sound.send.play();
			setTimeout(() => { location.reload()}, 3000 );
		}
	}
};

		</script>
	</body>
</html>
