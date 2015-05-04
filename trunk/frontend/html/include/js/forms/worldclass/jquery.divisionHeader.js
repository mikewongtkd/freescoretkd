$.widget( "freescore.divisionHeader", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var w    = this.element;
		var o    = this.options;
		var e    = this.options.elements = {};
		var html = e.html = FreeScore.html;

		var description = e.description = html.div.clone() .attr( "data-role", "collapsible" ) .attr( "data-theme", "b" ) .css( "width", "100%" ) .append( html.h3.clone() .html( "Division Description" ),           html.div.clone() .prop( "id", "descriptionWidget" ));
		var forms       = e.forms       = html.div.clone() .attr( "data-role", "collapsible" ) .attr( "data-theme", "b" ) .css( "width", "100%" ) .append( html.h3.clone() .html( "Please Select Forms" ),            html.div.clone() .prop( "id", "formsWidget" ));
		var judges      = e.judges      = html.div.clone() .attr( "data-role", "collapsible" ) .attr( "data-theme", "b" ) .css( "width", "100%" ) .append( html.h3.clone() .html( "Please Select Number of Judges" ), html.div.clone() .prop( "id", "judgesWidget" ));
		var accordian   = e.accordian   = html.div.clone() .attr( "data-role", "collapsibleset" ) .attr( "data-collapsed-icon", "carat-r" ) .attr( "data-expanded-icon", "carat-d" ) .attr( "data-corners", false );

		accordian.append( description, forms, judges );
		w .append( accordian );
	},
	_init: function( ) {
		var w = this.element;
		var o = this.options;
		var e = this.options.elements;

		var refresh = function( update ) {
			var tournament = JSON.parse( update.data );

			var handle = o.handlers = {
				judges : function( ev ) {
					var value  = $( ev.target ).val();
					var widget = e.judges.find( "h3 a" );
					widget.html( value );
					o.judges = parseInt( value );
				}
			};

			var initialize = o.initialize = {
				// ============================================================
				// INITIALIZE DESCRIPTION
				// ============================================================
				description : function() {
					var widget = e.description.find( "#descriptionWidget" );
					widget.divisionDescriptor( { header : { o : o, e : e }} );

					initialize.forms();
				},

				// ============================================================
				// INITIALIZE FORMS
				// ============================================================
				forms : function() {
					var widget = e.description.find( "#descriptionWidget" );
					o.description = widget.divisionDescriptor( 'option', 'description' );

					widget = e.forms.find( "#formsWidget" );
					widget.empty();
					var options = { header : { o : o, e : e } };
					if( defined( o.description )) {
						options.age  = o.description.age;
						options.rank = o.description.rank;
						if( defined( o.forms )) { options.forms = o.forms; }
					}

					widget.formSelector( options );
					widget.find( "[data-role='controlgroup']" ).controlgroup().controlgroup( "refresh" );
					var selected = widget.formSelector( 'option', 'selected' );
					if( ! defined( selected )) { e.forms.find( "h3 a" ).html( "Please Select Forms" ); } else
					                           { e.forms.find( "h3 a" ).html( selected.description ); }
				},
				judges : function() {
					var widget = e.judges.find( "#judgesWidget" );
					widget.empty();
					widget.append( addButtonGroup( "Judges", [ '3 Judges', '5 Judges', '7 Judges' ], handle.judges ) );
					widget.addClass( "ui-field-contain" );
					widget.find( "[data-role='controlgroup']" ).controlgroup().controlgroup( "refresh" );
					if( defined( o.judges )) {
						widget.find( ":checked" ).prop( "checked", false );
						widget.find( ":radio[value='" + o.judges + " Judges']" ).prop( "checked", true );
						widget.trigger( "create" );
						widget.children().controlgroup( "refresh" );
						e.judges.find( "h3 a" ).html( o.judges + " Judges" );
					} else {
					}
				}
			};

			initialize.description();
			initialize.judges();
		}

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	}
});
