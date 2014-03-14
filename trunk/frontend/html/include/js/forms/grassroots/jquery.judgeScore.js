$.widget( "freescore.judgeScore", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var options = this.options;
		options.elements = {};
		var html    = { div : $( "<div />" ) };
		var score   = options.elements.score = html.div.clone() .addClass( "score" ) .prop( "id", "judgeScore" + options.num );
		var name    = options.elements.name  = html.div.clone() .addClass( "judge" );
		name .html( "JUDGE " + options.num );
		this.element .addClass( "judgeScore" );
		this.element .append( score, name );
	},
	_init: function( ) {
		var e = this.options.elements;
		var score = this.options.score;
		if( score >= 0 ) { e.score .html( score ); }
		else             { e.score .html( '' ); }
	}
});
