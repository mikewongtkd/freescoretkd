$.widget( "freescore.brackets", {
	options: { autoShow: true },
	_create: function() {
		var o        = this.options;
		var e        = this.options.elements = {};
		var html     = o.html     = FreeScore.html;
	},
	_init: function( ) {
		var o = this.options;
		var e = this.options.elements;
		var w = this.element;
		var html = o.html;

		var draw     = SVG( 'brackets' ).size( '100%', '100%' );
		var division = new Division( o.division );
		var brackets = division.brackets();
		var athletes = division.athletes();
		var sum      = function( acc, cur ) { return acc + cur; }
		var poly     = function( line ) { return line.start.x + ',' + line.start.y + ' ' + line.head.x + ',' + line.head.y + ' ' + line.foot.x + ',' + line.foot.y + ' ' + line.stop.x + ',' + line.stop.y; };
		var k        = 0;
		var color    = { blue: '#286090', red: '#c9302c', white: 'white', current: '#f0ad4e', selected: '#5bc0de', line: '#ccc' };

		var selected = draw.rect( 180, 80 ).attr({ id: 'bracket-selection' }).fill( 'none' ).stroke({ width: 20, color: color.selected }).radius( 6 ).hide();
		var current  = draw.rect( 180, 80 ).attr({ id: 'bracket-current'   }).fill( 'none' ).stroke({ width: 20, color: color.current  }).radius( 6 );

		for( var j = 0; j < brackets.length; j++ ) {
			var round = brackets[ j ];
			var x     = (j * 300) + 10;

			for( var i = 0; i < round.length; i++ ) {
				var block    = 800/(4/Math.pow( 2, j ));
				var y        = (i + 0.5) * block - 50;
				var bracket  = round[ i ];
				var blue     = { athlete : defined( bracket.blue.athlete ) ? athletes[ bracket.blue.athlete ] : { name: () => { return 'Bye' }}};
				var red      = { athlete : defined( bracket.red.athlete )  ? athletes[ bracket.red.athlete ]  : { name: () => { return 'Bye' }}};
				var id       = i + '-' + j + '-' + k;
				var line     = { start: { x: x + 180, y: 0 }, head: { x: x + 200, y: 0 }, foot: { x: x + 280, y: y - (100 * j) - 60 }, stop: { x: x + 300, y: y - (100 * j) -60 }};
				var match    = draw.group().attr({ id: id });

				// ===== CLICK HANDLER
				var clicked  = (function( id, x, y ) { var ijk = id.split( '-' ).map( function( x ) { return parseInt( x ); }); var clickEvent = { type: 'matchClicked', i: ijk[ 0 ], j: ijk[ 1 ], k: ijk[ 2 ]}; return function() { $( w ).trigger( clickEvent ); selected.move( x, y ); selected.show() }})( id, x, y );
				
				// ===== CALCULATE SCORES
				blue.votes   = bracket.blue.votes.reduce( sum );
				red.votes    = bracket.red.votes.reduce( sum );

				var complete = blue.votes + red.votes == division.judges();

				if( complete ) {
					blue.won     = defined( bracket.blue.athlete )   && (blue.votes > red.votes  && complete);
					red.won      = defined( bracket.red.athlete )    && (red.votes  > blue.votes && complete);

					if( blue.won ) { line.start.y = y + 20; line.head.y = line.start.y; }
					if( red.won  ) { line.start.y = y + 60; line.head.y = line.start.y; }
				}

				// ===== RENDER THE MATCH
				match.path('M 0 0 L 0 -30 Q 0 -40 10 -40 L 170 -40 Q 180 -40 180 -30 L 180 0 Z' ).fill( color.blue ).attr({ id: id + '-blue' }).move( 0,  0 );
				match.path('M 0 0 L 0  30 Q 0  40 10  40 L 170  40 Q 180  40 180  30 L 180 0 Z' ).fill( color.red  ).attr({ id: id + '-red'  }).move( 0, 40 );
				match.text( blue.athlete.name() ).font({ size: 24 }).fill( color.white ).move(  12,  8 );
				match.text( red.athlete.name()  ).font({ size: 24 }).fill( color.white ).move(  12, 44 );
				match.text( String( blue.votes )).font({ size: 24 }).fill( color.white ).move( 160,  8 );
				match.text( String( red.votes  )).font({ size: 24 }).fill( color.white ).move( 160, 44 );

				match.move( x, y );
				match.click( clicked ); // Apply click behavior

				// ===== RENDER THE LINES
				if( complete ) {
					if( !( i % 2 )) { line.foot.y = (i + 1) * block - 10; line.stop.y = line.foot.y; }
					draw.polyline( poly( line )).fill( 'none' ).stroke({ width: 1, color: color.line });
				}

				if( division.current.athleteId() == k ) {
					current.move( x, y );
				}

				k++;
			}
		}

		w.append( draw );
	}
});
