
$.widget( "freescore.spinwheel", {
	options : { autoShow : true, min : 7.5, max : 10.0, step : 0.1, selected: 8.0 },
	_create : function() {
		var o          = this.options;
		var e          = this.options.elements = {};
		var widget     = this.element;
		var html       = o.html = { div : $( "<div />" ) };
		var precision  = Math.ceil( Math.abs( Math.log( o.step ) / Math.LN10 ));
		var height     = o.height = 60;
		var offset     = o.offset = o.height/2;
		var dampen     = o.dampen = 5;
		var controller = o.controller;

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
			var selected = (Math.round( dy/height ) * o.step) + o.min;
			if( selected >= o.max ) { selected = o.max - o.step; }
			if( selected <  o.min ) { selected = o.min; }
			return selected;
		};
		var velocity = function() {
			var start = o.swipe.start;
			var stop  = o.swipe.stop;
			var dx    = (stop.x - start.x);
			var dy    = (stop.y - start.y);
			var dt    = (stop.t - start.t)/100;
			var d     = Math.sqrt((dx * dx) + (dy * dy));
			var v     = dt == 0 ? 5 : Math.round( d/dt );
			var dir   = dy == 0 ? 0 : dy/Math.abs( dy );

			return { direction: dir, speed: v };
		};
		o.swipe = { active : false, start : {}, stop : {} };

		widget
		.mousedown( function( e ) {
			o.swipe.active = true;
			o.swipe.start = { x : e.pageX, y : e.pageY, t : (new Date()).getTime() };
			$( window ).mousemove( function( e ) {
				if( o.swipe.active ) {
					o.swipe.stop = { x : e.pageX, y : e.pageY, t : (new Date()).getTime() };
					v = velocity();
					var p = scroll( v );
				}
				$( window ).mouseup( function( e ) {
					o.swipe.active = false;
					o.selected = nearest();
					widget.scrollTop( scrollTarget );
					$( controller.element ).trigger( { type : "updateRequest", score : o.selected } );
					$( window ).unbind( 'mousemove' );
					$( window ).unbind( 'mouseup' );
				});
			});
		});

		widget.append( wheel );
		widget.animate({ scrollTop: scrollTarget() });
	},
	_init   : function() {
	}
});
