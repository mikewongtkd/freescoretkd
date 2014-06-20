$.widget( "freescore.worldclass", {
	options: { autoShow: true, server: 'localhost', judges: 3 },
	_create: function() {
		var options     = this.options;
		var e           = this.options.elements = {};
		var html        = { div : $( "<div />" ) };
		var leaderboard = e.leaderboard = html.div.clone() .addClass( "leaderboard" );
		var scorekeeper = e.scorekeeper = html.div.clone() .addClass( "scorekeeper" );
		var usermessage = e.usermessage = html.div.clone() .addClass( "usermessage" );

		this.element .addClass( "worldclass" );
		this.element .append( leaderboard, scorekeeper, usermessage );
	},
	_init: function( ) {
		var e = this.options.elements;
		var o = this.options;
		e.leaderboard.leaderboard( { division : { athletes : new Array() }} );
		e.scorekeeper.scorekeeper( { judges: o.judges, current : { athlete : { name : '', scores : new Array() }}} );

		function refresh( update ) {
			var division = JSON.parse( update.data );
			var athlete = division.athletes[ division.current ];
			if( division.error ) {
				e.scorekeeper.scorekeeper( 'fadeout' );
				e.leaderboard.leaderboard( 'fadeout' );
				e.usermessage.html( division.error );
				e.usermessage.fadeIn( 500 );
				
			} else if( division.state == 'display' ) {
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
