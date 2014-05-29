$.widget( "freescore.grassroots", {
	options: { autoShow: true, server: 'localhost' },
	_create: function() {
		var options     = this.options;
		var e           = this.options.elements = {};
		var html        = { div : $( "<div />" ) };
		var leaderboard = e.leaderboard = html.div.clone() .addClass( "leaderboard" );
		var scorekeeper = e.scorekeeper = html.div.clone() .addClass( "scorekeeper" );

		this.element .addClass( "grassroots" );
		this.element .append( leaderboard, scorekeeper );
	},
	_init: function( ) {
		var e = this.options.elements;
		var o = this.options;
		e.leaderboard.leaderboard( { division : { athletes : new Array() }} );
		e.scorekeeper.scorekeeper( { current : { athlete : { name : '', scores : new Array() }}} );
		e.scorekeeper.scorekeeper( 'fadeout' );
		e.leaderboard.leaderboard( 'fadeout' );

		function refresh( update ) {
			var division = JSON.parse( update.data );
			var athlete = division.athletes[ division.current ];
			if( division.state == 'display' ) {
				e.scorekeeper.scorekeeper( 'fadeout' );
				e.leaderboard.leaderboard( { division : division } );

			} else if( division.state == 'score' ) {
				e.leaderboard.leaderboard( 'fadeout' );
				e.scorekeeper.scorekeeper( { current: { athlete : athlete }} );
			}
		};

		e.source = new EventSource( 'update.php' );
		e.source.addEventListener( 'message', refresh, false );

	}
});
