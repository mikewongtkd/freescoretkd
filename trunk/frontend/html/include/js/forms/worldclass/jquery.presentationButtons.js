$.widget( "freescore.presentationButtons", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements = {};
		var html   = e.html = FreeScore.html;

		o.value    = 1.2;

		var controller = o.controller;
		var label      = e.label     = html.div.clone() .html( o.label );
		var value      = e.value     = html.div.clone() .html( o.value );
		var button     = {
			group : html.div.clone() .addClass( 'btn-group' ) .attr({ 'data-toggle' : 'buttons' })
		};
		var addButton = function( value ) {
			var button = {
				label : html.label.clone() .addClass( 'btn btn-default' ),
				radio : html.radio.clone() .attr({ name : o.name })
			};

			button.label.append( button.radio, value );
			return button.label;
		};
		for( var i = 2.0; i >= 0.5; i -= 0.1 ) { 
			button.group.append( addButton( i ));
		}

		widget.append( label, button.group );
		widget.addClass( "presentationButtons" );
	},
	_init: function( ) {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements;

	}
});
