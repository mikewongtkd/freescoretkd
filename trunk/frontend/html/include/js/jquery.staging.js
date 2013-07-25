(function( $ ) {
	$.widget( "freescore.stagingDivision", {
		options: {
			autoShow: true,
		},
		_init: function() {
			var div     = $( "<div />" );
			var divinfo = this.options.division;
			divinfo.description = divinfo.gender + " " + divinfo.age + " " + divinfo.rank;
			var division    = div.clone() .addClass( 'division' ) .addClass( 'subscribers-selection' ) .disableSelection();
			var header      = div.clone() .addClass( 'header' ) .disableSelection();
			var id          = div.clone() .addClass( 'id' ) .append( divinfo.id );
			var description = div.clone() .addClass( 'description' ) .append( divinfo.description );
			var message     = div.clone() .addClass( 'message' );
			var weight      = div.clone() .addClass( 'weight' ) .append( divinfo.weight );
			var athletes    = div.clone() .addClass( 'athletes' );

			this.division = division;
			this.header   = header;
			this.message  = message;

			header   .append( id );
			header   .append( description );
			header   .append( message );
			header   .append( weight );
			division .append( header );
			division .append( athletes );

			// ===== 
			var icon;
			var text;
			if(        divinfo.athletes.length == 1 ) {
				icon = div .clone() .addClass( 'ui-icon' ) .addClass( 'ui-icon-alert' );
				text = div .clone() .append( ' <b>Alert!</b> Not enough athletes' );
				division .addClass( 'state-error' );

			} else if( divinfo.exhibition ) {
				icon = div .clone() .addClass( 'ui-icon' ) .addClass( 'ui-icon-check' );
				text = div .clone() .append( ' Ready to assign to a ring as an <b>Exhibition Match</b>' );
				division .addClass( 'state-warning' );
			} else {
				icon = div .clone() .addClass( 'ui-icon' ) .addClass( 'ui-icon-check' );
				text = div .clone() .append( ' Ready to assign to a ring as a <b>Regulation Division</b>' );
				division .addClass( 'state-ok' );
			}
			message .append( icon ) .append( text );

			// ===== HANDLE INTERACTIVITY BEHAVIOR
			division.hover(
				function() {
					if     ( $( this ).hasClass( 'state-error' ))   { $( this ).addClass( 'state-error-selecting' );       }
					else if( $( this ).hasClass( 'state-warning' )) { $( this ).addClass( 'state-warning-selecting' );     } 
					else if( $( this ).hasClass( 'state-ok' ))      { $( this ).addClass( 'state-ok-selecting' );          }
					else                                            { $( this ).addClass( 'state-selected-selecting' );    }
				},
				function() {
					if     ( $( this ).hasClass( 'state-error' ))   { $( this ).removeClass( 'state-error-selecting' );    }
					else if( $( this ).hasClass( 'state-warning' )) { $( this ).removeClass( 'state-warning-selecting' );  }
					else if( $( this ).hasClass( 'state-ok' ))      { $( this ).removeClass( 'state-ok-selecting' );       }
					else                                            { $( this ).removeClass( 'state-selected-selecting' ); }
				}
			);

			division.click( function() {
				$( this ).toggleClass( 'state-selected' );
				var id         = $( this ).children( '.header' ).children( '.id' ).text();
				var isSelected = $( this ).hasClass( 'state-selected' );
				$( '.subscribers-selection' ).trigger( 'selected', [ id, isSelected ] );
				$( '.staging' ).trigger( 'selected', [ id, isSelected ] );
			});

			division.on( 'selected', function( event, sender, isSelected ) {
				var id = $( this ).children( '.header' ).children( '.id' ).text();
				
				if( sender == id ) {
				} else {
					$( this ).removeClass( 'state-selected' );
				}
				return false;
			});

			// ===== ASSIGN ATHLETE DATA
			for (var i = 0; i < divinfo.athletes.length; i++ ) {
				var athleteInfo = divinfo.athletes[ i ];
				var athlete = div.clone() .addClass( 'athlete' );
				athletes
					.append( 
						athlete
							.append( div.clone() .addClass( 'id' )         .append( athleteInfo.id ))
							.append( div.clone() .addClass( 'name' )       .append( athleteInfo.fname + ' ' + athleteInfo.lname ) )
							.append( div.clone() .addClass( 'age-weight' ) .append( athleteInfo.belt + ', ' + athleteInfo.age + 'yo, ' + athleteInfo.weight + ' lbs.' ))
					);
			}
			this.element .append( division );
		},
	});

	$.widget( "freescore.staging", {
		options: {
			autoShow: true,
		},
		_create: function() {
			var div = $( "<div />" );
			var header          = div.clone() .addClass( 'staging-header' );
			var tournamentTitle = $( "<h1 />" );
			var eventName       = $( "<h2 />" );
			var staging         = div.clone() .addClass( 'staging' );
			var divisions       = div.clone() .addClass( 'divisions' );
			var buttons         = div.clone() .addClass( 'buttons' );
			var message         = div.clone() .addClass( 'user-message' );
			var splitButton     = div.clone() .addClass( 'split' )  .addClass( 'button' ) .append( 'Split' );
			var mergeButton     = div.clone() .addClass( 'merge' )  .addClass( 'button' ) .append( 'Merge' );
			var assignButton    = div.clone() .addClass( 'assign' ) .addClass( 'button' ) .append( 'Assign to a Ring' );

			header.append( tournamentTitle );
			header.append( eventName );
			this.element.append( header );
			this.element.append( staging );

			staging .append( buttons );
			staging .append( divisions );
			staging .append( message );

			buttons .append( splitButton, mergeButton, assignButton );
			message .append( 'Click on a division to split the division, merge the division with another, or assign the division to a ring' );

			var url = {
				'tournament' : $.url().param( 'tournament' ),
				'event'      : $.url().param( 'event' )
			};

			$.getJSON( 
				'https://localhost/cgi-bin/freescore/rest/' + url.tournament + '/divisions/' + url.event,
				function( tournament ) {
					tournamentTitle.append( tournament.name );
					eventName .append( tournament.event );
					for ( var i = 0; i < tournament.divisions.length; i++ ) {
						var division = tournament.divisions[ i ];
						divisions.stagingDivision( { 'division' : division } );
					}
				}
			);

			var buttonArray = [ splitButton, mergeButton, assignButton ];
			for (var i in buttonArray ) {
				var button = buttonArray[ i ]
				button.hover(
					function() {
						if( ! $( this ).hasClass( 'state-enabled' )) { return false; }
						$( this ).addClass( 'state-hover' );
						
					},
					function() {
						if( ! $( this ).hasClass( 'state-enabled' )) { return false; }
						$( this ).removeClass( 'state-hover' );
					}
				);
			}

			staging.on( 'selected', function( event, sender, isSelected ) {
				if( isSelected ) {
					$( '.button' ).addClass( 'state-enabled' );
					$( '.user-message' ).html( 'Click on a button above to split, merge, or assign division #' + sender + ' to a ring.' );
				} else {
					$( '.button' ).removeClass( 'state-enabled' );
					$( '.user-message' ).html( 'Click on a division to split the division, merge the division with another, or assign the division to a ring' );
				}
				return false;
			});

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
