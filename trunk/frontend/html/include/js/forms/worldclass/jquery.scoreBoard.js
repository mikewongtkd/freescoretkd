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
		totalScore.append( athlete, score, round );

		for( var i = 0; i < k; i++ ) {
			var j = i + 1;
			var judge = html.div.clone() .prop( "id", "judge" + j );
			if     ( k == 3 ) { judge.addClass( "judges3" ); }
			else if( k == 5 ) { judge.addClass( "judges5" ); }
			else if( k == 7 ) { judge.addClass( "judges7" ); }
			judge.judgeScore( { num: j, max: k } ); // Instantiate a new Judge Score widget for each judge
			judges[ i ] = judge;
			judgeScores.append( judge );
		}
		
		this.element .addClass( "scoreboard" );
		this.element .append( judgeScores, totalScore );
	},

	_init: function() {
		var e       = this.options.elements;
		var o       = this.options;
		var k       = o.judges;
		var widget  = this.element;
		var current = o.current;
		var ordinal = [ '1st', '2nd', '3rd', '4th' ];
		if( ! defined( current )) { return; }

		var round_description;
		if( current.forms.length > 1 ) { round_description = current.name.toUpperCase() + ' &ndash; ' + current.round + ' round &ndash; ' + ordinal[ current.form ] + ' form &ndash; ' + current.forms[ current.form ]; } 
		else                           { round_description = current.name.toUpperCase() + ' &ndash; ' + current.round + ' round &ndash; ' + current.forms[ current.form ]; }
		if( ! defined( o.previous ) || (
			current.athlete.name != o.previous.athlete.name &&
			current.round != o.previous.round &&
			current.form != o.previous.form
		)) {
			e.athlete .html( '' ) .fadeOut( 500, function() { e.athlete .html( current.athlete.name ) .fadeIn(); });
			e.round   .html( '' ) .fadeOut( 500, function() { e.round   .html( round_description )    .fadeIn(); });
		}
		
		if( ! defined( current.athlete.scores )) { return; }
		var judge_scores = current.athlete.scores[ current.round ][ current.form ].judge;
		for( var i = 0; i < k; i++ ) {
			e.judges[ i ].judgeScore( { score : judge_scores[ i ] } );
		}

		if( parseInt( current.athlete.index ) % 2 ) { // MW This is broken for multiple rounds
			e.athlete .removeClass( "chung" ); 
			e.athlete .addClass( "hong" ); 
		} else { 
			e.athlete .removeClass( "hong" ); 
			e.athlete .addClass( "chung" ); 
		}
		var accuracy      = 0;
		var presentation  = 0;
		var score         = 0;
		for( var i = 0; i <= current.form; i++ ) {
			var form = current.athlete.scores[ current.round ][ i ];
			var mean      = form.adjusted_mean;
			if( ! defined( mean )) { continue; }
			accuracy     = mean.accuracy;
			presentation = mean.presentation;
			score        = mean.accuracy + mean.presentation;
		}
		if( accuracy >= 0     ) { accuracy     = accuracy.toFixed( 2 );     } else { accuracy     = ''; }
		if( presentation >= 0 ) { presentation = presentation.toFixed( 2 ); } else { presentation = ''; }
		if( score >= 0        ) { score        = score.toFixed( 2 );        } else { score        = ''; }

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
		o.previous = current;
	},
	fadeout: function() {
		this.element.fadeOut( 500 );
	}
});
