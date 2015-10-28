
$.widget( "freescore.divisions", {
	options: { autoShow: true, },
	_create: function() {
		var o    = this.options;
		var w    = this.element;
		var e    = this.options.elements = {};
		var html = e.html      = FreeScore.html;

		var sound = e.sound = {};
		sound.ok    = new Howl({ urls: [ "/freescore/sounds/upload.mp3",   "/freescore/sounds/upload.ogg" ]});
		sound.error = new Howl({ urls: [ "/freescore/sounds/quack.mp3",    "/freescore/sounds/quack.ogg" ]});

		var ring      = e.ring      = {
			panel     : html.div.clone(),
			list      : html.ul.clone()  .attr({ 'data-role': 'listview' }),
			divisions : html.div.clone(),
		};

		ring.panel.append( ring.list );

		w .addClass( 'divisions' );
		w .append( ring.panel, ring.divisions );
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
						if( ! divisionData.delete ) {
							$( ':mobile-pagecontainer' ).pagecontainer( 'change', 'editor.php?ring=' + o.ring + '&division=' + response.id );
						}
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
				index : $( this ).attr( 'divindex' ),
				ring  : $( this ).attr( 'ring' )
			};
			console.log( division );
		};

		// ============================================================
		var reassignDivision = o.reassignDivision = function( ev ) {
		// ============================================================
			var division = {
				name  : $( this ).attr( 'divname' ).toUpperCase(),
				index : $( this ).attr( 'index' ),
				ring  : $( this ).attr( 'ring' )
			};
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
		var showRing = function( i ) {
		// ============================================================
			var n         = o.rings.length;
			var divisions = i == "staging" ? o.rings[ i ] : o.rings[ i ];
			var list      = html.ul.clone() .attr( "data-role", "listview" );
			var page      = e.ring.divisions;

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
			back.link.attr( "href", "index.php" ) .attr({ 'data-transition' : 'slide', 'data-direction': 'reverse' });
			back.listitem.append( back.link );
			list.append( back.listitem );

			if( defined( divisions )) {
				for( var j in divisions ) {
					var division = { 
						data        : divisions[ j ], 
						listitem    : html.li.clone() .attr({ 'data-icon':'false' }), 
						description : html.a.clone(),
						action      : {
							panel   : html.div.clone() .attr({ 'data-role':'controlgroup', 'data-type':'horizontal' }) .css({ 'position':'absolute', 'top':'16px', 'right':'16px' }),
							remove  : html.a.clone()   .attr({ 'data-role':'button', 'data-icon':'delete', 'data-iconpos':'notext', 'ring':i, 'divindex':j, 'divname': divisions[ j ].name, 'actionname': 'delete'  }) .click( deleteDivision ) .css({ 'height':'20px', 'background-color':'red' }),
							restage : html.a.clone()   .attr({ 'data-role':'button', 'data-icon':'back',   'data-iconpos':'notext', 'ring':i, 'divindex':j, 'divname': divisions[ j ].name, 'actionname': 'restage' }) .css({ 'height':'20px', 'background-color':'orange' }),
						},
					};

					var count = division.data.athletes.length == 1 ? "1 Athlete" : division.data.athletes.length + " Athletes";

					division.shortlist = (division.data.athletes.length > 8 ? division.data.athletes.slice( 0, 7 ) : division.data.athletes).map( function( athlete ) { return athlete.name; } ).join( ", " ) + (division.data.athletes.length > 8 ? ', ...' : '');
					division.description.html( "<h3>" + division.data.name.toUpperCase() + " " + division.data.description + "</h3><p>&nbsp;&nbsp;<b>" + count + "</b><br>&nbsp;&nbsp;" + division.shortlist + "</p>" );
					division.description.attr({ href: "editor.php?ring=" + i + "&divindex=" + j, divid: division.data.name, 'data-transition': 'slide' });

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
		function refreshDivisions( update ) {
		// ============================================================
			var tournament = JSON.parse( update.data );
			o.rings = getRings( tournament );
			showRing( o.ring );
		};

		// ============================================================
		// Behavior
		// ============================================================
		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refreshDivisions, false );

	},
});
