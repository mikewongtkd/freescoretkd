FreeScore.Widget.Presentation = class FSWidgetPresentation extends FreeScore.Widget {
	static FIELD = {
		power: 'Power and Speed',
		rhythm: 'Rhythm and Control',
		ki: 'Expression of Energy',
	};
	constructor( app, dom, field ) {
		super( app, dom );

		this.field = { code: field };
		this.field.name = FSWidgetPresentation.FIELD[ field ];

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="presentation-control ${this.field.code}">
			<div class="pb-panel">
				<div class="pb-label">${this.field.name}</div>
				<div class="btn-group pb-group" data-toggle="buttons">
				</div>
			</div>
		</div>
		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.buttons = this.dom.find( `.presentation-control.${this.field.code} .pb-group` );
		this.display.all     = this.dom.find( `.presentation-control.${this.field.code}` );

		this.display.buttonGroup = buttons => {
			let buttonGroup = buttons.map( button => this.makeButton( button ));
			this.display.buttons.empty();
			this.display.buttons.append( buttonGroup );
		};

		this.display.high  = () => { this.display.buttonGroup([ 2.0, 1.9, 1.8, 1.7, 1.6, 'middle' ]); };
		this.display.mid   = () => { this.display.buttonGroup([ 'higher', 1.5, 1.4, 1.3, 1.2, 1.1, 1.0, 'lower' ]); };
		this.display.low   = () => { this.display.buttonGroup([ 'middle', 0.9, 0.8, 0.7, 0.6, 0.5 ]); };
		this.display.reset = ( division = null ) => { this.display.mid(); };

		if( this.display.buttons.find( 'label' ).length == 0 ) { this.display.mid(); }
	}

	makeButton( name ) {
		let value = name;
		let range = '';

		if( isNaN( parseFloat( name ))) { range = 'range'; } else { name = name.toFixed( 1 ); }
		let button = $( `<label class="btn btn-xs btn-default ${range}" for="${this.field.code}-${name}"><input type="radio" id="${this.field.code}-${name}" name="${this.field.code}">${name}</label>` );
		button.off( 'click' ).click( ev => {
			if( name == 'higher' ) { this.display.high(); return; }
			if( name == 'middle' ) { this.display.mid();  return; }
			if( name == 'lower' )  { this.display.low();  return; }

			this.app.state.score[ this.field.code ] = value;
		});
		return button;
	}
}
