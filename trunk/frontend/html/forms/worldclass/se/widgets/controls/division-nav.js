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

		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.button.score = this.dom.find( '#navigate-division' );
		this.display.all  = this.dom.find( '.navigate-division' );

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.button = ( update ) => {
		}

		// ===== ADD LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'ring' )
			.command( 'update' )  
				.respond( update => { 
					this.refresh.button( update, 'Showing Score' );       
				})
		.heard( 'division' )
			.command( 'update' )
				.respond( update => {
				});

		// ===== ADD EVENT LISTENER/RESPONSE HANDLERS
		this.event.listen( 'division-show', ( type, source, message ) => {
			if( message.divid == message.current ) {
				this.display.all.hide();
			} else {
				this.display.all.show();
			}
		});
	}
}
