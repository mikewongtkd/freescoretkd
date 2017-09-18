
$.widget( "freescore.voteDisplay", {
	options: { autoshow: true, judges: 3 },
	_create: function() {
		var o = this.options;
		var e = o.elements = {};
		var w = this.element;
		var html = e.html = FreeScore.html;

		var display = html.div.clone() .addClass( "display" );
		var title   = e.title = html.div.clone() .addClass( "title" ) .html( o.title );
		var votes   = e.votes = html.div.clone() .addClass( "votes" );

		display.append( title, votes );
		w.addClass( "tiebreaker" );
		w.append( display );
	},

	_init: function() {
		var o        = this.options;
		var e        = o.elements;
		var w        = this.element;
		var html     = e.html;
		var athletes = o.athletes;

		var addAthlete = o.addAthlete = function( athlete, color ) {
			var display  = html.div.clone() .addClass( color );
			var name     = html.div.clone() .addClass( "athlete" ) .html( athlete.name );
			var count    = html.div.clone() .addClass( "count" );
			var awarded  = [];
			var n        = 0;
			var scale    = o.judges <= 3 ? 120 : 80;
			var width    = (o.judges - 1) * scale;

			for( var i = 0; i < o.judges; i++ ) {
				var margin = (480 - width) / 4;
				var x      = (i * scale);
				awarded[ i ] = html.div.clone() .addClass( "vote" ) .addClass( "awarded" );

				if( defined( athlete.tiebreakers )) {
					if( athlete.tiebreakers[ i ] ) { awarded[ i ].css( "opacity", "1.0" ); n++; }

				} else if( defined( athlete.votes )) {
					if( athlete.votes[ i ] ) { awarded[ i ].css( "opacity", "1.0" ); n++; }
				}
				awarded[ i ] .css({ left: x + margin, border : 'none' });
				display.append( awarded[ i ] );
			}
			count.html( n );
			display.append( name, count );
			return display;
		};

		e.votes.empty();

		var chung = e.chung = addAthlete( athletes[ 0 ], "chung" );
		var hong  = e.hong  = addAthlete( athletes[ 1 ], "hong" );

		e.votes.append( hong, chung );
	}
});
