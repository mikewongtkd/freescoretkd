FreeScore.Widget.Score = class FSWidgetDivInfo extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="score">
			<div class="accuracy"></div>
			<div class="presentation"></div>
			<div class="athlete"></div>
			<div class="total"></div>
		</div>
		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.accuracy     = this.dom.find( '.score .accuracy' );
		this.display.presentation = this.dom.find( '.score .presentation' );
		this.display.athlete      = this.dom.find( '.score .athlete' );
		this.display.total        = this.dom.find( '.score .total' );
		this.display.all          = this.dom.find( '.score' );
		this.display.reset        = division => { this.refresh.display( division ); };

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.display = division => {
			let athlete      = division.current.athlete();
			let name         = athlete.display.name();
			let major        = this.app.state.score.major;
			let minor        = this.app.state.score.minor;
			let power        = this.app.state.score.power;
			let rhythm       = this.app.state.score.rhythm;
			let ki           = this.app.state.score.ki;
			let accuracy     = (major + minor).toFixed( 1 );
			let presentation = (power < 0.5 || rhythm < 0.5 || ki < 0.5) ? '&ndash;' : (power + rhythm + ki).toFixed( 1 );
			let total        = isNaN( parseFloat( presentation )) ? '&ndash;' : (parseFloat( accuracy ) + parseFloat( presentation )).toFixed( 1 );

			this.display.athlete.html( `<span class="athlete">${name}</span>` );
			this.display.accuracy.html( `${accuracy}<br><span>Accuracy</span>` );
			this.display.presentation.html( `${presentation}<br><span>Presentation</span>` );
			this.display.total.html( `${total}<span class="total-label">Total</span>` );
		}
	}
}
