
$.widget( "freescore.divisions", {
	options: { autoShow: true, },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};

		var html      = e.html      = FreeScore.html;

		var sound = e.sound = {};
		sound.ok    = new Howl({ urls: [ "/freescore/sounds/upload.mp3",   "/freescore/sounds/upload.ogg" ]});
		sound.error = new Howl({ urls: [ "/freescore/sounds/quack.mp3",    "/freescore/sounds/quack.ogg" ]});

		var dialog = e.dialog = {
			panel  : html.div.clone() .attr({ 'data-role': 'popup', 'data-dialog': true, 'data-overlay-theme': 'b', id: '#dialog' }) .css({ background : 'white' }),
			header : {
				panel : html.div.clone() .attr({ 'data-role': 'header', 'data-theme': 'b' }),
				title : html.h1.clone(),
			},
			content : {
				panel  : html.div.clone() .attr( "role", "main" ) .addClass( "ui-content" ),
				text   : html.p.clone(),
				icon   : html.span.clone() .addClass( "ui-btn-icon-left" ) .css( "position", "relative" ),
				cancel : html.a.clone() .attr({ 'data-role': 'button', 'data-icon': 'delete', 'data-inline': true }) .css({ background: 'red',   color: 'white', textShadow: 'none' }) .html( "No" ),
				ok     : html.a.clone() .attr({ 'data-role': 'button', 'data-icon': 'check' , 'data-inline': true }) .css({ background: '#3a3',  color: 'white', textShadow: 'none' }) .html( "Yes" ),
			}
		};

		dialog.header.panel.append( dialog.header.title );
		dialog.content.panel.append( dialog.content.icon, dialog.content.text, dialog.content.cancel, dialog.content.ok );
		dialog.panel.append( dialog.header.panel, dialog.content.panel );
		$( 'body' ).append( dialog.panel );
		$( function() { dialog.panel.enhanceWithin().popup(); });

		var ring      = e.ring      = {
			panel     : html.div.clone() .attr({ 'data-role': 'page', 'id': 'rings' }),
			list      : html.ul.clone()  .attr({ 'data-role': 'listview' }),
			divisions : html.div.clone() .attr({ 'data-role': 'page', 'id': 'ring-divisions' }),
			division  : {
				add    : html.div.clone() .attr({ 'data-role': 'page', 'id': 'division-add' }),
				editor : html.div.clone() .attr({ 'data-role': 'page', 'id': 'division-editor' }),
			},
		};

		ring.division.editor.divisionEditor( { division : {}, server : o.server, tournament : o.tournament, dialog : dialog } );

		ring.panel.append( ring.list );

		this.element .addClass( 'divisions' );
		this.element .append( ring.panel, ring.divisions, ring.division.editor );
	},

	_init: function() {
		var e       = this.options.elements;
		var o       = this.options;
		var html    = e.html;

		// ============================================================
		var editDivision = o.editDivision = function( divisionData ) {
		// ============================================================
			o.port = ':3088/';
			var url   = 'http://' + o.server + o.port + o.tournament.db + '/' + o.ring + '/' + o.division + '/edit';
			console.log( url );
			$.ajax( {
				type:      'POST',
				url:       url,
				dataType:  'json',
				data:      JSON.stringify( divisionData ),
				success: function( response ) { 
					// Server-side error
					if( defined( response.error )) {
						e.sound.error.play();
						console.log( response.error );

					// All OK
					} else {
						e.sound.ok.play(); 
						console.log( response.description );
						o.division = response.id;

						// ===== SHOW DIVISION EDITOR WITH NEW DIVISION
						$( ':mobile-pagecontainer' ).pagecontainer( 'change', '#division-editor?ring=' + o.ring + '&division=' + response.id );
					}
				},
				error:   function( response ) { 
					// Network error
					e.sound.error.play(); 
					console.log( 'Network Error: Unknown network error.' );
					// e.error.show(); 
					// e.error.errormessage({ message : 'Network Error: Unknown network error.' }); 
				}, 
			});
		};

		// ============================================================
		var deleteDivision = o.deleteDivision = function( ev ) {
		// ============================================================
			var division = {
				name  : $( this ).attr( 'divname' ).toUpperCase(),
				index : $( this ).attr( 'index' ),
				ring  : $( this ).attr( 'ring' )
			};
			e.dialog.header.title.html( "Delete Division?" );
			e.dialog.header.panel.css({ background : "red" });
			e.dialog.content.text.empty();
			e.dialog.content.icon.addClass( "ui-icon-delete" );
			e.dialog.content.text.append( e.dialog.content.icon, "Delete division " + division.name + "?<br>Once confirmed,<br>this cannot be undone." );
			e.dialog.content.ok.click( function( ev ) {
				$( ":mobile-pagecontainer" ).pagecontainer( "change", "#ring-divisions?ring=" + division.ring, { transition : "slide", reverse : true });
				e.dialog.panel.popup( 'close' );     // Close the confirmation dialog
				o.editDivision({ 'delete' : true }); // Send AJAX command to update DB
				$( this ).trigger( 'divisiondelete', { ring : division.ring, id : division.index });
			});
			e.dialog.content.cancel.click( function( ev ) { 
				e.dialog.panel.popup( 'close' );
			});

			e.dialog.panel.popup( 'open', { transition : "pop" } );
		};

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

			ring.link.attr( "href", "#ring-divisions?ring=" + i ) .attr( "data-transition", "slide" );
			ring.link.append( ring.count );

			if( ring.divisions.length == 1 ) { ring.count.html( "1 Division" ); }
			else { ring.count.html( ring.divisions.length + " Divisions" ); }
			ring.listitem.append( ring.link );

			e.ring.list.append( ring.listitem );
			e.ring.list.listview().listview( "refresh" );
			return ring;
		}

		// ============================================================
		var showEditor = function( i, divIndex ) {
		// ============================================================
			var n        = o.rings.length;
			var ring     = i == "staging" ? o.rings[ (n - 1) ] : o.rings[ (i - 1) ];
			if( ! defined( ring )) { return; }
			var division = ring.divisions[ divIndex ];
			if( ! defined( division )) {
				var j = divIndex = ring.divisions.length;
				ring.divisions[ j ] = division = {
					index : j,
					name  : o.division,
				};
			}
			division.index = divIndex;
			e.ring.division.editor.divisionEditor( { ring : i, division : division, updates : 0, dialog : e.dialog } );
		}

		// ============================================================
		var showRing = function( i ) {
		// ============================================================
			var n        = o.rings.length;
			var ring = i == "staging" ? o.rings[ i ] : o.rings[ (i - 1) ];
			var list = html.ul.clone() .attr( "data-role", "listview" );
			var page = e.ring.divisions;
			o.ring   = i;

			page.empty();
			list.empty();
			var content = html.div.clone() .attr( "data-role", "content" );
			page.append( content );
			content.append( list );

			var back = { 
				listitem  : html.li.clone(), 
				link      : html.a.clone() .addClass( 'ui-btn ui-btn-icon-left ui-icon-carat-l' ) .css({ 'color' : 'white', 'text-shadow':'0 1px 0 #036', 'background-color': '#38c', 'margin-top':'-1px', 'margin-bottom':'-1px' }),
			};
			if( i == 'staging' ) { back.link.html( 'Staging' ); }
			else                 { back.link.html( 'Ring ' + i ); }
			back.link.attr( "href", "#rings" ) .attr({ 'data-transition' : 'slide', 'data-direction': 'reverse' });
			back.listitem.append( back.link );
			list.append( back.listitem );

			if( defined( ring )) {
				for( var j in ring.divisions ) {
					var division = { 
						data        : ring.divisions[ j ], 
						listitem    : html.li.clone() .attr({ 'data-icon':'false' }), 
						description : html.a.clone(),
						action      : {
							panel   : html.div.clone() .attr({ 'data-role':'controlgroup', 'data-type':'horizontal' }) .css({ 'position':'absolute', 'top':'16px', 'right':'16px' }),
							remove  : html.a.clone()   .attr({ 'data-role':'button', 'data-icon':'delete', 'data-iconpos':'notext', 'ring':ring, 'index':j, 'divname': ring.divisions[ j ].name }) .click( deleteDivision ) .css({ 'height':'20px', 'background-color':'red' }),
							restage : html.a.clone()   .attr({ 'data-role':'button', 'data-icon':'back',   'data-iconpos':'notext', 'ring':ring, 'index':j, 'divname': ring.divisions[ j ].name }) .css({ 'height':'20px', 'background-color':'orange' }),
						},
					};

					var count = division.data.athletes.length == 1 ? "1 Athlete" : division.data.athletes.length + " Athletes";

					division.shortlist = (division.data.athletes.length > 8 ? division.data.athletes.slice( 0, 7 ) : division.data.athletes).map( function( athlete ) { return athlete.name; } ).join( ", " ) + (division.data.athletes.length > 8 ? ', ...' : '');
					division.description.html( "<h3>" + division.data.name.toUpperCase() + " " + division.data.description + "</h3><p>&nbsp;&nbsp;<b>" + count + "</b><br>&nbsp;&nbsp;" + division.shortlist + "</p>" );
					division.description.attr({ href: "#division-editor?ring=" + i + "&division=" + j, divid: division.data.name, 'data-transition': 'slide' });

					division.action.panel.append( division.action.restage, division.action.remove );
					division.action.panel.controlgroup();

					division.description.append( division.count, division.action.panel );
					division.listitem.append( division.description );

					list.append( division.listitem );
				}
			}

			var add = { 
				listitem  : html.li.clone(),
				link      : html.a.clone(),
			};
			add.link .addClass( "ui-btn ui-btn-icon-left ui-icon-plus" ) .html( "New Division" );
			add.link .attr( "ring", i );

			// ------------------------------------------------------------
			add.link.click( function( ev ) {
			// -----------------------------------------------------------
				var i = $( this ).attr( "ring" );
				o.division = -1; // Placeholder value for division
				o.editDivision({ ring : i, create : true }); // Send AJAX command to update DB
				$( ':mobile-pagecontainer' ).pagecontainer( 'change', '#division-editor?ring=' + i + '&division=' + o.division );

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
			e.ring.list.empty();
			o.rings = [];
			var rings = getRings( tournament );

			// $.removeCookie( "ring", { path : "/" } );
			// $.removeCookie( "division", { path : "/" } );

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
			if( defined( o.callback ) ) {
				var show = o.callback;
				o.callback = undefined;
				show();
			}
		};

		// ============================================================
		// Behavior
		// ============================================================
		this.element.on( "pagebeforetransition", function( ev, data ) {
			if( ! defined( data.absUrl )) { return; }
			var option  = parsePageUrl( data.absUrl );
			
			if( defined( option.ring     )) { $.cookie( "ring",     option.ring     ); } else { option.ring     = $.cookie( "ring" ); }
			if( defined( option.division )) { $.cookie( "division", option.division ); } else { option.division = $.cookie( "division" ); }

			if( ! defined( o.rings )) { 
				if      ( option.id == "ring-divisions"  ) { o.callback = function() { showRing( option.ring ); }; }
				else if ( option.id == "division-editor" ) { o.callback = function() { showEditor( option.ring, option.division ); } }
				return;
			}

			if      ( option.id == "ring-divisions"  ) { showRing( option.ring ); }
			else if ( option.id == "division-editor" ) { showEditor( option.ring, option.division ); }
		});

		$( 'body' ).on( "divisiondelete", function( ev, data ) {
			var i        = data.ring;
			var j        = data.id;
			var ring     = i == "staging" ? o.rings[ i ] : o.rings[ (i - 1) ];
			var id       = ring.divisions[ j ].name;
			var listitem = e.ring.divisions.find( 'a[divid=' + id + ']' );
			listitem.remove();
		});

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );

	},
});
