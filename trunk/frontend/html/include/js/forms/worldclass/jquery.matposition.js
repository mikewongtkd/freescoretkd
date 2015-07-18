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
	options: { autoShow: true },
	_create: function() {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements = {};
		var html   = e.html = FreeScore.html;

		var ring   = e.ring   = html.div.clone() .addClass( "ring" );
		var label  = e.label  = html.div.clone() .addClass( "label" ) .html( "Athlete Start Position" );
		var judges = e.judges = html.div.clone() .addClass( "judges" );
		var layer  = e.layer  = html.div.clone() .addClass( "layer" );
		var center = e.center = html.div.clone() .addClass( "center" );
		var start  = e.start  = html.div.clone() .addClass( "start-position" ) .html( '&#x2715;' ) .hide();
		var timer  = e.timer  = html.div.clone() .addClass( "timer" ) .html( "00:00.00" ) .css( "opacity", 0.75 );

		// ===== 8x8 MATS
		for( var i = 0; i < 8; i++ ) {
			for( var j = 0; j < 8; j++ ) {
				var x = i * 22;
				var y = j * 22;
				if((i == 3 || i == 4) && (j == 3 || j == 4)) { continue; }
				var mat = html.div.clone() .addClass( "blue mat" );
				mat.css({ left: x, top : y });
				ring.append( mat );
			}
		}

		// ===== 2x2 CENTER
		for( var i = 0; i < 2; i++ ) {
			for( var j = 0; j < 2; j++ ) {
				var x = i * 22;
				var y = j * 22;
				var mat = html.div.clone() .addClass( "red mat" );
				mat.css({ left: x, top : y });
				center.append( mat );
			}
		}

		widget.append( ring );
		ring.append( center, label, start, layer, judges, timer );
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
			e.timer.css( "opacity", 0.75 );
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
				e.timer.animate({ opacity : 0.75 });
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
		var html   = e.html;

		// ===== JUDGE POSITIONS
		if( defined( o.judges )) {
			e.judges.empty();
			var judge = [];
			for( var i = 0; i < o.judges; i++ ) {
				var num = i == 0 ? 'R' : i;
				var who = i == o.judge ? "me" : "notme";
				var pos = "j" + o.judges + "" + num; // position
				judge[ i ] = html.div.clone() .addClass( "judge" ) .addClass( pos ) .addClass( who ) .html( num );
				e.judges.append( judge[ i ] );
			}
		}


	}
});
