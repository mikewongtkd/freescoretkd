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
		var roundLabel = { prelim : 'Preliminary Round', semfin : 'Semi-Finals', finals : 'Finals', ro8 : '1st Finals', ro4 : '2nd Finals', ro2: '3rd Finals' };
		var formLabel = [
			defined( o.forms[ 0 ] ) ? o.forms[ 0 ] : 'Form 1',
			defined( o.forms[ 1 ] ) ? o.forms[ 1 ] : 'Form 2',
		];
		var header = {
			order : h.th.clone() .addClass( "order" )   .html( "#" ),
			name  : h.th.clone() .addClass( "name" )    .html( "Name (" + roundLabel[ round ] + ")" ),
			form1 : h.th.clone() .addClass( "form1" )   .html( formLabel[ 0 ] ),
			form2 : h.th.clone() .addClass( "form2" )   .html( formLabel[ 1 ] ),
			avg   : h.th.clone() .addClass( "average" ) .html( "Avg" )
		}
		var headers = [ header.order, header.name, header.form1 ];
		if( defined( o.forms ) && o.forms.length > 1 ) { headers.push( header.form2 ); } 
		else                                           { header.form1.removeClass( "form1" ) .addClass( "form0" ); }
		headers.push( header.avg );
		var table = h.table.clone();
		table.append( h.tr.clone() .append( headers ));

		var summarize = function( form ) {
			var accuracy     = form.accuracy().toFixed( 1 );
			var presentation = form.presentation().toFixed( 1 );
			if( ! form.is.complete() ) { accuracy = presentation = '&ndash;'; }
			return [
				e.html.span.clone() .addClass( "accuracy" )     .html( accuracy ), '/',
				e.html.span.clone() .addClass( "presentation" ) .html( presentation ) 
			];
		};

		for( var i = 0; i < o.order.length; i++ ) {
			var j            = o.order[ i ];
			var tr           = h.tr.clone();
			var athlete      = athletes[ j ];

			var score   = athlete.score( round );
			var form1   = summarize( score.form( 0 ));
			var form2   = score.forms.count() > 1 ? summarize( score.form( 1 )) : '';
			var average = score.is.complete() ? score.average().toFixed( 2 ) : '&ndash;';
			var isCurrent    = function( form ) { if( j == current ) { if( form == o.form ) { return "current-form"; } else { return "current"; }} else { return ''; }}

			var column = {
				order : h.td.clone() .addClass( isCurrent(   ) ) .addClass( "order" )   .html( i + 1 + "." ),
				name  : h.td.clone() .addClass( isCurrent(   ) ) .addClass( "name"  )   .html( athlete.name() ),
				form1 : h.td.clone() .addClass( isCurrent( 0 ) ) .addClass( "form1" )   .html( form1 ),
				form2 : h.td.clone() .addClass( isCurrent( 1 ) ) .addClass( "form2" )   .html( form2 ),
				avg   : h.td.clone() .addClass( isCurrent(   ) ) .addClass( "average" ) .html( average )
			}
			var columns = [ column.order, column.name, column.form1 ];
			var headers = [ header.order, header.name, header.form1 ];
			if( defined( o.forms ) && o.forms.length > 1 ) { columns.push( column.form2 ); } 
			else                                           { column.form1.removeClass( "form1" ) .addClass( "form0" ); }
			columns.push( column.avg );

			tr .append( columns );
			table.append( tr );
			j++;
		}
		view.append( table );
	}
});
