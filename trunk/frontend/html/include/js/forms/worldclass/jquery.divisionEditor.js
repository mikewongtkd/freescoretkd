
$.widget( "freescore.divisionEditor", {
	options: { autoShow: true, port : ':3088/' },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};
		var w = this.element;

		var html      = e.html      = FreeScore.html;
		var edit      = e.edit      = html.div.clone();
		var header    = e.header    = html.div.clone() .addClass( "config" ) .divisionHeader( o );
		var actions   = e.actions   = {
			footer : html.div.clone() .attr( "data-role", "footer" ) .attr( "data-position", "fixed" ) .attr( "data-theme", "b" ) .attr( "data-tap-toggle", false ) .addClass( "actions" ) .addClass( "ui-bar" ) .addClass( "ui-grid-a" ),
			button: {
				move : {
					up    : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "arrow-u" ) .attr( "data-inline", true ) .css( "background", "#38c" ) .html( "Move Up" ),
					down  : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "arrow-d" ) .attr( "data-inline", true ) .css( "background", "#38c" ) .html( "Move Down" ),
					last  : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "forward" ) .attr( "data-inline", true ) .css( "background", "#38c" ) .html( "Move Last" ),
				},
				remove : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "minus"  ) .attr( "data-inline", true ) .css({ background: "#fa3",                  }) .html( "Remove" ),
				erase  : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "delete" ) .attr( "data-inline", true ) .css({ background: "red",    width: "140px" }) .html( "Delete Division" ),
				ok     : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "check" )  .attr( "data-inline", true ) .css({ background: "#3a3",   width: "140px" }) .html( "Accept Division" ),
			},
			panel : {
				athlete : html.div.clone() .attr( "data-role", "controlgroup" ) .attr( "data-type", "horizontal" ) .addClass( "ui-block-a" ),
				division : html.div.clone() .addClass( "ui-block-b" ),
			}
		};

		actions.panel.athlete.append( actions.button.move.up, actions.button.move.down, actions.button.move.last, actions.button.remove );
		actions.panel.division.append( actions.button.erase, actions.button.ok );
		actions.footer.append( actions.panel.athlete, actions.panel.division );
		actions.panel.athlete.find( "a" ).addClass( 'ui-disabled' );

		var rounds    = e.rounds    = {
			tabs   : html.div.clone() .attr( "data-role", "tabs" ),
			navbar : html.div.clone() .attr( "data-role", "navbar" ),
			prelim : { button : html.li.clone(), tab : html.div.clone() .addClass( "athletes" ) .attr( "id", "prelim-tab" ), list : html.ul.clone() .attr( "data-role", "listview" ) },
			semfin : { button : html.li.clone(), tab : html.div.clone() .addClass( "athletes" ) .attr( "id", "semfin-tab" ), list : html.ul.clone() .attr( "data-role", "listview" ) },
			finals : { button : html.li.clone(), tab : html.div.clone() .addClass( "athletes" ) .attr( "id", "finals-tab" ), list : html.ul.clone() .attr( "data-role", "listview" ) },
		};

		var map = { prelim : "Preliminary Round", semfin : "Semi-Final Round", finals : "Final Round" };
		rounds.prelim.button.append( html.a.clone() .attr( "id", "tab-button-prelim" ) .attr( "href", "#prelim-tab" ) .attr( "data-ajax", false ) .html( map[ 'prelim' ] ));
		rounds.semfin.button.append( html.a.clone() .attr( "id", "tab-button-semfin" ) .attr( "href", "#semfin-tab" ) .attr( "data-ajax", false ) .html( map[ 'semfin' ] ));
		rounds.finals.button.append( html.a.clone() .attr( "id", "tab-button-finals" ) .attr( "href", "#finals-tab" ) .attr( "data-ajax", false ) .html( map[ 'finals' ] ));
		rounds.navbar.append( html.ul.clone() .append( rounds.prelim.button, rounds.semfin.button, rounds.finals.button ));
		rounds.prelim.tab.append( rounds.prelim.list );
		rounds.semfin.tab.append( rounds.semfin.list );
		rounds.finals.tab.append( rounds.finals.list );
		rounds.tabs.append( rounds.navbar, rounds.prelim.tab, rounds.semfin.tab, rounds.finals.tab );
		rounds.tabs.tabs();

		var dialog = e.dialog = {
			panel  : html.div.clone() .attr( "data-role", "popup" ) .attr( "data-dialog", true ) .attr( "data-overlay-theme", "b" ) .attr( "id", "#dialog" ),
			header : {
				panel : html.div.clone() .attr( "data-role", "header" ) .attr( "data-theme", "b" ),
				title : html.h1.clone(),
			},
			content : {
				panel  : html.div.clone() .attr( "role", "main" ) .addClass( "ui-content" ),
				text   : html.p.clone(),
				icon   : html.span.clone() .addClass( "ui-btn-icon-left" ) .css( "position", "relative" ),
				cancel : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "delete" ) .attr( "data-inline", true ) .css({ background: "red",   color: "white", textShadow: "none" }) .html( "No" ),
				ok     : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "check"  ) .attr( "data-inline", true ) .css({ background: "#3a3",  color: "white", textShadow: "none" }) .html( "Yes" ),
			}
		};

		dialog.header.panel.append( dialog.header.title );
		dialog.content.panel.append( dialog.content.icon, dialog.content.text, dialog.content.cancel, dialog.content.ok );
		dialog.panel.append( dialog.header.panel, dialog.content.panel );

		this.element .append( header, rounds.tabs, actions.footer, dialog.panel );

		var sound = e.sound = {};
		sound.ok    = new Howl({ urls: [ "/freescore/sounds/upload.mp3",   "/freescore/sounds/upload.ogg" ]});
		sound.error = new Howl({ urls: [ "/freescore/sounds/quack.mp3",    "/freescore/sounds/quack.ogg" ]});

		// ============================================================
		var editDivision = o.editDivision = function( divisionData ) {
		// ============================================================
			var url    = 'http://' + o.server + o.port + o.tournament.db + '/' + o.ring + '/' + o.division.index + '/edit';
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
						// e.error.show();
						// e.error.errormessage({ message : response.error });

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
					// e.error.show(); 
					// e.error.errormessage({ message : 'Network Error: Unknown network error.' }); 
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
						// e.error.show();
						// e.error.errormessage({ message : response.error });

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
					// e.error.show(); 
					// e.error.errormessage({ message : 'Network Error: Unknown network error.' }); 
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
			o.selected = undefined;                                         // Clear context
			e.actions.panel.athletes.find( "a" ).addClass( 'ui-disabled' ); // Disable contextual footer UI buttons

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
			e.actions.panel.athletes.find( "a" ).addClass( 'ui-disabled' ); // Disable contextual footer UI buttons

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
			e.actions.panel.athletes.find( "a" ).addClass( 'ui-disabled' ); // Disable contextual footer UI buttons

			o.editDivision({ index : i, reorder : true, move : 'last', round : round });
			o.updates = 0;
		});

		// ------------------------------------------------------------
		actions.button.remove.click( function( ev ) {
		// ------------------------------------------------------------
			var i       = o.selected.attr( "index" );
			var round   = o.selected.attr( "round" );
			var athlete = o.division.athletes[ i ];

			e.dialog.header.title.html( "Remove Athlete?" );
			e.dialog.header.panel.css({ background : "black" });
			e.dialog.content.text.empty();
			e.dialog.content.icon.addClass( "ui-icon-minus" );
			e.dialog.content.text.append( e.dialog.content.icon, "Remove athlete " + athlete.name + " from division? Once confirmed,<br>this cannot be undone." );
			e.dialog.content.ok.click( function( ev ) {
				e.dialog.panel.popup( 'close' );                                // Close the confirmation dialog
				o.editAthlete({ index : i, remove : true, round : round });     // Send AJAX command to update DB
				o.selected.parent().parent().remove();                          // Update list display
				o.selected = undefined;                                         // Clear context
				e.actions.panel.athletes.find( "a" ).addClass( 'ui-disabled' ); // Disable contextual footer UI buttons
				o.updates = 0;                                                  // Indicate that the list can be updated
			});
			e.dialog.content.cancel.click( function( ev ) { 
				e.dialog.panel.popup( 'close' );
			});

			e.dialog.panel.popup( 'open', { transition : "pop" } );
		});

		// ------------------------------------------------------------
		actions.button.erase.click( function( ev ) {
		// ------------------------------------------------------------
			e.dialog.header.title.html( "Delete Division?" );
			e.dialog.header.panel.css({ background : "red" });
			e.dialog.content.text.empty();
			e.dialog.content.icon.addClass( "ui-icon-delete" );
			e.dialog.content.text.append( e.dialog.content.icon, "Delete this entire division? Once confirmed,<br>this cannot be undone." );
			e.dialog.content.ok.click( function( ev ) {
				e.dialog.panel.popup( 'close' );       // Close the confirmation dialog
				o.editDivision({ 'delete' : true }); // Send AJAX command to update DB
				$( ":mobile-pagecontainer" ).pagecontainer( "change", "#ring-divisions?ring=" + o.ring, { transition : "slide", reverse : true });
			});
			e.dialog.content.cancel.click( function( ev ) { 
				e.dialog.panel.popup( 'close' );
			});

			e.dialog.panel.popup( 'open', { transition : "pop" } );

		});

		// ------------------------------------------------------------
		actions.button.ok.click( function( ev ) {
		// ------------------------------------------------------------
			$( ":mobile-pagecontainer" ).pagecontainer( "change", "#ring-divisions?ring=" + o.ring, { transition : "slide", reverse : true });
		});

		o.updates = 0; // Indicate that live updates are OK

	},

	_init: function() {
		var e       = this.options.elements;
		var o       = this.options;
		var w       = this.element;
		var html    = e.html;

		if( o.updates > 1 ) { return; } // Try to ignore live updates while editing the division
		o.updates++; // It takes 2 updates to get the division information (1 on init, 1 on receiving JSON data)

		var addAthlete = function( i, round, j ) {
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
				athlete.name .val( athlete.data.name );
				athlete.number .html( parseInt( j ) + 1 );
			} else {
				athlete.name .attr( "placeholder", "New Athlete" );
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
						number.html( k );
						number.css( "padding-top", "5px" );
						o.editAthlete({ index : k-1, name : newName, round : round });

						o.division.athletes[ k ] = { name : newName };
						var athlete = addAthlete( -1, rname, -1 );
						e.rounds[ round ].list.append( athlete.listitem );
						e.rounds[ round ].list.listview().listview( "refresh" );
						athlete.name.focus();
					}

				} else if ( ev.which == 27 ) { 
					if( i >= 0 && i < o.division.athletes.length ) { oldName = o.division.athletes[ i ].name; } 
					$( this ).val( oldName ); 
				}
			});

			athlete.view.append( athlete.number, athlete.name );
			athlete.listitem.append( athlete.view );

			return athlete;
		}

		var n = defined( o.division.athletes ) ? o.division.athletes.length : 0;
		e.header.divisionHeader({ 
			server:     o.server,
			port:       ':3088/',
			tournament: o.tournament,
			ring:       o.ring,
			division:   o.division.index, 
			text:       o.division.description, 
			forms:      o.division.forms, 
			judges:     o.division.judges, 
			athletes:   n 
		});
		var first = undefined;

		// ===== DETERMINE WHICH ROUND IS THE FIRST ROUND FOR THIS DIVISION
		var disable = [];
		for( var r = 0; r < 3; r++ ) {
			var rname = [ 'prelim', 'semfin', 'finals' ][ r ];
			if( ! defined( o.division.order ) || ! defined( o.division.order[ rname ] )) { 
				disable.push( r );
				continue;
			}
			if( ! defined( first )) { first = r; }
		}
		e.rounds.tabs.tabs({ disabled: disable });

		var active = undefined;
		for( var r = first; r < 3; r++ ) {
			var rname = [ 'prelim', 'semfin', 'finals' ][ r ];
			var order = o.division.order[ rname ];
			var round = e.rounds[ rname ];
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

		if( defined( first ) && ! defined( active )) {
			var rname = [ 'prelim', 'semfin', 'finals' ][ first ];
			e.rounds[ rname ].button.find( 'a' ).click();
		}
	},
});
