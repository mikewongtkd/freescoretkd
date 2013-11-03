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
			var message         = div.clone() .addClass( 'user-message' ) .addClass( 'subscribers-user-message' );
			var title           = div.clone() .addClass( 'title' );
			var tournament      = undefined;
			var selection       = undefined;

			header.append( tournamentTitle );
			this.element.append( header );
			this.element.append( staging );

			staging .append( title );
			staging .append( divisions );
			staging .append( message );

			message .html( 'Click on a division to select the division, or drag-and-drop athletes within a division to reorder the division' );

			var url = {
				'tournament' : $.url().param( 'tournament' ),
				'event'      : $.url().param( 'event' )
			};

			var refreshView = function( tournament ) {
				divisions.empty();
				for ( var i = 0; i < tournament.divisions.length; i++ ) {
					var divisionModel = tournament.divisions[ i ];
					divisions.showDivision( { 'model' : divisionModel } );
				}
			}

			$.getJSON( 
				'http://localhost/cgi-bin/freescore/rest/' + url.tournament + '/divisions/' + url.event,
				function( data ) {
					tournament = data;

					tournamentTitle.append( tournament.name );
					title .append( 'Staging ' ) .append( tournament.event ) .append( ' Divisions' );

					refreshView( tournament );
				}
			);

			// ============================================================
			// EVENTS AND EVENT HANDLERS
			// ============================================================
			divisions
				.addClass( 'subscribers-division-reorder' )
				.addClass( 'subscribers-division-split' )
				.addClass( 'subscribers-division-merge' );

			// ===== REORDER ATHLETES WITHIN A DIVISION
			divisions.on( 'event-division-reorder', function( event, id, order ) { 
				var divisionModel = undefined;
				for ( var i = 0; i < tournament.divisions.length; i++ ) {
					divisionModel = tournament.divisions[ i ];
					if( divisionModel.id == id ) { break; } else { divisionModel = undefined; }
				}
				if( divisionModel === undefined ) { return; }

				var reordering = [];
				for ( var i = 0; i < order.length; i++ ) {
					id = order[ i ];
					for ( var j = 0; j < divisionModel.athletes.length; j++ ) {
						var athlete = divisionModel.athletes[ j ];
						if( athlete.id == id ) { reordering.push( athlete ); }
					}
				}
				divisionModel.athletes = reordering;
				// UPDATE DATABASE VIA REST PROTOCOL
			});

			// ===== MERGE DIVISIONS
			divisions.on( 'event-division-merge', function( event, targetId, droppedId ) {
				var merged        = [];
				var maxId         = 0;
				for( var i = 0; i < tournament.divisions.length; i++ ) {
					var divisionModel = tournament.divisions[ i ];
					maxId = maxId > divisionModel.id ? maxId : divisionModel.id;
					if( divisionModel.id != targetId && divisionModel.id != droppedId ) { merged.push( divisionModel ); }
				}
				maxId++;

				var target        = undefined;
				var targetIndex   = 0;
				for( var i = 0; i < tournament.divisions.length; i++ ) {
					var target  = tournament.divisions[ i ];
					targetIndex = i;
					if( target.id == targetId ) { break; } else { target = undefined; }
				}

				var dropped       = undefined;
				for( var i = 0; i < tournament.divisions.length; i++ ) {
					var dropped= tournament.divisions[ i ];
					if( dropped.id == droppedId ) { break; } else { dropped = undefined; }
				}

				// ===== MERGE DIVISIONS
				// TODO: Add confirmation dialog, merge descriptions MW
				for( var i = 0; i < dropped.athletes.length; i++ ) {
					var athlete = dropped.athletes[ i ];
					target.athletes.push( athlete );
				}
				target.id = maxId;
				merged.splice( targetIndex, 0, target );
				tournament.divisions = merged;

				refreshView( tournament );
				// UPDATE DATABASE VIA REST PROTOCOL
				// post action='delete' table='division' id=''
			});

			message.on( 'event-user-message', function( event, userMessage ) { message.html( userMessage ); return false; });
			staging.on( 'event-selection', function( event, sender, isSelected ) { return false; });

		},

		_init:   function() {},
		_destroy: function() {},
		disable: function() {},
		enable:  function() {},
	});
})( jQuery );
