$.widget( "freescore.grassroots", {
	options: { autoShow: true, current: 0 },
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
		var i = this.options.current;
		var o = this.options;
		var url     = {
			tournament : $.url().param( 'tournament' ),
			division   : $.url().param( 'division' ),
		}
		var refresh = function() {
			$.getJSON(
				'http://localhost/cgi-bin/freescore/forms/grassroots/' + url.tournament + '/' + url.division,
				function( division ) {
					if( division.state == 'display' ) {
						e.leaderboard.leaderboard( { division : division } );
					} else if( division.state == 'score' ) {
						e.scorekeeper.scorekeeper( { current: { index: i, athlete : division[ i ]}} );
					}
				}
			);
		}
		refresh();
	}
});
