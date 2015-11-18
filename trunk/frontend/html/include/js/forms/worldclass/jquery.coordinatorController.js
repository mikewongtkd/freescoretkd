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
			ok    : new Howl({ urls: [ "/freescore/sounds/upload.mp3", "/freescore/sounds/upload.ogg" ]}),
			error : new Howl({ urls: [ "/freescore/sounds/quack.mp3",  "/freescore/sounds/quack.ogg" ]}),
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
			clock : {
				panel     : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend    : html.legend.clone() .html( "Timer" ),
				face      : button.clone() .removeClass( 'ui-btn-icon-left' ) .addClass( 'timer' ) .unbind( 'click' ) .html( "00:00.00" ),
				toggle    : button.clone() .addClass( 'start ui-icon-forward' ) .html( "Start Timer" ),
				settings  : { increment : 70, started : false },
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
				e.actions.clock.face.html( time.format( actions.clock.time )); 
				e.actions.clock.settings.started = false;
				e.actions.clock.toggle.removeClass( "stop" );
				e.actions.clock.toggle.removeClass( "ui-icon-delete" );
				e.actions.clock.toggle.addClass( "start" );
				e.actions.clock.toggle.addClass( "ui-icon-forward" );
				e.actions.clock.toggle.html( "Start Timer" );
			},
			start : function() {
				e.actions.clock.timer = $.timer( actions.clock.update, actions.clock.settings.increment, true );
				e.actions.clock.settings.started = true;
				e.actions.clock.toggle.removeClass( "start" );
				e.actions.clock.toggle.removeClass( "ui-icon-forward" );
				e.actions.clock.toggle.addClass( "stop" );
				e.actions.clock.toggle.addClass( "ui-icon-delete" );
				e.actions.clock.toggle.html( "Stop Timer" );
			},
			clear : function() {
				e.actions.clock.settings.started = false;
				e.actions.clock.timer = $.timer( actions.clock.update, actions.clock.settings.increment, true );
				e.actions.clock.time = 0;
				e.actions.clock.face.html( "00:00.00" );
			}
		};

		o.penalties = { bounds : 0, timelimit : 0, misconduct : 0 };

		actions.clock      .panel.append( actions.clock.legend, actions.clock.face, actions.clock.toggle );
		actions.penalties  .panel.append( actions.penalties.legend, actions.penalties.timelimit, actions.penalties.bounds, actions.penalties.clear );

		actions.panel.append( actions.clock.panel, actions.penalties.panel );
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
		// See master d6011f2 for navigation methods

		// ============================================================
		var awardPenaltyBounds = function() {
		// ============================================================
			o.penalties.bounds += 0.3;

			var penalties = (o.penalties.bounds * 10) + '/' + (o.penalties.timelimit * 10) + '/' + (o.penalties.misconduct * 10) + '/' + (e.actions.clock.time / 10);
			(sendCommand( "coordinator/" + penalties )());
		};

		// ============================================================
		var awardPenaltyTimeLimit = function() {
		// ============================================================
			o.penalties.timelimit = 0.3;

			var penalties = (o.penalties.bounds * 10) + '/' + (o.penalties.timelimit * 10) + '/' + (o.penalties.misconduct * 10) + '/' + (e.actions.clock.time / 10);
			(sendCommand( "coordinator/" + penalties )());
		};

		// ============================================================
		var clearPenalties = function() {
		// ============================================================
			o.penalties.bounds    = 0.0;
			o.penalties.timelimit = 0.0;

			var penalties = (o.penalties.bounds * 10) + '/' + (o.penalties.timelimit * 10) + '/' + (o.penalties.misconduct * 10) + '/' + (e.actions.clock.time / 10);
			(sendCommand( "coordinator/" + penalties )());
		};

		// ============================================================
		var parsePageUrl = function( pageUrl ) {
		// ============================================================
			var anchor = $.url( pageUrl ).attr( "anchor" );
			var args   = anchor.split( '?' );
			var option = $.url( anchor ).param();

			option[ 'id' ] = args[ 0 ];

			return option;
		};

		// ============================================================
		var sendCommand = function( command, callback ) {
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
							if( defined( callback )) { callback( response ); }
						}
					},
					error:   function( response ) { sound.error.play(); console.log( "Network Error: Unknown network error." ); },
				});
			}
		};

		// ============================================================
		var updateDivisions = e.updateDivisions = function( divisions, current ) {
		// ============================================================
			e.divisions.list.empty();
			if( ! defined( divisions )) { return; }
			for( var i = 0; i < divisions.length; i++ ) {
				var division = {
					data  : divisions[ i ],
					item  : html.li.clone(),
					link  : html.a.clone()
				}
				var count = division.data.athletes.length > 1 ? division.data.athletes.length + ' Athletes' : '1 Athlete';
				var list  = (division.data.athletes.length > 8 ? division.data.athletes.slice( 0, 7 ) : division.data.athletes).map( function( athlete ) { return athlete.name; } ).join( ", " ) + (division.data.athletes.length > 8 ? ', ...' : '');

				division.link.empty();
				division.link.append( '<h3>' + division.data.name.capitalize() + ' ' + division.data.description + '<h3><p><b>' + count + ':</b> ' + list + '</p>' );
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
				actions.clock.panel .hide();
				actions.penalties.panel .hide();
			}

			// Update Header
			e.athletes.header .find( 'h1' ) .text( division.name.capitalize() + ' ' + division.description );

			// Update Athlete List
			var round = division.round;
			var forms = division.forms[ round ];
			for( var i = 0; i < division.order[ round ].length; i++ ) {
				var j = division.order[ round ][ i ];
				var athlete = {
					data  : division.athletes[ j ],
					item  : html.li.clone() .empty(),
					name  : html.a.clone() .attr( { 'data-icon': false } ),
					form1 : html.a.clone() .addClass( "form" ) .attr({ 'data-role' : 'button', 'data-icon' : false }),
					form2 : html.a.clone() .addClass( "form" ) .attr({ 'data-role' : 'button', 'data-icon' : false }),
				};
				var complete = true;
				for( k = 0; k < forms.length; k++ ) {
					var formComplete = athlete.data.scores[ round ][ k ].complete;
					complete &= formComplete;
				}
				
				// Current Athlete
				athlete.name.append( athlete.data.name );
				athlete.item.append( athlete.name, athlete.form1, athlete.form2 );
				if( j == division.current ) { 
					athlete.item.addClass( 'current' );

				// Non-current athlete
				} else { 
					athlete.item.removeClass( 'current' ) 
				}

				// Append score
				var form1 = {
					name  : division.forms[ round ][ 0 ].name,
					score : defined( athlete.data.scores[ round ][ 0 ] ) ? athlete.data.scores[ round ][ 0 ].adjusted_mean.total.toFixed( 2 ) : '&mdash;'
				};
				athlete.form1.append( "<strong>" + form1.score + "</strong>" );
				if( division.forms[ round ].length > 1 ) { 
					var form2 = {
						name  : division.forms[ round ][ 1 ].name,
						score : defined( athlete.data.scores[ round ][ 1 ] ) ? athlete.data.scores[ round ][ 1 ].adjusted_mean.total.toFixed( 2 ) : '&mdash;'
					};
					athlete.form2.append( "<strong>" + form2.score + "</strong>" );
					athlete.name.append( athlete.form2 ); 
				}
				athlete.name.append( athlete.form1 ); 

				if( complete              ) { athlete.item.addClass( 'complete' ); } else { athlete.item.removeClass( 'complete' ); }
				e.athletes.list.append( athlete.item );
			}
			e.athletes.list.listview().listview( 'refresh' );

			var different = {
				division : division.name      != o.current.divname,
				athlete  : division.current   != o.current.athlete,
				form     : division.form      != o.current.form,
			};

			if( different.division || different.round || different.athlete || different.form ) {
				e.time.stop();
				e.time.clear();
			}
			o.current.divname = division.name;
			o.current.round   = division.round;
			o.current.athlete = division.current;
			o.current.form    = division.form;

		};

		// ============================================================
		this.element.on( "pagebeforetransition", function( ev, transition ) {
		// ============================================================
			if( ! defined( transition.absUrl )) { return; }
			if( ! defined( o.progress        )) { return; }
			var option    = parsePageUrl( transition.absUrl );
			var divisions = o.progress.divisions;
			var division  = undefined;
			var index     = undefined;
			if( defined( option.ring ) && defined( option.divid )) {
				for( var i = 0; i < divisions.length; i++ ) {
					division = divisions[ i ];
					if( division.name == option.divid && division.ring == option.ring ) { index = i; $.cookie( 'divindex', i ); break; }
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
			var i        = defined( $.cookie( 'divindex' )) ? $.cookie( 'divindex' ) : progress.current;
			o.progress = progress;
			e.updateDivisions( progress.divisions, progress.current );
			e.updateAthletes( progress.divisions[ i ], progress.current );

		};

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
