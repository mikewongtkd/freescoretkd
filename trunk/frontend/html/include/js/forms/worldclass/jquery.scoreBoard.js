// Depends on jquery.judgeScore.js

$.widget( "freescore.scorekeeper", {
	options: { autoShow: true, numJudges: 3 },
	_create: function() {
		var html = { div : $( "<div />" ) };
		var e = this.options.elements = {};

		var judgeScores = e.judgeScores = html.div.clone() .addClass( "judgeScores" );
		var judges      = e.judges      = new Array();
		var totalScore  = e.totalScore  = html.div.clone() .addClass( "totalScores" );
		var athlete     = e.athlete     = html.div.clone() .addClass( "athlete" );
		var score       = e.score       = html.div.clone() .addClass( "score" );
		totalScore.append( score );
		totalScore.append( athlete );

		var k = this.options.numJudges;
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
		
		this.element .addClass( "scoreKeeper" );
		this.element .append( judgeScores );
		this.element .append( totalScore );
	},

	_init: function() {
		var e       = this.options.elements;
		var options = this.options
		var k       = this.options.numJudges;
		var widget  = this.element;
		var current = this.options.current;

		e.athlete .html( current.athlete.name );
		for( var i = 0; i < k; i++ ) {
			var s = current.athlete.scores[ i ];
			e.judges[ i ].judgeScore( { score : s } );
		}

		if( parseInt( current.athlete.index ) % 2 ) { 
			e.athlete .removeClass( "chung" ); 
			e.athlete .addClass( "hong" ); 
		} else { 
			e.athlete .removeClass( "hong" ); 
			e.athlete .addClass( "chung" ); 
		}

		// ============================================================
		// SUM SCORES
		// ============================================================
		var scores = new Array();
		var min    = { accuracy : -1, presentation : -1 };
		var max    = { accuracy : -1, presentation : -1 };
		for( var i = 0; i < k; i++ ) {
			var j = i + 1;
			var accuracy     = parseFloat( $( '#judgeScore' + j + ' > .accuracy' ).html());
			var presentation = parseFloat( $( '#judgeScore' + j + ' > .accuracy' ).html());
			if( isNaN( accuracy     ) { accuracy     = -1.0; }
			if( isNaN( presentation ) { presentation = -1.0; }
			scores[ i ]      = { accuracy : accuracy, presentation : presentation };
		}

		// ===== SKIP MIN AND MAX FOR 5 OR 7 JUDGES
		if( k == 5 || k == 7 ) {
			for( var i = 0; i < k; i++ ) {
				if( min.accuracy < 0     || scores[ min.accuracy ].accuracy         > scores[ i ].accuracy )     { min.accuracy     = i; }
				if( max.accuracy < 0     || scores[ max.accuracy ].accuracy         < scores[ i ].accuracy )     { max.accuracy     = i; }
				if( min.presentation < 0 || scores[ min.presentation ].presentation > scores[ i ].presentation ) { min.presentation = i; }
				if( max.presentation < 0 || scores[ max.presentation ].presentation < scores[ i ].presentation ) { max.presentation = i; }
				e.judges.removeClass( "ignore" );
			}
		}

		var sum = 0.0;
		for( var i = 0; i < k; i++ ) {
			if( i == min.accuracy     ) { e.judges.addClass( "ignore" ); continue; }
			if( i == max.accuracy     ) { e.judges.addClass( "ignore" ); continue; }
			if( scores[ i ] > 0 ) { sum += scores[ i ]; }
		}
		for( var i = 0; i < k; i++ ) {
			if( i == min.presentation ) { e.judges.addClass( "ignore" ); continue; }
			if( i == max.presentation ) { e.judges.addClass( "ignore" ); continue; }
			if( scores[ i ] > 0 ) { sum += scores[ i ]; }
		}

		sum = Math.round( sum * 10 )/10;

		if( sum > 0.0 ) { e.score.html( sum.toFixed( 1 )); } else { e.score.empty(); }
		widget .fadeIn( 500 );
	},
	fadeout: function() {
		this.element.fadeOut( 500 );
	}
});
