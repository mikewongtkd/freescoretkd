FreeScore.Widget.SEAutopilot = class FSWidgetAutopilot extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="navigate-division">
			<h4>Division</h4>
			<div class="list-group">
				<a class="list-group-item" id="navigate-division"><span class="glyphicon glyphicon-play"></span><span id="navigate-division-label">Start Scoring this Division</span></a>
			</div>
		</div>

		<div class="navigate-round">
			<h4>Round</h4>
			<div class="btn-group btn-group-justified">
				<a class="btn btn-primary" id="navigate-prev-round">Previous</a>
				<a class="btn btn-primary" id="navigate-next-round">Next</a>
			</div>
		</div>

		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.button.previous  = this.dom.find( '#navigate-prev-round' );
		this.button.next      = this.dom.find( '#navigate-next-round' );
		this.button.score     = this.dom.find( '#navigate-division' );
		this.display.nav      = {
			division : this.dom.find( '.navigate-division' ),
			round    : this.dom.find( '.navigate-round' )
		};

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.nav = {
			division : divid => {
				this.button.score.off( 'click' ).click( ev => { 
					app.sound.ok.play(); 
					app.network.send({ type: 'division', action: 'navigate', target: { destination: 'division', divid:  }} ); 
					if( ring == 'staging' ) { 
						alertify.success( "Transferred division from staging to ring. Starting to score division." ); 
						setTimeout( function() { location.reload(); }, 3000 );
					}
				}
		};
		this.refresh.buttons = ( update ) => {
		};

		// ===== ADD LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'ring' )
			.command( 'update' )  
				.respond( update => { 
					let ring     = update?.ring;
					let division = ring?.divisions?.find( div => div.name == ring?.current );
					if( ! defined( division )) { return; }
					this.refresh.nav.round( division );       
				})
		.heard( 'division' )
			.command( 'update' )
				.respond( update => {
					let division = update?.division;
					if( ! defined( division )) { return; }
					this.refresh.nav.round( division );       
				});

		// ===== ADD EVENT LISTENER/RESPONSE HANDLERS
		this.event.listen( 'division-show', ( type, source, message ) => {
			let division = app.state.divisions?.find( div => div.name == message.divid );

			if( message.divid == message.current ) {
				this.display.nav.division.hide();
				if( defined( division )) {
					this.refresh.nav.round( division );
					this.display.nav.round.show();
				} else {
					alertify.error( `Division ${message.divid} not found in App division cache` );
					this.display.nav.round.hide();
				}
			} else {
				this.refresh.nav.division( message.divid );
				this.display.nav.division.show();
				this.display.nav.round.hide();
			}
		});
	}
}
