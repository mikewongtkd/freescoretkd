FreeScore.Widget.DEDescription = class FSWidgetDEDescription extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<label for="description">Description</label>
		<div class="description input-group">
			<span class="input-group-addon divid" style="width: 8em; font-weight: bold; text-align: left;">New Division</span>
			<input type="text" class="form-control description-text" readonly>
			<span class="input-group-btn">
				<button class="btn btn-default btn-edit" type="button"><span class="fas fa-pen" style="line-height: 1.42857143;"></span></span>
			</span>
		</div>

		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.divid       = this.dom.find( '.divid' );
		this.display.description = this.dom.find( '.description-text' );

		// ===== BUTTONS
		this.button.edit = this.dom.find( '.btn-edit' );

		// ===== BUTTON BEHAVIOR
		this.button.edit.off( 'click' ).click(() => {
			let divid       = this.app.state.division.name ? this.app.state.division.name.toUpperCase() : 'this new division';
			let description = this.app.state.division.description;
			
			alertify.prompt( 
				`Describe ${divid}`,
				`Provide a description for ${divid}`,
				description,
				( ev, value ) => { this.app.state.division.description = value; this.display.description.val( value ); },
				() => {}
			);
		});

		// ===== REFRESH BEHAVIOR
		this.refresh.all = () => {
			let division    = this.app.state.division;
			let divid       = division.name?.toUpperCase();
			let description = division.description;

			this.display.divid.html( divid );
			this.display.description.val( description );
			
		}
	}
}
