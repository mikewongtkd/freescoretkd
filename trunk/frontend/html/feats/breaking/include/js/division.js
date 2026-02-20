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

	judges() {
		return this.division.judges;
	}
	
	leaderboard() {
		return this.division.state == 'display';
	}

	name() { 
		return this.division.name; 
	}

	placements() {
		return this.division.placements;
	}

	progress() { 
		let progress = this.division.athletes.reduce(( a, b ) => { if( b.complete ) { return a + 1; } else { return a; }}, 0 );
		let count    = this.division.athletes.length;

		return `${progress} of ${count} contestant${count > 1 ? 's' : ''} scored`;
	}

	ring() {
		return this.division.ring;
	}

	scoreboard() {
		return this.division.state == 'score';
	}

	summary() { 
		return `${this.name().toUpperCase()} &ndash; ${this.description()}`; 
	}
}
