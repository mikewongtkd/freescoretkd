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
		this.button.status = this.dom.children( 'a.btn.status' );

		// ===== ADD STATE
		this.state.autopilot = { timer : null };

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.status = ( update, message ) => {
			let request  = update.request;
			let delay    = (request.delay + 1) * 1000;
			this.button.status.addClass( 'btn-success' ).removeClass( 'btn-default' ).html( message );
			if( this.state.autopilot.timer ) { clearTimeout( this.state.autopilot.timer ); }
			this.state.autopilot.timer = setTimeout( () => { this.button.status.addClass( 'btn-default' ).removeClass( 'btn-success' ).html( 'Disengaged' ); }, delay );
		}

		// ===== ADD LISTENER/RESPONSE HANDLERS
		this.network.on.heard( 'autopilot' )
		.command( 'scoreboard' )  .respond( update => { this.refresh.status( update, 'Showing Score' );       })
		.command( 'draw' )        .respond( update => { this.refresh.status( update, 'Drawing Poomsae' );     }) 
		.command( 'leaderboard' ) .respond( update => { this.refresh.status( update, 'Showing Leaderboard' ); })
		.command( 'next' )        .respond( update => { this.refresh.status( update, 'Advancing' );           });
	}
}
