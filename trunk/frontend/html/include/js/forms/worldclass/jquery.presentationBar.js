$.widget( "freescore.presentationBar", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements = {};
		var html   = e.html = { div : $( "<div />" ) };

		o.value    = 1.2;

		var judge     = o.controller.num;
		var score     = o.controller;
		var update    = o.controller.updateScore;
		var label     = e.label     = html.div.clone() .addClass( "label" ) .html( o.label );
		var value     = e.value     = html.div.clone() .addClass( "value" ) .html( o.value );
		var slider    = e.slider    = html.div.clone() .addClass( "slider" ) .slider( { value : o.value, min : 0.5, max : 2.0, step : 0.1, slide: function( e, ui ) { o.value = ui.value; value.html( ui.value.toFixed( 1 )); }, change: function() { update( judge, score ) }});
		e.buttons     = [];

		widget.append( label, slider, value );
		widget.addClass( "presentationBar" );
	},
	_init: function( ) {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements;
	}
});
