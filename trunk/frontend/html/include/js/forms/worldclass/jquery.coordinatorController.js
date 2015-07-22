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
				main    : html.div.clone() .attr({ 'role': 'main' }) .addClass( 'ui-grid-a' ),
				list    : html.ul.clone() .attr( 'role', 'listview' ) .addClass( 'ui-block-a' ) .css({ width: 'calc( 100% - 200px )' }),
				actions : html.div.clone() .addClass( 'ui-block-b' ) .css({ width: '200px' }),
				footer  : html.div.clone() .attr({ 'data-role': 'footer', 'data-theme' : 'b', 'data-position' : 'fixed' }),
		};

		divisions.main.append( divisions.list, divisions.actions );
		divisions.page.append( divisions.header, divisions.main, divisions.footer );

		athletes.main.append( athletes.list );
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
					item : html.li.clone() .addClass( 'athlete' ),
					link : html.a.clone()
				}
				var complete = true;
				for( k = 0; k < athlete.data.scores[ round ].length; k++ ) {
					var formComplete = athlete.data.scores[ round ][ k ].complete;
					complete &= formComplete;
				}
				athlete.link.html( athlete.data.name );
				athlete.link.attr({ href: '#athletes?divid=' + athlete.data.name, 'data-transition' : 'slide' });
				if( j == division.current ) { athlete.link.addClass( 'current' );  } else { athlete.link.removeClass( 'current' ) }
				if( complete              ) { athlete.link.addClass( 'complete' ); } else { athlete.link.removeClass( 'complete' ); }
				athlete.item.append( athlete.link );
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
