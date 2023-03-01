class Division {
	constructor( data ) { 
		this.division = data; 
		this.current  = {
			athlete : () => {
				let current  = this.division.current;
				let athletes = this.division.athletes;
				return new Athlete( athletes[ current ]);
			},
			athleteid : () => {
				return this.division.current;
			}
		};
	}

	athletes() {
		return this.division.athletes.map( x => new Athlete( x ));
	}

	description() { 
		return this.division.description; 
	}

	name() { 
		return this.division.name.toUpperCase(); 
	}

	progress() { 
		let progress = this.division.athletes.reduce(( a, b ) => { if( b.complete ) { return a + 1; } else { return a; }}, 0 );
		let count    = this.division.athletes.length;

		return `${progress} of ${count} contestant${count > 1 ? 's' : ''} scored`;
	}

	summary() { 
		return `${this.name()} &ndash; ${this.description()}`; 
	}
}
