$.widget( "freescore.judgeController", {
	options: { autoShow: true },
	_create: function() {
		var o      = this.options;
		var e      = this.options.elements = {};
		var widget = this.element;
		var html   = e.html  = FreeScore.html;

		widget.nodoubletapzoom();

		o.num     = parseInt( $.cookie( "judge" )) - 1;
		o.ring    = parseInt( $.cookie( "ring" ));
		o.current = {};

		widget.addClass( 'judgeController flippable' );

		var card         = e.card         = html.div.clone() .addClass( "card" );
		var front        = e.front        = html.div.clone() .addClass( "front" );
		var views        = e.views        = html.div.clone() .addClass( "view control-group" );
		var controllers  = e.controllers  = html.div.clone() .addClass( "controller control-group" );

		var flipToBack   = e.flipToBack   = html.div.clone() .addClass( "flip" ) .html( "Division" );
		var athlete      = e.athlete      = html.ul .clone() .addClass( "athlete" ) .totemticker({ row_height : '32px', interval : 3000 });
		var score        = e.score        = html.div.clone() .addClass( "score" );
		var accuracy     = e.accuracy     = html.div.clone() .addClass( "accuracy" );
		var presentation = e.presentation = html.div.clone() .addClass( "presentation" );
		var matPosition  = e.matPosition  = html.div.clone() .matposition();

		var major        = e.major        = html.div.clone() .deductions({ value : 0.3, controller : this });
		var minor        = e.minor        = html.div.clone() .deductions({ value : 0.1, controller : this });
		var controls     = e.controls     = html.div.clone() .addClass( "controls" );

		var label        = e.label        = html.div.clone() .addClass( "label" ) .html( "Presentation Score" );
		var power        = e.power        = html.div.clone() .presentationBar({ label : 'Power and Speed',      controller: this });
		var rhythm       = e.rhythm       = html.div.clone() .presentationBar({ label : 'Rhythm and Control',   controller: this });
		var ki           = e.ki           = html.div.clone() .presentationBar({ label : 'Expression of Energy', controller: this });
		var send         = e.send         = html.div.clone() .ajaxbutton({ server : o.server, port : ':3088/', tournament : o.tournament.db, ring : o.ring, label : "Send", type : "send" })

		var sendScore    = o.sendScore    = function( judge, score ) {
			var major  = (e.major  .deductions( 'option', 'count' ) * e.major .deductions( 'option', 'value' ) * 10) .toFixed( 0 );
			var minor  = (e.minor  .deductions( 'option', 'count' ) * e.minor .deductions( 'option', 'value' ) * 10) .toFixed( 0 );
			var rhythm = (e.rhythm .presentationBar( 'option', 'value' ) * 10) .toFixed( 0 );
			var power  = (e.power  .presentationBar( 'option', 'value' ) * 10) .toFixed( 0 );
			var ki     = (e.ki     .presentationBar( 'option', 'value' ) * 10) .toFixed( 0 );

			return judge + "/" + major + "/" + minor + "/" + rhythm + "/" + power + "/" + ki;
		}

		// ===== UPDATE BEHAVIOR
		widget.on( "updateRequest", function( ev ) {
			var o = ev.score;
			var e = ev.score.elements;
			o.accuracy     = 4.0 -
			                 e.major .deductions( 'option', 'count' ) * e.major .deductions( 'option', 'value' ) -
			                 e.minor .deductions( 'option', 'count' ) * e.minor .deductions( 'option', 'value' );
			o.accuracy     = o.accuracy < 0 ? 0 : o.accuracy; // The accuracy score cannot be lower than 0

			o.presentation = parseFloat( e.rhythm .presentationBar( 'option', 'value' )) +
			                 parseFloat( e.power  .presentationBar( 'option', 'value' )) +
			                 parseFloat( e.ki     .presentationBar( 'option', 'value' ));

			e.accuracy     .html( o.accuracy     .toFixed( 1 ) + "<br /><span>Accuracy</span>" );
			e.presentation .html( o.presentation .toFixed( 1 ) + "<br /><span>Presentation</span>" );
			e.send .ajaxbutton({ command : o.sendScore( o.num, o ) }); // Update "send" button callback
		} );


		score.append( accuracy, presentation, athlete );
		views.append( flipToBack, score, matPosition );
		controls.append( label, power, rhythm, ki, send );

		controllers.append( major, controls, minor );

		front.append( views, controllers );

		var back         = e.back         = html.div.clone() .addClass( "back" );
		var notes        = e.notes        = html.div.clone() .judgeNotes({ num : o.num });
		var flipToFront  = e.fliptoFront  = html.div.clone() .addClass( "flip" ) .html( "Score" );
		var prevAthlete  = e.prevAthlete  = html.div.clone() .ajaxbutton({ server : o.server, port : ':3088/', tournament : o.tournament.db, ring : o.ring, command : "athlete/previous",  label : "Prev Athlete",  type : "navigate prev athlete"  });
		var nextAthlete  = e.nextAthlete  = html.div.clone() .ajaxbutton({ server : o.server, port : ':3088/', tournament : o.tournament.db, ring : o.ring, command : "athlete/next",      label : "Next Athlete",  type : "navigate next athlete"  });
		var prevDivision = e.prevDivision = html.div.clone() .ajaxbutton({ server : o.server, port : ':3088/', tournament : o.tournament.db, ring : o.ring, command : "division/previous", label : "Prev Division", type : "navigate prev division" });
		var nextDivision = e.nextDivision = html.div.clone() .ajaxbutton({ server : o.server, port : ':3088/', tournament : o.tournament.db, ring : o.ring, command : "division/next",     label : "Next Division", type : "navigate next division" });
		var flipDisplay  = e.flipDisplay  = html.div.clone() .ajaxbutton({ server : o.server, port : ':3088/', tournament : o.tournament.db, ring : o.ring, command : "display",           label : "Leaderboard",   type : "navigate mode"          });

		back.append( prevAthlete, nextAthlete, prevDivision, nextDivision, flipDisplay, notes, flipToFront );

		card.append( front, back );

		widget.append( card );
		widget.trigger( { type : "updateRequest", score : o } );

		// ============================================================
		// BEHAVIOR
		// ============================================================
		flipToBack.click( function() {
			flipToBack.fadeTo( 50, 0.75, function() { flipToBack.fadeTo( 100, 1.0 ); } );
			card.toggleClass( 'flipped' );
		});
		flipToFront.click( function() {
			flipToFront.fadeTo( 50, 0.75, function() { flipToFront.fadeTo( 100, 1.0 ); } );
			card.toggleClass( 'flipped' );
		});

	},
	_init: function( ) {
		var widget      = this.element;
		var e           = this.options.elements;
		var o           = this.options;
		var html        = e.html;
		var ordinal     = [ '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th' ];

		function refresh( update ) {
			var progress = JSON.parse( update.data ); if( ! defined( progress.divisions )) { return; }
			var division = progress.divisions[ 0 ]; // Judge updates are limited in scope to one judge, one division, to minimize data transfer
			if( ! defined( division )) { return; }

			var formNames   = division.forms[ division.round ];
			var formOrdinal = formNames.length > 1 ? ordinal[ division.form ] + ' form ' : '';
			if( ! defined( formNames )) { return; }
			var formName    = formNames[ division.form ].name;

			console.log( division.order[ division.round ], division.current );

			if( division.state == 'score' ) {
				e.flipDisplay.ajaxbutton({ label : "Leaderboard" });
			} else {
				e.flipDisplay.ajaxbutton({ label : "Athlete Score" });
			}

			if( formNames.length > 1 ) {
				if( division.form < (formNames.length - 1)) {
					e.prevAthlete.ajaxbutton({ command : "athlete/previous", label : "Prev Athlete" });
					e.nextAthlete.ajaxbutton({ command : "form/next",        label : "Next Form" });
				} else {
					e.prevAthlete.ajaxbutton({ command : "form/previous",    label : "Prev Form" });
					e.nextAthlete.ajaxbutton({ command : "athlete/next",     label : "Next Athlete" });
				}
			} else {
				e.prevAthlete.ajaxbutton({ command : "athlete/previous", label : "Prev Athlete" });
				e.nextAthlete.ajaxbutton({ command : "athlete/next",     label : "Next Athlete" });
			}
			var num_rounds = Object.keys( division.forms ).length;
			if       ( num_rounds == 1 ) {
				e.prevDivision.ajaxbutton({ command : "division/previous", label : "Prev Division" });
				e.nextDivision.ajaxbutton({ command : "division/next",     label : "Next Division" });

			} else if( division.round == 'prelim' || (division.round == 'semfin' && num_rounds == 2 )) {
				e.prevDivision.ajaxbutton({ command : "division/previous", label : "Prev Division" });
				e.nextDivision.ajaxbutton({ command : "round/next",        label : "Next Round" });

			} else if( division.round == 'semfin' && num_rounds == 3 ) {
				e.prevDivision.ajaxbutton({ command : "round/previous",    label : "Prev Round" });
				e.nextDivision.ajaxbutton({ command : "round/next",        label : "Next Round" });

			} else if( division.round == 'finals' ) {
				e.prevDivision.ajaxbutton({ command : "round/previous",    label : "Prev Round" });
				e.nextDivision.ajaxbutton({ command : "division/next",     label : "Next Division" });

			}

			// ===== RESET DEFAULTS FOR A NEW ATHLETE
			var different = { 
				division : division.name    != o.current.divname,
				athlete  : division.current != o.current.athlete,
				form     : division.form    != o.current.form
			}
			
			if( different.division || different.athlete || different.form ) {
				var round_name = { 'prelim' : 'Preliminary Round', 'semfin' : 'Semi-Finals', 'finals' : 'Finals' };
				var athlete    = division.athletes[ parseInt( division.current ) ];
				var info       = { 
				                     division : html.span.clone() .addClass( "details" ) .html( division.name.toUpperCase().replace( ".", " " ) + ' ' + division.description ),
				                     athlete  : html.span.clone() .addClass( "athlete" ) .html( athlete.name ),
				                     round    : html.span.clone() .addClass( "details" ) .html( round_name[ division.round ] ),
				                     form     : html.span.clone() .addClass( "details" ) .html( formOrdinal + formName ),
				                 };
				var tickerList = [ info.athlete, info.division, info.round, info.form ].map( function( item ) { return e.html.li.clone() .html( item ); });
				e.athlete .empty();
				e.athlete .append( tickerList );
				e.matPosition.matposition( 'option', 'reset' )();

				o.major  = 0.0; e.major  .deductions( { count : 0 });
				o.minor  = 0.0; e.minor  .deductions( { count : 0 });
				o.rhythm = 0.9; e.rhythm .presentationBar( { value : 0.9 });
				o.power  = 0.9; e.power  .presentationBar( { value : 0.9 });
				o.ki     = 0.9; e.ki     .presentationBar( { value : 0.9 });

				widget.trigger({ type : "updateRequest", score : o });
			}
			// ===== UPDATE WIDGETS
			e.notes .judgeNotes({ forms : division.forms[ division.round ], form : division.form, athletes : division.athletes, judges : division.judges, current : division.current, round : division.round, order : division.order[ division.round ] });

			e.matPosition. matposition({ judges : division.judges, judge : o.num, remaining : division.pending.length });

			o.current.division = progress.current;
			o.current.divname  = division.name;
			o.current.athlete  = division.current;
			o.current.form     = division.form;
		};
		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	}
});
