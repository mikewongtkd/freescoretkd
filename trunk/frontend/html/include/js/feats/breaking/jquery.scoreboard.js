// Depends on jquery.judgeScore.js

$.widget( "freescore.scoreboard", {
	options: { autoShow: true, judges: 3 },
	_create: function() {
		var o = this.options;
		var e = o.elements = {};
		var html = e.html = FreeScore.html;

		var judgeScores = e.judgeScores = html.div.clone() .addClass( "judgeScores" );
		var judges      = e.judges      = [];
		var totalScore  = e.totalScore  = html.div.clone() .addClass( "totalScores" );
		var athlete     = e.athlete     = html.div.clone() .addClass( "athlete" );
		var score       = e.score       = html.div.clone() .addClass( "score" );
		totalScore.append( score );
		totalScore.append( athlete );

		var k = o.judges;
		for( var i = 0; i < k; i++ ) {
			var j = i + 1;
			var judge = html.div.clone() .prop( "id", "judge" + j );
			if(      k == 3   ) { judge.addClass( "judges3" ); }
			else if( k == 5   ) { judge.addClass( "judges5" ); }
			if     ( i == 0   ) { judge.addClass( "left" ); }
			else if( i == k-1 ) { judge.addClass( "right" ); }
			else                { judge.addClass( "middle" ); }
			judge.judgeScore( { num: j } ); // Instantiate a new Judge Score widget for each judge
			judges[ i ] = judge;
			judgeScores.append( judge );
		}
		
		this.element .addClass( "scoreboard" );
		this.element .append( judgeScores );
		this.element .append( totalScore );
	},

	_init: function() {
		var e       = this.options.elements;
		var o       = this.options
		var k       = o.judges;
		var widget  = this.element;
		var current = o.current;

		e.athlete .html( current.athlete.name );
		for( var i = 0; i < k; i++ ) {
			var s = current.athlete.scores[ i ];
			e.judges[ i ].judgeScore( { score : s } );
		}

		if( parseInt( current.athlete.index ) % 2 ) { 
			e.athlete.removeClass( "chung" ); 
			e.athlete.addClass( "hong" ); 
		} else { 
			e.athlete.removeClass( "hong" ); 
			e.athlete.addClass( "chung" ); 
		}

		// ============================================================
		// HIDE HIGH/LOW SCORES
		// ============================================================

		for( var i = 0; i < k; i++ ) { e.judges[ i ].removeClass( "ignore" ); }

		// ===== SKIP MIN AND MAX FOR 5 OR 7 JUDGES
		if( current.athlete.complete ) {
			if( defined( current.athlete.min   )) { e.judges[ current.athlete.min ].addClass( "ignore" ); }
			if( defined( current.athlete.max   )) { e.judges[ current.athlete.max ].addClass( "ignore" ); }
			if( defined( current.athlete.score )) { 
				if( ! defined( current.athlete.notes )) { current.athlete.notes = ''; }
				e.score.html( current.athlete.score.toFixed( 1 ) + "<span class=\"notes\">&nbsp;" + current.athlete.notes + "</span>" ); 
				e.score.animate({ opacity : 1 }, 500 ); 
			}
		} else {
			e.score.animate({ opacity: 0 }, 300, 'swing', function() { e.score.empty(); });
		}
	},
});
