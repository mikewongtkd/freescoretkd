$.widget( "freescore.register", {
	options: { autoShow: true },
	_create: function() {
		var o         = this.options;
		var e         = this.options.elements = {};
		var w         = this.element;
		var html      = o.html     = { div : $( "<div />" ), h1 : $( "<h1 />" ), p : $( "<p />" ), form : $( "<form />" ), select : $( "<select />" ), option : $( "<option />" ), submit : $( "<input type='button' />" ) };

		var h1        = html.h1.clone() .html( "Register This Device" );
		var text      = html.p.clone() .html( "Choose your ring number: " );

		var rings     = 0;
		var width     = o.tournament.rings.width;
		var height    = o.tournament.rings.height;
		var floorplan = html.div.clone() .addClass( "floorplan" ) .css( "width", width * 200 ) .css( "height", height * 200 );

		var addRing   = function( num, x, y ) {
			var mat          = html.div.clone() .addClass( "mat" );
			var playingField = html.div.clone() .addClass( "playing-field" ) .html( num );
			mat.attr( "num", num );
			mat.css( "opacity", 0.5 );
			mat.animate( { left: x, top: y, opacity: 1.0 } );
			mat.append( playingField );
			return mat;
		}
		for( var y = 0; y < height; y++ ) {
			for( var x = 0; x < width; x++ ) {
				rings++;
				if( rings > o.tournament.rings.count  ) { continue; }
				var xpos = x * 200;
				var ypos = y * 200;
				if( o.tournament.rings.formation == "loop" && height == 2) { // formation = [loop|rows]
					var half = o.tournament.rings.count / 2;
					xpos = rings > half ? (half - (x + 1)) * 200 : xpos;
				}

				if( o.tournament.rings.count % 2 ) { // If there is an odd ring
					if        ( width > height ) {
						if( rings == Math.round( o.tournament.rings.count/2 ) && rings % 2 ) { ypos += 100; } // center the odd ring
					} else if ( height > width ) {
						if( rings == o.tournament.rings.count && rings % 2 ) { xpos += 100; } // center the odd ring
					}
				}
				var ring = addRing( rings, xpos, ypos );
				floorplan.append( ring );
			}
		}
		
		w.append( h1, text, floorplan );
		w.addClass( "register" );
	},
	_init: function( ) {
		var o = this.options;
		var e = this.options.elements;
		var w = this.element;
	}
});
