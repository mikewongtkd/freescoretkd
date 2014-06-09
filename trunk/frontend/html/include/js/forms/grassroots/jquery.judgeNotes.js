$.widget( "freescore.judgeNotes", {
	options: { autoShow: true  },
	_create: function() {
		var options = this.options;
		var e       = this.options.elements = {};
		var widget  = this.element;
		var html    = e.html = { div : $( "<div />" ), a : $( "<a />" ), table : $( "<table />" ), tr : $( "<tr />" ), th : $( "<th />" ), td : $( "<td />" ) };
		var view    = e.view = html.div.clone() .addClass( "view" );

		widget.addClass( 'judgeNotes' );
		widget.append( view );

	},
	_init: function( ) {
		var e        = this.options.elements;
		var h        = this.options.elements.html;
		var o        = this.options;
		var widget   = this.element;
		var view     = e.view;
		var athletes = o.athletes;
		var current  = o.current;

		view.empty();
		var table = h.table.clone();
		table.append( h.tr.clone() 
			.append( h.th.clone().html( "#" ))
			.append( h.th.clone().html( "Name" ))
			.append( h.th.clone().html( "Judge " + (o.num + 1))));

		for( var i = 0; i < athletes.length; i++ ) {
			var tr        = h.tr.clone();
			var athlete   = athletes[ i ];
			var score     = athlete.scores[ o.num ]; score = score <= 0 ? "" : score;
			var isCurrent = function() { if( i == current ) { return "current"; }}

			tr
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "td-order" ) .html( i + 1 + "." ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "td-name"  ) .html( athlete.name ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "td-score" ) .html( score ));
			table.append( tr );
		}
		view.append( table );
	}
});