class Athlete {
	constructor( athlete ) {
		this.athlete = athlete;

		this.display = { name: ( max = 32 ) => {
			if( this.name.length <= max ) { return this.name; }
			let names = this.name.split( /\s+/ );
			if( names.length == 1 ) { return this.name.substr( 0, max ); }
			let first = names.filter( name => name != name.toUpperCase());
			let last  = names.filter( name => name == name.toUpperCase());
			if( last.length == 0 ) {
				last  = first;
				first = [ last.shift() ];
			}
			let initials = first.map( x => x.substr( 0, 1 ).toUpperCase()).join( '' );

			first = first.join( ' ' );
			last  = last.join( ' ' );

			initials = `${initials} ${last}`;
			if( initials <= max ) { return initials; }
			return last.substr( 0, max );
		}};
	}

	get name() { return this.athlete.name; }
	get id()   { return this.athlete.id; }

	info( key ) { 
		if( ! this.athlete.info ) { return null; }
		if( ! key in this.athlete.info ) { return null; }
		return this.athlete.info[ key ];
	}
	score( rid ) { return new Score( this.athlete.scores[ rid ]); }
}
