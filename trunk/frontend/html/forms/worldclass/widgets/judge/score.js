FreeScore.Widget.Score = class FSWidgetDivInfo extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="score">
			<div class="judge"></div>
			<div class="accuracy"></div>
			<div class="presentation"></div>
			<div class="athlete"></div>
			<div class="total"></div>
		</div>
		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.athlete      = this.dom.find( '.score .athlete' );
		this.display.judge        = this.dom.find( '.score .judge' );
		this.display.accuracy     = this.dom.find( '.score .accuracy' );
		this.display.presentation = this.dom.find( '.score .presentation' );
		this.display.total        = this.dom.find( '.score .total' );
		this.display.all          = this.dom.find( '.score' );
		this.display.reset        = ( division = null ) => { this.refresh.display( division ); };

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.display = ( division = null ) => {
			if( division === null ) {
				if( this.app.state.division == null ) { return; } // I got nothing. Time to nope out!
				division = new Division( this.app.state.division );
			}

			let athlete      = division.current.athlete();
			let name         = athlete.display.name();
			let major        = this.app.state.score.major;
			let minor        = this.app.state.score.minor;
			let power        = this.app.state.score.power;
			let rhythm       = this.app.state.score.rhythm;
			let ki           = this.app.state.score.ki;
			let accuracy     = (4.0 - (major + minor)).toFixed( 1 );
			let presentation = (power < 0.5 || rhythm < 0.5 || ki < 0.5) ? '&ndash;' : (power + rhythm + ki).toFixed( 1 );
			let total        = isNaN( parseFloat( presentation )) ? '&ndash;' : (parseFloat( accuracy ) + parseFloat( presentation )).toFixed( 1 );
			let judge        = app.state.current.judge == 0 ? 'Referee' : `Judge ${app.state.current.judge}`;

			this.display.athlete.html( name );
			this.display.judge.html( judge );
			this.display.accuracy.html( `${accuracy}<br><span>Accuracy</span>` );
			this.display.presentation.html( `${presentation}<br><span>Presentation</span>` );
			this.display.total.html( `${total}<br><span class="total-label">Total</span>` );
		}
	}
}
