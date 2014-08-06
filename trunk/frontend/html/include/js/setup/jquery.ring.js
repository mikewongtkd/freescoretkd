$.widget( "freescore.ring", {
	options: { autoShow: true },
	_create: function() {
		var o        = this.options;
		var e        = this.options.elements = {};
		var w        = this.element;
		var html     = o.html     = { div : $( "<div />" ), h1 : $( "<h1 />" ), p : $( "<p />" ), form : $( "<form />" ), select : $( "<select />" ), option : $( "<option />" ), submit : $( "<input type='button' />" ) };

		var h1     = html.h1.clone() .html( "Register This Device" );
		var text   = html.p.clone() .html( "Ring: " );
		var form   = html.form.clone();
		var select = html.select.clone();

		for( var i = 1; i <= o.tournament.rings; i++ ) {
			var option = html.option.clone() .prop( "value", i ) .html( i );
			select.append( option );
		}
		var submit = html.submit.clone() .prop( "value", "Register" );
		form.append( select, submit );
		text.append( form );
		
		w.append( h1, text );
		w.addClass( "ring" );
	},
	_init: function( ) {
		var o = this.options;
		var e = this.options.elements;
		var w = this.element;
	}
});
