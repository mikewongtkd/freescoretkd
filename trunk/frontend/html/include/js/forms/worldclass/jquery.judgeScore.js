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
		if( typeof( score ) === 'undefined' ) {
			score = {};
			score.major  = '';
			score.minor  = '';
			score.rhythm = '';
			score.power  = '';
			score.ki     = '';
		}
		var penalties = (parseFloat( score.major ) + parseFloat( score.minor ));
		var accuracy = 4.0 - penalties;
		accuracy = accuracy <= 0 ? 0.0 : accuracy;

		var presentation = parseFloat( score.rhythm ) + parseFloat( score.power ) + parseFloat( score.ki );

		// ===== DISPLAY VALID SCORES
		if( penalties >= 0 && presentation >= 1.5 ) { 
			var span = {
				accuracy     : o.html.span .clone() .addClass( "accuracy"     ) .html( accuracy.toFixed( 1 )),
				presentation : o.html.span .clone() .addClass( "presentation" ) .html( presentation.toFixed( 1 ))
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
