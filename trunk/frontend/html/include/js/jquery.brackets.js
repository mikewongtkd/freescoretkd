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

		var drawing  = html.div.clone().addClass( 'drawing' );
		var division = new Division( o.division );
		var brackets = division.brackets();
		var athletes = division.athletes();
		var position = [[{ x: 0, y: 0 }, { x: 0, y: 100 }, { x: 0, y: 200 }, { x: 0, y: 300 }], [{ x: 300, y: 50 }, { x: 300, y: 250 }], [{ x: 600, y: 150 }]];
		var connect  = [[ undefined, { x: 180, y: 38, height: 96, width: 120 }, undefined, { x: 180, y: 238, height: 96, width: 120 }], [ undefined, { x: 480, y: 88, height: 196, width: 120 }]];
		var current  = html.div.clone().addClass( 'current' ).html( '<span class="fa fa-location-arrow"></span>' );
		var line     = {
			connect : html.div.clone().addClass( 'connect' ).append( html.div.clone().addClass( 'line-down' ), html.div.clone().addClass( 'line-up' ),html.div.clone().addClass( 'line-across' )),
			dot     : html.div.clone().html( '<span class="fa fa-circle"></span>' ),
		};
		line.connect.append( line.dot.clone().addClass( 'start-high' ), line.dot.clone().addClass( 'start-low' ), line.dot.clone().addClass( 'stop' ));

		var sum      = function( acc, cur ) { return acc + cur; }

		for( var j = 0; j < brackets.length; j++ ) {
			var round = brackets[ j ];

			for( var i = 0; i < round.length; i++ ) {
				var x        = position[ j ][ i ].x;
				var y        = position[ j ][ i ].y;
				var bracket  = round[ i ];
				var blue     = { athlete : defined( bracket.blue.athlete ) ? athletes[ bracket.blue.athlete ] : { name: 'Bye' }};
				var red      = { athlete : defined( bracket.red.athlete )  ? athletes[ bracket.red.athlete ]  : { name: 'Bye' }};
				var match    = html.div.clone().addClass( 'match' ).css({ top: y + 'px', left: x + 'px' });

				blue.votes   = bracket.blue.votes.reduce( sum );
				red.votes    = bracket.red.votes.reduce( sum );

				var complete = blue.votes + red.votes == division.judges();

				blue.lost    = ! defined( bracket.blue.athlete ) || (blue.votes < red.votes  && complete);
				blue.won     = defined( bracket.blue.athlete )   && (blue.votes > red.votes  && complete);
				red.lost     = ! defined( bracket.red.athlete )  || (red.votes  < blue.votes && complete);
				red.won      = defined( bracket.red.athlete )    && (red.votes  > blue.votes && complete);

				blue.label   = html.div.clone().addClass( 'athlete chung' ).html( blue.athlete.name );
				red.label    = html.div.clone().addClass( 'athlete hong' ).html( red.athlete.name );

				if( blue.lost ) { blue.label.addClass( 'lost' ); }
				if( red.lost )  { red.label.addClass( 'lost' ); }

				if( bracket === division.current.bracket()) { match.append( current ); }

				match.append( blue.label, red.label );

				drawing.append( match );
				if( i % 2 ) {
					var c = connect[ j ][ i ];
					drawing.append( line.connect.clone().css({ top: c.y, left: c.x, height: c.height + 'px', width: c.width + 'px' }));
				}
			}
		}

		w.append( drawing );
	}
});
