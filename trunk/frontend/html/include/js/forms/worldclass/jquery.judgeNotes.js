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
		var round    = o.round;

		if( typeof athletes === 'undefined' ) { return; }
		if( typeof current  === 'undefined' ) { return; }
		if( typeof round    === 'undefined' ) { return; }

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

			if( 
				! defined( athlete.scores ) || 
				! defined( athlete.scores[ round ] ) || 
				! defined( athlete.scores[ round ].adjusted_mean ) || 
				athlete.scores.length == 0 
			) {
				score.accuracy     = '';
				score.presentation = '';
				score.sum          = '';

			} else {
				var forms = athlete.scores[ round ];
				score.accuracy     = forms.map( function( form ) { return form.adjusted_mean.accuracy.toFixed( 1 );        } ).join( '/' );
				score.presentation = forms.map( function( form ) { return form.adjusted_mean.presentation.toFixed( 1 );    } ).join( '/' );
				score.sum          = forms.map( function( form ) { return form.adjusted_mean.accuracy + form.adjusted_mean.presentation; } ).reduce( function( previous, current ) { return previous + current; } ).toFixed( 1 );
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
