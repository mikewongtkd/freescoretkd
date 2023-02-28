class Athlete {
	constructor( data ) { this.athlete = data; }

	boards() {
		if( ! this.athlete.info ) { return 0; }
		if( ! this.athlete.info.boards ) { return 0; }
		return int( this.athlete.info.boards );
	}
	name() { return this.athlete.name; }
}
