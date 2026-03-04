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
			<div class="count">${this.count}</div>
			<div class="btn-deduction-add ${this.code}">-${this.value}</div>
		</div>
		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.count          = this.dom.find( `.${this.code}.deductions .count` );
		this.display.all            = this.dom.find( '.deductions' );
		this.button.addDeduction    = this.dom.find( `.${this.code}.btn-deduction-add` );
		this.button.removeDeduction = this.dom.find( `.${this.code}.btn-deduction-remove` );

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.display = ( division = null ) => {
			this.display.count.html( deduction );
		}

		// ===== ADD BUTTON BEHAVIOR
		this.button.addDeduction.off( 'click' ).click( ev => {
			this.add();
			this.display.count.html( this.count );
			this.app.state.save();
			this.app.widget.score.refresh.display();
			this.button.removeDeduction.enable();
		});

		this.button.removeDeduction.disable = () => { this.button.removeDeduction.addClass( 'disabled' ); };
		this.button.removeDeduction.enable  = () => { this.button.removeDeduction.removeClass( 'disabled' ); };
		this.button.removeDeduction.off( 'click' ).click( ev => {
			if( this.deduction <= 0 ) { return; }
			this.remove();
			this.display.count.html( this.count );
			this.app.state.save();
			this.app.widget.score.refresh.display();
			if( this.count <= 0 ) { this.button.removeDeduction.disable(); }
		});
	}

	add() {
		let deduction = parseFloat((this.deduction + this.value).toFixed( 1 ));
		this.deduction = deduction;
	}

	remove() {
		let deduction = parseFloat((this.deduction - this.value).toFixed( 1 ));
		this.deduction = deduction;
	}

	get count() {
		let deduction = this.app.state.score[ this.code ];
		let count = Math.round( deduction / this.value );
		return count;
	}

	get deduction() {
		return this.app.state.score[ this.code ];
	}

	set deduction( value ) {
		this.app.state.score[ this.code ] = value;
	}
}
