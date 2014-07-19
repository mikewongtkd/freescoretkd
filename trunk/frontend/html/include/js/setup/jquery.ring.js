$.widget( "freescore.ring", {
	options: { autoShow: true },
	_create: function() {
		var o        = this.options;
		var e        = this.options.elements = {};
		var w        = this.element;
		var html     = o.html     = { div : $( "<div />" ), h1 : $( "<h1 />" ), p : $( "<p />" ) };

		w.append( html.h1.clone().html( "Register This Device" ));
		w.append( html.p.clone().html( "Ring: <form><select><option value=1>1</option></select></form>" ));
		
		w.addClass( "ring" );
	},
	_init: function( ) {
		var o = this.options;
		var e = this.options.elements;
		var w = this.element;
	}
});
