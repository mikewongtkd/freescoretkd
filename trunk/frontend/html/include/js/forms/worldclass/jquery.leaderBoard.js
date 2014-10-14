$.widget( "freescore.leaderboard", {
	options: { autoShow: true, twoThirds: true },
	_create: function() {
		var o         = this.options;
		var e         = this.options.elements = {};
		var html      = o.html      = { div : $("<div />"), img : $( "<img />" ), a : $( "<a />" ), span : $( "<span />" ), ol : $("<ol />"), li : $("<li />") };
		var division  = e.division  = html.div.clone() .addClass( "division" );
		var pending   = e.pending   = html.div.clone() .addClass( "pending" );
		var standings = e.standings = html.div.clone() .addClass( "standings" );

		division .append( pending, standings );

		this.element .addClass( "leaderboard" );
		this.element .append( division );
	},
	_init: function( ) {
		var e         = this.options.elements;
		var o         = this.options;
		var html      = o.html;
		var widget    = this.element;
		var pending   = { list: html.ol.clone(), athletes: new Array() };
		var standings = { athletes: new Array() };

		if( typeof( o.division ) === 'undefined' ) { return; }
		var athletes  = o.division.athletes;
		console.log( athletes );
		for( var i = 0; i < athletes.length; i++ ) {
			var athlete  = athletes[ i ];

			var valid = true;
			for( var j = 0; j < athlete.scores[ o.division.round ].length ; j++ ) {
				var form = athlete.scores[ o.division.round ][ j ];
				valid &= form.complete;
			}
			if   ( valid ) { standings .athletes .push( athlete ); }
			else           { pending   .athletes .push( athlete ); }
		}

		// ===== HIDE 'CURRENT STANDINGS' PANEL IF THERE ARE NO COMPLETED ATHLETES
		if( standings.athletes.length == 0 ) {
			e.standings.hide();
			e.standings.removeClass( "one-column", "two-column", "left-column" );

		} else if( pending.athletes.length == 0 ) {
			e.standings.show();
			e.standings.addClass( "one-column" );
			e.standings.removeClass( "two-column", "left-column" );

		} else {
			e.standings.show();
			e.standings.addClass( "two-column left-column" );
			e.standings.removeClass( "one-column" );
		}

		// ===== UPDATE THE 'CURRENT STANDINGS' PANEL
		standings.athletes.sort( function( a, b ) { return b.score.compare( a.score ); });
		e.standings.empty();
		e.standings.append( "<h2>Current Standings</h2>" );
		var k     = standings.athletes.length < 4 ? standings.athletes.length : 4;
		var notes = html.div.clone() .addClass( "notes" ) .hide();
		for( var i = 0; i < k; i++ ) {
			var item = html.li.clone();
			var athlete    = standings.athletes[ i ];
			var total      = athlete.score.form.map( function( score ) { return parseFloat( score.mean ); }).reduce( function( value, total ) { return total + value; }).toFixed( 1 );
			var place      = html.div.clone() .addClass( "athlete" );
			var j          = i + 1;
			var entry      = html.div.clone()  .addClass( "athlete" ) .css( "top", i * 48 );
			var name       = html.div.clone()  .addClass( "name" ) .addClass( "rank" + j ) .html( athlete.name );
			var score      = html.div.clone()  .addClass( "score" ) .html( total );
			var tiebreaker = html.span.clone() .addClass( "tiebreaker" ) .html( "*" );
			var medal      = html.div.clone()  .addClass( "medal" ) .append( html.img.clone() .attr( "src", "/freescore/images/medals/rank" + j + ".png" ) .attr( "align", "right" ));

			if( athlete.score.tiebreaker ) { 
				score.append( tiebreaker ); 
				notes.append( athlete.score.tiebreaker + " for " + athlete.name + "<br />" );
				notes.show();
			}
			entry.append( name, score, medal );
			e.standings.append( entry );
		}
		notes.css( "top", 460 - notes.height() );
		e.standings.append( notes );
		
		// ===== HIDE 'NEXT UP' PANEL IF THERE ARE NO REMAINING ATHLETES
		if( pending.athletes.length == 0 ) { 
			e.pending.hide();
			e.pending.removeClass( "one-column", "two-column", "right-column" );

		} else if( standings.athletes.length == 0 ) {
			e.pending.show();
			e.pending.addClass( "one-column left-column" );
			e.pending.removeClass( "two-column", "right-column" );

		} else {
			e.pending.show();
			e.pending.addClass( "two-column right-column" );
			e.pending.removeClass( "one-column" );
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
});
