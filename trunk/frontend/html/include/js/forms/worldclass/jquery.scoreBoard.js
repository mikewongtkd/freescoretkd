// Depends on jquery.judgeScore.js

$.widget( "freescore.scoreboard", {
	options: { autoShow: true, judges: 3 },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};
		var k = o.judges;

		var html        = o.html = { div : $( "<div />" ), span : $( "<span />" ) };
		var judgeScores = e.judgeScores = html.div.clone() .addClass( "judgeScores" );
		var judges      = e.judges      = new Array();
		var totalScore  = e.totalScore  = html.div.clone() .addClass( "totalScores" );
		var athlete     = e.athlete     = html.div.clone() .addClass( "athlete" );
		var round       = e.round       = html.div.clone() .addClass( "round" );
		var score       = e.score       = html.div.clone() .addClass( "score" );
		totalScore.append( score, athlete, round );

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
		
		this.element .addClass( "scoreboard" );
		this.element .append( judgeScores );
		this.element .append( totalScore );
	},

	_init: function() {
		var e       = this.options.elements;
		var o       = this.options;
		var k       = o.judges;
		var widget  = this.element;
		var current = o.current;
		var ordinal = [ '1st', '2nd', '3rd', '4th' ];
		if( typeof( current ) === 'undefined' ) { return; }

		var round_description;
		if( current.forms.length > 1 ) { round_description = current.round + ' round &ndash; ' + ordinal[ current.form ] + ' form &ndash; ' + current.forms[ current.form ]; } 
		else                           { round_description = current.round + ' round &ndash; ' + current.forms[ current.form ]; }
		e.athlete .html( '' ) .fadeOut( 500, function() { e.athlete .html( current.athlete.name ) .fadeIn(); });
		e.round   .html( '' ) .fadeOut( 500, function() { e.round   .html( round_description )    .fadeIn(); });
		
		if( typeof( current.athlete.scores ) === 'undefined' ) { return; }
		var scores = new FreeScore.WorldClass.Score( current.athlete.scores, k, current.form );
		for( var i = 0; i < k; i++ ) {
			e.judges[ i ].judgeScore( { score : scores.form[ current.form ].judge[ i ] } );
		}

		if( parseInt( current.athlete.index ) % 2 ) { 
			e.athlete .removeClass( "chung" ); 
			e.athlete .addClass( "hong" ); 
		} else { 
			e.athlete .removeClass( "hong" ); 
			e.athlete .addClass( "chung" ); 
		}
		var accuracy      = scores.total.accuracy     > 0.0 ? scores.total.accuracy.toFixed( 1 )     : '';
		var presentation  = scores.total.presentation > 0.0 ? scores.total.presentation.toFixed( 1 ) : '';
		var score         = scores.total.score        > 0.0 ? scores.total.score.toFixed( 1 )        : '';

		var display       = { 
			accuracy:     o.html.div.clone() .addClass( "accuracy" )     .append( o.html.span.clone() .addClass( "mean" )  .html( accuracy )),
			presentation: o.html.div.clone() .addClass( "presentation" ) .append( o.html.span.clone() .addClass( "mean" )  .html( presentation )),
			total:        o.html.div.clone() .addClass( "total" )        .append( o.html.span.clone() .addClass( "total" ) .html( score )),
		};

		e.score.empty();
		if( true ) { 
			e.score.append( display.accuracy, display.presentation, display.total ); 
		} 
		widget .fadeIn( 500 );
	},
	fadeout: function() {
		this.element.fadeOut( 500 );
	}
});
