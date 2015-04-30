
$.widget( "freescore.divisionEditor", {
	options: { autoShow: true, },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};

		var html      = e.html      = FreeScore.html;
		var division  = e.division  = html.div.clone();
		var edit      = e.edit      = html.div.clone();
		var header    = e.header    = html.div.clone();
		var list      = e.list      = html.ol.clone() .attr( "data-role", "listview" ) .attr( "id", "list" );

		var actions   = e.actions   = {
			athlete : html.text.clone(),
			save    : html.a.clone(),
			reset   : html.a.clone(),
			remove  : html.a.clone(),
			close   : html.a.clone(),
		}

		actions.athlete.on( "change", function( ev, ui ) {
			o.current.name = actions.athlete.attr( "value" );
		});

		actions.save
			.addClass( "ui-btn ui-icon-check ui-btn-icon-left" )
			.html( "Save" )
			.attr( "href", "#list" )
			.attr( "data-rel", "close" );

		actions.reset
			.addClass( "ui-btn ui-icon-back ui-btn-icon-left" )
			.html( "Clear Score" )
			.click( function( ev ) { } );

		actions.remove
			.addClass( "ui-btn ui-icon-minus ui-btn-icon-left" )
			.html( "Remove" )
			.click( function( ev ) { } );

		actions.close
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
			.append( actions.athlete, actions.save, actions.reset, actions.remove, actions.close );
		
		division.append( edit, header, list );
		this.element .append( division );
	},

	_init: function() {
		var e       = this.options.elements;
		var o       = this.options;
		var html    = e.html;

		// ============================================================
		function refresh( update ) {
		// ============================================================
			var tournament = JSON.parse( update.data );
			o.division = tournament.divisions[ 2 ]; // MW

			e.list.empty();
			for( var i in o.division.athletes ) {
				var athlete = { 
					data     : o.division.athletes[ i ],
					name     : html.span.clone(),
					view     : html.div.clone(),
					move     : html.div.clone(),
					moveup   : html.a.clone(),
					movedown : html.a.clone(),
					actions  : html.div.clone(),
					edit     : html.a.clone(),
					listitem : html.li.clone() .attr( "data-icon", "ui-icon-user" ),
				};

				athlete.view
					.css( "display", "inline-block" )
					.css( "width", "95%" );

				athlete.name
					.css( "font-weight", "bold" )
					.css( "font-size", "14pt" )
					.css( "position", "absolute" )
					.css( "top", "22px" )
					.html( athlete.data.name );

				athlete.move
					.addClass( "ui-nodisc-icon" )
					.css( "padding", "8px" )
					.css( "margin-right", "24px" )
					.css( "float", "left" );

				var switchUp = i == 0 ? 0 : (i - 1);
				athlete.moveup
					.addClass( "ui-btn ui-icon-arrow-u ui-btn-icon-notext ui-btn-inline" )
					.attr( "athlete", i )
					.attr( "switch", switchUp )
					.css( "margin", "0 1px 0 0" )
					.css( "border-radius", "24px 0 0 24px" )
					.css( "border", "0" )
					.css( "background", "#ccc" )
					.click( function() { 
						var i = $( this ).attr( "athlete" );
						var j = $( this ).attr( "switch" );
						console.log( "ajax call to swap " + i + " and " + j );
					});

				var switchDown = i == o.division.athletes.length ? o.divisions.athletes.length : (i + 1);
				athlete.movedown
					.addClass( "ui-btn ui-icon-arrow-d ui-btn-icon-notext ui-btn-inline" )
					.attr( "athlete", i )
					.attr( "switch", switchDown )
					.css( "margin", "0 0 0 0" )
					.css( "border-radius", "0 24px 24px 0" )
					.css( "border", "0" )
					.css( "background", "#ccc" )
					.click( function( ev ) { console.log( ev ) } );

				athlete.edit
					.addClass( "ui-btn ui-icon-edit ui-btn-icon-notext ui-btn-inline" )
					.attr( "athlete", i )
					.css( "margin", "0 1px 0 0" )
					.css( "border-radius", "24px" )
					.css( "margin-top", "8px" )
					.css( "border", "0" )
					.css( "float", "right" )
					.click( function( ev ) { 
						var i = $( this ).attr( "athlete" ); 
						var athlete = o.division.athletes[ i ];
						console.log( athlete.name );
						o.current = athlete;
						e.actions.athlete.attr( "value", athlete.name ); 
						e.edit.panel( "open" ); 
					});

				athlete.move.append( athlete.moveup, athlete.movedown );

				athlete.view.append( athlete.move, athlete.name, athlete.edit );
				athlete.listitem.append( athlete.view );
				e.list.append( athlete.listitem );
			}
			e.list.listview( "refresh" );
		};

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	},
});
