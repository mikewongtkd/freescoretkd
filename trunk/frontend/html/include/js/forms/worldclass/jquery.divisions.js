
$.widget( "freescore.divisions", {
	options: { autoShow: true, },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};

		var html     = e.html     = FreeScore.html;
		var list     = e.list     = html.div.clone() .addClass( "list" );
		var athletes = e.athletes = html.div.clone() .addClass( "athletes" );
		var arrow    = e.arrow    = html.div.clone() .addClass( "arrow" );
		arrow.hide();
		
		this.element .addClass( "divisions" );
		this.element .append( list, arrow, athletes );
	},

	_init: function() {
		var e       = this.options.elements;
		var o       = this.options;
		var html    = e.html;

		var addDivisionList = function( division ) {
			var athletes = division.athletes;
			var description = html.div.clone() .addClass( "division" ).html( division.description );
			e.athletes.empty();
			e.athletes.append( description );
			var list = html.ul.clone();
			list.sortable({ axis : 'y' });
			list.on( "sortstop", function( ev, ui ) {  
				o.reorder = [];
				list.children().each( function( index ) { o.reorder[ $( this ).prop( "order" ) ] = index; } );
				console.log( o.reorder ); 
				// REST call to reorder
			} );
			for( var i = 0; i < athletes.length; i++ ) {
				var athlete = { 'data' : athletes[ i ] };
				var icon    = html.span.clone() .addClass( "ui-icon" ) .addClass( "ui-icon-arrowthick-2-n-s" )
				var name    = html.span.clone() .html( athlete.data.name );
				athlete.view = html.li.clone() .addClass( "athlete" ) .prop( "order", i ) .append( icon, name );
				list.append( athlete.view );
			}
			e.athletes.append( list );
		}

		var callback = function( division ) {
			return function() {
				addDivisionList( division.data );
				var position = division.view.offset();
				var x        = position.left + division.view.width() + 20;
				var y        = position.top + (division.view.height()/2) - 22;
				e.arrow.css( "left", x );
				e.arrow.css( "top", y );
				e.arrow.show();
				e.athletes.show(); 
			};
		}

		var addLocation = function( name, divisions ) {
			var title = html.div.clone() .addClass( "location" );
			title.html( name );
			e.list.append( title );
			for( var i = 0; i < divisions.length; i++ ) {
				var division = { 'data' : divisions[ i ] };
				division.view = html.div.clone() .addClass( "division" );
				division.view.html( division.data.name.toUpperCase() + " " + division.data.description );
				var handleClick = callback( division );
				division.view.click( handleClick );
				e.list.append( division.view );
			}
		}

		var get_divisions = function( tournament ) {
			var locations = { 'staging' : [] };
			for( var i = 0; i < tournament.divisions.length; i++ ) {
				var division = tournament.divisions[ i ];
				var ring     = division.ring;
				if( ! defined( locations[ ring ] )) { locations[ ring ] = []; }
				locations[ ring ].push( division );
			}
			return locations;
		};

		function refresh( update ) {
			var tournament = JSON.parse( update.data );
			e.list.empty();
			var locations = get_divisions( tournament );

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
