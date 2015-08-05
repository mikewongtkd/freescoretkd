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
				footer : html.div.clone() .attr({ 'data-role': 'footer', 'data-theme' : 'b', 'data-position' : 'fixed' }),
			};

		var athletes  = e.athletes = {
				page    : html.div.clone() .attr({ 'data-role': 'page', id: 'athletes' }),
				header  : html.div.clone() .attr({ 'data-role': 'header', 'data-theme': 'b', 'data-position' : 'fixed' }) .html( "<h1><a href=\"#divisions\" data-transition=\"slide\" data-direction=\"reverse\">Athletes</a></h1>" ),
				main    : html.div.clone() .attr({ 'role': 'main' }),
				list    : html.ol.clone() .attr( 'role', 'listview' ) .addClass( 'athletes' ),
				actions : html.div.clone(),
				footer  : html.div.clone() .attr({ 'data-role': 'footer', 'data-theme' : 'b', 'data-position' : 'fixed' }),
		};

		var button = html.a.clone() .addClass( 'ui-btn ui-corner-all ui-btn-icon-left' ) .css({ height: '24px' });

		var actions = e.actions = {
			panel : html.div.clone() .addClass( "actions" ),
			navigation : {
				panel     : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend    : html.legend.clone() .html( "Navigation" ),
				previous  : button.clone() .addClass( 'navigate-athletes ui-icon-arrow-u' ) .html( "Prev. Athlete" ),
				next      : button.clone() .addClass( 'navigate-athletes ui-icon-arrow-d' ) .html( "Next Athlete" ),
			},

			clock : {
				panel     : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend    : html.legend.clone() .html( "Timer" ),
				face      : button.clone() .removeClass( 'ui-btn-icon-left' ) .addClass( 'timer' ) .unbind( 'click' ) .html( "00:00:00" ),
				toggle    : button.clone() .addClass( 'start ui-icon-forward' ) .html( "Start Timer" ),
				settings  : { increment : 70, current: 0, started : false },
				timer     : undefined,
				time      : 0,
			},

			penalties : {
				panel     : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend    : html.legend.clone() .html( "Penalties" ),
				time      : button.clone() .addClass( 'penalty ui-icon-clock'   ) .html( "Time Limit" ),
				bounds    : button.clone() .addClass( 'penalty ui-icon-action'  ) .html( "Out-of-Bounds" ),
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
				actions.clock.timer.stop();
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
				actions.clock.settings.current = 0;
				actions.clock.face.html( "00:00:00" );
			}

		};

		actions.navigation .panel.append( actions.navigation.legend, actions.navigation.previous, actions.navigation.next );
		actions.clock      .panel.append( actions.clock.legend, actions.clock.face, actions.clock.toggle );
		actions.penalties  .panel.append( actions.penalties.legend, actions.penalties.time, actions.penalties.bounds );

		actions.panel.append( actions.navigation.panel, actions.clock.panel, actions.penalties.panel );
		actions.panel.attr({ 'data-position-fixed' : true });
		athletes.actions.append( actions.panel );

		actions.clock.update = function() { actions.clock.face.html( time.format( actions.clock.time )); if( actions.clock.settings.started ) { actions.clock.time += actions.clock.settings.increment; }};
		actions.clock.toggle.click( function( ev ) {
			if( actions.clock.settings.started ) { time.stop(); }
			else { time.start(); }
		});
		divisions.main.append( divisions.list );
		divisions.page.append( divisions.header, divisions.main, divisions.footer );

		athletes.main.append( athletes.list, athletes.actions );
		athletes.page.append( athletes.header, athletes.main, athletes.footer );

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
				e.updateAthletes( division );

				e.time.stop();
				e.time.clear();
			}
			(sendCommand( "athlete/previous" ))();
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
				e.updateAthletes( division );

				e.time.stop();
				e.time.clear();
			}

			(sendCommand( "athlete/next" ))();
		}

		// ============================================================
		function parsePageUrl( pageUrl ) {
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
					data : divisions[ i ],
					item : html.li.clone(),
					link : html.a.clone()
				}
				division.link.html( division.data.name.capitalize() + ' ' + division.data.description );
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
		var updateAthletes = e.updateAthletes = function( division ) {
		// ============================================================
			e.athletes.list.empty();
			if( ! defined( division )) { return; }
			var round = division.round;
			for( var i = 0; i < division.order[ round ].length; i++ ) {
				var j = division.order[ round ][ i ];
				var athlete = {
					data : division.athletes[ j ],
					item : html.li.clone()
				}
				var complete = true;
				var forms    = athlete.data.scores[ round ].length;
				for( k = 0; k < forms; k++ ) {
					var formComplete = athlete.data.scores[ round ][ k ].complete;
					complete &= formComplete;
				}
				if( j == division.current ) { 
					athlete.item.addClass( 'current' );
					if      ( forms  > 1 ) { athlete.item.html( athlete.data.name + ' <span class="ordinal">&mdash; ' + ordinal[ division.form ] + ':</span> <span class="form">' + division.forms[ round ][ division.form ].name + '</span>' ); }
					else if ( forms == 1 ) { athlete.item.html( athlete.data.name + ' <span class="ordinal">&mdash;</span> <span class="form">' + division.forms[ round ][ division.form ].name + '</span>' ); }

				} else { 
					athlete.item.html( athlete.data.name );
					athlete.item.removeClass( 'current' ) 
				}
				if( complete              ) { athlete.item.addClass( 'complete' ); } else { athlete.item.removeClass( 'complete' ); }
				e.athletes.list.append( athlete.item );
			}
			e.athletes.list.listview().listview( 'refresh' );

		};

		// ============================================================
		this.element.on( "pagebeforetransition", function( ev, transition ) {
		// ============================================================
			if( ! defined( transition.absUrl )) { return; }
			var option    = parsePageUrl( transition.absUrl );
			var divisions = o.progress.divisions;
			var division  = undefined;
			if( defined( option.ring ) && defined( option.divid )) {
				division = $.grep( o.progress.divisions, function( item ) { return (item.name == option.divid && item.ring == option.ring); })[ 0 ];
			}

			if      ( option.id == "divisions" ) { e.updateDivisions( divisions, o.progress.current ); }
			else if ( option.id == "athletes"  ) { e.updateAthletes( division ); }
		});

		// ============================================================
		e.refresh = function( update ) {
		// ============================================================
			var progress = JSON.parse( update.data ); if( ! defined( progress.divisions )) { return; }
			o.progress = progress;
			e.updateDivisions( progress.divisions, progress.current );

		};

		actions.navigation.previous .click( navPrevAthlete );
		actions.navigation.next     .click( navNextAthlete );


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
