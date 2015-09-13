$.widget( "freescore.match", {
	options: { autoShow: true  },
	_create: function() {
		var w    = this.element;
		var o    = this.options;
		var e    = this.options.elements = {};
		var html = e.html  = FreeScore.html;

		var addMatch = o.addMatch = function( name ) {
			var division = o.division;
			var athlete  = {};
			if( ! defined( division )) {
				athlete  = {
					chung : { name : 'Blue', score : '&mdash;' },
					hong  : { name : 'Red',  score : '&mdash;' },
				};
			} else {
			}
			var zoom  = { ro8a : 'zoom-right', ro8b : 'zoom-right', ro8c : 'zoom-right', ro8d : 'zoom-right', ro4a : 'zoom', ro4b : 'zoom', ro2 : 'zoom-left' };
			var match = {
				panel : html.div.clone() .addClass( 'match nozoom ' + name ) .attr({ id : name }) .hover( function() { $( this ).toggleClass( zoom[ name ] + ' nozoom fade' ); $( '.match' ).toggleClass( 'fade' ); }),
				chung : {
					panel   : html.div.clone() .addClass( "chung" ),
					athlete : html.div.clone() .addClass( "athlete" ) .html( athlete.chung.name ),
					score   : html.div.clone() .addClass( "score" )   .html( athlete.chung.score ),
				},
				hong : {
					panel   : html.div.clone() .addClass( "hong" ),
					athlete : html.div.clone() .addClass( "athlete" ) .html( athlete.hong.name ),
					score   : html.div.clone() .addClass( "score" )   .html( athlete.hong.score ),
				}
			};
			match.chung .panel.append( match.chung .athlete, match.chung .score );
			match.hong  .panel.append( match.hong  .athlete, match.hong  .score );
			match.panel.append( match.chung.panel, match.hong.panel );

			e[ name ] = match;
			return match.panel;
		};

		w .addClass( 'bracket' );
	},
	_init: function( ) {
		var w    = this.element;
		var o    = this.options;
		var e    = this.options.elements;
		var html = e.html  = FreeScore.html;

		w .empty();
		w .append( 
			o.addMatch( 'ro8a' ), o.addMatch( 'ro8b' ), o.addMatch( 'ro8c' ), o.addMatch( 'ro8d' ),
			o.addMatch( 'ro4a' ), o.addMatch( 'ro4b' ),
			o.addMatch( 'ro2' )
		);
	}
});
