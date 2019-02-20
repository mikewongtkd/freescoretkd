$.widget( "freescore.brackets", {
	options: { autoShow: true, height: '8in', width: '8in', stroke: 1 },
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

		var division = new Division( o.division );
		var brackets = division.brackets();
		var draw     = SVG( 'brackets' ).size( o.width, o.height );
		var athletes = division.athletes();
		var sum      = function( acc, cur ) { return acc + cur; }
		var poly     = function( line ) { return line.start.x + ',' + line.start.y + ' ' + line.head.x + ',' + line.head.y + ' ' + line.foot.x + ',' + line.foot.y + ' ' + line.stop.x + ',' + line.stop.y; };
		var k        = 0;
		var m        = brackets[ 0 ].length;
		var n        = Math.round((Math.log( m )/Math.log( 2 )));
		var scale    = defined( o.scale ) ? o.scale : { height: 600, width: 240, match : { height: 80, width: 180 }};
		var height   = m * (scale.height/4);
		var width    = (n + 1) * scale.width;
		var color    = defined( o.color ) ? o.color : { blue: '#286090', red: '#c9302c', white: 'white', current: '#f0ad4e', selected: '#5bc0de', line: '#ccc' };
		var font     = "<style>@font-face { font-family: 'FjallaOne'; src: url( '/include/fonts/FjallaOne-Regular.ttf' ), url( '/freescore/include/fonts/FjallaOne-Regular.ttf' ); font-weight: normal; font-style: normal; }</style>";


		draw.viewbox( 0, 0, width, height );
		$( 'svg' ).prepend( font );

		var selected = draw.rect( scale.match.width, scale.match.height ).attr({ id: 'bracket-selection' }).fill( 'none' ).stroke({ width: 20, color: color.selected }).radius( 6 ).hide();
		var current  = draw.rect( scale.match.width, scale.match.height ).attr({ id: 'bracket-current'   }).fill( 'none' ).stroke({ width: 20, color: color.current  }).radius( 6 );

		for( var j = 0; j < brackets.length; j++ ) {
			var round = brackets[ j ];
			var x     = (j * scale.width) + 10;

			for( var i = 0; i < round.length; i++ ) {
				var block    = scale.height/(4/Math.pow( 2, j ));
				var y        = (i + 0.5) * block - 50;
				var bracket  = round[ i ];
				var blue     = { athlete : defined( bracket.blue.athlete ) ? athletes[ bracket.blue.athlete ] : { display: { name: ( depth ) => { return depth == 0 ? 'Bye' : '—' }}}};
				var red      = { athlete : defined( bracket.red.athlete )  ? athletes[ bracket.red.athlete ]  : { display: { name: ( depth ) => { return depth == 0 ? 'Bye' : '—' }}}};
				var id       = 'match-' + i + '-' + j + '-' + k;
				var line     = { start: { x: x + scale.match.width, y: 0 }, head: { x: x + scale.match.width + 20, y: 0 }, foot: { x: x + scale.width - 20, y: y - (100 * j) - 60 }, stop: { x: x + scale.width, y: y - (100 * j) -60 }};
				var match    = draw.group().attr({ id: id });

				// ===== CLICK HANDLER
				var clicked  = (function( id, x, y ) { id = id.replace( /match-/, '' ); var ijk = id.split( '-' ).map( x => parseInt( x )); var clickEvent = { type: 'matchClicked', i: ijk[ 0 ], j: ijk[ 1 ], k: ijk[ 2 ]}; return function() { $( w ).trigger( clickEvent ); selected.move( x, y ); selected.show() }})( id, x, y );
				
				// ===== CALCULATE SCORES
				blue.votes   = bracket.blue.votes.reduce( sum );
				red.votes    = bracket.red.votes.reduce( sum );

				var complete = blue.votes + red.votes == division.judges();

				blue.won     = defined( bracket.blue.athlete ) && (blue.votes > red.votes  && complete);
				red.won      = defined( bracket.red.athlete )  && (red.votes  > blue.votes && complete);

				if( blue.won ) { line.start.y = y + 20; line.head.y = line.start.y; } else
				if( red.won  ) { line.start.y = y + 60; line.head.y = line.start.y; } else
							   { line.start.y = y + 40; line.head.y = line.start.y; }

				// ===== RENDER THE MATCH
				match.path('M 0 0 L 0 -30 Q 0 -40 10 -40 L 170 -40 Q 180 -40 180 -30 L 180 0 Z' ).fill( color.blue ).attr({ id: id + '-blue' }).move( 0,  0 );
				match.path('M 0 0 L 0  30 Q 0  40 10  40 L 170  40 Q 180  40 180  30 L 180 0 Z' ).fill( color.red  ).attr({ id: id + '-red'  }).move( 0, 40 );
				match.text( blue.athlete.display.name( j ) ).font({ 'font-family': 'FjallaOne', 'font-size': 24 }).fill( color.white ).move(  8,  7 );
				match.text( red.athlete.display.name( j )  ).font({ 'font-family': 'FjallaOne', 'font-size': 24 }).fill( color.white ).move(  8, 45 );
				if( defined( bracket.blue.athlete )) { match.text( String( blue.votes )).font({ 'font-family': 'FjallaOne', 'font-size': 24 }).fill( color.white ).move( 160,  7 ); }
				if( defined( bracket.red.athlete  )) { match.text( String( red.votes  )).font({ 'font-family': 'FjallaOne', 'font-size': 24 }).fill( color.white ).move( 160, 45 ); }

				match.move( x, y );
				match.click( clicked ); // Apply click behavior

				// ===== RENDER THE LINES
				var final_round = j == brackets.length - 1;
				var semi_finals = j == brackets.length - 2;
				if( ! final_round ) {
					var next_block = scale.height/(4/Math.pow( 2, j + 1 ));
					if( !( i % 2 )) { line.foot.y = (i + 1.0) * block      - 10; line.stop.y = line.foot.y; }
					else            { line.foot.y =  i        * block      - 10; line.stop.y = line.foot.y; }
					draw.polyline( poly( line )).fill( 'none' ).stroke({ width: o.stroke, color: color.line });
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
