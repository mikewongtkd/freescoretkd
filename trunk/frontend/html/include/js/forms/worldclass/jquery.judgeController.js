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
			e.send .ajaxbutton({ command : o.sendScore( o.num, o )}); // Update "send" button callback
		} );

		score.append( accuracy, presentation, athlete );
		views.append( flipToBack, score, matPosition );
		controls.append( label, power, rhythm, ki, send );

		controllers.append( major, controls, minor );

		front.append( views, controllers );

		var arrow        = e.arrow = {
			left : html.img.clone() .attr({ src : '/freescore/include/jquery/mobile/images/icons-svg/arrow-l-white.svg', height: '24px', width: '24px' }) .css({ paddingTop: '4px', opacity : 0.75 }),
			right: html.img.clone() .attr({ src : '/freescore/include/jquery/mobile/images/icons-svg/arrow-r-white.svg', height: '24px', width: '24px' }) .css({ paddingTop: '4px', opacity : 0.75 }),
		};

		var back         = e.back         = html.div.clone() .addClass( "back" );
		var notes        = e.notes        = html.div.clone() .judgeNotes({ num : o.num });
		var flipToFront  = e.fliptoFront  = html.div.clone() .addClass( "flip" ) .html( "Score" );
		var nav          = e.nav = {
			athlete : {
				label : html.div.clone() .addClass( "navigate label athlete-label" ) .html( "Athlete" ),
				// prev  : html.div.clone() .ajaxbutton({ server : o.server, port : ':3088/', tournament : o.tournament.db, ring : o.ring, command : "athlete/prev",      label : arrow.left .clone(), type : "navigate prev athlete"  }),
				// next  : html.div.clone() .ajaxbutton({ server : o.server, port : ':3088/', tournament : o.tournament.db, ring : o.ring, command : "athlete/next",      label : arrow.right.clone(), type : "navigate next athlete"  }),
				prev  : html.div.clone() .button({ label : arrow.left .clone() }) .addClass( "navigate button prev athlete" ),
				next  : html.div.clone() .button({ label : arrow.right.clone() }) .addClass( "navigate button next athlete" ),
			},
			form : {
				label : html.div.clone() .addClass( "navigate label form-label" ) .html( "Form" ),
				prev  : html.div.clone() .ajaxbutton({ server : o.server, port : ':3088/', tournament : o.tournament.db, ring : o.ring, command : "form/previous",     label : '1<sup>st</sup>',    type : "navigate prev form" }),
				next  : html.div.clone() .ajaxbutton({ server : o.server, port : ':3088/', tournament : o.tournament.db, ring : o.ring, command : "form/next",         label : '2<sup>nd</sup>',    type : "navigate next form" }),
			},
			round : {
				label : html.div.clone() .addClass( "navigate label round-label" ) .html( "Round" ),
				prev  : html.div.clone() .ajaxbutton({ server : o.server, port : ':3088/', tournament : o.tournament.db, ring : o.ring, command : "round/previous",    label : arrow.left.clone(),  type : "navigate prev round" }),
				next  : html.div.clone() .ajaxbutton({ server : o.server, port : ':3088/', tournament : o.tournament.db, ring : o.ring, command : "round/next",        label : arrow.right.clone(), type : "navigate next round" }),
			},
			division : {
				label : html.div.clone() .addClass( "navigate label division-label" ) .html( "Division" ),
				prev  : html.div.clone() .ajaxbutton({ server : o.server, port : ':3088/', tournament : o.tournament.db, ring : o.ring, command : "division/previous", label : arrow.left.clone(),  type : "navigate prev division" }),
				next  : html.div.clone() .ajaxbutton({ server : o.server, port : ':3088/', tournament : o.tournament.db, ring : o.ring, command : "division/next",     label : arrow.right.clone(), type : "navigate next division" }),
			}
		};
		var flipDisplay  = e.flipDisplay  = html.div.clone() .ajaxbutton({ server : o.server, port : ':3088/', tournament : o.tournament.db, ring : o.ring, command : "display",           label : "Leaderboard",   type : "navigate mode"          });

		back.append( 
			nav.athlete  .label, nav.athlete  .prev, nav.athlete  .next, 
			nav.form     .label, nav.form     .prev, nav.form     .next, 
			nav.round    .label, nav.round    .prev, nav.round    .next, 
			nav.division .label, nav.division .prev, nav.division .next, 
			flipDisplay, notes, flipToFront 
		);

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
		var ws          = new WebSocket( 'ws://' + o.server + ':3088/worldclass/' + o.tournament.db + '/' + o.ring ); 

		ws.onopen = function() {
			var request  = { data : { type : 'division', action : 'read', judge : o.num }};
			request.json = JSON.stringify( request.data );
			ws.send( request.json );
		};

		ws.onmessage = function( response ) {
			if( response == 'ping' ) { console.log( response ); return; }
			var update   = JSON.parse( response.data ); if( ! defined( update.division )) { return; }
			var digest   = update.digest; if( defined( o.current.digest ) && digest == o.current.digest ) { return; }
			var division = new Division( update.division );

			if( ! defined( division.form.list())) { return; }

			if( division.state.is.score() ) { e.flipDisplay.ajaxbutton({ label : "Leaderboard" }); } 
			else                            { e.flipDisplay.ajaxbutton({ label : "Athlete Score" }); }

			if( division.form.count() > 1 ) {
				var first = division.current.form.is.firstForm();
				var last  = division.current.form.is.lastForm();
				if      ( first             ) { e.nav.form.label.css({ opacity : 1 }); e.nav.form.prev.ajaxbutton( "disable" ); e.nav.form.next.ajaxbutton( "enable" );  }
				else if ( ! first && ! last ) { e.nav.form.label.css({ opacity : 1 }); e.nav.form.prev.ajaxbutton( "enable" );  e.nav.form.next.ajaxbutton( "enable" );  } 
				else if ( last              ) { e.nav.form.label.css({ opacity : 1 }); e.nav.form.prev.ajaxbutton( "enable" );  e.nav.form.next.ajaxbutton( "disable" ); }
			} else {
				e.nav.form.label.css({ opacity : 0.35 });
				e.nav.form.prev.ajaxbutton( "disable" );
				e.nav.form.next.ajaxbutton( "disable" );
			}

			var numRounds  = division.round.count();
			var nextStatus = division.round.is.complete() ? 'enable' : 'disable';
			if       ( numRounds == 1 ) { 
				e.nav.round.label.css({ opacity : 0.35 });
				e.nav.round.prev.ajaxbutton( "disable" );
				e.nav.round.next.ajaxbutton( "disable" ); 

			} else if( division.round.is.prelim() || (division.round.is.semfin() && numRounds == 2 )) {
				e.nav.round.label.css({ opacity : division.round.is.complete() ? 1.00 : 0.35 });
				e.nav.round.prev.ajaxbutton( "disable" );
				e.nav.round.next.ajaxbutton( nextStatus );

			} else if( division.round.is.semfin() && numRounds == 3 ) {
				e.nav.round.label.css({ opacity : 1.00 });
				e.nav.round.prev.ajaxbutton( "enable" );
				e.nav.round.next.ajaxbutton( nextStatus );

			} else if( division.round.is.finals() ) {
				e.nav.round.label.css({ opacity : 1.00 });
				e.nav.round.prev.ajaxbutton( "enable" );
				e.nav.round.next.ajaxbutton( "disable" );
			}

			// ===== RESET DEFAULTS FOR A NEW ATHLETE
			var different = { 
				division : division.name()              != o.current.divname,
				athlete  : division.current.athleteId() != o.current.athlete,
				round    : division.current.roundId()   != o.current.round,
				form     : division.current.formId()    != o.current.form
			}
			
			if( different.division || different.round || different.athlete || different.form ) {
				var athlete    = division.current.athlete();
				var info       = { 
				                     division : html.span.clone() .addClass( "details" ) .html( division.summary() ),
				                     athlete  : html.span.clone() .addClass( "athlete" ) .html( athlete.name() ),
				                     round    : html.span.clone() .addClass( "details" ) .html( division.round.name() ),
				                     form     : html.span.clone() .addClass( "details" ) .html( division.current.form.description() ),
				                 };
				var tickerList = [ info.athlete, info.division, info.round, info.form ].map( function( item ) { return e.html.li.clone() .html( item ); });
				e.athlete .empty();
				e.athlete .append( tickerList );
				e.matPosition.matposition( 'option', 'reset' )();

				o.major  = 0.0; e.major  .deductions( { count : 0 });
				o.minor  = 0.0; e.minor  .deductions( { count : 0 });
				o.rhythm = 1.2; e.rhythm .presentationBar( { value : 1.2 });
				o.power  = 1.2; e.power  .presentationBar( { value : 1.2 });
				o.ki     = 1.2; e.ki     .presentationBar( { value : 1.2 });

				widget.trigger({ type : "updateRequest", score : o });
			}

			// ===== UPDATE WIDGETS
			e.notes        .judgeNotes({ forms : division.form.list(), form : division.current.form.name(), athletes : division.athletes(), judges : division.judges(), current : division.current.athleteId(), round : division.current.roundId(), order : division.current.order() });
			e.matPosition  .matposition({ judges : division.judges(), judge : o.num, remaining : division.pending().length });

			// ===== UPDATE BUTTONS
			e.nav .athlete .next .off( 'click' ) .click( function() { var request  = { data : { type : 'division', action : 'athlete next', judge : o.num }}; request.json = JSON.stringify( request.data ); ws.send( request.json ); });
			e.nav .athlete .prev .off( 'click' ) .click( function() { var request  = { data : { type : 'division', action : 'athlete prev', judge : o.num }}; request.json = JSON.stringify( request.data ); ws.send( request.json ); });

			// ===== RECORD CURRENT STATUS
			o.current.digest   = digest;
			o.current.division = update.current;
			o.current.divname  = division.name();
			o.current.round    = division.current.roundId();
			o.current.athlete  = division.current.athleteId();
			o.current.form     = division.current.formId();
		};

		ws.onclose = function() {
			ws = new WebSocket( 'ws://' + o.server + ':3088/worldclass/' + o.tournament.db + '/' + o.ring ); 
		};
	}
});
