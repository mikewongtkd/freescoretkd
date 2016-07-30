$.widget( "freescore.errormessage", {
	options: { autoShow: true, message : ':' },
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

		var text  = o.message.split( ':', 2 );
		var error = { title: text[ 0 ], message: text[ 1 ], details : undefined };
		var code  = html.p.clone() .css( "color", "#fc0" ) .css( "font-family", "Monaco" );

		if( ! defined( error.title   )) { error.title   = ''; }
		if( ! defined( error.message )) { error.message = ''; }

		error.message = error.message.replace( /Can't/, "Can&apos;t" );
		error.message = error.message.replace( /'([^']+)'/,
		function( text ) {
			text = text.replace( /'/g, '' );
			return code.clone() .html( text ) [ 0 ].outerHTML;
		});
		var details = error.message.split( /at \/usr\/local\/freescore\/lib\/FreeScore\/Forms\/WorldClass\/Division\/Round.pm line 9\./ );
		error.details = details[ 1 ];
		error.message = error.message.replace( /at \/usr\/local\/freescore\/lib\/([\w\/]+\.pm) line (\d+)[^_]*$/,
			function( orig, module, line ) {
				module = module.replace( /\//g, "::" );
				module = module.replace( /\.pm/, "" );
				return "at line " + line + " in module " + code.clone().html( module ) [ 0 ].outerHTML;
			});
		error.message += "<p>Reconnecting to server...</p>";
		setTimeout( function() { location.reload(); }, 3500 );
		console.log( error );

		var dialog = html.div.clone() .attr( "data-role", "page" ) .attr( "data-dialog", "true" ) .attr( "data-close-btn", "none" );
		var header = html.div.clone() .attr( "data-role", "header" ) .attr( "data-position", "fixed" ) .css( "color", "white" ) .css( "background", "#900" ) .css( "text-shadow", "none" ) .addClass( "header" );
		var h1     = html.h1.clone();
		var p      = html.p.clone() .css( "font-size", "14pt" );
		var body   = html.div.clone() .attr( "role", "main" ) .addClass( "ui-content" ) .css( "background", "#333" ) .css( "text-shadow", "none" );

		header.append( h1.clone().html( "Error" ));
		body.append( h1.clone().html( error.title ) .css( "color", "#f90" ), p.html( error.message ) .css( "color", "white" ));
		dialog.append( header, body );
		dialog.enhanceWithin();
		w.empty();
		w.append( dialog ); 
		$.mobile.changePage( dialog );
		e.sound.error.play();
	}
});
