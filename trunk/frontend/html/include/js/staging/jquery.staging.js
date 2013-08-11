(function( $ ) {
	$.widget( "freescore.showStaging", {
		options: {
			autoShow: true,
		},
		_create: function() {
			var div = $( "<div />" );
			var header          = div.clone() .addClass( 'staging-header' );
			var tournamentTitle = $( "<h1 />" );
			var staging         = div.clone() .addClass( 'staging' );
			var divisions       = div.clone() .addClass( 'divisions' );
			var message         = div.clone() .addClass( 'user-message' );
			var title           = div.clone() .addClass( 'title' );
			var tournament      = undefined;
			var selection       = undefined;

			header.append( tournamentTitle );
			this.element.append( header );
			this.element.append( staging );

			staging .append( title );
			staging .append( divisions );
			staging .append( message );

			message .append( 'Click on a division to split the division, merge the division with another, or assign the division to a ring' );

			var url = {
				'tournament' : $.url().param( 'tournament' ),
				'event'      : $.url().param( 'event' )
			};

			$.getJSON( 
				'https://localhost/cgi-bin/freescore/rest/' + url.tournament + '/divisions/' + url.event,
				function( data ) {
					tournament = data;
					tournamentTitle.append( tournament.name );
					title .append( 'Staging ' ) .append( tournament.event ) .append( ' Divisions' );
					for ( var i = 0; i < tournament.divisions.length; i++ ) {
						var divisionModel = tournament.divisions[ i ];
						divisions.showDivision( { 'model' : divisionModel } );
					}
				}
			);

			staging.on( 'event-selection', function( event, sender, isSelected ) {
				if( isSelected ) {
					selection = sender;
					if( selection.athletes.length > 1 ) {
						$( '.user-message' ).html( 'Click on a button above to split, merge, or assign division #' + selection.id + ' <b>' + selection.description + ', ' + selection.weight + '</b> to a ring.' );
					} else {
						$( '.user-message' ).html( 'Click on a button above to merge division #' + selection.id + ' <b>' + selection.description + ', ' + selection.weight + '</b> with another division.' );
					}
				} else {
					$( '.user-message' ).html( 'Click on a division to split the division, merge the division with another, or assign the division to a ring' );
				}
				return false;
			});

		},

		_init:   function() {},
		_destroy: function() {},
		disable: function() {},
		enable:  function() {},
	});
})( jQuery );
