$.widget( "freescore.worldclass", {
	options: { autoShow: true, server: 'localhost', judges: 3 },
	_create: function() {
		var o           = this.options;
		var e           = this.options.elements = {};
		var widget      = this.element;
		var html        = e.html        = FreeScore.html;
		var leaderboard = e.leaderboard = html.div.clone() .addClass( "back" );
		var brackets    = e.brackets    = html.div.clone() .addClass( "back" ) .hide();
		var scoreboard  = e.scoreboard  = html.div.clone() .addClass( "front" );
		var dualscores  = e.dualscores  = html.div.clone() .addClass( "front" ). hide();
		var usermessage = e.usermessage = html.div.clone();
		var card        = e.card        = html.div.clone() .addClass( "card" );

		card.append( leaderboard, scoreboard );
		widget .addClass( "worldclass flippable" );
		widget .append( card, usermessage );
	},
	_init: function( ) {
		var e = this.options.elements;
		var o = this.options;
		e.leaderboard.leaderboard();
		e.scoreboard.scoreboard();

		function refresh( update ) {
			var progress = JSON.parse( update.data );
			var division = undefined;
			if( defined( o.digest ) && progress.digest == o.digest ) { return; } else { o.digest = progress.digest; }
			if( defined( progress.divisions ) && defined( progress.current )) {
				var divisionData = progress.divisions[ progress.current ];
				if( defined( divisionData )) {
					division = new Division( divisionData );
				}
			}

			if( progress.error ) {
				e.card.hide();
				e.usermessage.errormessage({ message : progress.error });
				
			} else if( division.state.is.display() ) {
				if( ! e.card.hasClass( 'flipped' )) { e.card.addClass( 'flipped' ); }
				e.leaderboard.leaderboard( { division : division } );

			} else {
				if( e.card.hasClass( 'flipped' )) { e.card.removeClass( 'flipped' ); }
				var odd = false;
				for( var i = 0; i < division.current.order().length; i++ ) {
					if( division.current.order( i ) == division.current.athleteId() ) {
						odd = i % 2;
						break;
					}
				}
				e.scoreboard.scoreboard( { 
					judges : division.judges(),
					current: { 
						name        : division.name(), 
						round       : division.current.roundId(), 
						roundName   : division.current.round.display.name(),
						description : division.description(),
						form        : division.current.formId(), 
						forms       : division.form.list(), 
						odd         : odd,
						athlete     : division.current.athlete() 
					}
				});
			}
		};

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );

	}
});
