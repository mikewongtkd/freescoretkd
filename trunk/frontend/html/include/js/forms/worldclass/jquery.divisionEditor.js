
$.widget( "freescore.divisionEditor", {
	options: { autoShow: true },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};

		var html      = e.html      = FreeScore.html;
		var division  = e.division  = html.div.clone();
		var edit      = e.edit      = html.div.clone();
		var header    = e.header    = html.div.clone() .divisionHeader( o );
		var list      = e.list      = html.ul.clone() .attr( "data-role", "listview" ) .attr( "id", "list" );

		var actions   = e.actions   = {
			athlete : { 
				name     : html.text.clone(),
				accept   : html.a.clone(),
				reset    : html.a.clone(),
				remove   : html.a.clone(),
				close    : html.a.clone(),
			}
		}

		actions.athlete.name.change( function( ev, ui ) {
			var i        = o.current;
			var athlete  = o.division.athletes[ i ];
			var view     = o.athletes[ i ];
			var oldName  = athlete.name;
			var newName  = $( this ).val();
			athlete.name = newName;
			view.name.html( newName );
			console.log( "AJAX call to change athlete name" );
		});

		actions.athlete.accept
			.addClass( "ui-btn ui-icon-check ui-btn-icon-left" )
			.html( "OK" )
			.attr( "href", "#list" )
			.attr( "data-rel", "close" );

		actions.athlete.reset
			.addClass( "ui-btn ui-icon-back ui-btn-icon-left" )
			.html( "Clear Score" )
			.click( function( ev ) { } );

		actions.athlete.remove
			.addClass( "ui-btn ui-icon-minus ui-btn-icon-left" )
			.html( "Remove" )
			.click( function( ev ) { } );

		actions.athlete.close
			.addClass( "ui-btn ui-icon-delete ui-btn-icon-left" )
			.html( "Cancel" )
			.attr( "href", "#list" )
			.attr( "data-rel", "close" );

		edit 
			.attr( "data-role", "panel" ) 
			.attr( "data-position", "right" ) 
			.attr( "data-display", "overlay" ) 
			.attr( "data-theme", "b" ) 
			.attr( "id", "edit-panel" )
			.append( 
				actions.athlete.name, 
				actions.athlete.accept, 
				actions.athlete.reset, 
				actions.athlete.remove, 
				actions.athlete.close 
			);

		division .attr( "id", "divisionEditor" );
		division .append( edit, header, list );
		this.element .append( division );
	},

	_init: function() {
		var e       = this.options.elements;
		var o       = this.options;
		var html    = e.html;

		o.athletes = [];

		var n = defined( o.division.athletes ) ? o.division.athletes.length : 0;
		e.header.divisionHeader({ text : o.division.description, forms : o.division.forms, judges : o.division.judges, athletes : n });
		e.list.empty();
		for( var i in o.division.athletes ) {
			var athlete = { 
				data     : o.division.athletes[ i ],
				name     : html.span .clone() .addClass( "name" ),
				view     : html.div  .clone() .addClass( "athlete" ),
				move     : html.div  .clone() .addClass( "move" ),
				moveup   : html.a.clone(),
				movedown : html.a.clone(),
				actions  : html.div.clone(),
				edit     : html.a.clone(),
				listitem : html.li.clone() .attr( "data-icon", "ui-icon-user" ),
			};

			athlete.view.addClass( "athlete" );

			athlete.name
				.html( athlete.data.name );

			athlete.move .addClass( "move ui-nodisc-icon" );

			var switchUp = i == 0 ? 0 : (i - 1);
			athlete.moveup
				.addClass( "up ui-btn ui-icon-arrow-u ui-btn-icon-notext ui-btn-inline" )
				.attr( "athlete", i )
				.attr( "switch", switchUp )
				.click( function() { 
					var i = $( this ).attr( "athlete" );
					var j = $( this ).attr( "switch" );
					console.log( "ajax call to swap " + i + " and " + j );
				});

			var switchDown = i == o.division.athletes.length ? o.divisions.athletes.length : (i + 1);
			athlete.movedown
				.addClass( "down ui-btn ui-icon-arrow-d ui-btn-icon-notext ui-btn-inline" )
				.attr( "athlete", i )
				.attr( "switch", switchDown )
				.click( function( ev ) { console.log( ev ) } );

			athlete.edit
				.addClass( "edit ui-btn ui-icon-edit ui-btn-icon-notext ui-btn-inline" )
				.attr( "athlete", i )
				.click( function( ev ) { 
					var i = $( this ).attr( "athlete" ); 
					var athlete = o.division.athletes[ i ];
					o.current = i;
					e.actions.athlete.name.val( athlete.name ); 
					e.edit.panel( "open" ); 
				});

			athlete.move.addClass( "move" );
			athlete.move.append( athlete.moveup, athlete.movedown );

			athlete.view.append( athlete.move, athlete.name, athlete.edit );
			athlete.listitem.append( athlete.view );
			e.list.append( athlete.listitem );

			e.edit.panel();
			e.list.listview().listview( "refresh" );
			o.athletes.push( athlete );
		};
	},
});
