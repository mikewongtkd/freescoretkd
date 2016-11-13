$.widget( "freescore.presentationButtons", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var o    = this.options;
		var w    = this.element;
		var e    = this.options.elements = {};
		var html = e.html = FreeScore.html;

		o.value = 1.2;

		var label      = e.label  = html.div.clone() .addClass( "pb-label" ) .html( o.label ) .css({ color: '#ccc' });
		var button     = e.button = {
			group : html.div.clone() .addClass( 'btn-group' ) .attr({ 'data-toggle' : 'buttons' })
		};
		w.append( label, button.group );
		w.addClass( "presentationButtons" );
	},
	_init: function( ) {
		var o    = this.options;
		var w    = this.element;
		var e    = this.options.elements;
		var html = e.html;

		var controller = o.controller;
		var context    = {
			lower: () => { 
					var buttons = [];
					for( var i = 0.5; i < 0.9; i += 0.1 ) { buttons.push( addButton( i.toFixed( 1 ))); }
					buttons.push( addButton( 'middle' ));
					e.button.group.empty().append( buttons.reverse() );
			},
			middle: () => {
				var buttons = [];
				buttons.push( addButton( 'lower' ));
				for( var i = 1.0; i < 1.6; i += 0.1 ) { buttons.push( addButton( i.toFixed( 1 ))); }
				buttons.push( addButton( 'higher' ));
				e.button.group.empty().append( buttons.reverse() );
			},
			higher: () => {
				var buttons = [];
				buttons.push( addButton( 'middle' ));
				for( var i = 1.6; i < 2.1; i += 0.1 ) { buttons.push( addButton( i.toFixed( 1 ))); }
				e.button.group.empty().append( buttons.reverse() );
			}
		};
		var addButton  = function( value ) {
			var button = {
				label : html.label.clone() .addClass( 'btn btn-xs btn-default' ),
				radio : html.radio.clone() .attr({ name : o.name })
			};
			if( isNaN( value )) { button.label.addClass( 'context' ); }

			if        ( value == 'lower' )  { button.label.click( context.lower );
			} else if ( value == 'middle' ) { button.label.click( context.middle );
			} else if ( value == 'higher' ) { button.label.click( context.higher );
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
		var w = this.element;
		w.find( ".active" ).removeClass( "active" );
		w.find( 'label:contains("1.2")' ).click();
	},
	value: function() {
		var o = this.options;
		return parseFloat( o.value ).toFixed( 1 );
	}
});
