(function( $ ) {
	$.widget( "freescore.stagingDivision", {
		options: {
			autoShow: true,
		},
		_init: function() {
			var div  = $( "<div />" );
			var division  = this.options.division;
			division.description = division.gender + " " + division.age + " " + division.rank;
			var division_container = div.clone() .addClass( 'division' ) .addClass( 'ui-widget' ).disableSelection();
			var description = div.clone() .addClass( 'description' );
			division_container.append( description.append( '<span class="description">' + division.description + '</span><span class="weight">' + division.weight + '</span>' ));
			if(        division.athletes.length == 1 ) {
				division_container .addClass( 'error' );
				description        .addClass( 'error' )
					.append( div.clone() .addClass( 'ui-icon' ) .addClass( 'ui-icon-custom-error' ) .addClass( 'ui-icon-alert' ) );
			} else if( division.exhibition ) {
				division_container .addClass( 'warning' );
				description        .addClass( 'warning' )
					.append( div.clone() .addClass( 'ui-icon' ) .addClass( 'ui-icon-custom-warning' ) .addClass( 'ui-icon-check' ) );
			} else {
				division_container .addClass( 'ok' );
				description        .addClass( 'ok' )
					.append( div.clone() .addClass( 'ui-icon' ) .addClass( 'ui-icon-custom-ok' ) .addClass( 'ui-icon-check' ) );
			}
			for (var j = 0; j < division.athletes.length; j++ ) {
				var athlete = division.athletes[ j ];
				division_container
					.append( '<div class="athlete"><div class="id">' + athlete.id + '</div> <div class="name">' + athlete.fname + ' ' + athlete.lname + '</div><div class="age-weight">' + athlete.belt + ', ' + athlete.age + ' yo, ' + athlete.weight + ' lbs.</div></div>' );
			}
			this.element.append( division_container );
		}
	});

	$.widget( "freescore.staging", {
		options: {
			autoShow: true,
		},
		_create: function() {
			var div = $( "<div />" );
			var tournament_title   = div.clone();
			var event_name         = div.clone();
			var divisions          = div.clone();

			this.element.append( tournament_title );
			this.element.append( event_name );
			this.element.append( divisions );

			var url = {
				'tournament' : $.url().param( 'tournament' ),
				'event'      : $.url().param( 'event' )
			};
			$.getJSON( 
				'https://localhost/cgi-bin/freescore/rest/' + url.tournament + '/divisions/' + url.event,
				function( tournament ) {
					tournament_title.append( '<h1>' + tournament.name + '</h1>' );
					event_name.append( '<h2>' + tournament.event + '</h2>' );
					for ( var i = 0; i < tournament.divisions.length; i++ ) {
						var division = tournament.divisions[ i ];
						divisions.stagingDivision( { 'division' : division } );
					}
				}
			);
		},

		_init: function() {
		},

		destroy: function() {
		},

		disable: function() {
		},

		enable: function() {
		},
	});
})( jQuery );
