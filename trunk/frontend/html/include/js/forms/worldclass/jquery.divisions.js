
$.widget( "freescore.divisions", {
	options: { autoShow: true, },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};

		var html      = e.html      = FreeScore.html;
		var rings     = e.rings     = html.div.clone() .attr( "data-role", "page" ) .attr( "id", "rings" );
		var list      = e.list      = html.ul.clone()  .attr( "data-role", "listview" );
		var ring_divs = e.ring_divs = html.div.clone() .attr( "data-role", "page" ) .attr( "id", "ring_divisions" );
		var div_edit  = e.div_edit  = html.div.clone() .attr( "data-role", "page" ) .attr( "id", "division_editor" );

		var dialog = e.dialog = {
			panel  : html.div.clone() .attr( "data-role", "popup" ) .attr( "data-dialog", true ) .attr( "data-overlay-theme", "b" ) .attr( "id", "#division-dialog" ),
			header : {
				panel : html.div.clone() .attr( "data-role", "header" ) .attr( "data-theme", "b" ),
				title : html.h1.clone(),
			},
			content : {
				panel  : html.div.clone() .attr( "role", "main" ) .addClass( "ui-content" ),
				text   : html.p.clone(),
				cancel : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "delete" ) .attr( "data-inline", true ) .css({ background: "red",   color: "white", textShadow: "none" }) .html( "No" ),
				ok     : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "check"  ) .attr( "data-inline", true ) .css({ background: "#3a3",  color: "white", textShadow: "none" }) .html( "Yes" ),
			}
		};

		dialog.header.panel.append( dialog.header.title );
		dialog.content.panel.append( dialog.content.text, dialog.content.cancel, dialog.content.ok );
		dialog.panel.append( dialog.header.panel, dialog.content.panel );

		div_edit.divisionEditor( { division : {}, server : o.server, tournament : o.tournament } );

		rings.append( list );
		
		this.element .attr( "data-role", "content" ) .addClass( "divisions" );
		this.element .append( rings, ring_divs, div_edit, dialog.panel );
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
			var ring     = i == "staging" ? o.rings[ (n - 1) ] : o.rings[ (i - 1) ];
			if( ! defined( ring )) { return; }
			var division = ring.divisions[ divIndex ];
			e.div_edit.divisionEditor( { ring : i, division : division, updates : 0 } );
		}

		// ============================================================
		var showRing = function( i ) {
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
			add.link .addClass( "ui-btn ui-btn-icon-left ui-icon-plus" ) .html( "New Division" );

			// ------------------------------------------------------------
			add.link.click( function( ev ) {
			// ------------------------------------------------------------
				e.dialog.header.title.html( "New Division" );
				e.dialog.content.text.html( "Please provide information for the new division." );
				e.dialog.content.ok.click( function( ev ) {
					// o.editAthlete({ index : i, remove : true, round : round });  // Send AJAX command to update DB
					e.dialog.panel.popup( 'close' );                                // Close the confirmation dialog
					$( ":mobile-pagecontainer" ).pagecontainer( "change", "#division_editor?ring=" + i, { transition : "slide" } ); 
				});
				e.dialog.content.cancel.click( function( ev ) { 
					e.dialog.panel.popup( 'close' );
				});

				e.dialog.panel.popup();
				e.dialog.panel.popup( 'open', { transition : "pop" } );
			});
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
		this.element.on( "pagebeforetransition", function( ev, data ) {
			if( ! defined( data.absUrl )) { return; }
			var option  = parsePageUrl( data.absUrl );

			if      ( option.id == "ring_divisions"  ) { showRing( option.ring ); }
			else if ( option.id == "division_editor" ) { showEditor( option.ring, option.division ); }

		});

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	},
});
