class Athlete {
	constructor( data ) { 
		this.athlete = data; 

		let get = {
			technical : {
				difficulty : score => {
					if( typeof( score ) != 'object' ) { return null; }
					if( !( 'technical' in score )) { return null; }
					if( !( 'difficulty' in score.technical )) { return null; }
					return parseFloat( score.technical.difficulty );
				}
			},
			presentation : score => {
				if( typeof( score ) != 'object' ) { return null; }
				if( !( 'presentation' in score )) { return null; }
				if( typeof( score.presentation ) != 'object' ) { return null; }
				return Object.keys( score.presentation ).map( y => parseFloat( score.presentation[ y ])).reduce(( a, b ) => a + b, 0.0 )
			}
		};

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
				let scores = this.athlete.scores.map( x => get.technical.difficulty( x )).filter( x => x !== null );
				let k      = this.athlete.scores.length;
				let n      = scores.length; 
				if( n == 0 || ( n != k && k != 0 )) { return null; }
				let sum    = scores.reduce(( a, b ) => a + b, 0.0);
				if( 'hilo' in this.athlete.trimmed ) {
					let dropped = this.athlete.trimmed.hilo;
					sum -= dropped.technical.hi.value + dropped.technical.lo.value;
					if( sum < 0 ) { sum = 0; } // The technical score cannot drop below 0
				}
				let mean = (boards + ( sum / 3 )).toFixed( 2 );
				return mean;
			},
			presentation: () => { 
				if( !( 'trimmed' in this.athlete )) { return null; }
				let scores = this.athlete.scores.map( x => get.presentation( x )).filter( x => x !== null );
				let k      = this.athlete.scores.length;
				let n      = scores.length; 
				if( n == 0 || ( n != k && k != 0 )) { return null; }
				let sum    = scores.reduce(( a, b ) => a + b, 0.0);
				if( 'hilo' in this.athlete.trimmed ) {
					let dropped = this.athlete.trimmed.hilo;
					sum -= dropped.presentation.hi.value + dropped.presentation.lo.value;
				}
				let mean = ( sum / 3 ).toFixed( 2 );
				return mean;
			},
			total: () => { 
				if( ! this.athlete.complete ) { return null; } 
				let tech = this.mean.technical();
				let pres = this.mean.presentation();
				if( tech === null || pres === null ) { return null; }

				tech = parseFloat( tech );
				pres = parseFloat( pres );

				return (tech + pres).toFixed( 2 );
			}
		};

		this.range = {
			technical: () => { 
				if( !('trimmed' in this.athlete )) { return null; } 
				let scores = this.athlete.scores.map( x => get.technical.difficulty( x )).filter( x => x !== null );
				if( scores.length == 0 ) { return null; }
				let max = Math.max( ... scores );
				let min = Math.min( ... scores );

				return (max - min).toFixed( 1 );
			},
			presentation: () => { 
				if( !( 'trimmed' in this.athlete )) { return null; }
				let scores = this.athlete.scores.map( x => get.presentation( x )).filter( x => x !== null );
				let k      = this.athlete.scores.length;
				let n      = scores.length;
				if( n == 0 || ( n != k && k != 0 )) { return null; }
				let max = Math.max( ... scores );
				let min = Math.min( ... scores );

				return (max - min).toFixed( 1 );
			},
			total: () => { 
				if( !('trimmed' in this.athlete )) { return null; } 
				let boards = parseInt( this.athlete.info.boards ) * 0.2;
				let tech   = this.athlete.scores.map( x => get.technical.difficulty( x ));
				let pres   = this.athlete.scores.map( x => get.presentation( x ));
				let scores = tech.map(( t, i ) => { 
					let p = pres[ i ]; 
					if( t === null ) { return null; } 
					if( p === null ) { return null; } 
					return t + p; 
				}).filter( x => x !== null );
				if( scores.length == 0 || scores.length != this.athlete.scores.length ) { return null; }

				let max = Math.max( ... scores );
				let min = Math.min( ... scores );

				return (max - min).toFixed( 1 );
			}
		};

		this.time = {
			reset : () => {
				if( ! this.athlete.info && ! this.athlete.info.time && ! this.athlete.info.time.start ) { return null; }
				this.athlete.info.time.start = null;
				this.athlete.info.time.stop  = null;
			},
			start : () => {
				if( ! this.athlete.info && ! this.athlete.info.time && ! this.athlete.info.time.start ) { return null; }
				return this.athlete.info.time.start;
			},
			stop : () => {
				if( ! this.athlete.info && ! this.athlete.info.time && ! this.athlete.info.time.stop ) { return null; }
				return this.athlete.info.time.stop;
			}
		};
	}

	boards() {
		if( ! this.athlete.info ) { return 0; }
		if( ! this.athlete.info.boards ) { return 0; }
		return parseInt( this.athlete.info.boards );
	}

	complete() {
		return this.athlete.complete;
	}

	decision() {
		if( ! this.athlete.info || ! this.athlete.info.decision ) { return null; }
		return this.athlete.info.decision;
	}

	name() { return this.athlete.name; }

	noc() {
		if( ! this.athlete.info || ! this.athlete.info.noc ) { return null; }
		return this.athlete.info.noc;
	}

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

	tb1() { return this.athlete.tb1; }
	tb2() { return this.athlete.tb2; }

	technical() {
		if( ! this.athlete.complete    ) { return null; }
		if( this.athlete.info.decision ) { return null; }
		return this.athlete.trimmed.technical.toFixed( 2 );
	}


}
