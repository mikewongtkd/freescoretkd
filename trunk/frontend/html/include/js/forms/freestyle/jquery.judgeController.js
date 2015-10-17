$.widget( "freescore.judgeController", {
	options: { autoShow: true },
	_create: function() {
		var o    = this.options;
		var w    = this.element;
		var e    = this.options.elements = {};
		var html = e.html  = FreeScore.html;

		widget.nodoubletapzoom();

		o.num     = parseInt( $.cookie( "judge" )) - 1;
		o.ring    = parseInt( $.cookie( "ring" ));
		o.current = {};

		widget.addClass( 'judgeController' );
	},
	_init: function( ) {
		var o       = this.options;
		var w       = this.element;
		var e       = this.options.elements;
		var html    = e.html;
		var ordinal = [ '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th' ];

		function refresh( update ) {
			var progress = JSON.parse( update.data ); if( ! defined( progress.divisions )) { return; }
			var division = progress.divisions[ 0 ]; // Judge updates are limited in scope to one judge, one division, to minimize data transfer
			if( ! defined( division )) { return; }

		};
		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	}
});
