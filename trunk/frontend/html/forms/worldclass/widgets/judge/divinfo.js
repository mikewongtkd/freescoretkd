FreeScore.Widget.DivInfo = class FSWidgetDivInfo extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="division-info">
			<div class="label">Current Division</div>
			<div class="description"></div>
			<div class="round"></div>
			<div class="form"></div>
		</div>
		<div class="btn-division-list">Division List</div>
		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.description = this.dom.find( '.division-info .description' );
		this.display.round       = this.dom.find( '.division-info .round' );
		this.display.form        = this.dom.find( '.division-info .form' );
		this.display.all         = this.dom.find( '.division-info' );
		this.button.divisionList = this.dom.find( '.btn-division-list' );

		this.display.reset       = division => { this.refresh.display( division ); };

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.display = division => {
			let forms = division.current.form.list().map(( form, i ) => i == division.current.formId ? `<span class="current">${form}</span>` : `<span>${form}</span>` ).join( ', ' );
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
