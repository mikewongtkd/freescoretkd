$.widget( "freescore.judgeController", {
	options: { autoShow: true },
	_create: function() {
		var o      = this.options;
		var e      = this.options.elements = {};
		var widget = this.element;
		var html   = e.html  = FreeScore.html;
		var sound  = e.sound    = {};

		widget.nodoubletapzoom();

		o.num     = parseInt( $.cookie( "judge" ));
		o.ring    = parseInt( $.cookie( "ring" ));
		o.current = {};

		sound.ok    = new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg" ]});
		sound.error = new Howl({ urls: [ "../../sounds/quack.mp3",    "../../sounds/quack.ogg"  ]});
		sound.next  = new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"   ]});
		sound.prev  = new Howl({ urls: [ "../../sounds/prev.mp3",     "../../sounds/prev.ogg"   ]});

		widget.addClass( 'judgeController flippable' );

		// ===== AVOID COLLISION BETWEEN BOOTSTRAP AND JQUERY
		var btn = $.fn.button.noConflict() // reverts $.fn.button to jqueryui btn
		$.fn.btn = btn // assigns bootstrap button functionality to $.fn.btn
		$.fn.presentationWidget = $.fn.presentationButtons // Default to presentation buttons

		// ===== INITIALIZE WIDGET ELEMENTS
		var card         = e.card         = html.div.clone() .addClass( "card" );
		var front        = e.front        = html.div.clone() .addClass( "front" );
		var views        = e.views        = html.div.clone() .addClass( "view control-group" );
		var controllers  = e.controllers  = html.div.clone() .addClass( "controller control-group" );

		var flipToBack   = e.flipToBack   = html.div.clone() .addClass( "flip" ) .html( "Division List" );
		var info         = e.info         = html.div.clone() .addClass( "division-info" ) .html( '<div class="label">Current Division</div>' );
		var description  = e.description  = html.div.clone() .addClass( "description" );
		var round        = e.round        = html.div.clone() .addClass( "round" );
		var form         = e.form         = html.div.clone() .addClass( "form" );
		var athlete      = e.athlete      = html.div.clone() .addClass( "athlete" );
		var score        = e.score        = html.div.clone() .addClass( "score" );
		var accuracy     = e.accuracy     = html.div.clone() .addClass( "accuracy" );
		var presentation = e.presentation = html.div.clone() .addClass( "presentation" );
		var total        = e.total        = html.div.clone() .addClass( "total" );
		var matPosition  = e.matPosition  = html.div.clone() .matposition();

		var major        = e.major        = html.div.clone() .deductions({ value : 0.3, controller : this });
		var minor        = e.minor        = html.div.clone() .deductions({ value : 0.1, controller : this });
		var controls     = e.controls     = html.div.clone() .addClass( "controls" );

		var label        = e.label        = html.div.clone() .addClass( "control-label" ) .html( "Presentation Score" );
		var power        = e.power        = html.div.clone() .presentationWidget({ name : 'power',  label : 'Power and Speed',      controller: this });
		var rhythm       = e.rhythm       = html.div.clone() .presentationWidget({ name : 'rhythm', label : 'Rhythm and Control',   controller: this });
		var ki           = e.ki           = html.div.clone() .presentationWidget({ name : 'energy', label : 'Expression of Energy', controller: this });
		var send         = e.send         = html.div.clone() .button({ label : "Send" }) .addClass( "send" );

		// ===== UPDATE BEHAVIOR
		widget.on( "updateRequest", function( ev ) {
			var o = ev.score;
			var e = ev.score.elements;

			// ===== UPDATE JUDGE CONTROLLER DISPLAY
			o.accuracy     = 4.0 -
			                 e.major .deductions( 'option', 'count' ) * e.major .deductions( 'option', 'value' ) -
			                 e.minor .deductions( 'option', 'count' ) * e.minor .deductions( 'option', 'value' );
			o.accuracy     = o.accuracy < 0 ? 0 : o.accuracy; // The accuracy score cannot be lower than 0

			o.presentation = parseFloat( e.rhythm .presentationWidget( 'value' )) +
			                 parseFloat( e.power  .presentationWidget( 'value' )) +
			                 parseFloat( e.ki     .presentationWidget( 'value' ));

			e.accuracy     .html( o.accuracy     .toFixed( 1 ) + "<br /><span>Accuracy</span>" );
			e.presentation .html( o.presentation .toFixed( 1 ) + "<br /><span>Presentation</span>" );
			e.total        .html( `${(parseFloat( o.accuracy ) + parseFloat( o.presentation )).toFixed( 1 )}<div class="total-label">Total</div>` );

			// ===== UPDATE SEND BUTTON
			var score = {
				major  : (e.major  .deductions( 'option', 'count' ) * e.major .deductions( 'option', 'value' )) .toFixed( 1 ),
				minor  : (e.minor  .deductions( 'option', 'count' ) * e.minor .deductions( 'option', 'value' )) .toFixed( 1 ),
				rhythm : parseFloat( e.rhythm .presentationWidget( 'value' )).toFixed( 1 ),
				power  : parseFloat( e.power  .presentationWidget( 'value' )).toFixed( 1 ),
				ki     : parseFloat( e.ki     .presentationWidget( 'value' )).toFixed( 1 ),
			};

			e.send .off( 'click' ) .click( function() {
				alertify.notify( "Sending score... please wait" );
				var request  = { data : { type : 'division', action : 'score', score : score }};
				request.json = JSON.stringify( request.data );
				e.ws.send( request.json );
				e.send.attr({ 'sent': 'true' });
				e.send.css({ opacity: 0.5 });
				
				setTimeout( function() { 
					e.send.css({ opacity: 1.0 }); 
					if( e.send.attr( 'sent' ) == 'true' ) { 
						alertify.error( 'Send failed.' ); 
						e.send.attr({ 'sent' : 'false' }); 
					} 
				}, 5000 );
			});
		} );

		info.append( description, round, form );
		score.append( accuracy, presentation, athlete, total );
		views.append( flipToBack, info, score, matPosition );
		controls.append( label, power, rhythm, ki, send );

		controllers.append( major, controls, minor );

		front.append( views, controllers );

		var arrow        = e.arrow = {
			left : html.img.clone() .attr({ src : '../../include/jquery/mobile/images/icons-svg/arrow-l-white.svg', height: '28px', width: '28px' }) .css({ paddingTop: '4px', opacity : 0.75 }),
			right: html.img.clone() .attr({ src : '../../include/jquery/mobile/images/icons-svg/arrow-r-white.svg', height: '28px', width: '28px' }) .css({ paddingTop: '4px', opacity : 0.75 }),
		};

		var back         = e.back         = html.div.clone() .addClass( "back" );
		var notes        = e.notes        = html.div.clone() .judgeNotes({ num : o.num });
		var flipToFront  = e.fliptoFront  = html.div.clone() .addClass( "flip" ) .html( "Return to Scoring" );
		var nav          = e.nav = {
			athlete : {
				label : html.div.clone() .addClass( "navigate navigate-label athlete-label" ) .html( "Athlete" ),
				prev  : html.div.clone() .button({ label : arrow .left.clone() }) .addClass( "navigate nav-button prev athlete" )  .attr({ type: 'division', action: 'athlete prev',  sound: 'prev' }),
				next  : html.div.clone() .button({ label : arrow.right.clone() }) .addClass( "navigate nav-button next athlete" )  .attr({ type: 'division', action: 'athlete next',  sound: 'next' }),
			},
			form : {
				label : html.div.clone() .addClass( "navigate navigate-label form-label" ) .html( "Form" ),
				prev  : html.div.clone() .button({ label : '1<sup>st</sup>' })    .addClass( "navigate nav-button prev form" )     .attr({ type: 'division', action: 'form prev',     sound: 'prev' }),
				next  : html.div.clone() .button({ label : '2<sup>nd</sup>' })    .addClass( "navigate nav-button next form" )     .attr({ type: 'division', action: 'form next',     sound: 'next' }),
			},
			round : {
				label : html.div.clone() .addClass( "navigate navigate-label round-label" ) .html( "Round" ),
				prev  : html.div.clone() .button({ label : arrow .left.clone() }) .addClass( "navigate nav-button prev round" )    .attr({ type: 'division', action: 'round prev',    sound: 'prev' }),
				next  : html.div.clone() .button({ label : arrow.right.clone() }) .addClass( "navigate nav-button next round" )    .attr({ type: 'division', action: 'round next',    sound: 'next' }),
			},
			division : {
				label : html.div.clone() .addClass( "navigate navigate-label division-label" ) .html( "Division" ),
				prev  : html.div.clone() .button({ label : arrow .left.clone() }) .addClass( "navigate nav-button prev division" ) .attr({ type: 'ring',     action: 'division prev', sound: 'prev' }),
				next  : html.div.clone() .button({ label : arrow.right.clone() }) .addClass( "navigate nav-button next division" ) .attr({ type: 'ring',     action: 'division next', sound: 'next' }),
			}
		};
		var flipDisplay  = e.flipDisplay  = html.div.clone() .button({ label : "Leaderboard" }) .addClass( "navigate nav-button display-mode" ) .attr( 'action', 'display' ) .attr( 'sound', 'ok' );

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
		var ws          = e.ws = new window.WebsocketHeartbeatJs({ url : `ws://${o.server}:3088/worldclass/${o.tournament.db}/${o.ring}/judge`, pingMsg: `{"type":"division","action":"judge ping","judge":${o.num}}` }); 
		var network     = { reconnect: 0 };

		alertify.set( 'notifier', 'position', 'top-right' );

		ws.onerror = network.error = function( error ) {
			if( network.reconnect > 5 ) { alertify.error( 'Connection failed' ); }
		};

		ws.onopen = network.connect = function() {
			network.reconnect = 0;
			alertify.success( 'Connected to server' );

			var request  = { data : { type : 'division', action : 'read' }};
			request.json = JSON.stringify( request.data );
			ws.send( request.json );
		};

		ws.onmessage = network.message = function( response ) {
			var update   = JSON.parse( response.data ); if( ! defined( update.division ) || update.type != 'division' || update.action != 'update' ) { return; }
			console.log( update );
			var digest   = update.digest; if( defined( o.current.digest ) && digest == o.current.digest ) { return; }
			var division = new Division( update.division );

			if( ! defined( division.form.list())) { return; }

			if( e.send.attr( 'sent' ) == 'true' ) {
				e.sound.ok.play();
				e.send.css({ opacity: 1.0 });
				alertify.success( 'Score received.' );
				e.send.attr({ 'sent': 'false' });
			}

			var button = {
				enable : function( button ) {
					button.button( 'enable' );
					button.off( 'click' ).click( function() {
						var request  = { data : { type : button.attr( 'type' ), action : button.attr( 'action' ) }}; 
						request.json = JSON.stringify( request.data );
						ws.send( request.json ); 
						e.sound[ button.attr( 'sound' ) ].play();
					});
				},
				disable : function( button ) {
					button.button( 'disable' );
					button.off( 'click' );
				}
			}

			// ----------------------------------------
			// ATHLETE NAVIGATION BUTTONS
			// ----------------------------------------
			button.enable( e.nav.athlete.prev );
			button.enable( e.nav.athlete.next );

			// ----------------------------------------
			// FLIPCARD BUTTON
			// ----------------------------------------
			if( division.state.is.score() ) { e.flipDisplay.button({ label : "Leaderboard" }); } 
			else                            { e.flipDisplay.button({ label : "Athlete&nbsp;Score" }); }
			e.flipDisplay .off( 'click' ) .click( function() {
				var request  = { data : { type : 'division', action : 'display' }}; 
				request.json = JSON.stringify( request.data );
				ws.send( request.json ); 
				e.sound.ok.play();
			});

			// ----------------------------------------
			// FORM NAVIGATION BUTTONS
			// ----------------------------------------
			e.nav.form.prev.off( 'click' );
			e.nav.form.next.off( 'click' );
			if( division.form.count() <= 1 ) { // One form; no need to navigate
				e.nav.form.label.css({ opacity : 0.35 });
				button.disable( e.nav.form.prev );
				button.disable( e.nav.form.next );
			} else { // Two forms
				var first = division.current.form.is.firstForm();
				var last  = division.current.form.is.lastForm();
				e.nav.form.label.css({ opacity : 1 }); 
				if      ( first             ) { button .disable( e.nav.form.prev ); button  .enable( e.nav.form.next ); }
				else if ( ! first && ! last ) { button  .enable( e.nav.form.prev ); button  .enable( e.nav.form.next ); } 
				else if ( last              ) { button  .enable( e.nav.form.prev ); button .disable( e.nav.form.next ); }
			}

			// ----------------------------------------
			// ROUND NAVIGATION BUTTONS
			// ----------------------------------------
			var numRounds = division.round.count();
			if       ( numRounds == 1 ) { 
				e.nav.round.label.css({ opacity : 0.35 });
				button.disable( e.nav.round.prev );
				button.disable( e.nav.round.next );

			} else if( division.round.is.prelim() || (division.round.is.semfin() && numRounds == 2 )) {
				e.nav.round.label.css({ opacity : division.round.is.complete() ? 1.00 : 0.35 });
				button.disable( e.nav.round.prev );
				if( division.round.is.complete() ) { button.enable( e.nav.round.next ) } else { button.disable( e.nav.round.next ); }

			} else if( division.round.is.semfin() && numRounds == 3 ) {
				e.nav.round.label.css({ opacity : 1.00 });
				button.enable( e.nav.round.prev );
				if( division.round.is.complete() ) { button.enable( e.nav.round.next ) } else { button.disable( e.nav.round.next ); }

			} else if( division.round.is.finals() ) {
				e.nav.round.label.css({ opacity : 1.00 });
				button  .enable( e.nav.round.prev );
				button .disable( e.nav.round.next );
			}

			// ----------------------------------------
			// DIVISION NAVIGATION BUTTONS
			// ----------------------------------------
			button .enable( e.nav.division.prev );
			button .enable( e.nav.division.next );

			// ===== CHECK TO SEE IF THE DIVISION, ATHLETE, ROUND, OR FORM HAS CHANGED
			var different = { 
				division : division.name()              != o.current.divname,
				athlete  : division.current.athleteId() != o.current.athlete,
				round    : division.current.roundId()   != o.current.round,
				form     : division.current.formId()    != o.current.form
			}
			
			// ===== RESET DEFAULTS FOR A DIFFERENT ATHLETE, FORM, ROUND, OR DIVISION
			if( different.division || different.round || different.athlete || different.form ) {
				e.sound.next.play();
				var athlete = division.current.athlete();
				var judge   = o.num == 0 ? 'Referee' : 'Judge ' + o.num;
				var ring    = 'Ring ' + o.ring;
				alertify.notify( ring + ' ' + judge + ' ready to score<br>' + athlete.display.name() + '<br>' + division.current.form.name() );

				// ===== UPDATE DIVISION INFO
				e.description .empty().html( division.description());
				e.round       .empty().html( division.round.name() );
				e.form        .empty().html( division.form.list().map(( form, i ) => { return i == division.current.formId() ? `<span class="current">${form}</span>` : `<span>${form}</span>` }).join( ', ' ));

				// ===== UPDATE ATHLETE NAME
				e.athlete .empty().append( html.span.clone() .addClass( "athlete" ) .html( athlete.name()));

				// ===== RESET SCORE
				o.major  = 0.0; e.major  .deductions( { count : 0 });
				o.minor  = 0.0; e.minor  .deductions( { count : 0 });
				o.rhythm = 1.2; e.rhythm .presentationWidget( 'reset' );
				o.power  = 1.2; e.power  .presentationWidget( 'reset' );
				o.ki     = 1.2; e.ki     .presentationWidget( 'reset' );

				widget.trigger({ type : "updateRequest", score : o });
			}

			// ===== UPDATE WIDGETS
			e.notes        .judgeNotes({ forms : division.form.list(), form : division.current.form.name(), athletes : division.athletes(), judges : division.judges(), current : division.current.athleteId(), round : division.current.roundId(), order : division.current.order() });
			e.matPosition  .matposition({ judges : division.judges(), judge : o.num, ring : o.ring });

			// ===== RECORD CURRENT STATUS
			o.current.digest   = digest;
			o.current.division = update.current;
			o.current.divname  = division.name();
			o.current.round    = division.current.roundId();
			o.current.athlete  = division.current.athleteId();
			o.current.form     = division.current.formId();
		};

		// ===== WEBSOCKET RECONNECT
		ws.onreconnect = network.reconnect = () => {
			if( network.reconnect == 0 ) { alertify.message( 'Connection to server lost' ); alertify.message( 'Reconnecting' ); }
			network.reconnect++;
			if( network.reconnect > 5 ) { alertify.message( 'Reconnecting' ); }
		};

		// ===== CLOSE WEBSOCKET
		ws.onclose = network.close = () => {
		};
	}
});
