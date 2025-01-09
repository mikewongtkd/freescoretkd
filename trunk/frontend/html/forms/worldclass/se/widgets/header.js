FreeScore.Widget.SEHeader = class FSWidgetHeader extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.html( `
		<a class="btn btn-warning"><span class="glyphicon glyphicon-menu-left"></span> Back</a> <span id="division-summary"></span>
		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.button.back     = this.dom.find( 'a.btn' );
		this.display.summary = this.dom.find( '#division-summary' );

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.header = ( division ) => {
			this.display.summary.html( division.summary() );
		}

		// ===== ADD EVENT LISTENER/RESPONSE HANDLERS
		this.event.listen( 'division-show' )
			.respond(( type, source, message ) => {
				let division = this.app.state.current.division;
				division = new Division( division );
				this.refresh.header( division );
			});

		// ===== ADD BUTTON BEHAVIORS
		this.button.back.off( 'click' ).click( ev => { this.event.trigger( 'ring-show' ); });

	}
}
