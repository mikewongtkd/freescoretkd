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
		var accordian   = e.accordian   = html.div.clone() .attr( "data-role", "collapsibleset" ) .attr( "data-collapsed-icon", "edit" ) .attr( "data-expanded-icon", "gear" ) .attr( "data-corners", false );
		var error       = e.error       = html.div.clone() .hide();
		var sound       = e.sound       = {};

		sound.ok    = new Howl({ urls: [ "/freescore/sounds/upload.mp3",   "/freescore/sounds/upload.ogg" ]});
		sound.error = new Howl({ urls: [ "/freescore/sounds/quack.mp3",    "/freescore/sounds/quack.ogg" ]});

		accordian.append( error, description, forms, judges );
		w .append( accordian );
	},
	_init: function( ) {
		var w = this.element;
		var o = this.options;
		var e = this.options.elements;

		var handle = o.handlers = {
			judges : function( ev ) {
				var value  = $( ev.target ).val();
				var widget = e.judges.find( "h3 a" );
				widget.html( value );
				o.judges   = parseInt( value );
				var url    = 'http://' + o.server + o.port + o.tournament + '/' + o.ring + '/' + o.division + '/edit';
				$.ajax( {
					type:      'POST',
					url:       url,
					dataType:  'json',
					data:      { header : { judges : o.judges }},
					success: function( response ) { 
						// Server-side error
						if( defined( response.error )) {
							sound.error.play();
							error.show();
							error.errormessage({ message : response.error });

						// All OK
						} else {
							sound.ok.play(); 
						}
					},
					error:   function( response ) { sound.error.play(); progress.fadeOut( 100 ); }, // Network error
				});

			}
		};

		var initialize = o.initialize = {
			// ============================================================
			// INITIALIZE DESCRIPTION
			// ============================================================
			description : function() {
				var widget = e.description.find( "#descriptionWidget" );
				widget.divisionDescriptor( { header : { o : o, e : e }} );
				var placeholder = e.html.span.clone() .css( "color", "#999" ) .html( "Division Description" );
				var view        = e.description.find( "h3 a" );

				if( defined( o.text )) { view.html( o.text ); }
				else                   { view.html( placeholder ); }

				initialize.forms();
			},

			// ============================================================
			// INITIALIZE FORMS
			// ============================================================
			forms : function() {
				// Retrieve latest description
				var widget = e.description.find( "#descriptionWidget" );
				o.description = widget.divisionDescriptor( 'option', 'description' );

				// Update the forms widget
				widget = e.forms.find( "#formsWidget" );
				widget.empty();
				var options = { header : { o : o, e : e }, athletes : o.athletes };
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
				if( defined( o.judges )) {
					widget.find( ":checked" ).prop( "checked", false );
					widget.find( ":radio[value='" + o.judges + " Judges']" ).prop( "checked", true );
					e.judges.find( "h3 a" ).html( o.judges + " Judges" );
				} else {
				}
				widget.trigger( "create" );
				widget.find( "[data-role='controlgroup']" ).controlgroup().controlgroup( "refresh" );
			}
		};

		initialize.description();
		initialize.judges();
		e.accordian.collapsibleset().trigger( 'create' );
		e.accordian.collapsibleset( "refresh" );
	}
});
