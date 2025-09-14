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
				<button class="btn btn-default btn-undo disabled" type="button"><span class="fas fa-undo" style="line-height: 1.42857143;"></span></span>
				<button class="btn btn-default btn-edit" type="button"><span class="fas fa-pen" style="line-height: 1.42857143;"></span></span>
			</span>
		</div>

		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.divid       = this.dom.find( '.divid' );
		this.display.description = this.dom.find( '.description-text' );

		// ===== BUTTONS
		this.button.edit = this.dom.find( '.btn-edit' );
		this.button.undo = this.dom.find( '.btn-undo' );

		// ===== STATE
		this.state = { manual : { override : false }, previous : null };

		// ===== BUTTON BEHAVIOR
		this.button.edit.off( 'click' ).click(() => {
			let divid       = this.app.state.division.name ? this.app.state.division.name.toUpperCase() : 'this new division';
			let description = this.app.state.division.description;
			
			alertify.prompt( 
				`Describe ${divid}`,
				`Provide a description for ${divid}`,
				description,
				( ev, value ) => { 
					this.state.previous = this.app.state.division.description;
					this.button.undo.enable();

					this.app.state.division.description = value; 
					this.display.description.val( value ); 
					this.state.manual.override = true;
				},
				() => {}
			);
		});

		this.button.undo.enable = () => {
			this.button.undo.removeClass( 'disabled' );
			this.button.undo.off( 'click' ).click(() => {
				this.app.state.division.description = this.state.previous; 
				this.display.description.val( this.state.previous ); 
				this.state.previous = null;

				this.button.undo.disable();
				this.state.manual.override = false;
			});
		};

		this.button.undo.disable = () => {
			this.button.undo.addClass( 'disabled' );
			this.button.undo.off( 'click' );
		};

		// ===== REFRESH BEHAVIOR
		this.refresh.all = () => {
			let division    = this.app.state.division;
			let divid       = division.name?.toUpperCase();
			let description = division.description;

			this.display.divid.html( divid );
			this.display.description.val( description );
		}

		this.refresh.with = { settings : () => {
			// Rank Age Gender Event
			const display = {
				rank: { 'white' : 'White Belt', 'yellow' : 'Yellow Belt', 'green' : 'Green Belt', 'blue' : 'Blue Belt', 'red' : 'Red Belt', 'black1' : 'Black Belt 1st Dan', 'black2' : 'Black Belt 2nd Dan', 'black3' : 'Black Belt 3rd Dan', 'black4' : 'Black Belt 4th Dan', 'black5' : 'Black Belt 5th Dan', 'black6' : 'Black Belt 6th Dan', 'black7' : 'Black Belt 7th Dan' },
				age: { 
				}
			}

			let divid       = settings.divid;
			let descriptors = [];

			if( this.state.manual.override ) { return; }

			if( settings.rank != 'black' ) {
				if( display.rank?.[ settings.rank ]) { descriptors.push( display.rank[ settings.rank ]); }
			}

			if( display?.[ rank ]) { descriptors.push( display[ rank ]); }

			this.state.previous = this.app.state.description;
			this.button.undo.enable();

			let description = descriptors.join( ' ' );
			this.app.state.description = description;
			this.display.divid.html( divid );
			this.display.description.val( description );
		}};
	}
}
