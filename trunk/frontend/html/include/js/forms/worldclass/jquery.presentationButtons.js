$.widget( "freescore.presentationButtons", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var o    = this.options;
		var w    = this.element;
		var e    = this.options.elements = {};
		var html = e.html = FreeScore.html;

		o.value = 1.2;

		var panel  = e.panel  = html.div.clone() .addClass( "pb-panel" );
		var label  = e.label  = html.div.clone() .addClass( "pb-label" ) .html( o.label ) .css({ color: '#ccc' });
		var button = e.button = {
			group : html.div.clone() .addClass( 'btn-group' ) .attr({ 'data-toggle' : 'buttons' })
		};
		panel.append( label, button.group );
		w.append( panel );
		w.addClass( "presentationButtons" );
	},
	_init: function( ) {
		var o    = this.options;
		var w    = this.element;
		var e    = this.options.elements;
		var html = e.html;

		var controller = o.controller;
		var context    = o.context = {
			lower: () => { 
				e.button.group.fadeOut( 400, () => {
					var buttons = [];
					for( var i = 0.5; i < 1.0; i += 0.1 ) { buttons.push( addButton( i.toFixed( 1 ))); }
					buttons.push( addButton( 'middle' ));
					e.button.group.empty().append( buttons.reverse() ).fadeIn();
					e.button.group.addClass( 'low' );
				});
			},
			middle: () => {
				e.button.group.fadeOut( 400, () => {
					var buttons = [];
					buttons.push( addButton( 'lower' ));
					for( var i = 1.0; i < 1.6; i += 0.1 ) { buttons.push( addButton( i.toFixed( 1 ))); }
					buttons.push( addButton( 'higher' ));
					e.button.group.empty().append( buttons.reverse() ).fadeIn();
					e.button.group.removeClass( 'low high' );
				});
			},
			higher: () => {
				e.button.group.fadeOut( 400, () => {
					var buttons = [];
					buttons.push( addButton( 'middle' ));
					for( var i = 1.5; i < 2.1; i += 0.1 ) { buttons.push( addButton( i.toFixed( 1 ))); }
					e.button.group.empty().append( buttons.reverse() ).fadeIn();
					e.button.group.addClass( 'high' );
				});
			}
		};
		var addButton  = o.addButton = function( value ) {
			var button = {
				label : html.label.clone() .addClass( 'btn btn-xs btn-default' ),
				radio : html.radio.clone() .attr({ name : o.name })
			};
			if( isNaN( value )) { button.label.addClass( 'context' ); }

			if        ( value == 'lower' )  { button.label.addClass( "context" ); button.label.click( context.lower );
			} else if ( value == 'middle' ) { button.label.addClass( "context" ); button.label.click( context.middle );
			} else if ( value == 'higher' ) { button.label.addClass( "context" ); button.label.click( context.higher );
			} else {
				if( o.value == value ) { button.label.addClass( 'active' ); }
				button.label.click( function() { 
					o.value = value; 
					$( controller.element ).trigger({ type : 'updateRequest', score :controller.options });
				});
			}

			button.label.append( button.radio, value );
			return button.label;
		};
		context.middle();
	},
	reset: function() {
		var o = this.options;
		var e = this.options.elements;
		var w = this.element;

		var b = e.button.group;
		if( b.hasClass( "low" ) || b.hasClass( "high" )) { o.context.middle(); }

		w.find( ".active" ).removeClass( "active" );
		w.find( 'label:contains("1.2")' ).click();

		o.value = 1.2;
	},
	value: function() {
		var o = this.options;
		return parseFloat( o.value ).toFixed( 1 );
	}
});
