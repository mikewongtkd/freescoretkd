// Depends on jquery.judgeScore.js

$.widget( "freescore.divisions", {
	options: { autoShow: true, },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};

		var html     = e.html     = FreeScore.html;
		var list     = e.list     = html.div.clone() .addClass( "list" );
		var athletes = e.athletes = html.div.clone() .addClass( "athletes" );
		
		this.element .addClass( "divisions" );
		this.element .append( list, athletes );
	},

	_init: function() {
		var e       = this.options.elements;
		var o       = this.options;
		var html    = e.html;

		var addDivisionList = function( athletes ) {
			e.athletes.empty();
			for( var i = 0; i < athletes.length; i++ ) {
				var athlete = athletes[ i ];
				var display = html.div.clone() .addClass( "athlete" ) .html( athlete.name );
				e.athletes.append( display );
			}
		}

		var addLocation = function( name, divisions ) {
			var title = html.div.clone() .addClass( "location" );
			title.html( name );
			e.list.append( title );
			for( var i = 0; i < divisions.length; i++ ) {
				var division = divisions[ i ];
				var listing = html.div.clone() .addClass( "division" );
				listing.html( division.name.toUpperCase() + " " + division.description );
				listing.click( function() { 
					addDivisionList( division.athletes );
					e.athletes.show(); 
				} );
				e.list.append( listing );
			}
		}

		function refresh( update ) {
			var tournament = JSON.parse( update.data );
			console.log( tournament );
			e.list.empty();
			var locations = { 'staging' : [] };
			for( var i = 0; i < tournament.divisions.length; i++ ) {
				var division = tournament.divisions[ i ];
				var ring     = division.ring;
				if( ! defined( locations[ ring ] )) { locations[ ring ] = []; }
				locations[ ring ].push( division );
			}
			addLocation( "Staging", locations[ 'staging' ] );
			for( var ring in locations ) {
				if( ring == 'staging' ) { continue; }
				var divisions = locations[ ring ];
				addLocation( "Ring " + ring, divisions );
			}
		};

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	},
});
