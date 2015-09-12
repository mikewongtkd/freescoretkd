$.widget( "freescore.match", {
	options: { autoShow: true  },
	_create: function() {
		var w    = this.element;
		var o    = this.options;
		var e    = this.options.elements = {};
		var html = e.html  = FreeScore.html;

		var addMatch = function( name ) {
			var match = {
				panel : html.div.clone() .addClass( "match" ) .addClass( name ) .addClass( "grow" ) .attr({ id : name }),
				chung : {
					panel   : html.div.clone() .addClass( "chung" ),
					athlete : html.div.clone() .addClass( "athlete" ) .html( "Blue" ),
					score   : html.div.clone() .addClass( "score" )   .html( "7.66" ),
				},
				hong : {
					panel   : html.div.clone() .addClass( "hong" ),
					athlete : html.div.clone() .addClass( "athlete" ) .html( "Red" ),
					score   : html.div.clone() .addClass( "score" )   .html( "7.42" ),
				}
			};
			match.chung .panel.append( match.chung .athlete, match.chung .score );
			match.hong  .panel.append( match.hong  .athlete, match.hong  .score );
			match.panel.append( match.chung.panel, match.hong.panel );

			e[ name ] = match;
			return match.panel;
		};

		var match = {
			ro8  : html.div.clone() .append( addMatch( 'ro8a' ), addMatch( 'ro8b' ), addMatch( 'ro8c' ), addMatch( 'ro8d' )),
			ro4  : html.div.clone() .append( addMatch( 'ro4a' ), addMatch( 'ro4b' )),
			ro2  : addMatch( 'ro2'  ),
		}

		w .append( 
			addMatch( 'ro8a' ), addMatch( 'ro8b' ), addMatch( 'ro8c' ), addMatch( 'ro8d' ),
			addMatch( 'ro4a' ), addMatch( 'ro4b' ),
			addMatch( 'ro2' )
			// match.ro2 
		) .addClass( "bracket" );
	},
	_init: function( ) {
		var w    = this.element;
		var o    = this.options;
		var e    = this.options.elements;
		var html = e.html  = FreeScore.html;

	}
});
