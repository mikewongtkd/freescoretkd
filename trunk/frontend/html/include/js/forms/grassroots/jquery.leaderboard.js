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
		var o         = this.options;
		var e         = o.elements;
		var widget    = this.element;
		var athletes  = o.division.athletes;
		var pending   = { list: html.ol.clone(), athletes: new Array() };
		var standings = { athletes: new Array() };

		for( var i = 0; i < athletes.length; i++ ) {
			var athlete = athletes[ i ];
			if( athlete.complete ) { standings.athletes.push( athlete ); }
			else                   { pending.athletes.push( athlete ); }
		}

		// ===== HIDE 'CURRENT STANDINGS' PANEL IF THERE ARE NO COMPLETED ATHLETES
		if( standings.athletes.length == 0 ) {
			e.standings.css( 'display', 'none' );
			e.pending.css( 'font-size', '48pt' );
			e.pending.css( 'width', '913px' );
		} else {
			e.standings.css( 'display', 'block' );
			e.pending.css( 'font-size', '24pt' );
			e.pending.css( 'width', '400px' );
		}

		// ===== UPDATE THE 'CURRENT STANDINGS' PANEL
		standings.athletes = o.division.placements.map( function( i ) { return athletes[ i ]; } );
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
			e.pending.css( 'display', 'none' ); 
			e.standings.css( 'font-size', '48pt' );
			e.standings.css( 'width', '913px' );
		} else {
			e.pending.css( 'display', 'block' ); 
			e.standings.css( 'font-size', '24pt' );
			e.standings.css( 'width', '400px' );
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
