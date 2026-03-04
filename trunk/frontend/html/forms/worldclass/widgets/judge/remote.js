FreeScore.Widget.Remote = class FSWidgetRemote extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="navigate">
			<div class="navigate-label athlete-label">Athlete</div>
			<div class="btn-navigate prev athlete" type="division" action="athlete prev"><span class="fas fa-left-arrow"></span></div>
			<div class="btn-navigate next athlete" type="division" action="athlete next"><span class="fas fa-right-arrow"></span></div>
		</div>
		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.description = this.dom.find( '.division-info .description' );
		this.display.round       = this.dom.find( '.division-info .round' );
		this.display.form        = this.dom.find( '.division-info .form' );
		this.display.all         = this.dom.find( '.division-info' );

		this.display.reset       = ( division = null ) => { this.refresh.display( division ); };

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.display = ( division = null ) => {
			if( division === null ) {
				division = new Division( this.app.state.division );
			}

			let forms = division.current.form.list().map(( form, i ) => i == division.current.formId() ? `<span class="current">${form}</span>` : `<span>${form}</span>` ).join( ', ' );
			this.display.description.html( division.description());
			this.display.round.html( division.current.round.name() );
			this.display.form.html( forms );
		}

		// ===== ADD LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'division' )
			.command( 'update' )
				.respond( update => { 
					let division = update?.division;
					if( ! division ) { return; }
					division = new Division( division );

					this.refresh.display( division );
				});
	}
}
