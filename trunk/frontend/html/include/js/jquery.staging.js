(function( $ ) {
	$.widget( "freescore.stagingDivision", {
		options: {
			autoShow: true,
		},
		_init: function() {
			var div     = $( "<div />" );
			var divinfo = this.options.division;
			divinfo.description = divinfo.gender + " " + divinfo.age + " " + divinfo.rank;
			var division    = div.clone() .addClass( 'division' );
			var header      = div.clone() .addClass( 'header' );
			var description = div.clone() .addClass( 'description' ) .append( divinfo.description );
			var message     = div.clone() .addClass( 'message' );
			var weight      = div.clone() .addClass( 'weight' ) .append( divinfo.weight );
			var athletes    = div.clone() .addClass( 'athletes' );

			this.division = division;
			this.header   = header;
			this.message  = message;

			header   .append( description );
			header   .append( message );
			header   .append( weight );
			division .append( header );
			division .append( athletes );

			if(        divinfo.athletes.length == 1 ) {
				var icon = div .clone() .addClass( 'ui-icon' ) .addClass( 'ui-icon-custom-error' ) .addClass( 'ui-icon-alert' );
				var text = div .clone() .append( ' <b>Alert!</b> Not enough athletes' );
				message
					.append( icon )
					.append( text );
				division .addClass( 'error' );
				header   .addClass( 'error' );

			} else if( divinfo.exhibition ) {
				var icon = div .clone() .addClass( 'ui-icon' ) .addClass( 'ui-icon-custom-warning' ) .addClass( 'ui-icon-check' );
				var text = div .clone() .append( ' Ready to assign to a ring as an <b>Exhibition Match</b>' );
				message
					.append( icon )
					.append( text );
				division .addClass( 'warning' );
				header   .addClass( 'warning' );
			} else {
				var icon = div .clone() .addClass( 'ui-icon' ) .addClass( 'ui-icon-custom-ok' ) .addClass( 'ui-icon-check' );
				var text = div .clone() .append( ' Ready to assign to a ring as a <b>Regulation Division</b>' );
				message
					.append( icon )
					.append( text );
				division .addClass( 'ok' );
				header   .addClass( 'ok' );
			}
			for (var j = 0; j < divinfo.athletes.length; j++ ) {
				var athlete_info = divinfo.athletes[ j ];
				var athlete = div.clone() .addClass( 'athlete' );
				athletes
					.append( 
						athlete
							.append( div.clone() .addClass( 'id' )         .append( athlete_info.id ))
							.append( div.clone() .addClass( 'name' )       .append( athlete_info.fname + ' ' + athlete_info.lname ) )
							.append( div.clone() .addClass( 'age-weight' ) .append( athlete_info.belt + ', ' + athlete_info.age + 'yo, ' + athlete_info.weight + ' lbs.' ))
					);
			}
			this.element .append( division );
		},

		handleInHover : function() {
			if       ( $( this ).hasClass( 'error' ) ) {
				this.division.addClass( 'selecting-error' );
				this.header.addClass( 'selecting-header-error' );

			} else if( $( this ).hasClass( 'warning' )) {
				this.division.addClass( 'selecting-warning' );

			} else {
				this.division.addClass( 'selecting-ok' );
			}
		},

		handleOutHover : function() {
			if       ( $( this ).hasClass( 'error' ) ) {
				this.division.removeClass( 'selecting-error' );
				this.header.removeClass( 'selecting-header-error' );

			} else if( $( this ).hasClass( 'warning' )) {
				this.division.removeClass( 'selecting-warning' );

			} else {
				this.division.removeClass( 'selecting-ok' );
			}
		}

	});

	$.widget( "freescore.staging", {
		options: {
			autoShow: true,
		},
		_create: function() {
			var div = $( "<div />" );
			var header             = div.clone() .addClass( 'staging-header' );
			var tournament_title   = $( "<h1 />" );
			var event_name         = $( "<h2 />" );
			var staging            = div.clone() .addClass( 'staging' );
			var divisions          = div.clone() .addClass( 'divisions' );
			var buttons            = div.clone() .addClass( 'buttons' );
			var message            = div.clone() .addClass( 'user-message' );
			var split_button       = div.clone() .addClass( 'split' )  .addClass( 'button' ) .append( 'Split' );
			var merge_button       = div.clone() .addClass( 'merge' )  .addClass( 'button' ) .append( 'Merge' );
			var assign_button      = div.clone() .addClass( 'assign' ) .addClass( 'button' ) .append( 'Assign to a Ring' );

			header.append( tournament_title );
			header.append( event_name );
			this.element.append( header );
			this.element.append( staging );

			staging .append( buttons )   .addClass( 'buttons' );
			staging .append( divisions ) .addClass( 'divisions' );
			staging .append( message )   .addClass( 'user-message' );

			buttons .append( split_button, merge_button, assign_button );
			message .append( 'Click on a division to split the division, merge the division with another, or assign the division to a ring' );

			var url = {
				'tournament' : $.url().param( 'tournament' ),
				'event'      : $.url().param( 'event' )
			};
			$.getJSON( 
				'https://localhost/cgi-bin/freescore/rest/' + url.tournament + '/divisions/' + url.event,
				function( tournament ) {
					tournament_title.append( tournament.name );
					event_name .append( tournament.event );
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
