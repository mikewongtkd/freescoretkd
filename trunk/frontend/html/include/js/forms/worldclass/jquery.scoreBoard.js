// Depends on jquery.judgeScore.js

$.widget( "freescore.scorekeeper", {
	options: { autoShow: true, judges: 3 },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};

		var html = o.html = { div : $( "<div />" ), span : $( "<span />" ) };
		var judgeScores = e.judgeScores = html.div.clone() .addClass( "judgeScores" );
		var judges      = e.judges      = new Array();
		var totalScore  = e.totalScore  = html.div.clone() .addClass( "totalScores" );
		var athlete     = e.athlete     = html.div.clone() .addClass( "athlete" );
		var score       = e.score       = html.div.clone() .addClass( "score" );
		totalScore.append( score );
		totalScore.append( athlete );

		var k = this.options.judges;
		for( var i = 0; i < k; i++ ) {
			var j = i + 1;
			var judge = html.div.clone() .prop( "id", "judge" + j );
			if(      k == 3   ) { judge.addClass( "judges3" ); }
			else if( k == 5   ) { judge.addClass( "judges5" ); }
			else if( k == 7   ) { judge.addClass( "judges7" ); }
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
		var o       = this.options;
		var k       = o.judges;
		var widget  = this.element;
		var current = o.current;

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
			var accuracy     = parseFloat( $( '#judgeScore' + j + ' .accuracy'     ).html());
			var presentation = parseFloat( $( '#judgeScore' + j + ' .presentation' ).html());
			if( isNaN( accuracy     )) { accuracy     = -1.0; }
			if( isNaN( presentation )) { presentation = -1.0; }
			scores[ i ]      = { accuracy : accuracy, presentation : presentation };
		}

		// ===== SKIP MIN AND MAX FOR 5 OR 7 JUDGES
		if( k == 5 || k == 7 ) {
			for( var i = 0; i < k; i++ ) {
				if( min.accuracy < 0     || scores[ min.accuracy ].accuracy         > scores[ i ].accuracy )     { min.accuracy     = i; }
				if( max.accuracy < 0     || scores[ max.accuracy ].accuracy         < scores[ i ].accuracy )     { max.accuracy     = i; }
				if( min.presentation < 0 || scores[ min.presentation ].presentation > scores[ i ].presentation ) { min.presentation = i; }
				if( max.presentation < 0 || scores[ max.presentation ].presentation < scores[ i ].presentation ) { max.presentation = i; }
				e.judges[ i ].removeClass( "ignore" );
			}
		}

		var sum   = { accuracy : 0.0, presentation : 0.0 };
		var count = { accuracy : 0,   presentation : 0   };
		var mean  = { accuracy : 0.0, presentation : 0.0 };

		for( var i = 0; i < k; i++ ) {
			if( i == min.accuracy         ) { e.judges[ i ].addClass( "ignore" ); continue; }
			if( i == max.accuracy         ) { e.judges[ i ].addClass( "ignore" ); continue; }
			if( scores[ i ].accuracy <= 0 ) { continue; }
			sum.accuracy += scores[ i ].accuracy;
			count.accuracy++;
		}
		for( var i = 0; i < k; i++ ) {
			if( i == min.presentation         ) { e.judges[ i ].addClass( "ignore" ); continue; }
			if( i == max.presentation         ) { e.judges[ i ].addClass( "ignore" ); continue; }
			if( scores[ i ].presentation <= 0 ) { continue; }
			sum.presentation += scores[ i ].presentation;
			count.presentation++;
		}
		mean.accuracy     = count.accuracy     == 0 ? 0.0 : (sum.accuracy     / count.accuracy)     .toFixed( 2 );
		mean.presentation = count.presentation == 0 ? 0.0 : (sum.presentation / count.presentation) .toFixed( 2 );

		var display       = { 
			accuracy:     o.html.div.clone() .addClass( "accuracy" )     .append( o.html.span.clone() .addClass( "mean" ) .html( mean.accuracy )),
			presentation: o.html.div.clone() .addClass( "presentation" ) .append( o.html.span.clone() .addClass( "mean" ) .html( mean.presentation )),
			total:        o.html.div.clone() .addClass( "total" )        .append( o.html.span.clone() .addClass( "total" ) .html( (parseFloat( mean.accuracy ) + parseFloat( mean.presentation )).toFixed( 2 ) )),
		};

		e.score.empty();
		if( mean.accuracy > 0.0 && mean.presentation > 0.0 ) { 
			e.score.append( display.accuracy, display.presentation, display.total ); 
		} 
		widget .fadeIn( 500 );
	},
	fadeout: function() {
		this.element.fadeOut( 500 );
	}
});
