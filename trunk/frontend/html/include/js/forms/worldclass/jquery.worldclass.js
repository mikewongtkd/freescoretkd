$.widget( "freescore.worldclass", {
	options: { autoShow: true, server: 'localhost', judges: 3 },
	_create: function() {
		var o           = this.options;
		var e           = this.options.elements = {};
		var widget      = this.element;
		var html        = e.html        = FreeScore.html;
		var leaderboard = e.leaderboard = html.div.clone() .addClass( "back" );
		var brackets    = e.brackets    = html.div.clone() .addClass( "back" ) .hide();
		var scoreboard  = e.scoreboard  = html.div.clone() .addClass( "front" );
		var dualscores  = e.dualscores  = html.div.clone() .addClass( "front" ). hide();
		var usermessage = e.usermessage = html.div.clone();
		var card        = e.card        = html.div.clone() .addClass( "card" );

		// ===== ZOOM FUNCTION
		o.zoom = 1.0;
		e.zoom = function( zoom ) {
			o.zoom += zoom;
			$( 'body' ).css({ 'transform' : 'scale( ' + o.zoom.toFixed( 2 ) + ' )', 'transform-origin' : '0 0' });
			alertify.notify( "Zoom: " + Math.round( o.zoom * 100 ) + "%" );
		}

		card.append( leaderboard, scoreboard );
		widget .addClass( "worldclass flippable" );
		widget .append( card, usermessage );
	},
	_init: function( ) {
		var e       = this.options.elements;
		var o       = this.options;
		var ws      = e.ws = new WebSocket( `ws://${o.server}:3088/worldclass/${o.tournament.db}/${o.ring}/display` );
		var network = { reconnect: 0 };

		e.leaderboard.leaderboard();
		e.scoreboard.scoreboard();

		alertify.set( 'notifier', 'position', 'top-right' );

		alertify.notify( "Click to toggle fullscreen. Press '-' or '=' to zoom" );

		// ===== ENABLE SINGLE TAB ZOOM
		var body = $( 'body' );
		body.keydown(( ev ) => {
			switch( ev.key ) {
				case '=': e.zoom(  0.05 ); break;
				case '-': e.zoom( -0.05 ); break;
			}
		});

		ws.onopen = network.connect = function() {
			var request  = { data : { type : 'division', action : 'read' }};
			request.json = JSON.stringify( request.data );
			ws.send( request.json );
		}

		ws.onmessage = network.message = function( response ) {
			var update = JSON.parse( response.data );
			if( update.action != 'update' ) { return; }
			if( update.type != 'division' && update.type != 'ring' ) { return; }

			// ===== EXTRACT THE DIVISION DATA FROM A DIVISION UPDATE OR RING UPDATE
			var division     = undefined;
			if( defined( update.division )) { division = new Division( update.division ); } else
			if( defined( update.ring     )) { division = new Division( update.ring.divisions.find((d) => { return d.name == update.ring.current; })); }
			else                            { return; }

			// Ignore the update if the digest is the same as previous (i.e. the update contains no changes)
			if( defined( o.digest ) && response.digest == o.digest ) { return; } else { o.digest = response.digest; }

			if( response.error ) {
				e.card.hide();
				e.usermessage.errormessage({ message : response.error });
				
			} else if( division.state.is.display() ) {
				if( ! e.card.hasClass( 'flipped' )) { e.card.addClass( 'flipped' ); }
				e.leaderboard.leaderboard( { division : division } );

			} else {
				if( e.card.hasClass( 'flipped' )) { e.card.removeClass( 'flipped' ); }
				var odd = false;
				for( var i = 0; i < division.current.order().length; i++ ) {
					if( division.current.order( i ) == division.current.athleteId() ) {
						odd = i % 2;
						break;
					}
				}
				e.scoreboard.scoreboard( { 
					judges : division.judges(),
					current: { 
						name        : division.name(), 
						round       : division.current.roundId(), 
						roundName   : division.current.round.display.name(),
						description : division.description(),
						form        : division.current.formId(), 
						forms       : division.form.list(), 
						odd         : odd,
						athlete     : division.current.athlete() 
					}
				});
			}
		};

		ws.onerror = network.error = function() {
			setTimeout( function() { location.reload(); }, 15000 ); // Attempt to reconnect every 15 seconds
		};
		
		// ===== TRY TO RECONNECT IF WEBSOCKET CLOSES
		ws.onclose = network.close = function() {
			if( network.reconnect < 10 ) { // Give 10 attempts to reconnect
				if( network.reconnect == 0 ) { alertify.error( 'Network error. Trying to reconnect.' ); }
				network.reconnect++;
				ws = new WebSocket( `ws://${o.server}:3088/worldclass/${o.tournament.db}/${o.ring}/display` ); 
				
				ws.onerror   = network.error;
				ws.onmessage = network.message;
				ws.onclose   = network.close;
			}
		};
	}
});
