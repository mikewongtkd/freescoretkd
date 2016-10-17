$.widget( "freescore.presentationButtons", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var o    = this.options;
		var w    = this.element;
		var e    = this.options.elements = {};
		var html = e.html = FreeScore.html;

		o.value = 1.2;

		var controller = o.controller;
		var label      = e.label     = html.div.clone() .addClass( "pb-label" ) .html( o.label ) .css({ color: '#ccc' });
		var button     = {
			group : html.div.clone() .addClass( 'btn-group' ) .attr({ 'data-toggle' : 'buttons' })
		};
		var addButton = function( value ) {
			var button = {
				label : html.label.clone() .addClass( 'btn btn-xs btn-default' ),
				radio : html.radio.clone() .attr({ name : o.name })
			};

			button.label.click( function() { 
				o.value = value; 
				$( controller.element ).trigger({ type : 'updateRequest', score :controller.options });
			});

			button.label.append( button.radio, value );
			return button.label;
		};
		var buttons = [];
		for( var i = 0.5; i < 2.1; i += 0.1 ) { buttons.push( addButton( i.toFixed( 1 ))); }
		button.group.append( buttons.reverse() );

		w.append( label, button.group );
		w.addClass( "presentationButtons" );
	},
	_init: function( ) {
		var o = this.options;
		var w = this.element;
		var e = this.options.elements;

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
