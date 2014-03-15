$.widget( "freescore.leaderboard", {
	options: { autoShow: true, twoThirds: true },
	_create: function() {
		var options   = this.options;
		var e         = this.options.elements = {};
		var html      = { div : $( "<div />" ) };
		var division  = e.division  = html.div.clone() .addClass( "division" );
		var pending   = e.pending   = html.div.clone() .addClass( "pending" );
		var standings = e.standings = html.div.clone() .addClass( "standings" );

		division .append( pending, standings );

		this.element .addClass( "leaderboard" );
		this.element .append( division );
	},
	_init: function( ) {
		var html       = { div : $("<div />"), ol : $("<ol />"), li : $("<li />") };
		var e          = this.options.elements;
		var o          = this.options;
		var widget     = this.element;
		var athletes   = this.options.division.athletes;
		var pending    = { list: html.ol.clone(), athletes: new Array() };
		var standings = { athletes: new Array() };
		var url        = {
			tournament : $.url().param( 'tournament' ),
			division   : $.url().param( 'division' ),
		}

		for( var i = 0; i < athletes.length; i++ ) {
			var athlete = athletes[ i ];
			var done    = 1;
			var sum     = 0.0;
			for( var j = 0; j < athlete.scores.length; j++ ) {
				var score = parseFloat( athlete.scores[ j ] );
				done &= (score > 0.0);
				if( score > 0.0 ) { sum += score; }
			}
			athlete.score = sum;
			if( done ) { standings.athletes.push( athlete ); }
			else       { pending.athletes.push( athlete ); }
		}

		standings.athletes.sort( function( a, b ) { return parseFloat( b.score ) - parseFloat( a.score ); } );
		e.standings.empty();
		e.standings.append( "<h2>Current Standings</h2>" );
		var k = standings.athletes.length < 4 ? standings.athletes.length : 4;
		for( var i = 0; i < k; i++ ) {
			var item = html.li.clone();
			var athlete = standings.athletes[ i ];
			e.standings.append(  "<div class=\"athlete\"><div class=\"name rank" + (i + 1) + "\">" + athlete.name + "</div><div class=\"score\">" + athlete.score.toFixed( 1 ) + "</div><div class=\"medal\"><img src=\"/freescore/images/medals/rank" + (i + 1) + ".png\" align=\"right\" /></div></div>" );
		}
		
		e.pending.empty();
		e.pending.append( "<h2>Next Up</h2>" );
		e.pending.append( pending.list );
		for( var i = 0; i < pending.athletes.length; i++ ) {
			var athlete = pending.athletes[ i ];
			var item    = html.li.clone();
			item.append( athlete.name );
			pending.list.append( item );
		}
		widget.fadeIn( 500 );
	},
	fadeout: function() {
		this.element.fadeOut( 500 );
	}
});
