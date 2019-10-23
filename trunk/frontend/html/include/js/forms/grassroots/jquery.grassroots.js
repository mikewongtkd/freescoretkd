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
		var card        = e.card        = html.div.clone() .addClass( "card" );

		card .append( leaderboard, scoreboard, tiebreaker );
		widget .addClass( "grassroots flippable" );
		widget .append( card );
	},
	_init: function( ) {
		var e = this.options.elements;
		var o = this.options;
		refresh( o.progress );

		function refresh( progress ) {
			var division = new Division( progress.divisions.find((d) => { return d.name == progress.current; }));
			var athletes = division.athletes();
			var athlete  = division.current.athlete();

			console.log( division.state.is );
			if( division.error() ) {
				e.card.fadeOut();
				e.alertify( division.error() );

			} else if( division.state.is.tiebreaker() ) {
				if( e.card.hasClass( 'flipped' )) { e.card.removeClass( 'flipped' ); }
				var a     = division.is.tied() ? division.tied.athletes() : o.tiecache.tied.map( i => athletes[ i ] );
				var title = ordinal( tie.place ) + ' Place Tiebreaker';

				// ===== SHOW TIEBREAKER BY VOTE
				if( tie.tied.length == 2 ) {
					e.scoreboard.hide();
					e.tiebreaker.show();
					e.tiebreaker.voteDisplay({ title: title, athletes : a, judges : division.judges() });

				// ===== SHOW TIEBREAKER BY SCORE
				} else {
					e.scoreboard.show();
					e.tiebreaker.hide();
					e.scoreboard.scoreboard( { title: title, current: { athlete : athlete }, judges : division.judges() } );
				}
				
			} else if( division.is.single.elimination() && division.state.is.score() ) {
				if( e.card.hasClass( 'flipped' )) { e.card.removeClass( 'flipped' ); }

				var brackets = division.brackets();
				var a        = [];
				var i        = division.current.athleteId();
				var j        = 0;
				while( i >= brackets[ j ].length ) { i -= brackets[ j ].length; j++; }
				var bracket  = brackets[ j ][ i ];

				var blue = athletes[ bracket.blue.athlete ];
				var red  = defined( bracket.red.athlete ) ? athletes[ bracket.red.athlete ] : { name : '<span style="opacity: 0.5;">Bye</span>' };
				a.push({ name : blue.display.name(), votes : bracket.blue.votes });
				a.push({ name : red.display.name(),  votes : bracket.red.votes });

				e.scoreboard.hide();
				e.tiebreaker.show();
				e.tiebreaker.voteDisplay({ title: title, athletes : a, judges : division.judges() });

			} else if( division.state.is.display() ) {
				
				if( ! e.card.hasClass( 'flipped' )) { e.card.addClass( 'flipped' ); }

				if( defined( division.mode ) && division.mode == 'single-elimination' ) {
					var i        = division.current;
					var j        = 0;
					while( i >= division.brackets[ j ].length ) { i -= division.brackets[ j ].length; j++; }
					var bracket  = division.brackets[ j ][ i ];
					console.log( 'SHOW BRACKET', i, j );
					e.leaderboard.leaderboard( { division : division, round: j, current: i });
				} else {
					e.leaderboard.leaderboard( { division : division } );
				}

			} else {
				if( e.card.hasClass( 'flipped' )) { e.card.removeClass( 'flipped' ); }
				e.scoreboard.show();
				e.tiebreaker.hide();
				e.scoreboard.scoreboard( { current: { athlete : athlete }, judges : division.judges } );
			}
		};

	}
});
