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
		var html      = { div : $("<div />"), ol : $("<ol />"), li : $("<li />") };
		var e         = this.options.elements;
		var o         = this.options;
		var widget    = this.element;
		var athletes  = this.options.division.athletes;
		var pending   = { list: html.ol.clone(), athletes: new Array() };
		var standings = { athletes: new Array() };

		var meanScore = function( scores ) {
			var sum = 0.0;
			for( var j = 0; j < scores.length; j++ ) {
				var score = scores[ j ];
				if( typeof( score ) === 'undefined' ) { return -1.0; }
				var major        = 0.3 * Number.parseInt( score.major );
				var minor        = 0.1 * Nubmer.parseInt( score.minor );
				var accuracy     = major + minor;
				var rhythm       = Number.parseFloat( score.rhythm );
				var power        = Number.parseFloat( score.power );
				var ki           = Number.parseFloat( score.ki );
				var presentation = rhythm + power + ki;

				sum += accuracy + presentation;
			}
			var mean = scores.length == 0 ? 0 : sum / scores.length;
			return mean;
		}

		for( var i = 0; i < athletes.length; i++ ) {
			var athlete  = athletes[ i ];
			athlete.mean = meanScore( athlete.scores );
			if   ( athlete.mean > 0.0 ) { standings .athletes .push( athlete ); }
			else                        { pending   .athletes .push( athlete ); }
		}

		// ===== HIDE 'CURRENT STANDINGS' PANEL IF THERE ARE NO COMPLETED ATHLETES
		if( standings.athletes.length == 0 ) {
			e.standings.addClass( "hidden" );
			e.standings.removeClass( "one-column", "two-column" );

		} else if( pending.athletes.length == 0 ) {
			e.standings.addClass( "one-column" );
			e.standings.removeClass( "hidden", "two-column" );

		} else {
			e.standings.addClass( "two-column" );
			e.standings.removeClass( "hidden", "one-column" );
		}

		// ===== UPDATE THE 'CURRENT STANDINGS' PANEL
		standings.athletes.sort( function( a, b ) { return parseFloat( b.score ) - parseFloat( a.score ); } );
		e.standings.empty();
		e.standings.append( "<h2>Current Standings</h2>" );
		var k = standings.athletes.length < 4 ? standings.athletes.length : 4;
		for( var i = 0; i < k; i++ ) {
			var item = html.li.clone();
			var athlete = standings.athletes[ i ];
			e.standings.append(  "<div class=\"athlete\"><div class=\"name rank" + (i + 1) + "\">" + athlete.name + "</div><div class=\"score\">" + athlete.score.toFixed( 1 ) + "</div><div class=\"medal\"><img src=\"/freescore/images/medals/rank" + (i + 1) + ".png\" align=\"right\" /></div></div>" );
		}
		
		// ===== HIDE 'NEXT UP' PANEL IF THERE ARE NO REMAINING ATHLETES
		if( pending.athletes.length == 0 ) { 
			e.pending.addClass( "hidden" );
			e.pending.removeClass( "one-column", "two-column" );

		} else if( standings.athletes.length == 0 ) {
			e.pending.addClass( "one-column" );
			e.pending.removeClass( "hidden", "two-column" );

		} else {
			e.pending.addClass( "two-column" );
			e.pending.removeClass( "hidden", "one-column" );
		}

		// ===== UPDATE THE 'NEXT UP' PANEL
		e.pending.empty();
		e.pending.append( "<h2>Next Up</h2>" );
		e.pending.append( pending.list );
		for( var i = 0; i < pending.athletes.length; i++ ) {
			var athlete = pending.athletes[ i ];
			var item    = html.li.clone();
			item.append( "<b>" + athlete.name + "</b>" );
			pending.list.append( item );
		}
		widget.fadeIn( 500 );
	},
	fadeout: function() {
		this.element.fadeOut( 500 );
	}
});
