
$.widget( "freescore.rings", {
	options: { autoShow: true, },
	_create: function() {
		var o    = this.options;
		var w    = this.element;
		var e    = this.options.elements = {};
		var html = e.html      = FreeScore.html;

		var ring      = e.ring      = {
			panel     : html.div.clone(),
			list      : html.ul.clone()  .attr({ 'data-role': 'listview' }),
			divisions : html.div.clone(),
		};

		ring.panel.append( ring.list );

		this.element .addClass( 'divisions' );
		this.element .append( ring.panel, ring.divisions );
	},

	_init: function() {
		var e       = this.options.elements;
		var o       = this.options;
		var html    = e.html;

		// ============================================================
		var getRings = function( tournament ) {
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
		var addRing = function( i, divs ) {
		// ============================================================
			var ring = { 
				number    : i,
				divisions : divs, 
				listitem  : html.li.clone(),
				link      : html.a.clone(),
				count     : html.div.clone() .addClass( "ui-li-count" ) 
			};
			if( i == 'staging' ) { ring.link.html( 'Staging' ); }
			else                 { ring.link.html( 'Ring ' + i ); }

			ring.link.attr( "href", "ring.php?ring=" + i ) .attr( "data-transition", "slide" );
			ring.link.append( ring.count );

			if( ring.divisions.length == 1 ) { ring.count.html( "1 Division" ); }
			else { ring.count.html( ring.divisions.length + " Divisions" ); }
			ring.listitem.append( ring.link );

			e.ring.list.append( ring.listitem );
			e.ring.list.listview().listview( "refresh" );
			return ring;
		}

		// ============================================================
		function refresh( update ) {
		// ============================================================
			var tournament = JSON.parse( update.data );
			e.ring.list.empty();
			o.rings = [];
			var rings = getRings( tournament );

			var header = {
				listitem : html.li.clone() .attr( "data-theme", "b" ),
				name     : html.span.clone() .html( defined( o.tournament.name ) ? o.tournament.name : "World Class Poomsae" ) .css( "font-family", "HelveticaNeue-CondensedBold" ) .css( "font-size", "18pt" ),
				app      : html.span.clone() .html( defined( o.tournament.name ) ? "World Class Poomsae" : "" ) .css( "font-family", "HelveticaNeue-CondensedBold" ) .css( "font-size", "18pt" ) .css( "margin-left", "8px" ) .css( "color", "#999" ),
				search   : {
					view   : html.div.clone()
								.css( "float", "right" ),

					input  : html.search.clone() 
								.addClass( "search-box" ) 
								.attr({ name: "search", placeholder: "Search for athlete name or division description", 'data-type': "search" })
								.css({ width: "360px", margin: "2px 16px 0 0", borderRadius: "24px", float: "left" }),

					button : html.a.clone()
								.attr( "href", "#" )
								.addClass( "ui-btn ui-icon-search ui-btn-icon-right" )
								.html( "Search" )
								.css({ borderRadius: "24px", float: "left", margin: "0", fontSize: "9pt" })
				}
			};
			header.search.view.append( header.search.input, header.search.button );
			header.listitem.append( header.name, header.app, header.search.view );
			
			e.ring.list.append( header.listitem );
			for( var i in rings ) {
				var divisions = rings[ i ];
				o.rings.push( addRing( i, divisions ));
			}
		};

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );

	},
});
