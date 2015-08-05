$.widget( "freescore.coordinatorController", {
	options: { autoShow: true },
	_create: function() {
		var o       = this.options;
		var e       = this.options.elements = {};
		var widget  = this.element;
		var html    = e.html  = FreeScore.html;
		var ordinal = [ '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th' ];

		o.ring      = parseInt( $.cookie( "ring" ));
		o.port      = ':3088/';
		o.current   = {};
		var ring    = o.ring == 'staging' ? 'Staging' : 'Ring ' + o.ring;

		var sound    = e.sound    = {
			ok    : new Howl({ urls: [ "/freescore/sounds/upload.mp3",   "/freescore/sounds/upload.ogg" ]}),
			error : new Howl({ urls: [ "/freescore/sounds/quack.mp3",    "/freescore/sounds/quack.ogg" ]}),
		};

		var divisions = e.divisions = {
				page   : html.div.clone() .attr({ 'data-role': 'page', id: 'divisions' }),
				header : html.div.clone() .attr({ 'data-role': 'header', 'data-theme': 'b', 'data-position' : 'fixed' }) .html( "<h1>Divisions for " + ring + "</h1>" ),
				main   : html.div.clone() .attr({ 'role': 'main' }),
				list   : html.ul.clone()  .attr({ 'role': 'listview' }) .addClass( 'divisions' ),
			};

		var athletes  = e.athletes = {
				page    : html.div.clone() .attr({ 'data-role': 'page', id: 'athletes' }),
				header  : html.div.clone() .attr({ 'data-role': 'header', 'data-theme': 'b', 'data-position' : 'fixed' }) .html( "<a href=\"#divisions\" data-transition=\"slide\" data-direction=\"reverse\" data-icon=\"carat-l\">Divisions for Ring " + o.ring + " </a><h1>Athletes</h1>" ),
				main    : html.div.clone() .attr({ 'role': 'main' }),
				list    : html.ol.clone() .attr( 'role', 'listview' ) .addClass( 'athletes' ),
				actions : html.div.clone(),
		};

		var button = html.a.clone() .addClass( 'ui-btn ui-corner-all ui-btn-icon-left' ) .css({ height: '24px' });

		var actions = e.actions = {
			panel : html.div.clone() .addClass( "actions" ),
			navigation : {
				panel     : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend    : html.legend.clone() .html( "Navigation" ),
				division  : button.clone() .addClass( 'navigate-division ui-icon-bullets' ) .html( "This Division" ),
				previous  : button.clone() .addClass( 'navigate-athletes ui-icon-arrow-u' ) .html( "Prev. Athlete" ),
				next      : button.clone() .addClass( 'navigate-athletes ui-icon-arrow-d' ) .html( "Next Athlete" ),
				round     : button.clone() .addClass( 'navigate-round    ui-icon-check'   ) .html( "Next Round" ),
			},

			clock : {
				panel     : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend    : html.legend.clone() .html( "Timer" ),
				face      : button.clone() .removeClass( 'ui-btn-icon-left' ) .addClass( 'timer' ) .unbind( 'click' ) .html( "00:00.00" ),
				toggle    : button.clone() .addClass( 'start ui-icon-forward' ) .html( "Start Timer" ),
				settings  : { increment : 70, current: 0, started : false },
				timer     : undefined,
				time      : 0,
			},

			penalties : {
				panel     : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend    : html.legend.clone() .html( "Penalties" ),
				timelimit : button.clone() .addClass( 'penalty ui-icon-clock'   ) .html( "Time Limit" ),
				bounds    : button.clone() .addClass( 'penalty ui-icon-action'  ) .html( "Out-of-Bounds" ),
				clear     : button.clone() .addClass( 'penalty ui-icon-minus'  ) .html( "Clear Penalties" ),
			},

		};

		var time = e.time = {
			pad : function(number, length) {
				var str = '' + number;
				while (str.length < length) {str = '0' + str;}
				return str;
			},
			format : function(time) {
				time = time / 10;
				var min = parseInt(time / 6000),
					sec = parseInt(time / 100) - (min * 60),
					hundredths = e.time.pad(time - (sec * 100) - (min * 6000), 2);
				return (min > 0 ? e.time.pad(min, 2) : "00") + ":" + e.time.pad(sec, 2) + "." + hundredths;
			},
			stop : function() {
				if( defined( actions.clock.timer )) { actions.clock.timer.stop(); }
				actions.clock.face.html( time.format( actions.clock.time )); 
				actions.clock.settings.started = false;
				actions.clock.toggle.removeClass( "stop" );
				actions.clock.toggle.removeClass( "ui-icon-delete" );
				actions.clock.toggle.addClass( "start" );
				actions.clock.toggle.addClass( "ui-icon-forward" );
				actions.clock.toggle.html( "Start Timer" );
			},
			start : function() {
				actions.clock.timer = $.timer( actions.clock.update, actions.clock.settings.increment, true );
				actions.clock.settings.started = true;
				actions.clock.toggle.removeClass( "start" );
				actions.clock.toggle.removeClass( "ui-icon-forward" );
				actions.clock.toggle.addClass( "stop" );
				actions.clock.toggle.addClass( "ui-icon-delete" );
				actions.clock.toggle.html( "Stop Timer" );
			},
			clear : function() {
				actions.clock.settings.started = false;
				actions.clock.timer = $.timer( actions.clock.update, actions.clock.settings.increment, true );
				actions.clock.settings.current = 0;
				actions.clock.face.html( "00:00.00" );
			}

		};

		o.penalties = { bounds : 0, timelimit : 0, misconduct : 0 };

		actions.navigation .panel.append( actions.navigation.legend, actions.navigation.previous, actions.navigation.division, actions.navigation.next );
		actions.clock      .panel.append( actions.clock.legend, actions.clock.face, actions.clock.toggle );
		actions.penalties  .panel.append( actions.penalties.legend, actions.penalties.timelimit, actions.penalties.bounds, actions.penalties.clear );

		actions.panel.append( actions.navigation.panel, actions.navigation.round, actions.clock.panel, actions.penalties.panel );
		actions.panel.attr({ 'data-position-fixed' : true });
		athletes.actions.append( actions.panel );

		actions.clock.update = function() { actions.clock.face.html( time.format( actions.clock.time )); if( actions.clock.settings.started ) { actions.clock.time += actions.clock.settings.increment; }};
		actions.clock.toggle.click( function( ev ) {
			if( actions.clock.settings.started ) { time.stop(); }
			else { time.start(); }
		});
		divisions.main.append( divisions.list );
		divisions.page.append( divisions.header, divisions.main );

		athletes.main.append( athletes.list, athletes.actions );
		athletes.page.append( athletes.header, athletes.main );

		widget.nodoubletapzoom();
		widget.addClass( "coordinator-controller" );
		widget.append( divisions.page, athletes.page );

		// ============================================================
		// Behavior
		// ============================================================

		// ============================================================
		var navPrevAthlete = function() {
		// ============================================================
			if( defined( o.progress )) {
				var division = o.progress.divisions[ o.progress.current ];
				var round    = division.round;
				var order    = division.order[ round ];
				var i        = 0;
				while( i < order.length ) {
					if( order[ i ] == division.current ) { break; }
					i++;
				}
				if( i > 0 ) { division.current = order[ i - 1 ] } else { division.current = order[ order.length - 1 ]; };
				var form = division.athletes[ division.current ].scores[ round ][ division.form ];
				if( defined( form.penalty )) { o.penalties.bounds = defined( form.penalty.bounds ) ? parseFloat( form.penalty.bounds ) : 0; o.penalties.timelimit = defined( form.penalty.timelimit ) ? parseFloat( form.penalty.timelimit ) : 0; }
				e.updateAthletes( division, o.progress.current );

				e.time.stop();
				e.time.clear();
			}
			(sendCommand( "athlete/previous" ))();
		}

		// ============================================================
		var navPrevForm = function() {
		// ============================================================
			if( defined( o.progress )) {
				var division = o.progress.divisions[ o.progress.current ];
				var round    = division.round;
				if( division.form > 0 ) { division.form--; }
				var form = division.athletes[ division.current ].scores[ round ][ division.form ];
				if( defined( form.penalty )) { o.penalties.bounds = form.penalty.bounds; o.penalties.timelimit = form.penalty.timelimit; }
				e.updateAthletes( division, o.progress.current );

				e.time.stop();
				e.time.clear();
			}
			(sendCommand( "form/previous" ))();
		}

		// ============================================================
		var navNextAthlete = function() {
		// ============================================================
			if( defined( o.progress )) {
				var division = o.progress.divisions[ o.progress.current ];
				var round    = division.round;
				var order    = division.order[ round ];
				var i        = 0;
				while( i < order.length ) {
					if( order[ i ] == division.current ) { break; }
					i++;
				}
				if( i < order.length - 1 ) { division.current = order[ i + 1 ] } else { division.current = order[ 0 ]; };
				division.form = 0;
				var form = division.athletes[ division.current ].scores[ round ][ division.form ];
				if( defined( form.penalty )) { o.penalties.bounds = form.penalty.bounds; o.penalties.timelimit = form.penalty.timelimit; }
				e.updateAthletes( division, o.progress.current );

				e.time.stop();
				e.time.clear();
			}

			(sendCommand( "athlete/next" ))();
		}

		// ============================================================
		var navNextForm = function() {
		// ============================================================
			if( defined( o.progress )) {
				var division = o.progress.divisions[ o.progress.current ];
				var round    = division.round;
				var k        = division.forms[ round ].length - 1;
				if( division.form < k ) { division.form++; }
				var form = division.athletes[ division.current ].scores[ round ][ division.form ];
				if( defined( form.penalty )) { o.penalties.bounds = form.penalty.bounds; o.penalties.timelimit = form.penalty.timelimit; }
				e.updateAthletes( division, o.progress.current );

				e.time.stop();
				e.time.clear();
			}
			(sendCommand( "form/next" ))();
		}

		// ============================================================
		var navDivision = function( current ) {
		// ============================================================
			if( defined( o.progress )) {
				var division = o.progress.divisions[ current ];
				var k = Object.keys( division.forms ).length;
				if( k > 1 ) { actions.navigation.round.show(); } else { actions.navigation.round.hide(); }
			}
			actions.navigation.division.hide();
			actions.navigation.next.show();
			actions.navigation.previous.show();
			actions.navigation.panel.controlgroup( 'refresh' );
			actions.clock.panel .show();
			actions.penalties.panel .show();
		}

		// ============================================================
		var navRound = function() {
		// ============================================================
			if( defined( o.progress )) {
				var division = o.progress.divisions[ o.progress.current ];
				var round    = division.round;
				if      ( round == 'prelim' && defined( division.order.semfin )) { division.round = 'semfin'; }
				else if ( round == 'semfin' && defined( division.order.finals )) { division.round = 'finals'; }
				else if ( round == 'finals' && defined( division.order.prelim )) { division.round = 'prelim'; }
				if( division.round != round ) {
					division.current = division.order[ division.round ][ 0 ];
					updateAthletes( division, o.progress.current );
					(sendCommand( "round/next" ))();
				}
			}
		}

		// ============================================================
		var awardPenaltyBounds = function() {
		// ============================================================
			o.penalties.bounds += 0.3;

			var penalties = (o.penalties.bounds * 10) + '/' + (o.penalties.timelimit * 10) + '/' + (o.penalties.misconduct * 10) + '/' + (e.actions.clock.time / 10);
			(sendCommand( "coordinator/" + penalties )());
		}

		// ============================================================
		var awardPenaltyTimeLimit = function() {
		// ============================================================
			o.penalties.timelimit = 0.3;

			var penalties = (o.penalties.bounds * 10) + '/' + (o.penalties.timelimit * 10) + '/' + (o.penalties.misconduct * 10) + '/' + (e.actions.clock.time / 10);
			(sendCommand( "coordinator/" + penalties )());
		}

		// ============================================================
		var clearPenalties = function() {
		// ============================================================
			o.penalties.bounds    = 0.0;
			o.penalties.timelimit = 0.0;

			var penalties = (o.penalties.bounds * 10) + '/' + (o.penalties.timelimit * 10) + '/' + (o.penalties.misconduct * 10) + '/' + (e.actions.clock.time / 10);
			(sendCommand( "coordinator/" + penalties )());
		}

		// ============================================================
		var parsePageUrl = function( pageUrl ) {
		// ============================================================
			var anchor = $.url( pageUrl ).attr( "anchor" );
			var args   = anchor.split( '?' );
			var option = $.url( anchor ).param();

			option[ 'id' ] = args[ 0 ];

			return option;
		}

		// ============================================================
		var sendCommand = function( command ) {
		// ============================================================
			return function() {
				console.log( command );
				var url = 'http://' + o.server + o.port + o.tournament.db + '/' + o.ring + '/' + command;
				$.ajax( {
					type:    'GET',
					crossDomain: true,
					url:     url,
					data:    {},
					success: function( response ) { 
						if( defined( response.error )) {
							sound.error.play();
							console.log( response );
						} else {
							sound.ok.play(); 
							console.log( url );
							console.log( response );
						}
					},
					error:   function( response ) { sound.error.play(); },
				});
			}
		}

		// ============================================================
		var updateDivisions = e.updateDivisions = function( divisions, current ) {
		// ============================================================
			e.divisions.list.empty();
			if( ! defined( divisions )) { return; }
			for( var i = 0; i < divisions.length; i++ ) {
				var division = {
					data  : divisions[ i ],
					item  : html.li.clone(),
					count : html.span.clone() .addClass( 'ui-li-count' ),
					link  : html.a.clone()
				}
				division.count.html( division.data.athletes.length );
				division.link.empty();
				division.link.append( division.data.name.capitalize() + ' ' + division.data.description, division.count );
				division.link.attr({ 'data-transition' : 'slide', 'divid' : division.data.name });
				division.link.click( function( ev ) { var divid = $( this ).attr( 'divid' ); 
					$( ':mobile-pagecontainer' ).pagecontainer( 'change', '#athletes?ring=' + o.ring + '&divid=' + divid, { transition : 'slide' } )
				});
				if( i == current ) { division.link.addClass( 'current' ); } else { division.link.removeClass( 'current' ); }
				division.item.append( division.link );
				e.divisions.list.append( division.item );
			}
			e.divisions.list.listview().listview( 'refresh' );
		};

		// ============================================================
		var updateAthletes = e.updateAthletes = function( division, current ) {
		// ============================================================
			e.athletes.list.empty();
			if( ! defined( division )) { return; }
			if( o.progress.current != current ) { 
				actions.navigation.division.unbind( 'click' ).click( function() { 
					(sendCommand( 'division/' + current )()); 
					navDivision( current );
				});
				actions.navigation.division.show();
				actions.navigation.round.hide();
				actions.navigation.next.hide();
				actions.navigation.previous.hide();
				actions.navigation.panel.controlgroup( 'refresh' );
				actions.navigation.division.addClass( 'ui-first-child ui-last-child' );
				actions.clock.panel .hide();
				actions.penalties.panel .hide();
			} else {
				navDivision( current );
			}

			// Update Header
			e.athletes.header .find( 'h1' ) .text( division.name.capitalize() + ' ' + division.description );

			// Update Athlete List
			var round = division.round;
			var forms = division.forms[ round ];
			for( var i = 0; i < division.order[ round ].length; i++ ) {
				var j = division.order[ round ][ i ];
				var athlete = {
					data : division.athletes[ j ],
					item : html.li.clone()
				}
				var complete = true;
				for( k = 0; k < forms.length; k++ ) {
					var formComplete = athlete.data.scores[ round ][ k ].complete;
					complete &= formComplete;
				}
				if( j == division.current ) { 
					athlete.item.addClass( 'current' );
					var form = forms[ division.form ].name;
					if      ( forms.length  > 1 ) { athlete.item.html( athlete.data.name + ' <span class="ordinal">&mdash; ' + ordinal[ division.form ] + ':</span> <span class="form">' + form + '</span>' ); }
					else if ( forms.length == 1 ) { athlete.item.html( athlete.data.name + ' <span class="ordinal">&mdash;</span> <span class="form">' + form + '</span>' ); }

				} else { 
					athlete.item.html( athlete.data.name );
					athlete.item.removeClass( 'current' ) 
				}
				if( complete              ) { athlete.item.addClass( 'complete' ); } else { athlete.item.removeClass( 'complete' ); }
				e.athletes.list.append( athlete.item );
			}
			e.athletes.list.listview().listview( 'refresh' );

			// Update Navigation Menus
			var k = forms.length - 1;
			if( division.form == 0 ) { e.actions.navigation.previous .removeClass( 'navigate-forms ui-icon-carat-u' )    .addClass( 'navigate-athletes ui-icon-arrow-u' ) .html( 'Prev. Athlete' ) .unbind( 'click' ) .click( navPrevAthlete ); } 
			else                     { e.actions.navigation.previous .removeClass( 'navigate-athletes ui-icon-arrow-u' ) .addClass( 'navigate-forms ui-icon-carat-u' )    .html( 'Prev. Form' )    .unbind( 'click' ) .click( navPrevForm ); }
			if( division.form == k ) { e.actions.navigation.next     .removeClass( 'navigate-forms ui-icon-carat-d' )    .addClass( 'navigate-athletes ui-icon-arrow-d' ) .html( 'Next Athlete' )  .unbind( 'click' ) .click( navNextAthlete ); } 
			else                     { e.actions.navigation.next     .removeClass( 'navigate-athletes ui-icon-arrow-d' ) .addClass( 'navigate-forms ui-icon-carat-d' )    .html( 'Next Form' )     .unbind( 'click' ) .click( navNextForm ); }
		};

		// ============================================================
		this.element.on( "pagebeforetransition", function( ev, transition ) {
		// ============================================================
			if( ! defined( transition.absUrl )) { return; }
			var option    = parsePageUrl( transition.absUrl );
			var divisions = o.progress.divisions;
			var division  = undefined;
			var index     = undefined;
			if( defined( option.ring ) && defined( option.divid )) {
				for( var i = 0; i < divisions.length; i++ ) {
					division = divisions[ i ];
					if( division.name == option.divid && division.ring == option.ring ) { index = i; break; }
					division = undefined;
				}
			}

			if      ( option.id == "divisions" ) { e.updateDivisions( divisions, o.progress.current ); }
			else if ( option.id == "athletes"  ) { e.updateAthletes( division, index ); }
		});

		// ============================================================
		e.refresh = function( update ) {
		// ============================================================
			var progress = JSON.parse( update.data ); if( ! defined( progress.divisions )) { return; }
			o.progress = progress;
			e.updateDivisions( progress.divisions, progress.current );

		};

		actions.navigation .round     .click( navRound );

		actions.penalties  .timelimit .click( awardPenaltyTimeLimit );
		actions.penalties  .bounds    .click( awardPenaltyBounds );
		actions.penalties  .clear     .click( clearPenalties );


	},
	_init: function( ) {
		var widget      = this.element;
		var e           = this.options.elements;
		var o           = this.options;
		var html        = e.html;
		var ordinal     = [ '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th' ];

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', e.refresh, false );
	}
});
