
$.widget( "freescore.divisions", {
	options: { autoShow: true, },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};

		var html     = e.html     = FreeScore.html;
		var list     = e.list     = html.div.clone() .attr( "data-role", "collapsible-set" );
		
		this.element .addClass( "divisions" );
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
		function addRing( i, divisions ) {
		/* ============================================================ */
			var ring  = { data : divisions, view : html.div.clone() .attr( "data-role", "collapsible" ) .attr( "data-collapsed", "false" ), title : html.h3.clone() };
			if( i == 'staging' ) { ring.title.html( 'Staging' ); }
			else                 { ring.title.html( 'Ring ' + i ); }
			ring.view.append( ring.title );

			for( var division in divisions ) {
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
				console.log( divisions );
				o.rings.push( addRing( i, divisions ));
			}
		};

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	},
});
