$.widget( "freescore.divisionEditor", {
	options: { autoShow: true },
	_create: function() {
		var o       = this.options;
		var e       = this.options.elements = {};
		var widget  = this.element;
		var html    = { div : $( "<div />" ) };
		var score   = e.score = html.div.clone() .addClass( "score" ) .prop( "id", "judgeScore" + options.num );
		var name    = e.name  = html.div.clone() .addClass( "judge" );
		var view    = e.view  = html.div.clone();
		this.element .append( score, name );
	},
	_init: function( ) {
		var e     = this.options.elements;
		var o     = this.options;
		var score = o.score;
		if( score >= 0 ) { e.view.html( score ); e.view.fadeIn(); }
		else             { e.view.fadeOut( 500, function() { e.view .empty(); }); }
	}
});
