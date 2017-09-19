$.widget( "freescore.leaderboard", {
	options: { autoShow: true, twoThirds: true },
	_create: function() {
		var options   = this.options;
		var e         = this.options.elements = {};
		var html      = e.html      = FreeScore.html;
		var division  = e.division  = html.div.clone() .addClass( "division" );
		var pending   = e.pending   = html.div.clone() .addClass( "pending" );
		var standings = e.standings = html.div.clone() .addClass( "standings" );
		var brackets  = e.brackets  = html.div.clone() .addClass( "brackets" );

		division .append( pending, standings, brackets );

		this.element .addClass( "leaderboard" );
		this.element .append( division );
	},
	_init: function( ) {
		var o         = this.options;
		var e         = o.elements;
		var html      = e.html;
		var widget    = this.element;
		var athletes  = o.division.athletes;
		var pending   = { list: html.ol.clone(), athletes: [] };
		var standings = { athletes: [] };

		e.brackets.css({ display: 'none' });

		if( ! defined( o.division.placements )) { o.division.placements = []; }
		if( ! defined( o.division.pending    )) { o.division.pending    = []; }

		standings.athletes = o.division.placements .map( function( i ) { return athletes[ i ]; } );
		pending.athletes   = o.division.pending    .map( function( i ) { return athletes[ i ]; } );

		// ===== HIDE 'CURRENT STANDINGS' PANEL IF THERE ARE NO COMPLETED ATHLETES
		if( defined( o.division.mode ) && o.division.mode == 'single-elimination' ) {
			console.log( 'SHOWING BRACKETS' );
			if( standings.athletes.length == 0 ) {
				// Brackets at full screen
				e.brackets.css({ display: 'block' });
				e.pending.css({ display: 'block' });
				e.standings.css({ display: 'none' });
				e.brackets.empty();
				var drawing = html.div.clone().attr({ id: 'drawing' });;
				e.brackets.append( '<h2>Brackets</h2>', drawing );
				var teams = o.division.brackets[ 0 ].map( function( match ) { 
					var blue = match.blue.athlete;
					var red  = match.red.athlete;

					blue = o.division.athletes[ blue ].name;
					red  = defined( red ) ? o.division.athletes[ red ].name : 'Bye';
					
					return [ blue, red ];
				});
				var sum     = function( acc, cur ) { return acc + cur; };
				var results = o.division.brackets.map( function( round ) { 
					var results = [];
					for( var i = 0; i < round.length; i++ ) {
						var match = round[ i ];
						var votes = [ match.blue.votes.reduce( sum ), match.red.votes.reduce( sum ) ];
						results.push( votes );
					}
					return results;
				});
				console.log( 'TEAMS:', teams, 'RESULTS:', results );

				drawing.bracket({ init: { teams: teams, results: results }});

			} else {
				e.brackets.css({ display: 'none' });
				e.pending.css({ display: 'none' }); 
				e.standings.css({ display: 'block', 'font-size' : '48pt', width: '913px' });
			}

		} else if( standings.athletes.length == 0 ) {
			// Full screen
			e.standings.css( 'display', 'none' );
			e.pending.css( 'font-size', '48pt' );
			e.pending.css( 'width', '913px' );


		} else {
			// Half screen
			e.standings.css( 'display', 'block' );
			e.pending.css( 'font-size', '24pt' );
			e.pending.css( 'width', '400px' );
		}

		// ===== UPDATE THE 'CURRENT STANDINGS' PANEL
		e.standings.empty();
		e.standings.append( "<h2>Current Standings</h2>" );
		var k = standings.athletes.length < 4 ? standings.athletes.length : 4;
		for( var i = 0; i < k; i++ ) {
			var item = html.li.clone();
			var athlete = standings.athletes[ i ];
			var notes   = defined( athlete.notes ) ? "<div class=\"notes\">" + athlete.notes + "</div>": '';
			e.standings.append(  "<div class=\"athlete\"><div class=\"name rank" + (i + 1) + "\">" + athlete.name + "</div><div class=\"score\">" + athlete.score.toFixed( 1 ) + notes + "</div><div class=\"medal\"><img src=\"/freescore/images/medals/rank" + (i + 1) + ".png\" align=\"right\" /></div></div>" );
		}
		
		// ===== HIDE 'NEXT UP' PANEL IF THERE ARE NO REMAINING ATHLETES
		if( defined( o.division.mode ) && o.division.mode == 'single-elimination' ) {
		} else if( pending.athletes.length == 0 ) { 
			// Full screen
			e.pending.css( 'display', 'none' ); 
			e.standings.css( 'font-size', '48pt' );
			e.standings.css( 'width', '913px' );

		} else {
			// Half screen
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
