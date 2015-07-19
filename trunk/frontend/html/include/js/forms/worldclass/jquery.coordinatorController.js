$.widget( "freescore.coordinatorController", {
	options: { autoShow: true },
	_create: function() {
		var o      = this.options;
		var e      = this.options.elements = {};
		var widget = this.element;
		var html   = e.html  = FreeScore.html;

		widget.nodoubletapzoom();

		o.num     = parseInt( $.cookie( "judge" )) - 1;
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
			var forms      = JSON.parse( update.data );
			var division   = forms.divisions[ 0 ];
		};
		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	}
});
