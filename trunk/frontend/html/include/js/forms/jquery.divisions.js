/*
 * Ideas:
 *
 * Pagination
 * Search for division name, description, or athlete
 * Divisions are sortable; use "connectWith" option for jQuery Sortable to tie together the different pages
 *
 * Name Description ... #Athletes
 */
$.widget( "freescore.divisions", {
	options: { autoShow: true  },
	_create: function() {
		var widget  = this.element;
		var o       = this.options;
		var e       = this.options.elements = {};
		var html    = e.html   = { div : $( "<div />" ), ul : $( "<ul />"), li : $( "<li />" ), input : $( "<input />" ), h1 : $( "<h1 />" ) };
		var list    = e.list   = html.ul.clone() .sortable();
		var title   = e.title  = html.h1.clone() .html( o.event.substr( 0, 1 ).toUpperCase() + o.event.substr( 1 ) + " Divisions" );
		var search  = e.search = html.div.clone() .addClass( "search" );
		var input   = e.input  = html.input.clone() .attr( "type", "search" ) .attr( "results", "0" ) .attr( "placeholder", " Search for athlete names or division name or descriptions" );

		search .append( input );

		e.division  = {};
		o.input     = [];

		input.change( function() {
			var search = new RegExp( $( input ).val(), 'i' );
			for( var id in e.division ) {
				var division = e.division[ id ] .division( 'option', 'entry' );
				var divisionMatches = division.name.match( search );
				if( typeof( division.description ) !== 'undefined' ) { divisionMatches = divisionMatches || division.description.match( search ); }
				var athleteMatches  = false;
				for( var i = 0; i < division.athletes.length; i++ ) {
					var athlete = division.athletes[ i ];
					if( athlete.name.match( search )) { athleteMatches = true; break; }
				}
				if( divisionMatches || athleteMatches ) { e.division[ id ].show(); } 
				else                                    { e.division[ id ].hide(); }
			};
		});
		
		widget.addClass( 'divisions' );
		widget.append( title, search, list );
	},
	_init: function( ) {
		var widget   = this.element;
		var o        = this.options;
		var e        = this.options.elements;
		var h        = this.options.elements.html;

		var refresh = function( update ) {
			var forms    = JSON.parse( update.data );
			var current  = parseInt( forms.current );

			o.input = [];
			for( var i = 0; i < forms.divisions.length; i++ ) {
				var division = forms.divisions[ i ];
				if( typeof( e.division[ division.name ] ) === 'undefined' ) {
					e.division[ division.name ] = h.li.clone() .division({ entry : division, isCurrent : i == current });
					e.list.append( e.division[ division.name ] );

					o.input[ division.name.toUpperCase() ] = 1;
					for( var j = 0; j < division.athletes.length; j++ ) {
						var athlete = division.athletes[ j ];
						o.input[ athlete.name ] = 1;
					}
				}
			}
			e.input.autocomplete({ source : Object.keys( o.input )});
		}

		e.source = new EventSource( '/cgi-bin/forms/' + o.event + '/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	}
});
