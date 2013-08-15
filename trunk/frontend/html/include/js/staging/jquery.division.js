(function( $ ) {
	$.widget( "freescore.showDivision", {
		options: { autoShow: true },
		_init: function() {
			var div       = $( "<div />" );
			var model     = this.options.model;
			model.description = model.gender + " " + model.age + " " + model.rank;
			var division    = div.clone() .addClass( 'division' )    .disableSelection();
			var header      = div.clone() .addClass( 'header' )      .disableSelection();
			var id          = div.clone() .addClass( 'id' )          .append( model.id );
			var description = div.clone() .addClass( 'description' ) .append( model.description );
			var message     = div.clone() .addClass( 'message' );
			var weight      = div.clone() .addClass( 'weight' )      .append( model.weight );
			var athletes    = div.clone() .addClass( 'athletes' );

			header   .append( id );
			header   .append( description );
			header   .append( message );
			header   .append( weight );
			division .append( header );
			division .append( athletes );

			// ===== SUBSCRIBE TO EVENTS
			division
				.addClass( 'subscribers-selection' )
				.addClass( 'subscribers-split' )
				.addClass( 'subscribers-merge' )

			athletes .sortable( {
				stop: function( event, ui ) {
					var order = [];
					$( '.id', athletes ).each( function( i, id ) {
						order.push( $(id).text() );
					})
					$( '.subscribers-division-reorder' ).trigger( 'event-division-reorder', [ order ] );
				}
			});

			// ===== GIVE USERS FEEDBACK ON DIVISION STATE
			var icon;
			var text;
			if(        model.athletes.length == 1 ) {
				icon = div .clone() .addClass( 'ui-icon' ) .addClass( 'ui-icon-alert' );
				text = div .clone() .append( ' <b>Alert!</b> Not enough athletes' );
			} else if( model.exhibition ) {
				icon = div .clone() .addClass( 'ui-icon' ) .addClass( 'ui-icon-check' );
				text = div .clone() .append( ' Ready to assign to a ring as an <b>Exhibition Match</b>' );
			} else {
				icon = div .clone() .addClass( 'ui-icon' ) .addClass( 'ui-icon-check' );
				text = div .clone() .append( ' Ready to assign to a ring as a <b>Regulation Division</b>' );
			}
			message .append( icon ) .append( text );

			// ===== HANDLE INTERACTIVITY BEHAVIOR
			division.draggable();
			division.droppable({
				drop: function( event, ui ) {
				},
				out:  function( event, ui ) { $( this ).removeClass( 'state-dropping' ); },
				over: function( event, ui ) { $( this ).addClass( 'state-dropping' ); }
			});
			division.hover(
				function() { $( this ).addClass( 'state-selected-selecting' );    },
				function() { $( this ).removeClass( 'state-selected-selecting' ); }
			);

			division.click( function() {
				$( this ).toggleClass( 'state-selected' );
				var isSelected = $( this ).hasClass( 'state-selected' );
				$( '.subscribers-selection' ).trigger( 'event-selection', [ model, isSelected ] );
				$( '.staging' ).trigger( 'event-selection', [ model, isSelected ] );
			});

			division.on( 'event-selection', function( event, sender, isSelected ) {
				var id = $( this ).children( '.header' ).children( '.id' ).text();
				if( sender.id != id ) { $( this ).removeClass( 'state-selected' ); }
				return false;
			});
	
			// ===== ASSIGN ATHLETE DATA
			for (var i = 0; i < model.athletes.length; i++ ) {
				var modelAthlete = model.athletes[ i ];
				if( i == model.athletes.length -1 ) { modelAthlete.last = true;  }
				else                                { modelAthlete.last = false; }
				athletes.showAthlete( { 'model' : modelAthlete });
			}
			this.element .append( division );
		},
	});
})( jQuery );
