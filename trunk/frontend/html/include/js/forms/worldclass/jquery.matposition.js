$.widget( "freescore.matposition", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements = {};
		var html   = e.html = { div : $( "<div />" ) };

		var mat    = e.mat    = html.div.clone() .addClass( "mat" );
		var label  = e.label  = html.div.clone() .addClass( "label" ) .html( "Athlete Start Position<br><span>Front</span>" );
		var layer  = e.layer  = html.div.clone() .addClass( "layer" );
		var center = e.center = html.div.clone() .addClass( "center" );
		var start  = e.start  = html.div.clone() .addClass( "start" ) .html( '&#x2715;' ) .hide();

		o.dx = 12;
		o.dy = 20;

		widget.append( mat );
		mat.append( center, label, start, layer );
		widget.addClass( "matposition" );

		// ============================================================
		// BEHAVIOR
		// ============================================================
		layer.click( function( ev ) {
			var position = widget.offset();
			var x = (ev.clientX - (position.left + o.dx)).toFixed( 0 );
			var y = (ev.clientY - (position.top  + o.dy)).toFixed( 0 );
			console.log( ev, position );
			e.start.fadeOut( 250, function() { 
				e.start.css( 'left', x );
				e.start.css( 'top', y );
				e.start.fadeIn( 250 ); 
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
