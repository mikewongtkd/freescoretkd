$.widget( "freescore.judgeScore", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var options = this.options;
		var e       = this.options.elements = {};
		var html    = { div : $( "<div />" ) };
		var score   = e.score = html.div.clone() .addClass( "score" ) .prop( "id", "judgeScore" + options.num );
		var name    = e.name  = html.div.clone() .addClass( "judge" );
		var view    = e.view  = html.div.clone();
		score.append( view );
		name .html( "JUDGE " + options.num );
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
		var accuracy = 4.0 - (parseFloat( score.major ) + parseFloat( score.minor ));
		accuracy = accuracy <= 0 ? 0.0 : accuracy;

		var presentation = parseFloat( score.rhythm ) + parseFloat( score.power ) + parseFloat( score.ki );
		if( ! isNaN( accuracy ) && ! isNaN( presentation )) { e.view.html( "<span class=\"accuracy\">" + accuracy.toFixed( 1 ) + "</span>&nbsp;<span class=\"presentation\">" + presentation.toFixed( 1 ) + "</span>" ); e.view.fadeIn(); }
		else                                                { e.view.fadeOut( 500, function() { e.view .empty(); }); }
	}
});
