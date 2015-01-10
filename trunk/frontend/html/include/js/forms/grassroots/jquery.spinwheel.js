
$.widget( "freescore.spinwheel", {
	options : { autoShow : true, min : 5.0, max : 10.0, step : 0.1, selected: 8.0 },
	_create : function() {
		var o          = this.options;
		var e          = this.options.elements = {};
		var widget     = this.element;
		var html       = o.html = { div : $( "<div />" ) };
		var precision  = Math.ceil( Math.abs( Math.log( o.step ) / Math.LN10 ));
		var height     = o.height = 60;
		var offset     = o.offset = o.height/2;
		var dampen     = o.dampen = 5;

		var wheel     = html.div.clone() .addClass( "wheel" );
		widget .addClass( "spinwheel" );
		for( var i = o.min; i < o.max; i+= o.step ) {
			var panel = html.div.clone() .addClass( "panel" ) .html( Number( i ).toFixed( precision ));
			panel.css( "top", (Math.round(((i - o.min)/o.step) * height )+offset));
			panel.css( "height", height );
			wheel .append( panel );
		}

		// ============================================================
		// BEHAVIOR
		// ============================================================
		var scroll   = function( v ) {
			var p = o.position + (v.direction * v.speed);
			if      ( p <    0 ) { o.position =    0; }
			else if ( p > 1600 ) { o.position = 1600; }
			else                 { o.position =    p; }
			widget.scrollTop( o.position );
			return o.position;
		}
		var scrollTarget = function() { 
			o.position = Math.round(((o.selected - o.min)/o.step) * o.height ); 
			return o.position;
		}
		var nearest   = function() { 
			var dy = o.position;
			var selected = (Math.round( dy/o.height ) * o.step) + o.min;
			if( selected >= o.max ) { selected = o.max - o.step; }
			if( selected <  o.min ) { selected = o.min; }
			return selected;
		};
		o.swipe = { last : 0 };

		widget.swipe({ 
			swipeStatus : function( ev, phase, direction, distance, duration, fingers ) {
				var v = { speed : distance - o.swipe.last, direction : 0 };
				if     ( direction == 'up'   ) { v.direction =  1; } 
				else if( direction == 'down' ) { v.direction = -1; }
				scroll( v );
				o.swipe.last = distance;
			}, 
			swipe : function( ev, direction, distance, duration, fingerCount, fingerData ) { 
				o.selected = nearest();             // Get nearest value
				widget.scrollTop( scrollTarget() ); // Scroll to it
				o.selected = nearest();             // Get the updated value
				widget.trigger( "updateRequest" );
			}, 
			threshold : 0 
		});

		widget.append( wheel );
		widget.animate({ scrollTop: scrollTarget() });
	},
	_init   : function() {
	}
});
