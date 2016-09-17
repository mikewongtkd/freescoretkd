$.widget( "freescore.matposition", {
	options: { autoShow: true },
	_create: function() {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements = {};
		var html   = e.html = FreeScore.html;

		var ring   = e.ring   = html.div.clone() .addClass( "ring" );
		var label  = e.label  = html.div.clone() .addClass( "label" ) .html( "Touch to Mark Athlete Start Position" );
		var judges = e.judges = html.div.clone() .addClass( "judges" );
		var layer  = e.layer  = html.div.clone() .addClass( "layer" );
		var center = e.center = html.div.clone() .addClass( "center" );
		var start  = e.start  = html.div.clone() .addClass( "start-position" ) .html( '&#x2715;' ) .hide();

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
		ring.append( center, label, start, layer, judges );
		widget.addClass( "matposition" );

		o.dx   = 5;
		o.dy   = 22;
		// ============================================================
		// BEHAVIOR
		// ============================================================
		layer.click( function( ev ) {
			var position = widget.offset();
			var x = (ev.pageX - (position.left + o.dx)).toFixed( 0 );
			var y = (ev.pageY - (position.top  + o.dy)).toFixed( 0 );
			e.start.fadeOut( 250, function() { 
				e.start.css( 'left', x );
				e.start.css( 'top', y );
				e.start.fadeIn( 250 ); 
				e.label.fadeOut();
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
