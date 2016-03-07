
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

			if( ring.divisions.length > 0 ) {
				ring.link.attr({ href: "ring.php?ring=" + i, "data-transition": "slide" });
			}
			ring.link.append( ring.count );

			if( ring.divisions.length == 1 ) { ring.count.html( "1 Division" ); }
			else { ring.count.html( ring.divisions.length + " Divisions" ); }
			ring.listitem.append( ring.link );

			e.ring.list.append( ring.listitem );
			e.ring.list.listview().listview( "refresh" );
			return ring;
		}

		// ============================================================
		function refreshRings( update ) {
		// ============================================================
			var tournament = JSON.parse( update.data );
			e.ring.list.empty();
			o.rings = [];
			var rings = getRings( tournament );

			var header = {
				listitem : html.li.clone() .attr( "data-theme", "b" ),
				name     : html.span.clone() .html( defined( o.tournament.name ) ? o.tournament.name : "World Class Poomsae" ) .css( "font-family", "HelveticaNeue-CondensedBold" ) .css( "font-size", "18pt" ),
				app      : html.span.clone() .html( defined( o.tournament.name ) ? "World Class Poomsae" : "" ) .css( "font-family", "HelveticaNeue-CondensedBold" ) .css( "font-size", "18pt" ) .css( "margin-left", "8px" ) .css( "color", "#999" ),
			};
			header.listitem.append( header.name, header.app );
			
			e.ring.list.append( header.listitem );
			for( var i in rings ) {
				var divisions = rings[ i ];
				o.rings.push( addRing( i, divisions ));
			}
		};

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refreshRings, false );

	},
});