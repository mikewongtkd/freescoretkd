$.widget( "freescore.judgeNotes", {
	options: { autoShow: true, judges: 3  },
	_create: function() {
		var widget  = this.element;
		var o       = this.options;
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

		if( typeof athletes === 'undefined' ) { return; }

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
			var score        = {};

			if( typeof( athlete.scores ) === 'undefined' ) {
				score.accuracy     = '';
				score.presentation = '';
				score.sum          = '';

			} else {
				var scores = new FreeScore.WorldClass.Score( athlete.scores, o.judges );
				score.accuracy     = scores.form.map( function( form ) { var x = (form.judge[ o.num ].accuracy     ); return x < 0 ? '&ndash;' : x.toFixed( 1 ); }).join( "/" );
				score.presentation = scores.form.map( function( form ) { var x = (form.judge[ o.num ].presentation ); return x < 0 ? '&ndash;' : x.toFixed( 1 ); }).join( "/" );
				score.sum          = scores.form.map( function( form ) { var x = (form.judge[ o.num ].total        ); return x < 0 ? '&ndash;' : x.toFixed( 1 ); }).join( "/" );
			}

			var isCurrent    = function() { if( i == current ) { return "current"; }}

			tr
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "order" )        .html( i + 1 + "." ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "name"  )        .html( athlete.name ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "accuracy" )     .html( score.accuracy ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "presentation" ) .html( score.presentation ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "sum" )          .html( score.sum ));
			table.append( tr );
		}
		view.append( table );
	}
});
