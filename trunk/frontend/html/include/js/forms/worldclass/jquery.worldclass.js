$.widget( "freescore.worldclass", {
	options: { autoShow: true, server: 'localhost', judges: 3 },
	_create: function() {
		var o           = this.options;
		var e           = this.options.elements = {};
		var widget      = this.element;
		var html        = { div : $( "<div />" ) };
		var leaderboard = e.leaderboard = html.div.clone() .addClass( "leaderboard back" );
		var scorekeeper = e.scorekeeper = html.div.clone() .addClass( "scorekeeper front" );
		var usermessage = e.usermessage = html.div.clone() .addClass( "usermessage" ) .hide();
		var card        = e.card        = html.div.clone() .addClass( "card" );

		card.append( leaderboard, scorekeeper );
		widget .addClass( "worldclass flippable" );
		widget .append( card, usermessage );
	},
	_init: function( ) {
		var e = this.options.elements;
		var o = this.options;
		e.leaderboard.leaderboard( { division : { athletes : new Array() }} );
		e.scorekeeper.scorekeeper( { judges: o.judges, current : { athlete : { name : '', scores : new Array() }}} );


		function refresh( update ) {
			var forms    = JSON.parse( update.data );
			var division = forms.divisions[ forms.current ];
			var athlete  = division.athletes[ division.current ];
			if( forms.error ) {
				e.card.fadeOut();
				e.usermessage.html( forms.error );
				e.usermessage.fadeIn( 500 );
				
			} else if( forms.state == 'display' ) {
				if( ! e.card.hasClass( 'flipped' )) { e.card.addClass( 'flipped' ); }
				e.leaderboard.leaderboard( { division : division } );

			} else if( division.state == 'score' ) {
				if( e.card.hasClass( 'flipped' )) { e.card.removeClass( 'flipped' ); }
				e.scorekeeper.scorekeeper( { current: { athlete : athlete }} );
			}
		};

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db + '&ring=' + $.cookie( 'ring' ) );
		e.source.addEventListener( 'message', refresh, false );

	}
});
