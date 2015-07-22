$.widget( "freescore.coordinatorController", {
	options: { autoShow: true },
	_create: function() {
		var o      = this.options;
		var e      = this.options.elements = {};
		var widget = this.element;
		var html   = e.html  = FreeScore.html;

		o.ring    = parseInt( $.cookie( "ring" ));
		o.current = {};
		var ring  = o.ring == 'staging' ? 'Staging' : 'Ring ' + o.ring;

		var divisions = e.divisions = {
				page   : html.div.clone() .attr({ 'data-role': 'page', id: 'divisions' }),
				header : html.div.clone() .attr({ 'data-role': 'header', 'data-theme': 'b', 'data-position' : 'fixed' }) .html( "<h1>Divisions for " + ring + "</h1>" ),
				main   : html.div.clone() .attr( 'role', 'main' ),
				list   : html.ul.clone() .attr( 'role', 'listview' ),
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
				panel    : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend   : html.legend.clone() .html( "Navigation" ),
				previous : button.clone() .addClass( 'navigate-athletes ui-icon-arrow-u' ) .html( "Prev. Athlete" ),
				next     : button.clone() .addClass( 'navigate-athletes ui-icon-arrow-d' ) .html( "Next Athlete" ),
			},

			clock : {
				panel    : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend   : html.legend.clone() .html( "Timer" ),
				timer    : button.clone() .removeClass( 'ui-btn-icon-left' ) .addClass( 'timer' ) .unbind( 'click' ) .html( "00:00:00" ),
				toggle   : button.clone() .addClass( 'start ui-icon-forward' ) .html( "Start Timer" ),
			},

			penalties : {
				panel    : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend   : html.legend.clone() .html( "Penalties" ),
				time     : button.clone() .addClass( 'penalty ui-icon-clock'   ) .html( "Time Limit" ),
				bounds   : button.clone() .addClass( 'penalty ui-icon-action'  ) .html( "Out-of-Bounds" ),
			},

		}

		actions.navigation .panel.append( actions.navigation.legend, actions.navigation.previous, actions.navigation.next );
		actions.clock      .panel.append( actions.clock.legend, actions.clock.timer, actions.clock.toggle );
		actions.penalties  .panel.append( actions.penalties.legend, actions.penalties.time, actions.penalties.bounds );

		actions.panel.append( actions.navigation.panel, actions.clock.panel, actions.penalties.panel );
		athletes.actions.append( actions.panel );

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
		function parsePageUrl( pageUrl ) {
		// ============================================================
			var anchor = $.url( pageUrl ).attr( "anchor" );
			var args   = anchor.split( '?' );
			var option = $.url( anchor ).param();

			option[ 'id' ] = args[ 0 ];

			return option;
		}

		// ============================================================
		var updateDivisions = e.updateDivisions = function( divisions ) {
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
				for( k = 0; k < athlete.data.scores[ round ].length; k++ ) {
					var formComplete = athlete.data.scores[ round ][ k ].complete;
					complete &= formComplete;
				}
				athlete.item.html( athlete.data.name );
				if( j == division.current ) { athlete.item.addClass( 'current' );  } else { athlete.item.removeClass( 'current' ) }
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
				division = $.grep( o.progress.divisions, function( item ) { return (item.name == option.divid && item.ring == option.ring); }).shift();
			}

			if      ( option.id == "divisions" ) { e.updateDivisions( divisions ); }
			else if ( option.id == "athletes"  ) { e.updateAthletes( division ); }
		});

		// ============================================================
		e.refresh = function( update ) {
		// ============================================================
			var progress = JSON.parse( update.data ); if( ! defined( progress.divisions )) { return; }
			o.progress = progress;
			e.updateDivisions( progress.divisions );

		};

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
