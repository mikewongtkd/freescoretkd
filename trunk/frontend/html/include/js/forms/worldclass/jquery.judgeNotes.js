$.widget( "freescore.judgeNotes", {
	options: { autoShow: true  },
	_create: function() {
		var widget  = this.element;
		var options = this.options;
		var e       = this.options.elements = {};
		var html    = e.html = { div : $( "<div />" ), a : $( "<a />" ), table : $( "<table />" ), tr : $( "<tr />" ), th : $( "<th />" ), td : $( "<td />" ) };
		var view    = e.view = html.div.clone() .addClass( "view" );

		widget.addClass( 'judgeNotes' );
		widget.append( view );

	},
	_init: function( ) {
		var widget   = this.element;
		var e        = this.options.elements;
		var h        = this.options.elements.html;
		var o        = this.options;
		var view     = e.view;
		var athletes = o.athletes;
		var current  = o.current;

		view.empty();
		var table = h.table.clone();
		table.append( h.tr.clone() 
			.append( h.th.clone() .addClass( "order" )        .html( "#" ))
			.append( h.th.clone() .addClass( "name" )         .html( "Name" ))
			.append( h.th.clone() .addClass( "accuracy" )     .html( "Acc." ))
			.append( h.th.clone() .addClass( "presentation" ) .html( "Pres." ))
			.append( h.th.clone() .addClass( "sum" )          .html( "Sum" )));

		for( var i = 0; i < athletes.length; i++ ) {
			var tr           = h.tr.clone();
			var athlete      = athletes[ i ];
			var score        = athlete.scores[ o.num ];

			if( typeof( score ) === 'undefined' ) {
				score              = {};
				score.accuracy     = -1.0;
				score.presentation = -1.0;
			}

			var accuracy     = score.accuracy;                                                  accuracy     = accuracy     <= 0 ? "" : parseFloat( accuracy ).toFixed( 1 );
			var presentation = score.presentation;                                              presentation = presentation <= 0 ? "" : parseFloat( presentation ).toFixed( 1 );
			var sum          = parseFloat( score.accuracy ) + parseFloat( score.presentation ); sum          = sum          <= 0 ? "" : parseFloat( sum ).toFixed( 1 );
			var isCurrent    = function() { if( i == current ) { return "current"; }}

			tr
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "order" )        .html( i + 1 + "." ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "name"  )        .html( athlete.name ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "accuracy" )     .html( accuracy ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "presentation" ) .html( presentation ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "sum" )          .html( sum ));
			table.append( tr );
		}
		view.append( table );
	}
});
