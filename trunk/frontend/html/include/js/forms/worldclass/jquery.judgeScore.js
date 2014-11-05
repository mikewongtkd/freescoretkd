$.widget( "freescore.judgeScore", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var o       = this.options;
		var e       = this.options.elements = {};
		var html    = o.html  = { div : $( "<div />" ), span : $( "<span />" ) };
		var score   = e.score = html.div.clone() .addClass( "score" ) .prop( "id", "judgeScore" + o.num );
		var name    = e.name  = html.div.clone() .addClass( "judge" );
		var view    = e.view  = html.div.clone();
		score.append( view );
		name .html( "JUDGE " + o.num );
		this.element .addClass( "judgeScore" );
		this.element .append( score, name );
	},
	_init: function( ) {
		var e        = this.options.elements;
		var o        = this.options;
		var score    = o.score;
		if( defined( score )) {
			score.accuracy     = defined( score.accuracy )     ?  score.accuracy.toFixed( 1 )     : '';
			score.presentation = defined( score.presentation ) ?  score.presentation.toFixed( 1 ) : '';

		} else {
			score = {};
			score.accuracy     = '';
			score.presentation = '';
		}

		// ===== DISPLAY VALID SCORES
		if( score.accuracy >= 0 && score.presentation >= 0 ) { 
			var span = {
				accuracy     : o.html.span .clone() .addClass( "accuracy"     ) .html( score.accuracy     ),
				presentation : o.html.span .clone() .addClass( "presentation" ) .html( score.presentation )
			};
			e.view.empty();
			e.view.append( span.accuracy, "&nbsp;", span.presentation );
			e.view.fadeIn(); 

		// ===== HIDE INVALID SCORES
		} else {
			e.view.empty();
			e.view.fadeOut();
		}
	}
});
