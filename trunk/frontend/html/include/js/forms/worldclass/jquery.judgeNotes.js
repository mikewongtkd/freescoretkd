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

		if( ! defined( athletes )) { return; }
		if( ! defined( current  )) { return; }
		if( ! defined( round    )) { return; }

		view.empty();
		var table = h.table.clone();
		table.append( h.tr.clone() 
			.append( h.th.clone() .addClass( "order" )   .html( "#" ))
			.append( h.th.clone() .addClass( "name" )    .html( "Name" ))
			.append( h.th.clone() .addClass( "form1" )   .html( "Form 1" ))
			.append( h.th.clone() .addClass( "form2" )   .html( "Form 2" ))
			.append( h.th.clone() .addClass( "average" ) .html( "Avg" )));

		for( var i = 0; i < o.participants.length; i++ ) {
			var j            = o.participants[ i ];
			var tr           = h.tr.clone();
			var athlete      = athletes[ j ];
			var score        = { form1 : '', form2 : '', average : '' };

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
				score.average = (function() {
					var avg = forms.map( function( form ) { 
						if( ! defined( form.judge[ 0 ] )) { return 0.0; }
						var judge        = form.judge[ 0 ];
						if( ! defined(judge.major ) || ! defined( judge.minor ) || ! defined( judge.rhythm ) || ! defined( judge.power ) || ! defined( judge.ki )) { return 0.0; }
						if( judge.rhythm < 0.5 || judge.power < 0.5 || judge.ki < 0.5 ) { return 0.0; }
						var penalties    = judge.major + judge.minor;
						var accuracy     = parseFloat( penalties > 4.0 ? 0.0 : 4.0 - penalties );
						var presentation = parseFloat( judge.rhythm + judge.power + judge.ki );
						return (accuracy + presentation) / forms.length;
					} ).reduce( function( previous, current ) { return (previous + current) > 0 ? previous + current : 0; } );
					avg = avg > 0 ? avg.toFixed( 2 ) : '&ndash;';
					return avg;
				})();
			}

			var isCurrent    = function() { if( i == current ) { return "current"; }} // MW TODO This only works for the first round.

			tr
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "order" )   .html( i + 1 + "." ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "name"  )   .html( athlete.name ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "form1" )   .html( score.form1 ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "form2" )   .html( score.form2 ))
				.append( h.td.clone() .addClass( isCurrent() ) .addClass( "average" ) .html( score.average ));
			table.append( tr );
			j++;
		}
		view.append( table );
	}
});
