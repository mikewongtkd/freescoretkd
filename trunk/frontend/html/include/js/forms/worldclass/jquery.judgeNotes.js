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
		var formLabel = [
			defined( o.forms[ 0 ] ) ? o.forms[ 0 ].name : 'Form 1',
			defined( o.forms[ 1 ] ) ? o.forms[ 1 ].name : 'Form 2',
		];
		var header = {
			order : h.th.clone() .addClass( "order" )   .html( "#" ),
			name  : h.th.clone() .addClass( "name" )    .html( "Name" ),
			form1 : h.th.clone() .addClass( "form1" )   .html( formLabel[ 0 ] ),
			form2 : h.th.clone() .addClass( "form2" )   .html( formLabel[ 1 ] ),
			avg   : h.th.clone() .addClass( "average" ) .html( "Avg" )
		}
		var headers = [ header.order, header.name, header.form1 ];
		if( defined( o.forms ) && o.forms.length > 1 ) { headers.push( header.form2 ); } 
		else                                           { header.form1.removeClass( "form1" ) .addClass( "form" ); }
		headers.push( header.avg );
		var table = h.table.clone();
		table.append( h.tr.clone() .append( headers ));

		for( var i = 0; i < o.order.length; i++ ) {
			var j            = o.order[ i ];
			var tr           = h.tr.clone();
			var athlete      = athletes[ j ];
			var score        = { form1 : '', form2 : '', average : '' };

			if( athlete.scores[ round ].length > 0 ) {

				var summarize = function( form ) { // MW TODO Consider pulling this closure out.
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

			var isCurrent    = function( form ) { if( j == current ) { if( form == o.form ) { return "current-form"; } else { return "current"; }} else { return ''; }}

			var column = {
				order : h.td.clone() .addClass( isCurrent(   ) ) .addClass( "order" )   .html( i + 1 + "." ),
				name  : h.td.clone() .addClass( isCurrent(   ) ) .addClass( "name"  )   .html( athlete.name ),
				form1 : h.td.clone() .addClass( isCurrent( 0 ) ) .addClass( "form1" )   .html( score.form1 ),
				form2 : h.td.clone() .addClass( isCurrent( 1 ) ) .addClass( "form2" )   .html( score.form2 ),
				avg   : h.td.clone() .addClass( isCurrent(   ) ) .addClass( "average" ) .html( score.average )
			}
			var columns = [ column.order, column.name, column.form1 ];
			var headers = [ header.order, header.name, header.form1 ];
			if( defined( o.forms ) && o.forms.length > 1 ) { columns.push( column.form2 ); } 
			else                                           { column.form1.removeClass( "form1" ) .addClass( "form" ); }
			columns.push( column.avg );

			tr .append( columns );
			table.append( tr );
			j++;
		}
		view.append( table );
	}
});
