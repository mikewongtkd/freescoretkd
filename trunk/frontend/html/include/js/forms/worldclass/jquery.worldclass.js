$.widget( "freescore.worldclass", {
	options: { autoShow: true, server: 'localhost', judges: 3 },
	_create: function() {
		var o           = this.options;
		var e           = this.options.elements = {};
		var widget      = this.element;
		var html        = { div : $( "<div />" ) };
		var leaderboard = e.leaderboard = html.div.clone() .addClass( "back" );
		var scoreboard  = e.scoreboard  = html.div.clone() .addClass( "front" );
		var usermessage = e.usermessage = html.div.clone() .addClass( "usermessage" ) .hide();
		var card        = e.card        = html.div.clone() .addClass( "card" );

		card.append( leaderboard, scoreboard );
		widget .addClass( "worldclass flippable" );
		widget .append( card, usermessage );
	},
	_init: function( ) {
		var e = this.options.elements;
		var o = this.options;
		e.leaderboard.leaderboard( { division : { athletes : new Array() }} );
		e.scoreboard.scoreboard( { judges: o.judges, current : { round : 0, forms : [], athlete : { name : '', scores : undefined }}} );

		function refresh( update ) {
			var forms    = JSON.parse( update.data );
			var division = forms.divisions[ forms.current ];
			var current  = parseInt( division.current );
			var athlete  = division.athletes[ current ];
			if( forms.error ) {
				e.card.fadeOut();
				e.usermessage.html( forms.error );
				e.usermessage.fadeIn( 500 );
				
			} else if( division.state == 'display' ) {
				if( ! e.card.hasClass( 'flipped' )) { e.card.addClass( 'flipped' ); }
				e.leaderboard.leaderboard( { division : division } );

			} else if( division.state == 'score' ) {
				if( e.card.hasClass( 'flipped' )) { e.card.removeClass( 'flipped' ); }
				e.scoreboard.scoreboard( { judges : o.judges, current: { round : division.round, forms : division.forms, athlete : athlete }} );
			}
		};

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );

	}
});
