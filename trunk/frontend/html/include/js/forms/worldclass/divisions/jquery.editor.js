
$.widget( "freescore.editor", {
	options: { autoShow: true, port : ':3088/' },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};
		var w = this.element;

		var html      = e.html      = FreeScore.html;
		var header    = e.header    = html.div.clone() .addClass( "config" );
		var athletes  = e.athletes  = html.div.clone();

		w .empty();
		w .append( header, athletes );
		w .addClass( "division" );

	},

	_init: function() {
		var e       = this.options.elements;
		var o       = this.options;
		var w       = this.element;
		var html    = e.html;

		// ============================================================
		function refreshEditor( update ) {
		// ============================================================
			var tournament = JSON.parse( update.data );
			var ring       = $.grep( tournament.divisions, function( division ) { return division.ring == o.ring; });
			var division   = o.division = ring[ o.divindex ];
			var n          = defined( o.division.athletes ) ? o.division.athletes.length : 0;

			if( ! defined( division )) { return; }

			e.header.header({ 
				server:     o.server,
				port:       ':3088/',
				tournament: o.tournament,
				ring:       o.ring,
				division:   o.divindex, 
				text:       division.description, 
				forms:      division.forms, 
				judges:     division.judges, 
				athletes:   n,
			});

			e.athletes.athletes({
				server:     o.server,
				port:       ':3088/',
				tournament: o.tournament,
				division:   division
			});
		};

		// ============================================================
		// Behavior
		// ============================================================
		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refreshEditor, false );

	},
});
