$.widget( "freescore.match", {
	options: { autoShow: true  },
	_create: function() {
		var w    = this.element;
		var o    = this.options;
		var e    = this.options.elements = {};
		var html = e.html  = FreeScore.html;

		var addMatch = o.addMatch = function( name, athlete ) {
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

		var addLine = o.addLine = function( name ) {
			var type = name.match( /8/ ) ? 'line8' : 'line4';
			var line = {
				panel : html.div.clone(),
				start : html.div.clone() .addClass( type + ' line-' + name + '-start' ),
				stop  : html.div.clone() .addClass( type + ' line-' + name + '-stop' )
			};
			line.panel.append( line.start, line.stop );

			e[ name ] = line;
			return line.panel;
		};

		w .addClass( 'bracket' );
	},
	_init: function( ) {
		var w    = this.element;
		var o    = this.options;
		var e    = this.options.elements;
		var html = e.html  = FreeScore.html;

		var division = o.division;
		if( ! defined( division )) {
			var blank  = {
				chung : { name : 'Blue', score : '&mdash;' },
				hong  : { name : 'Red',  score : '&mdash;' },
			};
			match = { ro8a: blank, ro8b: blank, ro8c: blank, ro8d: blank, ro4a: blank, ro4b: blank, ro2: blank };
		} else {
			var blank  = {
				chung : { name : '&mdash;', score : '&mdash;' },
				hong  : { name : '&mdash;', score : '&mdash;' },
			};
			[ 'ro8a', 'ro8b', 'ro8c', 'ro8d' ].forEach(( round ) => {
				var athletes = division.current.athletes( round );
				if( athletes.length == 0 ) { 
					match[ round ] = blank;
					return; 
				}
				if( athletes.length == 1 ) { 
					var chung = athletes[ 0 ];
					match[ round ].chung = { name : chung.display.name(), score: chung.score().total() };
					match[ round ].hong  = blank.hong;
					return;
				};
				if( athletes.length == 2 ) { 
					var chung = athletes[ 0 ];
					var hong  = athletes[ 1 ];
					match[ round ].chung = { name : chung.display.name(), score: chung.score().total() };
					match[ round ].hong  = { name : hong .display.name(), score: hong .score().total() };
					return;
				};
			});
		}

		w .empty();
		w .append( 
			o.addMatch( 'ro8a', match.ro8a ), o.addMatch( 'ro8b', match.ro8b ), o.addMatch( 'ro8c', match.ro8c ), o.addMatch( 'ro8d', match.ro8d ),
			o.addMatch( 'ro4a', match.ro4a ), o.addMatch( 'ro4b', match.ro4b ),
			o.addMatch( 'ro2', match.ro2 ),
			o.addLine( '8a4a' ), o.addLine( '8b4a' ), o.addLine( '8c4b' ), o.addLine( '8d4b' ), 
			o.addLine( '4a2' ), o.addLine( '4b2' )
		);
	}
});
