
$.widget( "freescore.athletes", {
	options: { autoShow: true, port : ':3088/' },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};
		var w = this.element;

		var html      = e.html      = FreeScore.html;
		var edit      = e.edit      = html.div.clone();
		var actions   = e.actions   = {
			footer : html.div.clone() .attr( "data-role", "footer" ) .attr( "data-position", "fixed" ) .attr( "data-theme", "b" ) .attr( "data-tap-toggle", false ) .addClass( "actions" ) .addClass( "ui-bar" ),
			button: {
				move : {
					up    : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "arrow-u" ) .attr( "data-inline", true ) .css( "background", "#38c" ) .html( "Move Up" ),
					down  : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "arrow-d" ) .attr( "data-inline", true ) .css( "background", "#38c" ) .html( "Move Down" ),
					last  : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "forward" ) .attr( "data-inline", true ) .css( "background", "#38c" ) .html( "Move Last" ),
				},
				remove : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "minus"  ) .attr( "data-inline", true ) .css({ background: "#fa3",                  }) .html( "Remove" ),
			},
			athlete  : html.div.clone(),
			header   : html.div.clone() .attr( "data-role", "header" ) .attr( "data-position", "fixed" ) .attr( "data-theme", "b" ) .attr( "data-tap-toggle", false ) .addClass( "actions" ) .addClass( "ui-bar" ),
			division : html.div.clone(),
		};

		actions.athlete.append( actions.button.move.up, actions.button.move.down, actions.button.move.last, actions.button.remove );
		actions.footer.append( actions.athlete );
		actions.athlete.find( "a" ).addClass( 'ui-disabled' );

		// ===== INITIALIZE TAB NAVIGATION
		var rounds    = e.rounds    = {
			tabs   : html.div.clone() .attr( "data-role", "tabs" ),
			navbar : html.div.clone() .attr( "data-role", "navbar" ),
			prelim : { button : html.li.clone(), tab : html.div.clone() .addClass( "athletes" ) .attr( "id", "prelim-tab" ), list : html.ul.clone() .attr( "data-role", "listview" ) },
			semfin : { button : html.li.clone(), tab : html.div.clone() .addClass( "athletes" ) .attr( "id", "semfin-tab" ), list : html.ul.clone() .attr( "data-role", "listview" ) },
			finals : { button : html.li.clone(), tab : html.div.clone() .addClass( "athletes" ) .attr( "id", "finals-tab" ), list : html.ul.clone() .attr( "data-role", "listview" ) },
			ro8a   : { button : html.li.clone(), tab : html.div.clone() .addClass( "athletes" ) .attr( "id", "ro8a-tab"   ), list : html.ul.clone() .attr( "data-role", "listview" ) },
			ro8b   : { button : html.li.clone(), tab : html.div.clone() .addClass( "athletes" ) .attr( "id", "ro8b-tab"   ), list : html.ul.clone() .attr( "data-role", "listview" ) },
			ro8c   : { button : html.li.clone(), tab : html.div.clone() .addClass( "athletes" ) .attr( "id", "ro8c-tab"   ), list : html.ul.clone() .attr( "data-role", "listview" ) },
			ro8d   : { button : html.li.clone(), tab : html.div.clone() .addClass( "athletes" ) .attr( "id", "ro8d-tab"   ), list : html.ul.clone() .attr( "data-role", "listview" ) },
			ro4a   : { button : html.li.clone(), tab : html.div.clone() .addClass( "athletes" ) .attr( "id", "ro4a-tab"   ), list : html.ul.clone() .attr( "data-role", "listview" ) },
			ro4b   : { button : html.li.clone(), tab : html.div.clone() .addClass( "athletes" ) .attr( "id", "ro4b-tab"   ), list : html.ul.clone() .attr( "data-role", "listview" ) },
			ro2    : { button : html.li.clone(), tab : html.div.clone() .addClass( "athletes" ) .attr( "id", "ro2-tab"    ), list : html.ul.clone() .attr( "data-role", "listview" ) },
		};

		// Initialize tab buttons that control navigation
		var map = { prelim : "Preliminary Round", semfin : "Semi-Final Round", finals : "Final Round", ro8a : "1st Finals Group A", ro8b : "1st Finals Group B", ro8c : "1st Finals Group C", ro8d : "1st Finals Group D", r04a : "2nd Finals Group A", ro4b : "2nd Finals Group B", ro2 : "3rd Finals" };
		rounds.prelim.button .append( html.a.clone() .attr( "id", "tab-button-prelim" ) .attr( "href", "#prelim-tab" ) .attr( "data-ajax", false ) .html( map[ 'prelim' ] ));
		rounds.semfin.button .append( html.a.clone() .attr( "id", "tab-button-semfin" ) .attr( "href", "#semfin-tab" ) .attr( "data-ajax", false ) .html( map[ 'semfin' ] ));
		rounds.finals.button .append( html.a.clone() .attr( "id", "tab-button-finals" ) .attr( "href", "#finals-tab" ) .attr( "data-ajax", false ) .html( map[ 'finals' ] ));
		rounds.ro8a  .button .append( html.a.clone() .attr( "id", "tab-button-ro8a"   ) .attr( "href", "#ro8a-tab"   ) .attr( "data-ajax", false ) .html( map[ 'ro8a'   ] ));
		rounds.ro8b  .button .append( html.a.clone() .attr( "id", "tab-button-ro8b"   ) .attr( "href", "#ro8b-tab"   ) .attr( "data-ajax", false ) .html( map[ 'ro8b'   ] ));
		rounds.ro8c  .button .append( html.a.clone() .attr( "id", "tab-button-ro8c"   ) .attr( "href", "#ro8c-tab"   ) .attr( "data-ajax", false ) .html( map[ 'ro8c'   ] ));
		rounds.ro8d  .button .append( html.a.clone() .attr( "id", "tab-button-ro8d"   ) .attr( "href", "#ro8d-tab"   ) .attr( "data-ajax", false ) .html( map[ 'ro8d'   ] ));
		rounds.ro4a  .button .append( html.a.clone() .attr( "id", "tab-button-ro4a"   ) .attr( "href", "#ro4a-tab"   ) .attr( "data-ajax", false ) .html( map[ 'ro4a'   ] ));
		rounds.ro4b  .button .append( html.a.clone() .attr( "id", "tab-button-ro4b"   ) .attr( "href", "#ro4b-tab"   ) .attr( "data-ajax", false ) .html( map[ 'ro4b'   ] ));
		rounds.ro2   .button .append( html.a.clone() .attr( "id", "tab-button-ro2"    ) .attr( "href", "#ro2-tab"    ) .attr( "data-ajax", false ) .html( map[ 'ro2'    ] ));

		w .empty();
		w .append( rounds.tabs, actions.footer );
		w .addClass( "division" );

		var sound = e.sound = {};
		sound.ok    = new Howl({ urls: [ "/freescore/sounds/upload.mp3",   "/freescore/sounds/upload.ogg" ]});
		sound.error = new Howl({ urls: [ "/freescore/sounds/quack.mp3",    "/freescore/sounds/quack.ogg" ]});

		// ============================================================
		var editDivision = o.editDivision = function( divisionData ) {
		// ============================================================
			var url    = 'http://' + o.server + o.port + o.tournament.db + '/' + o.ring + '/' + o.divindex + '/edit';
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
					}
				},
				error:   function( response ) { 
					// Network error
					e.sound.error.play(); 
					console.log( 'Network Error: Unknown network error.' );
				}, 
			});
		};

		// ============================================================
		var editAthlete = o.editAthlete = function( athleteData ) {
		// ============================================================
			var url    = 'http://' + o.server + o.port + o.tournament.db + '/' + o.ring + '/' + o.division.index + '/edit';
			console.log( url );
			$.ajax( {
				type:      'POST',
				url:       url,
				dataType:  'json',
				data:      JSON.stringify({ athlete : athleteData}),
				success: function( response ) { 
					// Server-side error
					if( defined( response.error )) {
						e.sound.error.play();
						console.log( response.error );

					// All OK
					} else {
						e.sound.ok.play(); 
						console.log( response.description );
					}
				},
				error:   function( response ) { 
					// Network error
					e.sound.error.play(); 
					console.log( 'Network Error: Unknown network error.' );
				}, 
			});
		};

		// ============================================================
		// FOOTER UI BUTTON BEHAVIOR
		// ============================================================

		// ------------------------------------------------------------
		actions.button.move.up.click( function( ev ) {
		// ------------------------------------------------------------
			var i        = o.selected.attr( "index" );
			var round    = o.selected.attr( "round" );
			var athlete  = o.division.athletes[ i ];

			var current  = o.selected.parent().parent();
			var j        = current.find( ".number" ).html();
			var previous = current.prev();
			var k        = previous.find( ".number" ).html();
			previous.detach();
			previous.insertAfter( current );
			current.find( ".number" ).html( k );
			previous.find( ".number" ).html( j );
			o.selected = undefined;                                // Clear context
			e.actions.athlete.find( "a" ).addClass( 'ui-disabled' ); // Disable contextual footer UI buttons

			o.editDivision({ index : i, reorder : true, move : 'up', round : round });
			o.updates = 0;
		});

		// ------------------------------------------------------------
		actions.button.move.down.click( function( ev ) {
		// ------------------------------------------------------------
			var i       = o.selected.attr( "index" );
			var round   = o.selected.attr( "round" );
			var athlete = o.division.athletes[ i ];

			var current  = o.selected.parent().parent();
			var j        = current.find( ".number" ).html();
			var next     = current.next();
			var k        = next.find( ".number" ).html();
			current.detach();
			current.insertAfter( next );
			current.find( ".number" ).html( k );
			next.find( ".number" ).html( j );
			o.selected = undefined;                                         // Clear context
			e.actions.athlete.find( "a" ).addClass( 'ui-disabled' ); // Disable contextual footer UI buttons

			o.editDivision({ index : i, reorder : true, move : 'down', round : round });
			o.updates = 0;
		});

		// ------------------------------------------------------------
		actions.button.move.last.click( function( ev ) {
		// ------------------------------------------------------------
			var i       = o.selected.attr( "index" );
			var round   = o.selected.attr( "round" );
			var athlete = o.division.athletes[ i ];

			var current  = o.selected.parent().parent();
			var last     = current.parent().find( "li:last-child" );
			current.detach();
			current.insertBefore( last );
			o.selected = undefined;                                         // Clear context
			e.actions.athlete.find( "a" ).addClass( 'ui-disabled' ); // Disable contextual footer UI buttons

			o.editDivision({ index : i, reorder : true, move : 'last', round : round });
			o.updates = 0;
		});

		// ------------------------------------------------------------
		actions.button.remove.click( function( ev ) {
		// ------------------------------------------------------------
			var i       = o.selected.attr( "index" );
			var round   = o.selected.attr( "round" );
			var athlete = o.division.athletes[ i ];

			// Activate dialog to confirm athlete removal

		});

		o.updates = 0; // Indicate that live updates are OK

	},

	_init: function() {
		var e       = this.options.elements;
		var o       = this.options;
		var w       = this.element;
		var html    = e.html;

		// ------------------------------------------------------------
		var addAthlete = function( i, round, j ) {
		// ------------------------------------------------------------
			var athletes = defined( o.division ) && defined( o.division.athletes ) ? o.division.athletes : [];
			var data = (i >= 0 && i < athletes.length) ? athletes[ i ] : undefined;
			var athlete = { 
				index    : i,
				data     : data,
				number   : html.div  .clone() .addClass( "number" ),
				name     : html.text .clone() .addClass( "name" ),
				view     : html.div  .clone() .addClass( "athlete" ),
				edit     : html.a    .clone(),
				listitem : html.li   .clone() .attr( "id", "athlete-" + round + "-" + i )
			};

			athlete.view.addClass( "athlete" );
			athlete.name .attr( "index", i );
			athlete.name .attr( "round", round );
			athlete.name.focus( function( ev ) { 
				if( defined( o.selected )) {
					o.selected.parent().parent().css({ background : "white" });
				}
				$( this ).parent().parent().css({ background: "#b3d4fd" }); 
				o.selected = $( this );
				e.actions.footer.find( "a" ).removeClass( 'ui-disabled' );
			});
			if( defined( athlete.data )) {
				athlete.name   .val( athlete.data.name );
				athlete.number .html( parseInt( j ) + 1 );
			} else {
				athlete.name   .attr( "placeholder", "New Athlete" );
				athlete.number .addClass( "ui-btn-icon-notext ui-icon-plus" ) .css( "margin", "6px 0 0 0" );
			}
			athlete.name .click( function( ev ) { $( this ).select(); } );
			// ------------------------------------------
			// Behavior for editing athlete name
			// ------------------------------------------
			athlete.name .keydown( function( ev ) { 
				var i       = $( this ).attr( "index" );
				var round   = $( this ).attr( "round" );
				var newName = $( this ).val();
				var oldName = undefined;
				var k       = o.division.athletes.length + 1;

				// Enter key behavior: accept name and move to next athlete
				if      ( ev.which == 13 ) { 
					if( i >= 0 && i < o.division.athletes.length ) {
						o.division.athletes[ i ].name = newName; 
						oldName = o.division.athletes[ i ].name;
						$( this ).blur(); 
						o.editAthlete({ index : i, name : newName, round : round });
						var textboxes = $( "input:text" );
						var current = textboxes.index( this );
						if( textboxes[ current + 1 ] != null ) {
							var next = textboxes[ current + 1 ];
							next.focus();
							next.select();
							ev.preventDefault();
							return false;
						}

					} else {
						$( this ).blur();
						var listitem = $( this ).parent();
						var number = listitem.find( ".number" );
						number.removeClass( "ui-btn-icon-notext" );
						number.removeClass( "ui-icon-plus" );
						console.log( k, o.division.athletes );
						number.html( k );
						number.css( "padding-top", "5px" );
						o.editAthlete({ index : k-1, name : newName, round : round });

						o.division.athletes[ k-1 ] = { name : newName };
						var athlete = addAthlete( -1, rname, -1 );
						e.rounds[ round ].list.append( athlete.listitem );
						e.rounds[ round ].list.listview().listview( "refresh" );
						athlete.name.focus();
					}

				// Escape key behavior: Restore the old name
				} else if ( ev.which == 27 ) { 
					if( i >= 0 && i < o.division.athletes.length ) { oldName = o.division.athletes[ i ].name; } 
					$( this ).val( oldName ); 
				}
			});

			// ===== COPY-AND-PASTE FUNCTIONALITY
			athlete.name .on( "paste", function( ev ) {
				var textinput = $( this );
				var i         = textinput.attr( "index" );
				var round     = textinput.attr( "round" );
				var clipboard = ev.originalEvent.clipboardData;
				var content   = {
					html : clipboard.getData( 'text/html' ),
					text : clipboard.getData( 'text/plain' ),
				}
				var names = [];

				// Microsoft Excel or HTML table
				if       ( content.html != '' ) {
					console.log( "Clipboard has HTML or Excel data" );

					var parser    = new DOMParser();
					var doc       = parser.parseFromString( content.html, "text/html" );
					var table     = $( doc ).find( 'table' );
					var rows      = table.find( 'tr' );
					$.each( rows, function( i ) {
						var columns = $( rows[ i ] ).find( 'td' );
						var name    = $( columns[ 0 ]).html();
						names.push( name );
					});

				// Plain text
				} else if( content.text != '' ) {
					console.log( "Clipboard has text data" );
					names = names.concat( $.grep( content.text.split( /[\r\n]/ ), function( item ) { return item != ''; } ));

				} else {
					console.log( "Clipboard has unknown or no data" );
				}

				$.each( names, function( j ) {
					var newName = names[ j ];
					o.division.athletes[ i ].name = newName; 
					oldName = o.division.athletes[ i ].name;
					textinput.blur(); 
					o.editAthlete({ index : i, name : newName, round : round });
					var textboxes = $( "input:text" );
					var current = textboxes.index( textinput );
					if( textboxes[ current + 1 ] != null ) {
						var next = textboxes[ current + 1 ];
						next.focus();
						next.select();
						ev.preventDefault();
						i++;
					}
				});
				return false;
			});

			athlete.view.append( athlete.number, athlete.name );
			athlete.listitem.append( athlete.view );

			return athlete;
		};

		var division   = o.division;
		var n          = defined( o.division.athletes ) ? o.division.athletes.length : 0;

		if( ! defined( division )) { return; }

		// ====== POPULATE THE ROUNDS
		e.rounds.prelim.tab .empty() .append( e.rounds.prelim.list );
		e.rounds.semfin.tab .empty() .append( e.rounds.semfin.list );
		e.rounds.finals.tab .empty() .append( e.rounds.finals.list );

		var navigationTabs = html.ul.clone();
		e.rounds.navbar .empty() .append( navigationTabs );
		e.rounds.tabs   .empty() .append( e.rounds.navbar );
		var rounds = [];
		var first = undefined;
		if( o.division.method == 'combination' ) { rounds  = rounds.concat( [ 'prelim', 'semfin', 'ro8a', 'ro8b', 'ro8c', 'ro8d', 'ro4a', 'ro4b', 'ro2' ] ); }
		else { rounds = rounds.concat( [ 'prelim', 'semfin', 'finals' ] ); }
		console.log( rounds );
		for( var r = 0; r < rounds.length; r++ ) {
			var rname = rounds[ r ];
			if( defined( o.division.order ) && defined( o.division.order[ rname ] )) {
				var order = o.division.order[ rname ];
				var round = e.rounds[ rname ];
				if( isNaN( first )) { first = r; console.log( round.button.find( 'a' )); }

				navigationTabs.append( e.rounds[ rname ].button );
				e.rounds.tabs.append( e.rounds[ rname ].tab );
				round.list.empty();

				// Skip updating the list if no athletes are in this round
				if( ! defined( order )) { continue; }

				// Add all athletes in the current round
				for( var j in order ) {
					var i = order[ j ];
					var athlete = addAthlete( i, rname, j );
					round.list.append( athlete.listitem );

					e.edit.panel();
					round.list.listview().listview( "refresh" );
				};
				// Add a blank to add new athletes to the current round
				var athlete = addAthlete( o.division.athletes.length, rname, -1 );
				round.list.append( athlete.listitem );
				round.list.listview().listview( "refresh" );

				if( round.button.find( 'a' ).hasClass( 'ui-btn-active' )) { active = rname; }
			}
		}

		e.rounds.tabs.tabs();
		e.rounds.tabs.enhanceWithin();
	},
});
