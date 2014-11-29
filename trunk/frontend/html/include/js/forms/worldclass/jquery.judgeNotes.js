$.widget( "freescore.judgeNotes", {
	options: { autoShow: true, judges: 3  },
	_create: function() {
		var widget  = this.element;
		var o       = this.options;
		var e       = this.options.elements = {};
		var html    = e.html = { div : $( "<div />" ), span : $( "<span />" ), a : $( "<a />" ), table : $( "<table />" ), tr : $( "<tr />" ), th : $( "<th />" ), td : $( "<td />" ) };
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
			.append( h.th.clone() .addClass( "order" ) .html( "#" ))
			.append( h.th.clone() .addClass( "name" )  .html( "Name" ))
			.append( h.th.clone() .addClass( "form1" ) .html( "Form 1" ))
			.append( h.th.clone() .addClass( "form2" ) .html( "Form 2" ))
			.append( h.th.clone() .addClass( "sum" )   .html( "Sum" )));

		for( var i = 0; i < o.participants.length; i++ ) {
			var j            = o.participants[ i ];
			var tr           = h.tr.clone();
			var athlete      = athletes[ j ];
			var score        = { form1 : '', form2 : '', sum : '' };

			if( athlete.scores[ round ].length > 0 ) {
				var summarize = function( form ) {
					var score = { accuracy : 0.0, presentation : 0.0 };
					if   ( defined( form.adjusted_mean ) && defined( form.adjusted_mean.accuracy )) { 
						score = form.adjusted_mean; 
						return [
							e.html.span.clone() .addClass( "accuracy" )     .html( score.accuracy.toFixed( 1 ) ), '/',
							e.html.span.clone() .addClass( "presentation" ) .html( score.presentation.toFixed( 1 ) ) 
						];
					} 
					return [ e.html.span.clone() .addClass( "accuracy" ) .html( '&ndash;' ), '/', e.html.span.clone() .addClass( "presentation" ) .html( '&ndash;' ) ];
				}
				var forms = athlete.scores[ round ];
				score.form1 = summarize( forms[ 0 ] );
				if( defined( forms[ 1 ] )) { score.form2 = summarize( forms[ 1 ] ); }
				score.sum   = forms.map( function( form ) { return defined( form.judge[ 0 ]) ? form.judge[ 0 ].accuracy + form.judge[ 0 ].presentation : 0.0; } ).reduce( function( previous, current ) { return previous + current; } ).toFixed( 2 );
			}

			var isCurrent    = function() { if( i == current ) { return "current"; }}

			tr
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "order" ) .html( i + 1 + "." ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "name"  ) .html( athlete.name ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "form1" ) .html( score.form1 ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "form2" ) .html( score.form2 ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "sum" )   .html( score.sum ));
			table.append( tr );
			j++;
		}
		view.append( table );
	}
});
