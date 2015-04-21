
$.widget( "freescore.divisions", {
	options: { autoShow: true, },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};

		var html     = e.html     = FreeScore.html;
		var list     = e.list     = html.div.clone() .attr( "data-role", "collapsible-set" );
		
		this.element .attr( "data-role", "content" ) .addClass( "divisions" );
		this.element .append( list );
	},

	_init: function() {
		var e       = this.options.elements;
		var o       = this.options;
		var html    = e.html;

		/* ============================================================ */
		var get_rings = function( tournament ) {
		/* ============================================================ */
			var rings = { staging : [] };
			for( var i = 0; i < tournament.divisions.length; i++ ) {
				var division = tournament.divisions[ i ];
				var j        = division.ring;
				if( ! defined( rings[ j ] )) { rings[ j ] = []; }
				rings[ j ].push( division );
			}
			return rings;
		};

		/* ============================================================ */
		function addRing( i, divs ) {
		/* ============================================================ */
			var ring = { divisions : divs, view : html.div.clone() .attr( "data-role", "collapsible" ), title : html.h4.clone(), list : html.ul.clone() .attr( "data-role", "listview" ), count : html.div.clone() .addClass( "ui-btn-up-c ui-btn-corner-all custom-count-pos" ) };
			if( i == 'staging' ) { ring.title.html( 'Staging' ); }
			else                 { ring.title.html( 'Ring ' + i ); }

			ring.count.html( ring.divisions.length );

			ring.view.append( ring.title );
			ring.view.append( ring.list );
			ring.title.append( ring.count );

			for( var i in ring.divisions ) {
				var division = ring.divisions[ i ];
				var view  = html.li.clone();
				var name  = html.a.clone() .attr( "href", "/freescore" ) .html( division.name.toUpperCase() + " " + division.description );
				var count = html.span.clone() .addClass( "ui-li-count" ) .html( division.athletes.length );
				view.append( name, count );
				ring.list.append( view );
			}

			e.list.append( ring.view );
			return ring;
		}

		/* ============================================================ */
		function refresh( update ) {
		/* ============================================================ */
			var tournament = JSON.parse( update.data );
			e.list.empty();
			o.rings = [];
			var rings = get_rings( tournament );

			for( var i in rings ) {
				var divisions = rings[ i ];
				o.rings.push( addRing( i, divisions ));
			}
		};

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	},
});
