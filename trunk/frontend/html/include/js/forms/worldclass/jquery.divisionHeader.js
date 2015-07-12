$.widget( "freescore.divisionHeader", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var w    = this.element;
		var o    = this.options;
		var e    = this.options.elements = {};
		var html = e.html = FreeScore.html;

		var button     = e.button     = {
			'delete' : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "delete" ) .attr( "data-inline", true ) .attr( "data-mini", true ) .attr( "data-corners", true ) .css({ color: "white", background: "red",    textShadow: "2px 2px #600", width: "140px" }) .html( "Delete Division" ),
			'accept' : html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "check" )  .attr( "data-inline", true ) .attr( "data-mini", true ) .attr( "data-corners", true ) .css({ color: "white", background: "#3a3",   textShadow: "2px 2px #060", width: "140px" }) .html( "Accept Division" ),
		};

		var description = e.description = html.div.clone() .attr( "data-role", "collapsible" ) .attr( "data-theme", "b" ) .css( "width", "100%" ) .append( html.h3.clone() .html( "Division Description" ),           html.div.clone() .prop( "id", "descriptionWidget" ));
		var forms       = e.forms       = html.div.clone() .attr( "data-role", "collapsible" ) .attr( "data-theme", "b" ) .css( "width", "100%" ) .append( html.h3.clone() .html( "Please Select Forms" ),            html.div.clone() .prop( "id", "formsWidget" ));
		var judges      = e.judges      = html.div.clone() .attr( "data-role", "collapsible" ) .attr( "data-theme", "b" ) .css( "width", "100%" ) .append( html.h3.clone() .html( "Please Select Number of Judges" ), html.div.clone() .prop( "id", "judgesWidget" ));
		var accordian   = e.accordian   = html.div.clone() .attr( "data-role", "collapsibleset" ) .attr( "data-collapsed-icon", "edit" ) .attr( "data-expanded-icon", "gear" ) .attr( "data-corners", false );
		var error       = e.error       = html.div.clone() .hide();
		var sound       = e.sound       = {};
		e.dialog        = o.dialog;

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

		accordian.append( error, description, forms, judges );
		w .append( accordian, button.delete, button.accept );

		var updateHeader = o.updateHeader = function( data ) {
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
						// e.error.show();
						// e.error.errormessage({ message : response.error });

					// All OK
					} else {
						e.sound.ok.play(); 
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

		// ------------------------------------------------------------
		button.delete.click( function( ev ) {
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
		button.accept.click( function( ev ) {
		// ------------------------------------------------------------
			$( ":mobile-pagecontainer" ).pagecontainer( "change", "#ring-divisions?ring=" + o.ring, { transition : "slide", reverse : true });
		});
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
