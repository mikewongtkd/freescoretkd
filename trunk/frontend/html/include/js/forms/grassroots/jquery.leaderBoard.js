$.widget( "freescore.leaderboard", {
	options: { autoShow: true, twoThirds: true },
	_create: function() {
		var options    = this.options;
		var e          = this.options.elements = {};
		var html       = { div : $( "<div />" ) };
		var division   = e.division   = html.div.clone() .addClass( "division" );
		var pending    = e.pending    = html.div.clone() .addClass( "pending" );
		var placements = e.placements = html.div.clone() .addClass( "placements" );

		division .append( pending, placements );

		this.element .addClass( "leaderboard" );
		this.element .append( division );
	},
	_init: function( ) {
		var html       = { div : $("<div />"), ol : $("<ol />"), li : $("<li />") };
		var e          = this.options.elements;
		var o          = this.options;
		var widget     = this.element;
		var athletes   = this.options.division.athletes;
		var list       = html.ol.clone();
		var pending    = new Array();
		var placements = new Array();
		var url        = {
			tournament : $.url().param( 'tournament' ),
			division   : $.url().param( 'division' ),
		}
		/*
		for( var i = 0; i < athletes.length; i++ ) {
			var athlete = athletes[ i ];
			var done    = 1;
			for( var j = 0; j < athletes.scores.length; j++ ) {
				done = done & (athlete.scores[ j ] > 0.0);
			}
			if( done ) {
				placements.push( athlete );
			} else {
				pending.push( athlete );
			}
		}
		*/

		e.placements.empty();
		e.placements.append( "<h2>Placements</h2>" );
		
		e.pending.empty();
		e.pending.append( "<h2>Next Up</h2>" );
		e.pending.append( list );
		for( var i = 0; i < athletes.length; i++ ) {
			var item = html.li.clone();
			item.append( "<a href=\"?tournament=" + url.tournament + "&division=" + url.division + "&athlete=" + i + "&state=score\">" + athletes[ i ].name + "</a>" );
			list.append( item );
		}
		widget.fadeIn( 500 );
	}
});
