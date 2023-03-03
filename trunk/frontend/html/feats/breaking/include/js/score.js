class Score {
	constructor( data ) { 
		this.score = data; 
		this.dropped = { technical : false, presentation: false }; 
	}

	drop( category ) {
		if( category != 'technical' || category != 'presentation' ) { throw Error( `Unknown category ${category}` ); }
		this.dropped[ category ] = true;
	}

	technical() {
		if( ! this.score.technical || ! this.score.technical.difficulty ) { return null; }
		return this.score.technical.difficulty.toFixed( 1 );
	}

	presentation() {
		if( ! this.score.presentation ) { return null; }
		let sum = Object.keys( this.score.presentation ).map( x => parseFloat( this.score.presentation[ x ])).reduce(( a, b ) => a + b, 0.0 ).toFixed( 1 );
		return sum;
	}
}
