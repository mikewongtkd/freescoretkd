FreeScore.Widget.Accuracy = class FSWidgetAccuracy extends FreeScore.Widget {
	constructor( app, dom, value ) {
		super( app, dom );

		this.value = value;
		this.code  = value == 0.1 ? 'minor' : 'major';
		this.label = value == 0.1 ? 'Minor' : 'Major';

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="deductions ${this.code}">
			<div class="deduction-label">${this.label} Deductions</div>
			<div class="btn-deduction-remove ${this.code}">+${this.value}</div>
			<div class="count">0</div>
			<div class="btn-deduction-add ${this.code}">-${this.value}</div>
		</div>
		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.count          = this.dom.find( '.deductions .count' );
		this.display.all            = this.dom.find( '.deductions' );
		this.button.addDeduction    = this.dom.find( '.btn-deduction-add' );
		this.button.removeDeduction = this.dom.find( '.btn-deduction-remove' );

		// ===== STATE
		this.state.deduction = 0;
		this.state.reset     = () => {
			this.state.deduction = 0;
			this.button.removeDeduction.disable();
		};

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.display = division => {
			this.display.count.html( this.state.deduction );
		}

		// ===== ADD BUTTON BEHAVIOR
		this.button.addDeduction.off( 'click' ).click( ev => {
			let deduction = ++this.state.deduction;
			this.display.count.html( deduction );
			this.app.state.score[ this.code ] = parseFloat( deduction * this.value).toFixed( 1 );
			this.button.removeDeduction.enable();
		});

		this.button.removeDeduction.disable = () => { this.button.removeDeduction.addClass( 'disabled' ); };
		this.button.removeDeduction.enable  = () => { this.button.removeDeduction.removeClass( 'disabled' ); };
		this.button.removeDeduction.off( 'click' ).click( ev => {
			let deduction = --this.state.deduction;
			this.display.count.html( deduction );
			this.app.state.score[ this.code ] = parseFloat( deduction * this.value).toFixed( 1 );
			if( deduction == 0 ) { this.button.removeDeduction.disable(); }
		});
	}
}
