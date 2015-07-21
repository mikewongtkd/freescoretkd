$.widget( "freescore.coordinatorController", {
	options: { autoShow: true },
	_create: function() {
		var o      = this.options;
		var e      = this.options.elements = {};
		var widget = this.element;
		var html   = e.html  = FreeScore.html;

		widget.nodoubletapzoom();

		o.ring    = parseInt( $.cookie( "ring" ));
		o.current = {};

	},
	_init: function( ) {
		var widget      = this.element;
		var e           = this.options.elements;
		var o           = this.options;
		var html        = e.html;
		var ordinal     = [ '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th' ];

		function refresh( update ) {
			var progress = JSON.parse( update.data ); if( ! defined( progress.divisions )) { return; }
			var division = progress.divisions[ progress.current ];

			if( ! defined( division )) { return; }
			console.log( division );

		};
		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	}
});
