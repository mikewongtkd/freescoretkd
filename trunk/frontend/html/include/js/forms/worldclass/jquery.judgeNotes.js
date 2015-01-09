$.widget( "freescore.judgeNotes", {
	options: { autoShow: true, judges: 3  },
	_create: function() {
		var widget  = this.element;
		var o       = this.options;
		var e       = this.options.elements = {};
		var html    = e.html = FreeScore.html;
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
					var judge        = form.judge[ 0 ];
					var penalties    = judge.major + judge.minor;
					var accuracy     = parseFloat( penalties > 4.0 ? 0.0 : 4.0 - penalties );
					var presentation = parseFloat( judge.rhythm + judge.power + judge.ki );
					var score        = { accuracy : accuracy.toFixed( 1 ), presentation : presentation.toFixed( 1 ) };
					if   ( accuracy >= 0 && presentation > 0 ) { 
						return [
							e.html.span.clone() .addClass( "accuracy" )     .html( score.accuracy ), '/',
							e.html.span.clone() .addClass( "presentation" ) .html( score.presentation ) 
						];
					} 
					return [ e.html.span.clone() .addClass( "accuracy" ) .html( '&ndash;' ), '/', e.html.span.clone() .addClass( "presentation" ) .html( '&ndash;' ) ];
				}
				var forms = athlete.scores[ round ];
				score.form1 = summarize( forms[ 0 ] );
				if( defined( forms[ 1 ] )) { score.form2 = summarize( forms[ 1 ] ); }
				score.sum   = forms.map( function( form ) { 
					if( ! defined( form.judge[ 0 ] )) { return 0.0; }
					var judge        = form.judge[ 0 ];
					if( ! defined(judge.major ) || ! defined( judge.minor ) || ! defined( judge.rhythm ) || ! defined( judge.power ) || ! defined( judge.ki )) { return 0.0; }
					var penalties    = judge.major + judge.minor;
					var accuracy     = parseFloat( penalties > 4.0 ? 0.0 : 4.0 - penalties );
					var presentation = parseFloat( judge.rhythm + judge.power + judge.ki );
					return accuracy + presentation;
				} ).reduce( function( previous, current ) { return previous + current; } ).toFixed( 2 );
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
