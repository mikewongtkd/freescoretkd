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
		var line     = {
			connect : html.div.clone().addClass( 'connect' ).append( html.div.clone().addClass( 'line-down' ), html.div.clone().addClass( 'line-up' ),html.div.clone().addClass( 'line-across' )),
		};

		var sum      = function( acc, cur ) { return acc + cur; }
		var k        = 0;

		for( var j = 0; j < brackets.length; j++ ) {
			var round = brackets[ j ];
			var x     = j * 300;

			for( var i = 0; i < round.length; i++ ) {
				var block    = 400/(4/Math.pow( 2, j ));
				var y        = (i + 0.5) * block - 50;
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

				if( bracket === division.current.bracket()) {};

				match.append( blue.label, red.label );
				match.attr({ round : j, match: i, index: k });

				drawing.append( match );
				if( i % 2 ) {
					var cx = x + 180;
					var cy = y - (100 * j) - 62;
					var height = (j + 1) * 100 - 4;
					drawing.append( line.connect.clone().css({ top: cy, left: cx, height: height + 'px', width: '120px' }));
				}
				k++;
			}
		}

		w.append( drawing );
	}
});
