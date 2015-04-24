
$.widget( "freescore.divisions", {
	options: { autoShow: true, },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};

		var html      = e.html      = FreeScore.html;
		var rings     = e.rings     = html.div.clone() .attr( "data-role", "page" ) .attr( "id", "rings" );
		var list      = e.list      = html.ul.clone() .attr( "data-role", "listview" );
		var ring_divs = e.ring_divs = html.div.clone() .attr( "data-role", "page" ) .attr( "id", "ring_divisions" );
		var div_edit  = e.div_edit  = html.div.clone() .attr( "data-role", "page" ) .attr( "id", "division_editor" );

		rings.append( list );
		
		this.element .attr( "data-role", "content" ) .addClass( "divisions" );
		this.element .append( rings, ring_divs, div_edit );
	},

	_init: function() {
		var e       = this.options.elements;
		var o       = this.options;
		var html    = e.html;

		// ============================================================
		var get_rings = function( tournament ) {
		// ============================================================
			var rings = { staging : [] };
			for( var i = 0; i < tournament.divisions.length; i++ ) {
				var division = tournament.divisions[ i ];
				var j        = division.ring;
				if( ! defined( rings[ j ] )) { rings[ j ] = []; }
				rings[ j ].push( division );
			}
			return rings;
		};

		// ============================================================
		function addRing( i, divs ) {
		// ============================================================
			var ring = { 
				divisions : divs, 
				listitem  : html.li.clone(),
				link      : html.a.clone(),
				count     : html.div.clone() .addClass( "ui-btn-up-c ui-btn-corner-all custom-count-pos" ) 
			};
			if( i == 'staging' ) { ring.link.html( 'Staging' ); }
			else                 { ring.link.html( 'Ring ' + i ); }

			ring.link.attr( "href", "#ring_divisions?ring=" + i ) .attr( "data-transition", "slide" );
			ring.link.append( ring.count );

			ring.count.html( ring.divisions.length + " Divisions" );
			if( ring.divisions.length == 1 ) { ring.count.html( "1 Division" ); }
			else { ring.count.html( ring.divisions.length + " Divisions" ); }
			ring.listitem.append( ring.link );

			e.list.append( ring.listitem );
			e.list.listview( "refresh" );
			return ring;
		}

		// ============================================================
		function showEditor( i, division ) {
		// ============================================================
			var ring = i == "staging" ? o.rings[ i ] : o.rings[ (i - 1) ];
			var page = e.div_edit;
		}

		// ============================================================
		function showRing( i ) {
		// ============================================================
			var ring = i == "staging" ? o.rings[ i ] : o.rings[ (i - 1) ];
			var list = html.ul.clone() .attr( "data-role", "listview" );
			var page = e.ring_divs;

			page.empty();
			list.empty();
			page.append( list );

			var back = { 
				listitem  : html.li.clone() .attr( 'data-icon', 'carat-l' ) .attr( "data-theme", "b" ), 
				link      : html.a.clone(),
			};
			if( i == 'staging' ) { back.link.html( 'Staging' ); }
			else                 { back.link.html( 'Ring ' + i ); }
			back.link.attr( "href", "#rings" ) .attr( "data-transition", "slide" ) .attr( "data-direction", "reverse" );
			back.listitem.append( back.link );
			list.append( back.listitem );

			if( defined( ring )) {
				for( var j in ring.divisions ) {
					var division = { 
						data      : ring.divisions[ j ], 
						listitem  : html.li.clone(), 
						link      : html.a.clone(),
						count     : html.div.clone() .addClass( "ui-btn-up-c ui-btn-corner-all custom-count-pos" ) 
					};
					division.link.html( division.data.name.toUpperCase() + " " + division.data.description );
					division.link.attr( "href", "#division_editor?ring=" + i + "&division=" + j ) .attr( "data-transition", "slide" );
					division.link.append( division.count );

					if( division.data.athletes.length == 1 ) { division.count.html( "1 Athlete" ); }
					else { division.count.html( division.data.athletes.length + " Athletes" ); }
					division.listitem.append( division.link );

					list.append( division.listitem );
				}
			}

			var add = { 
				listitem  : html.li.clone(),
				link      : html.a.clone(),
			};
			add.link .append( "Add Division" );
			add.link
				.attr( "href",            "#division_editor?ring=" + i )
				.attr( "data-transition", "slide"                      )
				.addClass( "ui-btn ui-btn-icon-left ui-icon-plus" );
			add.listitem.append( add.link );
			list.append( add.listitem );


			list.listview().listview( "refresh" );
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
		function refresh( update ) {
		// ============================================================
			var tournament = JSON.parse( update.data );
			e.list.empty();
			o.rings = [];
			var rings = get_rings( tournament );

			var header = {
				listitem : html.li.clone() .attr( "data-theme", "b" ),
				name     : html.span.clone() .html( defined( o.tournament.name ) ? o.tournament.name : "World Class Poomsae" ) .css( "font-family", "HelveticaNeue-CondensedBold" ) .css( "font-size", "18pt" ),
				app      : html.span.clone() .html( defined( o.tournament.name ) ? "World Class Poomsae" : "" ) .css( "font-family", "HelveticaNeue-CondensedBold" ) .css( "font-size", "18pt" ) .css( "margin-left", "8px" ) .css( "color", "#999" ),
				search   : {
					view   : html.div.clone()
								.css( "float", "right" ),

					input  : html.search.clone() 
								.addClass( "search-box" ) 
								.attr( "name", "search" ) 
								.attr( "placeholder", "Search for athlete name or division description" ) 
								.attr( "data-type", "search" )
								.css( "width", "360px" )
								.css( "margin", "2px 16px 0 0" )
								.css( "border-radius", "24px" )
								.css( "float", "left" ),

					button : html.a.clone()
								.attr( "href", "#" )
								.addClass( "ui-btn ui-icon-search ui-btn-icon-right" )
								.html( "Search" )
								.css( "border-radius", "24px" )
								.css( "float", "left" )
								.css( "margin", "0" )
								.css( "font-size", "9pt" )
				}
			};
			header.search.view.append( header.search.input, header.search.button );
			header.listitem.append( header.name, header.app, header.search.view );
			
			e.list.append( header.listitem );
			for( var i in rings ) {
				var divisions = rings[ i ];
				o.rings.push( addRing( i, divisions ));
			}
		};

		// ============================================================
		// Behavior
		// ============================================================
		this.element.on( "pagebeforechange", function( ev, data ) {
			if( ! defined( data.absUrl )) { return; }
			var option  = parsePageUrl( data.absUrl );

			if      ( option.id == "ring_divisions"  ) { showRing( option.ring ); }
			else if ( option.id == "division_editor" ) { showEditor( option.ring, option.division ); }
		});

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	},
});
