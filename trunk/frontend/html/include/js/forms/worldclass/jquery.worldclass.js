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
		var e  = this.options.elements;
		var o  = this.options;
		var ws = e.ws = new WebSocket( 'ws://' + o.server + '/worldclass/request/' + o.tournament.db + '/' + o.ring );
		e.leaderboard.leaderboard();
		e.scoreboard.scoreboard();

		ws.onopen = function() {
			var request  = { data : { type : 'division', action : 'read' }};
			request.json = JSON.stringify( request.data );
			ws.send( request.json );
		}

		ws.onmessage = function( response ) {
			var update = JSON.parse( response.data );
			if( update.type != 'division' || update.action != 'update' ) { return; } // Ignore all messages other than current division updates

			// ===== EXTRACT THE DIVISION DATA FROM A DIVISION UPDATE OR RING UPDATE
			var division     = undefined;
			if( defined( update.division )) { division = new Division( update.division ); } else
			if( defined( update.ring     )) { division = new Division( update.ring.divisions.find((d) => { return d.name == update.ring.current; })); }
			else                            { return; }

			// Ignore the update if the digest is the same as previous (i.e. the update contains no changes)
			if( defined( o.digest ) && response.digest == o.digest ) { return; } else { o.digest = response.digest; }

			if( response.error ) {
				e.card.hide();
				e.usermessage.errormessage({ message : response.error });
				
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
	}
});
