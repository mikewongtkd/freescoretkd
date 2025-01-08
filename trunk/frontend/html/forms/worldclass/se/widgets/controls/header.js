FreeScore.Widget.SEHeader = class FSWidgetHeader extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.html( `
		<a class="btn btn-warning"><span class="glyphicon glyphicon-menu-left"></span> Back</a> <span id="division-header"></span>
		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.button.back = this.dom.find( 'a.btn' );

		// ===== ADD STATE
		this.state.autopilot = { timer : null };

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.header = ( division ) => {
			let request  = update.request;
			let delay    = (request.delay + 1) * 1000;
			this.button.status.addClass( 'btn-success' ).removeClass( 'btn-default' ).html( message );
			if( this.state.autopilot.timer ) { clearTimeout( this.state.autopilot.timer ); }
			this.state.autopilot.timer = setTimeout( () => { this.button.status.addClass( 'btn-default' ).removeClass( 'btn-success' ).html( 'Disengaged' ); }, delay );
		}

		// ===== ADD NETWORK LISTENER/RESPONSE HANDLERS
		this.app.on.heard( 'ring' )
		.command( 'update' )  .respond( update => {
			this.refresh.status( update, 'Showing Score' );       
		});

		// ===== ADD EVENT LISTENER/RESPONSE HANDLERS
		this.event.listen( 'division-show', ( type, source, message ) => {
			this.state.division.show = message.divid;
			this.refresh.division.header();
			this.refresh.athlete.list();
		});

		// ===== ADD BUTTON BEHAVIORS
		this.button.back.off( 'click' ).click( ev => { this.event.trigger( 'ring-show' ); });

	}
}
