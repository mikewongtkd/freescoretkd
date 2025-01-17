FreeScore.Widget.SEAutopilot = class FSWidgetAutopilot extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="autopilot">
			<h4>Autopilot</h4>
			<a class="btn btn-block btn-default disabled status">Disengaged</a>
		</div>

		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.button.status = this.dom.find( 'a.btn.status' );
		this.display.all   = this.dom.find( '.autopilot' );

		// ===== ADD STATE
		this.state.autopilot = { timer : null };

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.status = ( update, message ) => {
			let request  = update.request;
			let delay    = isNaN( request?.delay ) ? 5000 : (request.delay + 1) * 1000;
			this.button.status.addClass( 'btn-success' ).removeClass( 'btn-default' ).html( message );
			if( this.state.autopilot.timer ) { clearTimeout( this.state.autopilot.timer ); }
			this.state.autopilot.timer = setTimeout( () => { this.button.status.addClass( 'btn-default' ).removeClass( 'btn-success' ).html( 'Disengaged' ); }, delay );
		}

		// ===== ADD LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'autopilot' )
			.command( 'update' )
				.respond( update => { 
					let action = update?.request?.action;
					switch( action ) {
						case 'scoreboard'  : this.refresh.status( update, 'Showing Score'       ); break;
						case 'leaderboard' : this.refresh.status( update, 'Showing Leaderboard' ); break;
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
