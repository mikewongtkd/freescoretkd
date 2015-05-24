
$.widget( "freescore.divisions", {
	options: { autoShow: true, },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};

		var html      = e.html      = FreeScore.html;
		var error     = e.error     = html.div.clone();
		var div_edit  = e.div_edit  = html.div.clone() .attr( "data-role", "page" ) .attr( "id", "division-editor" );

		div_edit.divisionEditor( { division : {}, server : o.server, tournament : o.tournament } );
		
		this.element .attr( "data-role", "content" ) .addClass( "divisions" );
		this.element .append( error, div_edit );
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
		var addRing = function( i, divs ) {
		// ============================================================
			var ring = { 
				number    : i,
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
			e.list.listview().listview( "refresh" );
			return ring;
		}

		// ============================================================
		var showEditor = function( i, divIndex ) {
		// ============================================================
			var n        = o.rings.length;
			var ring     = i == "staging" ? o.rings.staging : o.rings[ i ];
			var division = ring[ divIndex ];
			e.div_edit.divisionEditor( { division : division } );
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
			if( defined( tournament.error )) {
				e.error.errormessage({ message : tournament.error });
			}
			o.rings = get_rings( tournament );

			showEditor( 1, 0 );

		};

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	},
});
