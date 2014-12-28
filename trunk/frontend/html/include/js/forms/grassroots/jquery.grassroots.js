$.widget( "freescore.grassroots", {
	options: { autoShow: true },
	_create: function() {
		var o           = this.options;
		var e           = this.options.elements = {};
		var widget      = this.element;
		var html        = { div : $( "<div />" ) };
		var leaderboard = e.leaderboard = html.div.clone() .addClass( "leaderboard back" );
		var scoreboard  = e.scoreboard  = html.div.clone() .addClass( "scoreboard front" );
		var usermessage = e.usermessage = html.div.clone() .addClass( "usermessage" );
		var card        = e.card        = html.div.clone() .addClass( "card" );

		card .append( leaderboard, scoreboard );
		widget .addClass( "grassroots flippable" );
		widget .append( card, usermessage );
	},
	_init: function( ) {
		var e = this.options.elements;
		var o = this.options;

		function refresh( update ) {
			var forms    = JSON.parse( update.data );
			var division = forms.divisions[ parseInt( forms.current ) ];
			var athlete  = division.athletes[ division.current ];
			if( defined( division.error )) {
				e.card.fadeOut();
				e.usermessage.html( division.error );
				e.usermessage.fadeIn( 500 );

			} else if( defined( division.tied )) {
				var tied = division.tied.shift();
				e.card.fadeOut();
				e.usermessage.html( "Tie for " + tied.place );
				e.usermessage.fadeIn( 500, function() {
					e.usermessage.delay( 5000 ).fadeOut( 500, function() {
						e.scoreboard.scoreboard( { current: { athlete : athlete }, judges : division.judges } );
						e.card.fadeIn();
					});
				});
				
			} else if( division.state == 'display' ) {
				if( ! e.card.hasClass( 'flipped' )) { e.card.addClass( 'flipped' ); }
				e.leaderboard.leaderboard( { division : division } );

			} else {
				if( e.card.hasClass( 'flipped' )) { e.card.removeClass( 'flipped' ); }
				e.scoreboard.scoreboard( { current: { athlete : athlete }, judges : division.judges } );
			}
		};

		e.source = new EventSource( '/cgi-bin/freescore/forms/grassroots/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );

	}
});
