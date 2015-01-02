$.widget( "freescore.grassroots", {
	options: { autoShow: true },
	_create: function() {
		var o           = this.options;
		var e           = this.options.elements = {};
		var widget      = this.element;
		var html        = { div : $( "<div />" ) };
		var leaderboard = e.leaderboard = html.div.clone() .addClass( "back" );
		var scoreboard  = e.scoreboard  = html.div.clone() .addClass( "front" );
		var tiebreaker  = e.tiebreaker  = html.div.clone() .addClass( "front" );
		var usermessage = e.usermessage = html.div.clone() .addClass( "usermessage" );
		var card        = e.card        = html.div.clone() .addClass( "card" );

		card .append( leaderboard, scoreboard, tiebreaker );
		widget .addClass( "grassroots flippable" );
		widget .append( card, usermessage );
	},
	_init: function( ) {
		var e = this.options.elements;
		var o = this.options;

		function refresh( update ) {
			var forms    = JSON.parse( update.data );
			var division = forms.divisions[ parseInt( forms.current ) ];
			console.log( division );
			var athlete  = division.athletes[ division.current ];

			o.tiecache   = defined( division.tied ) ? division.tied[ 0 ] : o.tiecache;
			if( defined( division.error )) {
				e.card.fadeOut();
				e.usermessage.html( division.error );
				e.usermessage.fadeIn( 500 );

			} else if( division.state == 'tiebreaker' ) {
				if( e.card.hasClass( 'flipped' )) { e.card.removeClass( 'flipped' ); }
				var tie      = defined( division.tied ) ? division.tied.shift() : o.tiecache;
				var athletes = tie.tied.map( function( i ) { return division.athletes[ i ]; });
				var title    = ordinal( tie.place ) + ' Place Tiebreaker';
				// ===== SHOW TIEBREAKER BY VOTE
				if( tie.tied.length == 2 ) {
					e.scoreboard.hide();
					e.tiebreaker.show();
					e.tiebreaker.voteDisplay({ title: title, athletes : athletes, judges : division.judges });

				// ===== SHOW TIEBREAKER BY SCORE
				} else {
					e.scoreboard.show();
					e.tiebreaker.hide();
					e.scoreboard.scoreboard( { title: title, current: { athlete : athlete }, judges : division.judges } );
				}
				
			} else if( division.state == 'display' ) {
				if( ! e.card.hasClass( 'flipped' )) { e.card.addClass( 'flipped' ); }
				e.leaderboard.leaderboard( { division : division } );

			} else {
				if( e.card.hasClass( 'flipped' )) { e.card.removeClass( 'flipped' ); }
				e.scoreboard.show();
				e.tiebreaker.hide();
				e.scoreboard.scoreboard( { current: { athlete : athlete }, judges : division.judges } );
			}
		};

		e.source = new EventSource( '/cgi-bin/freescore/forms/grassroots/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );

	}
});
