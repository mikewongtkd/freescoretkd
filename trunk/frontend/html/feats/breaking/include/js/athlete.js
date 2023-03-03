class Athlete {
	constructor( data ) { 
		this.athlete = data; 

		this.deductions = {
			technical : () => {
				if( ! this.athlete.scores[ 0 ]) { return null; }
				let referee = this.athlete.scores[ 0 ];
				let sum     = referee.technical.deductions.major + referee.technical.deductions.minor;
				return '-' + sum.toFixed( 1 );
			},
			procedural : () => {
				if( ! this.athlete.scores[ 0 ]) { return null; }
				let referee = this.athlete.scores[ 0 ];
				let sum     = referee.procedural.deductions;
				return '-' + sum.toFixed( 1 );
			}

		};

		this.mean = {
			technical: () => { 
				if( !('trimmed' in this.athlete )) { return null; } 
				let boards = parseInt( this.athlete.info.boards ) * 0.2;
				let scores = this.athlete.scores.map( x => parseFloat( x.technical.difficulty ));
				let n      = this.athlete.scores.length; if( n == 0 ) { return null; }
				let sum    = scores.reduce(( a, b ) => a + b, 0.0);
				if( 'hilo' in this.athlete.trimmed ) {
					let dropped = this.athlete.trimmed.hilo;
					sum -= dropped.technical.hi.value + dropped.technical.lo.value;
				}
				let mean = (boards + ( sum / 3 )).toFixed( 2 );
				return mean;
			},
			presentation: () => { 
				if( !( 'trimmed' in this.athlete )) { return null; }
				let scores = this.athlete.scores.map( x => Object.keys( x.presentation ).map( y => parseFloat( x.presentation[ y ])).reduce(( a, b ) => a + b, 0.0 ));
				let n      = this.athlete.scores.length; if( n == 0 ) { return null; }
				let sum    = scores.reduce(( a, b ) => a + b, 0.0);
				if( 'hilo' in this.athlete.trimmed ) {
					let dropped = this.athlete.trimmed.hilo;
					sum -= dropped.presentation.hi.value + dropped.presentation.lo.value;
				}
				let mean = ( sum / 3 ).toFixed( 2 );
				return mean;
			},
			total: () => { 
				if( !('trimmed' in this.athlete )) { return null; } 
				return (parseFloat( this.mean.technical()) + parseFloat(this.mean.presentation())).toFixed( 2 );
			}
		};

		this.range = {
			technical: () => { 
				if( !('trimmed' in this.athlete )) { return null; } 
				let boards = parseInt( this.athlete.info.boards ) * 0.2;
				let scores = this.athlete.scores.map( x => boards + parseFloat( x.technical.difficulty ));
				let max = Math.max( ... scores );
				let min = Math.min( ... scores );

				return (max - min).toFixed( 1 );
			},
			presentation: () => { 
				if( !( 'trimmed' in this.athlete )) { return null; }
				let scores = this.athlete.scores.map( x => Object.keys( x.presentation ).map( y => parseFloat( x.presentation[ y ])).reduce(( a, b ) => a + b, 0.0 ));
				let max = Math.max( ... scores );
				let min = Math.min( ... scores );

				return (max - min).toFixed( 1 );
			},
			total: () => { 
				if( !('trimmed' in this.athlete )) { return null; } 
				let boards = parseInt( this.athlete.info.boards ) * 0.2;
				let scores = this.athlete.scores.map( x => boards + parseFloat( x.technical.difficulty ) + Object.keys( x.presentation ).map( y => parseFloat( x.presentation[ y ])).reduce(( a, b ) => a + b, 0.0 ));
				let max = Math.max( ... scores );
				let min = Math.min( ... scores );

				return (max - min).toFixed( 1 );
			}
		}
	}

	boards() {
		if( ! this.athlete.info ) { return 0; }
		if( ! this.athlete.info.boards ) { return 0; }
		return parseInt( this.athlete.info.boards );
	}
	name() { return this.athlete.name; }

	presentation() {
		if( ! this.athlete.complete    ) { return null; }
		if( this.athlete.info.decision ) { return null; }
		return this.athlete.trimmed.presentation.toFixed( 2 );
	}

	score() { 
		if( ! this.athlete.complete    ) { return null; }
		if( this.athlete.info.decision ) { return this.athlete.info.decision; }

		return this.athlete.trimmed.total.toFixed( 2 );
	}

	scores() { 
		let scores  = this.athlete.scores.map( x => new Score( x )); 
		let trimmed = 'trimmed' in this.athlete ? this.athlete.trimmed : null;
		if( ! trimmed ) { return scores; };
		if( 'hilo' in trimmed ) {
			let tech = trimmed.hilo.technical;
			let pres = trimmed.hilo.presentation;
			scores[ tech.hi.judge ].drop( 'technical' );
			scores[ tech.lo.judge ].drop( 'technical' );
			scores[ pres.hi.judge ].drop( 'presentation' );
			scores[ pres.lo.judge ].drop( 'presentation' );
		}

		return scores;
	}

	technical() {
		if( ! this.athlete.complete    ) { return null; }
		if( this.athlete.info.decision ) { return null; }
		return this.athlete.trimmed.technical.toFixed( 2 );
	}


}
