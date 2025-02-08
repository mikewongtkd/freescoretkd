FreeScore.Widget.SBSDrawPoomsae = class FSWidgetSBSDrawPoomsae extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="draw">
			<h4>Draw Poomsae</h4>
			<button class="btn btn-draw">Draw Poomsae</button>
		</div>

		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.status   = this.dom.find( '.well' );
		this.display.all      = this.dom.find( '.autopilot' );

		// ===== ADD STATE
		this.state.autopilot = { timer : null, start: null, stop: null, countdown: null, message: null };

		// ===== ADD REFRESH BEHAVIOR
		this.timer = {
			reset : () => {
				if( this.state.autopilot.timer ) { clearInterval( this.state.autopilot.timer ); }
				this.state.autopilot.duration = null;
				this.state.autopilot.start    = null;
				this.state.autopilot.stop     = null;
				this.state.autopilot.message  = null;
				this.display.status.html( 'Autopilot is on Standby' ); 
			},
			start : delay => {
				let ap = this.state.autopilot;
				ap.duration = delay;
				ap.start    = (new Date()).getTime();
				ap.timer    = setInterval( () => { 
					ap.stop = (new Date()).getTime();
					let elapsed  = Math.abs( ap.stop - ap.start );
					let duration = defined( ap.duration ) && ap.duration > 0 ? ap.duration : 1000;
					this.display.status.html( `${this.state.autopilot.message} ${Math.floor(( duration - elapsed )/ 1000 )}s` );
					if( elapsed > duration ) { this.timer.reset(); }
				}, 200 );
			}
		};
		this.refresh.status = ( update, message ) => {
			this.timer.reset();
			this.state.autopilot.message = message;
			let request = update.request;
			let delay   = isNaN( request?.delay ) ? 3500 : (parseFloat( request.delay ) + 0.5) * 1000;
			console.log( 'AUTOPILOT REFRESH', update.request, delay ); // MW
			this.timer.start( delay );
		}

		// ===== ADD LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'autopilot' )
			.command( 'update' )
				.respond( update => { 
					let action = update?.request?.action;
					switch( action ) {
						case 'scoreboard'  : this.refresh.status( update, 'Showing Score'       ); break;
						case 'results'     : this.refresh.status( update, 'Showing Match Results' ); break;
						case 'leaderboard' : this.refresh.status( update, 'Showing Leaderboard' ); break;
						case 'bracket'     : this.refresh.status( update, 'Showing Bracket' ); break;
						case 'next'        : this.refresh.status( update, 'Advancing'           ); break;
					}
				});

		// ===== ADD EVENT LISTENER/RESPONSE HANDLERS
		this.event.listen( 'division-show' )
			.respond(( type, source, message ) => {
				if( message.divid == message.current ) {
					this.display.all.show();
				} else {
					this.display.all.hide();
				}
			});
	}
}
