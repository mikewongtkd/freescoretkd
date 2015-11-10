$.widget( "freescore.header", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var w    = this.element;
		var o    = this.options;
		var e    = this.options.elements = {};
		var html = e.html = FreeScore.html;

		var accept      = e.accept = {
			button   : html.a  .clone() .addClass( "ui-btn ui-btn-icon-left ui-icon-carat-l" ) .html( "Accept Division" ) .css({ 'color': 'white', 'text-shadow': '0 1px 0 #030', 'background-color': '#090', 'margin':'-1px' }) .attr({ href : 'javascript: close()' })
		};

		var description = e.description = html.div.clone() .attr({ 'data-role': 'collapsible', 'data-theme': 'b' }) .css( "width", "100%" ) .append( html.h3.clone() .html( "Division Description" ),           html.div.clone() .prop( "id", "descriptionWidget" ));
		var forms       = e.forms       = html.div.clone() .attr({ 'data-role': 'collapsible', 'data-theme': 'b' }) .css( "width", "100%" ) .append( html.h3.clone() .html( "Please Select Forms" ),            html.div.clone() .prop( "id", "formsWidget" ));
		var judges      = e.judges      = html.div.clone() .attr({ 'data-role': 'collapsible', 'data-theme': 'b' }) .css( "width", "100%" ) .append( html.h3.clone() .html( "Please Select Number of Judges" ), html.div.clone() .prop( "id", "judgesWidget" ));
		var accordian   = e.accordian   = html.div.clone() .attr({ 'data-role': 'collapsibleset', 'data-collapsed-icon': 'edit', 'data-expanded-icon': 'gear', 'data-corners': false }) .css({ margin: 0 });
		var error       = e.error       = html.div.clone() .hide();
		var sound       = e.sound       = {};

		sound.ok    = new Howl({ urls: [ "/freescore/sounds/upload.mp3",   "/freescore/sounds/upload.ogg" ]});
		sound.error = new Howl({ urls: [ "/freescore/sounds/quack.mp3",    "/freescore/sounds/quack.ogg" ]});

		// ============================================================
		var editDivision = o.editDivision = function( divisionData ) {
		// ============================================================
			var url    = 'http://' + o.server + o.port + o.tournament.db + '/' + o.ring + '/' + o.division + '/edit';
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

		accordian.append( error, description, forms, judges );
		w .append( accept.button, accordian );

		// ============================================================
		var updateHeader = o.updateHeader = function( data ) {
		// ============================================================
			var url    = 'http://' + o.server + o.port + o.tournament.db + '/' + o.ring + '/' + o.division + '/edit';
			$.ajax( {
				type:      'POST',
				url:       url,
				dataType:  'json',
				data:      JSON.stringify( { header : data }),
				success: function( response ) { 
					// Server-side error
					if( defined( response.error )) {
						e.sound.error.play();
						console.log( response.error );

					// All OK
					} else {
						e.sound.ok.play(); 
					}
				},
				error:   function( response ) { 
					// Network error
					e.sound.error.play(); 
					console.log( 'Network Error: Unknown network error.' );
				}, 
			});
		}

		var handle = o.handle = {
			description : {
				ok : function( ev ) {
					var widget      = e.description.find( "#descriptionWidget" );
					var description = widget.divisionDescriptor( 'option', 'description' );
					o.updateHeader({ description : description.text });
					o.description = description.text;
					e.description.collapsible( "option", "collapsed", true );
				},
				cancel : function() {
					e.description.collapsible( "option", "collapsed", true );
				}
			},
			forms : { 
				ok : function( ev ) {
					var widget   = e.forms.find( "#formsWidget" );
					var selected = widget.formSelector( 'option', 'selected' );
					var data     = {};
					if( selected.prelim.length > 0 ) { data.prelim = selected.prelim.map( function( item ) { return { name : item, type : 'compulsory' }; }); }
					if( selected.semfin.length > 0 ) { data.semfin = selected.semfin.map( function( item ) { return { name : item, type : 'compulsory' }; }); }
					if( selected.finals.length > 0 ) { data.finals = selected.finals.map( function( item ) { return { name : item, type : 'compulsory' }; }); }
					o.updateHeader({ forms : data });
					o.forms = selected.text;
					e.forms.collapsible( "option", "collapsed", true );
				},
				cancel : function() {
					e.forms.collapsible( "option", "collapsed", true );
				}
			},
			judges : function( ev ) {
				var value  = $( ev.target ).val();
				var widget = e.judges.find( "h3 a" );
				o.judges   = parseInt( value );
				o.updateHeader({ judges : o.judges });
				widget.html( value );
			}
		};
	},

	_init: function( ) {
		var w = this.element;
		var o = this.options;
		var e = this.options.elements;

		$( "[data-role='collapsible']" ).collapsible( {
			collapse: function( ev, ui ) {
				$( this ) .children() .next() .slideUp( 250 );
			},
			expand: function( ev, ui ) {
				$( this ) .children() .next() .hide();
				$( this ) .children() .next() .slideDown( 250 );
			},
		});


		var initialize = o.initialize = {
			// ============================================================
			// INITIALIZE DESCRIPTION
			// ============================================================
			description : function() {
				var widget = e.description.find( "#descriptionWidget" );
				widget.divisionDescriptor( { header : { o : o, e : e }, handle : o.handle.description } );
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
				var options = { header : { o : o, e : e }, athletes : o.athletes, handle : o.handle.forms };
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
				widget.append( addButtonGroup( "Judges", [ '3 Judges', '5 Judges', '7 Judges' ], o.handle.judges ) );
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
