$.widget( "freescore.errormessage", {
	options: { autoShow: true },
	_create: function() {
		var o        = this.options;
		var e        = this.options.elements = {};
		var html     = o.html     = FreeScore.html;
		var sound    = e.sound    = {};

		sound.error = new Howl({ urls: [ "/freescore/sounds/quack.mp3",    "/freescore/sounds/quack.ogg" ]});
	},
	_init: function( ) {
		var o = this.options;
		var e = this.options.elements;
		var w = this.element;
		var html = o.html;

		var text = o.message.split( ':', 2 );
		var error = { title: text[ 0 ], message: text[ 1 ] };

		error.message = error.message.replace( /'([^']+)'/, "<code>$1</code>" );
		error.message = error.message.replace( /at \/usr\/local\/freescore\/lib\/([\w\/]+\.pm) line (\d+)[^_]*$/, 
		function( orig, module, line ) {
			module = module.replace( /\//g, "::" );
			module = module.replace( /\.pm/, "" );
			return "at line " + line + " in module <code>" + module + "</code>";
		});
		
		var dialog = html.div.clone() .attr( "data-role", "page" ) .attr( "data-dialog", "true" ) .attr( "data-close-btn", "none" );
		var header = html.div.clone() .attr( "data-role", "header" ) .attr( "data-position", "fixed" ) .attr( "data-theme", "b" ) .addClass( "header" );
		var h1     = html.h1.clone();
		var p      = html.p.clone();
		var body   = html.div.clone() .attr( "role", "main" ) .addClass( "ui-content" ) .css( "background", "#eee" );

		header.append( h1.clone().html( "Error" ));
		body.append( h1.clone().html( error.title ), p.html( error.message ));
		dialog.append( header, body );
		dialog.enhanceWithin();
		w.empty();
		w.append( dialog ); 
		$.mobile.changePage( dialog );
		e.sound.error.play();
	}
});
