$.widget( "freescore.presentationBar", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements = {};
		var html   = e.html = FreeScore.html;

		o.value    = 1.2;

		var controller = o.controller;
		var label      = e.label     = html.div.clone() .addClass( "pb-label" ) .html( o.label );
		var value      = e.value     = html.div.clone() .addClass( "value" ) .html( o.value );
		var slider     = e.slider    = html.div.clone() .addClass( "slider" ) .slider( { isRTL: true, value : o.value, min : 0.5, max : 2.0, step : 0.1, slide: function( e, ui ) { o.value = ui.value; value.html( ui.value.toFixed( 1 )); }, change: function() { $( controller.element ).trigger( { type : "updateRequest", score : controller.options } ); }});
		e.nudge        = {
			plus  : html.button.clone() .addClass( "nudge plus" ),
			minus : html.button.clone() .addClass( "nudge minus" ),
		};

		e.nudge.plus  .button({ icons: { primary : "ui-icon-plus" },  text : false});
		e.nudge.minus .button({ icons: { primary : "ui-icon-minus" }, text : false});
		e.nudge.plus  .click( function( ev ) { if( o.value < 2.0 ) { o.value += 0.1; e.slider.slider({ value : parseFloat( o.value )}); e.value.html( parseFloat( o.value ).toFixed( 1 )); }});
		e.nudge.minus .click( function( ev ) { if( o.value > 0.5 ) { o.value -= 0.1; e.slider.slider({ value : parseFloat( o.value )}); e.value.html( parseFloat( o.value ).toFixed( 1 )); }});

		widget.append( label, slider, value, e.nudge.plus, e.nudge.minus );
		widget.addClass( "presentationBar" );
	},
	_init: function( ) {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements;
		var judge  = o.controller.num;
		var score  = o.controller;
		e.slider.slider({ value : parseFloat( o.value )});
		e.value.html( parseFloat( o.value ).toFixed( 1 ));
	},
	reset: function() {
		var o = this.options;
		var e = this.options.elements;

		o.value = 1.2;
		e.slider.slider({ value : parseFloat( o.value )});
	},
	value: function() {
		var o = this.options;
		return parseFloat( o.value );
	}
});
