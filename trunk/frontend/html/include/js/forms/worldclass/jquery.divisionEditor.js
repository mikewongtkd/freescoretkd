
$.widget( "freescore.divisionEditor", {
	options: { autoShow: true, port : ':3088/' },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};

		var html      = e.html      = FreeScore.html;
		var edit      = e.edit      = html.div.clone();
		var header    = e.header    = html.div.clone() .addClass( "config" ) .divisionHeader( o );
		var actions   = e.actions   = {
			footer : html.div.clone() .attr( "data-role", "footer" ) .attr( "data-position", "fixed" ) .attr( "data-theme", "b" ) .attr( "data-tap-toggle", false ) .addClass( "actions" ) .addClass( "ui-bar" ) .addClass( "ui-grid-a" ),
			move : {
				panel : html.div.clone() .attr( "data-role", "controlgroup" ) .attr( "data-type", "horizontal" ) .attr( "data-inline", true ) .addClass( "ui-block-a" ),
				up    : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "arrow-u" ) .attr( "data-inline", true ) .html( "Move Up" ),
				down  : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "arrow-d" ) .attr( "data-inline", true ) .html( "Move Down" ),
				last  : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "forward" ) .attr( "data-inline", true ) .html( "Move Last" ),
			},
			remove : { 
				panel : html.div.clone() .addClass( "ui-block-b" ),
				button : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "delete" ) .attr( "data-inline", true ) .html( "Remove" )
			},
		};

		actions.move.panel.append( actions.move.up, actions.move.down, actions.move.last );
		actions.remove.panel.append( actions.remove.button );
		actions.footer.append( actions.move.panel, actions.remove.panel );

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

		this.element .append( header, rounds.tabs, actions.footer );

		var sound = e.sound = {};
		sound.ok    = new Howl({ urls: [ "/freescore/sounds/upload.mp3",   "/freescore/sounds/upload.ogg" ]});
		sound.error = new Howl({ urls: [ "/freescore/sounds/quack.mp3",    "/freescore/sounds/quack.ogg" ]});

		// ============================================================
		var editAthlete = o.editAthlete = function( i, athleteData, round ) {
		// ============================================================
			var url    = 'http://' + o.server + o.port + o.tournament.db + '/' + o.ring + '/' + o.division + '/edit';
			$.ajax( {
				type:      'POST',
				url:       url,
				dataType:  'json',
				data:      JSON.stringify( { athlete : athleteData}),
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
		}

		o.updates = 0; // Indicate that live updates are OK

	},

	_init: function() {
		var e       = this.options.elements;
		var o       = this.options;
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
			athlete.name.mouseover( function( ev ) { $( this ).parent().parent().addClass( "ui-btn-hover-c" ); });
			athlete.name.mouseout( function( ev ) { $( this ).parent().parent().removeClass( "ui-btn-hover-c" ); });
			athlete.name.focus( function( ev ) { $( this ).parent().parent().css({ background: "#b3d4fd" });  });
			athlete.name.blur(  function( ev ) { $( this ).parent().parent().css({ background: "white" }); });
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
						o.editAthlete( i, { index : i, name : newName, round : round }, round );
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
						o.editAthlete((k - 1), { index : k, name : newName, round : round }, round );

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

			athlete.edit
				.addClass( "edit ui-btn ui-nodisc-icon ui-icon-delete ui-btn-icon-notext ui-btn-inline" )
				.attr( "index", i )
				.css( "background-color", "red" )
				.click( function( ev ) { 
					var i = $( this ).attr( "index" ); 
					var athlete = o.division.athletes[ i ];

					o.current = i;
					o.editAthlete( i, { index : i, remove : true, round : round }, round );
					o.updates = 0;
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
