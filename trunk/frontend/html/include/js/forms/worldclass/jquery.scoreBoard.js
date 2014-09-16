// Depends on jquery.judgeScore.js

$.widget( "freescore.scoreboard", {
	options: { autoShow: true, judges: 3 },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};

		var html = o.html = { div : $( "<div />" ), span : $( "<span />" ) };
		var judgeScores = e.judgeScores = html.div.clone() .addClass( "judgeScores" );
		var judges      = e.judges      = new Array();
		var totalScore  = e.totalScore  = html.div.clone() .addClass( "totalScores" );
		var athlete     = e.athlete     = html.div.clone() .addClass( "athlete" );
		var round       = e.round       = html.div.clone() .addClass( "round" );
		var score       = e.score       = html.div.clone() .addClass( "score" );
		totalScore.append( score, athlete, round );

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
		if( typeof( current.athlete.scores ) === 'undefined' ) { return; }

		var scores = new FreeScore.WorldClass.Score( current.athlete.scores, k, o.current.round );
		e.athlete .html( current.athlete.name );
		if( current.forms.length > 1 ) { e.round   .html( 'Final round &ndash; ' + ordinal[ current.round ] + ' form &ndash; ' + current.forms[ current.round ] ); } 
		else                           { e.round   .html( 'Final round &ndash; ' + current.forms[ current.round ] ); }
		
		for( var i = 0; i < k; i++ ) {
			e.judges[ i ].judgeScore( { score : scores.form[ current.round ].judge[ i ] } );
		}

		if( parseInt( current.athlete.index ) % 2 ) { 
			e.athlete .removeClass( "chung" ); 
			e.athlete .addClass( "hong" ); 
		} else { 
			e.athlete .removeClass( "hong" ); 
			e.athlete .addClass( "chung" ); 
		}

		var display       = { 
			accuracy:     o.html.div.clone() .addClass( "accuracy" )     .append( o.html.span.clone() .addClass( "mean" )  .html( scores.total.accuracy.toFixed( 1 ) )),
			presentation: o.html.div.clone() .addClass( "presentation" ) .append( o.html.span.clone() .addClass( "mean" )  .html( scores.total.presentation.toFixed( 1 ) )),
			total:        o.html.div.clone() .addClass( "total" )        .append( o.html.span.clone() .addClass( "total" ) .html( scores.total.score.toFixed( 1 ))),
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
