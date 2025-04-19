<?php
	include "../../include/php/version.php";
	include "../../include/php/config.php";
?>
<html>
	<head>
		<title>Sport Poomsae Draws</title>
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/css/forms/worldclass/coordinator.css" rel="stylesheet" />
		<link href="../../include/css/forms/worldclass/draws.css" rel="stylesheet" />
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
		<script src="../../include/opt/jstat/jstat.min.js"></script>
		<script src="../../include/opt/js-sha1/sha1.min.js"></script>
		<script src="../../include/opt/moment/moment.min.js"></script>

		<meta name="viewport" content="width=device-width, initial-scale=1">
		<style type="text/css">
			@media print {
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

			input[type=text].form-draw {
				border: none;
				width: 80px;
			}

			#back-to-draws { margin-top: -4px; }
			#back-to-edit  { margin-top: -4px; }
			#keyboard-shortcuts { margin-top: 4px; }
		</style>
	</head>
	<body>
		<div id="pt-main" class="pt-perspective">
			<?php include( 'draws/settings.php' ); ?>
			<?php include( 'draws/editing.php' ); ?>
			<?php include( 'draws/display.php' ); ?>
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
	transition: ( to ) => { PageTransitions.nextPage({ showPage: (to - 1), animation: page.animation( to )}); page.num = to; },
	animation:  ( to ) => {
		return to >= page.num ? 1 : 2;
	}
};

$( '.list-group a' ).click( function( ev ) { 
	ev.preventDefault(); 
	sound.next.play(); 
	var href = $( this ).attr( 'href' );
	setTimeout( function() { window.location = href }, 300 );
});

var tournament = <?= $tournament ?>;
var draws      = undefined;
var settings   = { age: { groups: {}}, count: { prelim: 1, semfin: 1, finals: 2 }, events: {}, gender: false, method: 'cutoff', timestamp: moment().format( 'lll' ), checksum: undefined };

// ===== BUSINESS LOGIC
var checksum = ( draws ) => { return sha1.hex( JSON.stringify( draws )).substr( 0, 8 ); }
var load = ( settings ) => {
	// Method
	$( `#competition-format input[type="radio"][value="${settings.method}"]` ).click();

	// Gender
	if( settings.gender ) { $( '#gender-draw' ).bootstrapToggle( 'on' ); } else { $( '#gender-draw' ).bootstrapToggle( 'off' ); }

	// Count
	Object.keys( settings.count ).forEach( round => {
		var toggle = ( state ) => { $( `#${round}-count` ).bootstrapToggle( state ); }
		if( settings.count[ round ] == 1 ) { toggle( 'off' ); } else { toggle( 'on' ); }
	});

	// Events
	Object.keys( settings.events ).forEach( ev => {
		var checked = settings.events[ ev ];
		var button  = $( `input.events[value="${ev}"]` );
		var label   = button.parents( 'label' );
		button.prop( 'checked', checked );
		if( checked ) { label.addClass( 'active' ); } else { label.removeClass( 'active' ); }
	});

	// Age Groups
	Object.keys( settings.age.groups ).forEach( age => {
		var checked = settings.age.groups[ age ];
		var button  = $( `input.age-group[value="${age}"]` );
		var label   = button.parents( 'label' );
		button.prop( 'checked', checked );
		if( checked ) { label.addClass( 'active' ); } else { label.removeClass( 'active' ); }
	});
};

