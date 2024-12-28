FreeScore.Widget.Autopilot = class FSWidgetAutopilot extends FSWidget {
	constructor( app, dom ) {
		super( app, dom );

		this.dom.html( `

		<div class="autopilot">
			<h4>Autopilot</h4>
			<a class="btn btn-block btn-default disabled status">Disengaged</a>
		</div>

		` );

		this.button.status = this.dom.children( 'a.btn.status' );
		this.state.autopilot = { timer : null };

		this.refresh.status = ( update, message ) => {
			let request  = update.request;
			let delay    = (request.delay + 1) * 1000;
			this.button.status.addClass( 'btn-success' ).removeClass( 'btn-default' ).html( message );
			if( this.state.autopilot.timer ) { clearTimeout( this.state.autopilot.timer ); }
			this.state.autopilot.timer = setTimeout( () => { this.button.status.addClass( 'btn-default' ).removeClass( 'btn-success' ).html( 'Disengaged' ); }, delay );
		}

		this.response( 'autopilot' )
		.handle( 'scoreboard' )
		.by( update => {
			this.refresh.status( update, 'Showing Score' );
		})
		.handle( 'draw' ) by( update => {
			this.refresh.status( update, 'Drawing Poomsae' );
		})
		.handle( 'leaderboard' ) by( update => {
			this.refresh.status( update, 'Showing Leaderboard' );
		})
		.handle( 'next' )
		.by( update => {
			this.refresh.status( update, 'Advancing' );
		})
	}
}
