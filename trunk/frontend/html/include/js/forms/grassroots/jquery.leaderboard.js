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
		var single_elimination = defined( o.division.mode ) && o.division.mode == 'single-elimination';

		if( ! defined( o.division.placements )) { o.division.placements = []; }
		if( ! defined( o.division.pending    )) { o.division.pending    = []; }

		standings.athletes = o.division.placements .map( function( i ) { return athletes[ i ]; } );
		pending.athletes   = o.division.pending    .map( function( i ) { return athletes[ i ]; } );

		// ===== HIDE 'CURRENT STANDINGS' PANEL IF THERE ARE NO COMPLETED ATHLETES
		if( single_elimination ) {
			if( standings.athletes.length == 0 ) {
				// Brackets at full screen
				e.brackets.css({ display: 'block' });
				e.pending.css({ display: 'block' });
				e.standings.css({ display: 'none' });
				e.brackets.empty();
				var draw = html.div.clone().attr({ id: 'drawing' });;
				e.brackets.append( '<h2>Brackets</h2>', draw );
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
						if( votes.reduce( sum ) == o.division.judges ) {
							results.push( votes );
						}
					}
					return results;
				});
				draw.brackets({ division: o.division });

			} else {
				e.brackets.css({ display: 'none' });
				e.pending.css({ display: 'none' }); 
				e.standings.css({ display: 'block', 'font-size' : '48pt', height: '700px' });
			}

		} else if( standings.athletes.length == 0 ) {
			// Full screen
			e.standings.css( 'display', 'none' );
			e.pending.css( 'font-size', '48pt' );
			e.pending.css({ top: 0, height: '700px' });


		} else {
			// Half screen
			e.standings.css( 'display', 'block' );
			e.pending.css({ 'font-size': '24pt', height: '200px', top: '500px' });
		}

		// ===== UPDATE THE 'CURRENT STANDINGS' PANEL
		e.standings.empty();
		e.standings.append( "<h2>Current Standings</h2>" );
		var k = standings.athletes.length < 4 ? standings.athletes.length : 4;
		for( var i = 0; i < k; i++ ) {
			var item = html.li.clone();
			var athlete = standings.athletes[ i ];
			var notes   = defined( athlete.notes ) ? "<div class=\"notes\">" + athlete.notes + "</div>": '';
			var score   = single_elimination ? athlete.score.toFixed( 0 ) : athlete.score.toFixed( 1 );
			e.standings.append(  "<div class=\"athlete\"><div class=\"name rank" + (i + 1) + "\">" + athlete.name + "</div><div class=\"score\">" + score + notes + "</div><div class=\"medal\"><img src=\"/freescore/images/medals/rank" + (i + 1) + ".png\" align=\"right\" /></div></div>" );
		}
		
		// ===== HIDE 'NEXT UP' PANEL IF THERE ARE NO REMAINING ATHLETES
		if( single_elimination ) {
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
		if( single_elimination ) {
			var blue = defined( pending.athletes[ 0 ] ) ? '<div class="athlete chung">' + pending.athletes[ 0 ].name + '</div>' : '';
			var red  = defined( pending.athletes[ 1 ] ) ? '<div class="athlete hong">'  + pending.athletes[ 1 ].name + '</div>' : '';
			e.pending.append( blue, red );
		} else {
			e.pending.append( '<div class="athlete">' + pending.athletes[ 0 ].name + '</div>' );
		}
		widget.fadeIn( 500 );
	},
	fadeout: function() {
		this.element.fadeOut( 500 );
	}
});