var draw = () => {
	// Make draws
	draws = {};
	var replacement  = $( '#replacement' ).prop( 'checked' );
	var uniform      = $( '#uniform' ).prop( 'checked' );
	var distribution = {
		uniform : ( choices, round, form ) => { return Math.floor( Math.random() * choices.length ); },
		beta :    ( choices, round, form ) => {
			var x    = Math.random();
			var skew = 4;
			var distribution = {
				prelim : [ x => jStat.beta.inv( x, 1, skew ),     x => jStat.beta.inv( x, 2, skew + 1 ) ],
				semfin : [ x => jStat.beta.inv( x, 2, skew ),     x => jStat.beta.inv( x, skew, 2 )],
				finals : [ x => jStat.beta.inv( x, skew + 1, 2 ), x => jStat.beta.inv( x, skew - 1, 1 )]
			};

			distribution.final1 = distribution.prelim;
			distribution.final2 = distribution.semfin;
			distribution.final3 = distribution.finals;

			form = form > 0 ? 1 : 0; // Cap the function in case of more than 1 form selection
			var choice = Math.floor( distribution[ round ][ form ]( x ) * choices.length );
			return choice;
		}
	}
	var random = uniform ? distribution.uniform : distribution.beta;

	var autovivify  = ( ev, gender, age, round ) => {
		if( ! defined( draws[ ev ] ))                           { draws[ ev ]                           = {}; }
		if( ! defined( draws[ ev ][ gender ] ))                 { draws[ ev ][ gender ]                 = {}; }
		if( ! defined( draws[ ev ][ gender ][ age ] ))          { draws[ ev ][ gender ][ age ]          = {}; }
		if( ! defined( draws[ ev ][ gender ][ age ][ round ] )) { draws[ ev ][ gender ][ age ][ round ] = []; }
	};

	// ------------------------------------------------------------
	if( settings.method == 'cutoff' ) {
	// ------------------------------------------------------------
		var events  = FreeScore.rulesUSAT.poomsaeEvents();
		events.forEach(( ev ) => {
			if( ! ev in settings.events || ! settings.events[ ev ] ) { return; }

			var genders = [];
			var rank    = 'k'; // Black belt
			var ages    = FreeScore.rulesUSAT.ageGroups( ev );
			var coed    = ! $( '#gender-draw' ).prop( 'checked' ); 
			var pairs   = ev.match( /pair/i );
			if( pairs || coed ) { genders.push( 'c' );  } else { genders.push( 'f', 'm' ); }

			genders.forEach(( gender ) => {
				ages.forEach(( age ) => {
					if( ! age in settings.age.groups || ! settings.age.groups[ age ] ) { return; }

					var choices = FreeScore.rulesUSAT.recognizedPoomsae( ev, age, rank );
					var rounds  = [ 'prelim', 'semfin', 'finals' ];
					var pool    = choices.slice( 0 ); // clone the choices

					rounds.forEach(( round ) => {
						if( round == 'finals' && replacement ) { pool = choices.slice( 0 ); } // Refresh the pool for the Finals
						autovivify( ev, gender, age, round );

						for( var i = 0; i < settings.count[ round ]; i++ ) {
							var j = random( pool, round, i );
							draws[ ev ][ gender ][ age ][ round ].push( pool.splice( j, 1 ).shift() );
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
						var n = settings.count[ r ];

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
	var rounds = settings.method == 'cutoff' ? [ 'prelim', 'semfin', 'finals' ] : [ 'prelim', 'semfin', 'final1', 'final2', 'final3' ];
	draws = {};
	for( ev of rules.poomsaeEvents()) {
		draws[ ev ] = {};
		var genders;
		if( ev.match( /pair/i ) || ! settings.gender ) { genders = [ 'c' ]; }
		else if( settings.gender ) { genders = [ 'f', 'm' ] }
		for( gender of genders) { 
			draws[ ev ][ gender ] = {}; 
			for( age of rules.ageGroups( ev )) {
				draws[ ev ][ gender ][ age ] = {};
				for( round of rounds ) {
					draws[ ev ][ gender ][ age ][ round ] = [];
					for( var i = 0; i < settings.count[ round ]; i++ ) {
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
		var rounds = settings.method == 'cutoff' ? [ 'prelim', 'semfin', 'finals' ] : [ 'prelim', 'semfin', 'final1', 'final2', 'final3' ];
		var table  = undefined;
		var tables = { c: '-coed', f: '-female', m: '-male' };
		var focus  = undefined;
		var rules  = FreeScore.rulesUSAT;

		for( var ev of rules.poomsaeEvents()) {
			var e = ev.toLowerCase();
			if( ! ev in settings.events || ! settings.events[ ev ] ) { $( `.${e}` ).hide(); continue; }
			var draw = draws[ ev ];
			$( `.${e}` ).hide();

			var genders = settings.gender ? (ev.match( /pair/i ) ? [ 'c' ] : [ 'f', 'm' ]) : [ 'c' ];
			for( var gender of genders ) {
				var gname      = { 'c': 'coed', 'f': 'female', 'm': 'male' }[ gender ];
				var ages       = rules.ageGroups( ev );
				var header     = [];
				var rows       = [];

				$( '#' + e + tables[ gender ] ).show();
				table = $( '#' + e + tables[ gender ] + ' table' );
				table.empty();

				for( var round of rounds ) {
					var text = { prelim: 'Preliminary', semfin: 'Semi-Finals', finals: 'Finals', final1 : '1st Finals', final2 : '2nd Finals', final3 : '3rd Finals' };
					header.push( html.th.clone().attr({ colspan : settings.count[ round ]}).html( text[ round ] ));
				}

				for( var age of ages ) {
					if( ! age in settings.age.groups || ! settings.age.groups[ age ] ) { continue; }
					var text  = { "12-14" : "Cadet", "15-17" : "Junior", "18-30": "Under 30", "31-40": "Under 40", "31-50" : "Under 50", "41-50" : "Under 50", "51-60": "Under 60", "61+" : "Over 60", "61-65" : "Under 65", "66+" : "Over 65" };
					var label = age in text ? text[ age ] : age;
					var row   = [ html.th.clone().text( label ) ];
					for( var round of rounds ) {
						var forms = [].fill( '', 0, settings.count[ round ] );
						if( defined( draw ) && gender in draw && age in draw[ gender ] && round in draw[ gender ][ age ]) {
							var n = Math.min( draw[ gender ][ age ][ round ].length, settings.count[ round ]);
							for( var i = 0; i < n; i++ ) {
								forms[ i ] = draw[ gender ][ age ][ round ][ i ];
							}
						}
						for( var i = 0; i < settings.count[ round ]; i++ ) {
							var form    = forms[ i ];
							var choices = JSON.stringify( FreeScore.rulesUSAT.recognizedPoomsae( ev, age, 'k' )); 
							var div     = JSON.stringify( { 'event': ev, gender: gender, age: age, round: round, form: i });
							var id      = `form-${sha1.hex( div ).substr( 0, 8 )}`;
							var input   = html.text.clone().addClass( 'form-draw' ).attr({ id: id, 'data-list': choices, 'data-division': div }).val( form );
							var td    = html.td.clone();

							if( ! defined( focus )) { focus = id; }

							td.append( input );
							row.push( td );
						}
					}
					rows.push( row );
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
	},
	display : () => {
		var html    = FreeScore.html;
		var rules   = FreeScore.rulesUSAT;
		var rounds  = settings.method == 'cutoff' ? [ 'prelim', 'semfin', 'finals' ] : [ 'prelim', 'semfin', 'final1', 'final2', 'final3' ];
		var genders = settings.gender ? [ 'f', 'm' ] : [ 'c' ];
		var rowspan = {};
		var label   = {};
		var table   = $( '#display' );
		var time    = $( '#timestamp' );
		var row     = undefined;

		time.html( `Last updated on ${settings.timestamp}` );
		table.empty();

		// Calculate table width
		var formcols = Object.values( settings.count ).reduce(( acc, cur ) => { return acc + cur; }, 0);
		var width    = 2 + (genders.length * formcols);

		row = html.tr.clone().addClass( 'subsection' )
		row.append( html.td.clone().attr({ colspan: width }).html( 'Black Belt Designated Poomsae' ));
		table.append( row );

		// Add gender heading (if needed)
		if( settings.gender ) {
			row = html.tr.clone().addClass( 'genders' );
			row.append( html.td.clone().attr({ colspan : 2 }).html( '&nbsp;' ));
			row.append( html.td.clone().addClass( 'f' ).attr({ colspan : formcols }).html( 'Female' ));
			row.append( html.td.clone().addClass( 'm' ).attr({ colspan : formcols }).html( 'Male' ));
			table.append( row );
		}

		// Add rounds
		row = html.tr.clone().addClass( 'rounds' );
		row.append( html.td.clone().html( '&nbsp;' ), html.td.clone().html( 'Division' ));
		for( var gender of genders ) {
			for( var round of rounds ) {
				var text = { prelim: 'Preliminary', semfin: 'Semi-Finals', finals: 'Finals', final1 : '1st Finals', final2 : '2nd Finals', final3 : '3rd Finals' };
				row.append( html.td.clone().addClass( `round ${gender}` ).attr({ colspan : settings.count[ round ]}).html( text[ round ] ));
			}
		}
		table.append( row );
	
		// Calculate event label rowspans
		for( var ev of rules.poomsaeEvents()) {
			var ages = rules.ageGroups( ev );

			for( var age of ages ) {
				if( age in settings.age.groups && ! settings.age.groups[ age ] ) { continue; }
				if( ev in rowspan ) { rowspan[ ev ]++; } else { rowspan[ ev ] = 1; }
			}
		}

		// Start populating the table
		for( var ev of [ 'Individual', 'Team', 'Pair' ]) {
			if( ! ev in settings.events || ! settings.events[ ev ] ) { continue; }

			// Add gender & rounds for Pairs
			if( ev == 'Pair' && settings.gender ) {
				// Add mixed gender
				var row = html.tr.clone().addClass( 'genders' );
				row.append( html.td.clone().attr({ colspan: 2 }).html( '&nbsp;' ));
				row.append( html.td.clone().addClass( 'c' ).attr({ colspan : formcols }).html( 'Mixed' ));
				table.append( row );

				// Add rounds
				row = html.tr.clone().addClass( 'rounds' );
				row.append( html.td.clone().html( '&nbsp;' ), html.td.clone().html( 'Division' ));
				for( var round of rounds ) {
					var text = { prelim: 'Preliminary', semfin: 'Semi-Finals', finals: 'Finals', final1 : '1st Finals', final2 : '2nd Finals', final3 : '3rd Finals' };
					row.append( html.td.clone().addClass( `round c` ).attr({ colspan : settings.count[ round ]}).html( text[ round ] ));
				}
				table.append( row );
			}
				
			var draw    = draws[ ev ];
			var e       = ev.toLowerCase();
			var ages    = rules.ageGroups( ev );
			var genders = settings.gender ? (ev.match( /pair/i ) ? [ 'c' ] : [ 'f', 'm' ]) : [ 'c' ];
			var ages    = rules.ageGroups( ev );
			var row     = html.tr.clone().addClass( e );

			label.event = { 
				'Individual': { limit: 7, short: { name: 'IND',  offset: '32px' }, long: { name: 'INDIVIDUAL', offset: '90px' }},
				'Pair':       { limit: 2, short: { name: 'PR',   offset: ''     }, long: { name: 'PAIR',       offset: '20px' }},
				'Team':       { limit: 2, short: { name: 'TM',   offset: '6px'  }, long: { name: 'TEAM',       offset: '30px' }},
			};

			var evt = rowspan[ ev ] <= label.event[ ev ].limit ? label.event[ ev ].short : label.event[ ev ].long;
			row.append( html.td.clone().addClass( e ).attr({ rowspan: rowspan[ ev ] }).append( html.div.clone().addClass( 'rotate' ).attr({ 'data-offset' : evt.offset }).html( evt.name )));

			for( var age of ages ) {
				if( ! age in settings.age.groups || ! settings.age.groups[ age ] ) { continue; }
				var text  = { "12-14" : "Cadet", "15-17" : "Junior", "18-30": "Under 30", "31-40": "Under 40", "31-50" : "Under 50", "41-50" : "Under 50", "51-60": "Under 60", "61+" : "Over 60", "61-65" : "Under 65", "66+" : "Over 65" };
				var label = { age: age in text ? text[ age ] : age };
				var td    = html.td.clone().html( label.age );

				console.log( 'AGE', age, settings.age.groups ); // MW

				row.append( td );

				for( var gender of genders ) {
					for( var round of rounds ) {
						var forms = [].fill( '', 0, settings.count[ round ]);
						if( defined( draw ) && gender in draw && age in draw[ gender ] && round in draw[ gender ][ age ]) {
							var n = Math.min( draw[ gender ][ age ][ round ].length, settings.count[ round ]);
							for( var i = 0; i < n; i++ ) { forms[ i ] = draw[ gender ][ age ][ round ][ i ]; }
							for( var i = 0; i < settings.count[ round ]; i++ ) {
								td = html.td.clone().html( forms[ i ]);
								row.append( td );
							}
						}
					}
				}
				table.append( row );
				row = html.tr.clone().addClass( e );

			}
		}
		$( '.rotate' ).each(( i, item ) => {
			var height = $( item ).height();
			var offset = $( item ).attr( 'data-offset' );
			$( item ).css({ height: '28px', width: height, 'margin-top' : offset, transform: 'rotate(-90.0deg)' });
		});
	}
};

// ===== FORM ELEMENT BEHAVIOR
$( 'input[type="radio"].format' ).change(( ev ) => { 
	var clicked     = $( ev.target );
	settings.method = clicked.val();
	sound.next.play();
});

// Draws for each gender
$( '#gender-draw' ).change(( ev ) => {
	var clicked     = $( ev.target );
	var value       = clicked.prop( 'checked' );
	settings.gender = value;
	sound.next.play();
});

$( '#replacement' ).change(( ev ) => {
	sound.next.play();
});

$( '#uniform' ).change(( ev ) => {
	sound.next.play();
});

// Draws per round
$( 'input[type="checkbox"].count' ).change(( ev ) => {
	var clicked = $( ev.target );
	var name    = clicked.attr( 'data-round' );
	var value   = clicked.prop( 'checked' ) ? clicked.attr( 'data-on' ) : clicked.attr( 'data-off' );
	settings.count[ name ] = parseInt( value );
	sound.next.play();
});

// Events
$( 'input[type="checkbox"].events' ).each(( i, ev ) => {
	var value = $( ev ).val();
	settings.events[ value ] = $( ev ).prop( 'checked' );
});

$( 'input[type="checkbox"].events' ).change(( ev ) => {
	var clicked = $( ev.target );
	var value   = clicked.val();
	settings.events[ value ] = clicked.prop( 'checked' );
	if( settings.events[ value ]) { sound.next.play(); } else { sound.prev.play(); }
});

// Age groups
$( 'input[type="checkbox"].age-group' ).each(( i, group ) => {
	var value = $( group ).val();
	settings.age.groups[ value ] = $( group ).prop( 'checked' );
});

$( 'input[type="checkbox"].age-group' ).change(( ev ) => {
	var clicked = $( ev.target );
	var value   = clicked.val();
	settings.age.groups[ value ] = clicked.prop( 'checked' );
	if( settings.age.groups[ value ]) { sound.next.play(); } else { sound.prev.play(); }
});

// ===== BUTTON BEHAVIOR
$( '#instant-draw' ).off( 'click' ).click( el => { el.preventDefault(); sound.next.play(); draw(); show.table(); page.transition( 2 ); });

$( '#back-to-draws' ).off( 'click' ).click(( ev ) => { 
	// ===== SWITCH THE PAGE
	sound.prev.play();
	page.transition( 1 ); 
});

$( '#keyboard-shortcuts' ).off( 'click' ).click(() => {
	alertify.confirm().set({ 
		title:      'Keyboard Shortcuts',
		message:    '<table> <thead> <tr><th>Key</th><th>Form</th></tr> </thead> <tbody> <tr><td>1-8</td><td>Taegeuk 1-8</td></tr> <tr><td>k</td><td>Koryo</td></tr> <tr><td>g</td><td>Keumgang</td></tr> <tr><td>t</td><td>Taebaek</td></tr> <tr><td>p</td><td>Pyongwon</td></tr> <tr><td>s</td><td>Sipjin</td></tr> <tr><td>j</td><td>Jitae</td></tr> <tr><td>c</td><td>Chonkwon</td></tr> <tr><td>h</td><td>Hansu</td></tr> <tr><td>o</td><td>Other</td></tr>  <tr><td>&lt;delete&gt;</td><td>None</td></tr> </tbody> </table>',
		transition: 'zoom'
	}).show();
});

$( '.pt-page-1 .cancel' ).off( 'click' ).click(() => { 
	sound.prev.play();
	setTimeout( function() { window.location = '../../index.php' }, 500 ); 
});

$( '.pt-page-2 .cancel' ).off( 'click' ).click(() => { 
	sound.prev.play();
	page.transition( 1 );
});

$( '.pt-page-3 .cancel' ).off( 'click' ).click(() => { 
	sound.prev.play();
	page.transition( 2 );
});

$( '.pt-page-1 .delete' ).off( 'click' ).click(() => {
	if( $( '.pt-page-1 .delete' ).hasClass( 'disabled' )) { return; }
	alertify.confirm( 
		'Delete Poomsae Draws?', 
		'Click <code>Delete</code> to delete the poomsae draws. Deleting cannot be undone!', 
		() => {
			var request;

			request = { data : { type : 'tournament', action : 'draws delete' }};
			request.json = JSON.stringify( request.data );
			ws.send( request.json );
		},
		() => {}
	).set( 'labels', { ok: 'Delete', cancel: 'Cancel' });
});

$( '.page-1 .edit' ).off( 'click' ).click(() => {
	if( $( '.pt-page-1 .edit' ).text() == 'Select Manually' ) { blank(); }

	sound.next.play();
	show.table();
	page.transition( 2 );
});

$( '.pt-page-2 .accept' ).off( 'click' ).click(() => { 
	if( checksum( draws ) != settings.checksum ) {
		settings.checksum  = checksum( draws );
		settings.timestamp = moment().format( 'lll' ); // Mark timestamp for when updated draws are accepted
	}
	draws.settings = settings;
	var request  = { data : { type : 'tournament', action : 'draws write', draws }};
	request.json = JSON.stringify( request.data );
	delete draws.settings;
	ws.send( request.json );
	show.display();
	page.transition( 3 );
});

$( '.pt-page-3 .print' ).off( 'click' ).click(() => { alertify.dismissAll(); window.print(); });
$( '.pt-page-3 .accept' ).off( 'click' ).click(() => { window.location = '../../index.php'; });

// ===== SERVER COMMUNICATION
var ws = new WebSocket( '<?= $config->websocket( 'worldclass', 'staging', 'computer+operator' ) ?>' );

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
			$( '.pt-page-1 .delete' ).addClass( 'disabled' );
			$( '.pt-page-1 .edit' ).text( 'Select Manually' );
			return; 
		};

		if( update.request.action == 'read' ) {
			draws    = update.ring.draws;
			if( ! defined( draws )) { return; }

			if( defined( draws.settings )) {
				settings = draws.settings;
				delete draws.settings;
				load( settings );
			}

			settings.checksum = checksum( draws );

			if( Object.keys( draws ).some(( ev ) => { return Object.keys( draws[ ev ] ).some(( g ) => { return g.match( /^[fm]/i ); })})) {
				$( '#gender-draw' ).bootstrapToggle( 'on' );
			}

			$( '.pt-page-1 .delete' ).removeClass( 'disabled' );
			$( '.pt-page-1 .edit' ).text( 'Edit' );
			show.table();
			page.transition( 2 );

		} else if( update.request.action == 'draws write' ) {
			alertify.success( 'Sport Poomsae Draws Saved.' );
			sound.send.play();

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
