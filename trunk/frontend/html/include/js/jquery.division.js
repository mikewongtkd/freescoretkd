(function( $ ) {
	$.widget( "freescore.division", {
		options: {
			autoShow: true,
		},
		_create: function() {
			var div = $( "<div />" );
			var container          = div.clone();
			var tournament_title   = div.clone();
			var event_name         = div.clone();
			var meta               = div.clone() .addClass( 'meta' );
			var division_container = div.clone() .addClass( 'division' );

			var db = $.url().param( 'tournament' );
			var id = $.url().param( 'id' );
			$.getJSON( 
				'https://localhost/cgi-bin/freescore/rest/' + db + '/division?id=' + id,
				function( division ) {
					division.description = division.gender + " " + division.age + " " + division.rank;
					counting = [ 'No', 'One', 'Two', 'Three', 'Four' ];
					tournament_title.append( '<h1>' + division.tournament + '</h1>' );
					event_name.append( '<h2><div class="event">' + division.event + '</div>&nbsp;<div class="division-id"><span class="id">Division ' + division.id + '</span><span class="barcode">&nbsp;<img src="https://localhost/cgi-bin/freescore/barcode?id=' + division.id + '" /></span></div></h2>' );
					meta.append( '<div class="keyword">Division</div><div class="value">' + division.id + ' - ' + division.description + '</div>' );
					if( division.staged ) {
						meta.append( '<div class="keyword">Staging Time</div><div class="value">' + Date( division.staged ).toUTCString() + '</div>' )
					}
					if( division.event.match( /sparring/i )) {
						meta
							.append( '<div class="keyword">Weight Class</div><div class="value">' + division.weight + '</div>' )
							.append( '<div class="keyword">Regulation Time</div><div class="value">' + counting[ division.rounds ] + ' ' + division.time + ' second rounds, with ' + division.rest + ' second rests in between</div>' )
							.append( '<div class="keyword">Head Contact</div><div class="value">' + division.contact + '</div>' );

					}
					if( division.exhibition ) { meta.append( '<div class="keyword">Exhibition Match</div><div class="value">Yes</div>' ); }
					if( division.note       ) { meta.append( '<div class="keyword">Notes</div><div class="value">' + division.note + '</div>' ); }

					division_container.append( '<div class="description"><span class="division-description">ID, Name</span><span class="subdivision">Rank, Age, Weight</span>' );
					for (var i = 0; i < division.athletes.length; i++ ) {
						var athlete = division.athletes[ i ];
						division_container
							.append( '<div class="athlete"><div class="id">' + athlete.id + '</div> <div class="name">' + athlete.fname + " " + athlete.lname + '</div><div class="age-weight">' + athlete.belt + ', ' + athlete.age + ' yo, ' + athlete.weight + ' lbs.</div></div>' );
					}
				}
			);
			this.element.append( tournament_title );
			this.element.append( event_name );
			this.element.append( meta );
			this.element.append( division_container );
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
