
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
				name     : html.div.clone(),
				accept   : html.a.clone(),
				reset    : html.a.clone(),
				remove   : html.a.clone(),
				close    : html.a.clone(),
			}
		}
		actions.athlete.name
			.html( "Name" );

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
				index    : i,
				data     : o.division.athletes[ i ],
				name     : html.text .clone() .addClass( "name" ) .attr( "id", "athlete-name-" + i ),
				view     : html.div  .clone() .addClass( "athlete" ),
				actions  : html.div.clone(),
				edit     : html.a.clone(),
				listitem : html.li.clone() .attr( "data-icon", "ui-icon-user" ),
			};

			athlete.view.addClass( "athlete" );
			athlete.name .attr( "index", i );
			athlete.name .val( athlete.data.name );
			athlete.name .click( function( ev ) { $( this ).select(); } );
			athlete.name .keydown( function( ev ) { 
				var i       = $( this ).attr( "index" );
				var oldName = o.division.athletes[ i ].name;
				var newName = $( this ).val();
				if      ( ev.which == 13 ) { 
					o.division.athletes[ i ].name = newName; 
					$( this ).blur(); 
					console.log( "AJAX call to change name from '" + oldName + "' to '" + newName + "' for athlete " + i );

				} else if ( ev.which == 27 ) { $( this ).val( oldName ); }
			});

			athlete.edit
				.addClass( "edit ui-btn ui-icon-edit ui-btn-icon-notext ui-btn-inline" )
				.attr( "index", i )
				.click( function( ev ) { 
					var i = $( this ).attr( "index" ); 
					var athlete = o.division.athletes[ i ];
					o.current = i;
					e.actions.athlete.name.html( athlete.name ); 
					e.edit.panel( "open" ); 
				});

			athlete.view.append( athlete.name, athlete.edit );
			athlete.listitem.append( athlete.view );
			e.list.append( athlete.listitem );

			e.edit.panel();
			e.list.listview().listview( "refresh" );
			o.athletes.push( athlete );
		};
	},
});
