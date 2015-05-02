$.widget( "freescore.divisionHeader", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var w    = this.element;
		var o    = this.options;
		var e    = this.options.elements = {};
		var html = e.html = FreeScore.html;

		var description = e.description = html.div.clone() .attr( "data-role", "collapsible" ) .append( html.h3.clone() .html( "Division Description" ),           html.div.clone() .prop( "id", "descriptionWidget" ));
		var forms       = e.forms       = html.div.clone() .attr( "data-role", "collapsible" ) .append( html.h3.clone() .html( "Please Select Forms" ),            html.div.clone() .prop( "id", "formsWidget" ));
		var judges      = e.judges      = html.div.clone() .attr( "data-role", "collapsible" ) .append( html.h3.clone() .html( "Please Select Number of Judges" ), html.div.clone() .prop( "id", "judgesWidget" ));
		var actions     = e.actions     = html.div.clone() .attr( "data-role", "collapsible" ) .append( html.h3.clone() .html( "Actions" ),                        html.div.clone() .prop( "id", "actionsWidget" ));
		var accordian   = e.accordian   = html.div.clone() .attr( "data-role", "collapsibleset" );

		accordian.append( description, forms, judges, actions );
		w .append( accordian );
	},
	_init: function( ) {
		var w = this.element;
		var o = this.options;
		var e = this.options.elements;

		var refresh = function( update ) {
			var tournament = JSON.parse( update.data );

			var initialize = o.initialize = {
				// ============================================================
				// INITIALIZE DESCRIPTION
				// ============================================================
				description : function() {
					var widget = e.description.find( "#descriptionWidget" );
					widget.empty();

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
					}

					widget.formSelector( options );
					widget.find( "[data-role='controlgroup']" ).controlgroup().controlgroup( "refresh" );
					e.forms.find( "h3 a" ).html( "Please Select Forms" );
				}
			};

			initialize.description();
		}

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	}
});
