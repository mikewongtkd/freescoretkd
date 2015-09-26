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
			var forms    = JSON.parse( update.data );
			var division, current, athlete;
			if( defined( forms.divisions ) && defined( forms.current )) {
				division = forms.divisions[ forms.current ];
				if( defined( division )) {
					current = parseInt( division.current );
					athlete = division.athletes[ current ];
				}
			}

			if( forms.error ) {
				e.card.hide();
				e.usermessage.errormessage({ message : forms.error });
				
			} else if( division.state == 'display' ) {
				if( ! e.card.hasClass( 'flipped' )) { e.card.addClass( 'flipped' ); }
				e.leaderboard.leaderboard( { division : division } );

			} else {
				if( e.card.hasClass( 'flipped' )) { e.card.removeClass( 'flipped' ); }
				var odd = false;
				for( var i = 0; i < division.order[ division.round ].length; i++ ) {
					if( division.order[ division.round ][ i ] == current ) {
						odd = i % 2;
						break;
					}
				}
				e.scoreboard.scoreboard( { 
					judges : division.judges,
					current: { 
						name        : division.name, 
						round       : division.round, 
						description : division.description,
						form        : division.form, 
						forms       : division.forms[ division.round ], 
						odd         : odd,
						athlete     : athlete 
					}
				});
			}
		};

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );

	}
});
