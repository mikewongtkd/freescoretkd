function pad(number, length) {
	var str = '' + number;
	while (str.length < length) {str = '0' + str;}
	return str;
}

function formatTime(time) {
	time = time / 10;
	var min = parseInt(time / 6000),
		sec = parseInt(time / 100) - (min * 60),
		hundredths = pad(time - (sec * 100) - (min * 6000), 2);
	return (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2) + "." + hundredths;
}

$.widget( "freescore.matposition", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements = {};
		var html   = e.html = { div : $( "<div />" ) };

		var mat    = e.mat    = html.div.clone() .addClass( "mat" );
		var label  = e.label  = html.div.clone() .addClass( "label" ) .html( "Athlete Start Position" );
		var layer  = e.layer  = html.div.clone() .addClass( "layer" );
		var center = e.center = html.div.clone() .addClass( "center" );
		var start  = e.start  = html.div.clone() .addClass( "start-position" ) .html( '&#x2715;' ) .hide();
		var timer  = e.timer  = html.div.clone() .addClass( "timer" ) .html( "00:00.00" ) .hide();

		widget.append( mat );
		mat.append( center, label, start, layer, timer );
		widget.addClass( "matposition" );

		o.dx   = 5;
		o.dy   = 22;
		o.time = { increment : 70, current : 0, started : false };
		o.time.update = function() {
			e.timer.html( formatTime( o.time.current ));
			if( o.time.started ) { o.time.current += o.time.increment; }
		};
		o.reset = function() {
			o.time.current = 0;
			o.time.started = false;
			e.timer.html( formatTime( o.time.current ));
			e.timer.css( "opacity", 0.5 );
			e.timer.hide();
			e.label.show();
			e.start.hide();
		}

		// ============================================================
		// BEHAVIOR
		// ============================================================
		timer.click( function( ev ) {
			if( o.time.started ) {
				o.time.stopwatch.stop();
				o.time.started = false;
				e.timer.animate({ opacity : 0.50 });
			} else {
				o.time.stopwatch = $.timer( o.time.update, o.time.increment, true );
				o.time.started = true;
				e.timer.animate({ opacity : 0.25 });
			}
			return false;
		});
		layer.click( function( ev ) {
			var position = widget.offset();
			var x = (ev.pageX - (position.left + o.dx)).toFixed( 0 );
			var y = (ev.pageY - (position.top  + o.dy)).toFixed( 0 );
			e.start.fadeOut( 250, function() { 
				e.start.css( 'left', x );
				e.start.css( 'top', y );
				e.start.fadeIn( 250 ); 
				e.label.fadeOut();
				e.timer.fadeIn();
			});
			return false;
		});

	},
	_init: function( ) {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements;
	}
});
