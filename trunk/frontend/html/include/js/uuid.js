class UUID {
	constructor() {}

	static v4() {
		const hex      = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f' ];
		const variants = [ 8, 9, 'a', 'b' ];
		const groups   = [ 8, 4, 3, 3, 12 ];

		let variant = variants[ Math.floor( Math.random() * 4 )];
		let uuid    = groups.map(( size, i ) => {
			let group = '';
			if     ( i == 2 ) { group = '4'; }
			else if( i == 3 ) { group = `${variant}`; }
			for( let j = 0; j < size; j++ ) {
				group += hex[ Math.floor( Math.random() * 16 )];
			}
			return group;
		}).join( '-' );

		return uuid;
	}
}
