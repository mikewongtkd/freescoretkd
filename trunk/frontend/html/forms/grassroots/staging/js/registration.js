class Athlete {
	constructor( id, data, reg ) {
		if( defined( data )) { Object.keys( data ).forEach( key => { this[ `_${key}` ] = data[ key ]; }); }
		this._reg = reg;
		this._id  = id;
	}

	get id() { return this._id; }
	get name() { return this._name; }
	get lastName() { let match = this._name.match( /(?<lastname>[A-Z\s]+)$/ ); let lastName = match.groups.lastname; if( lastName ) { return lastName; } else { return ''; }}

	checkin( div ) {
		let divid = div.id;
		this._reg._checkin[ divid ][ this._id ] = true;
		this._reg._here[ divid ][ this._id ]    = true;
	}

	checkout( div ) {
		let divid = div.id;
		this._reg._checkin[ divid ][ this._id ] = false;
		this._reg._here[ divid ][ this._id ]    = true;
	}

	missing( div ) {
		let divid = div.id;
		this._reg._checkin[ divid ][ this._id ] = false;
		this._reg._here[ divid ][ this._id ]    = false;
	}

	hasCheckedIn( div ) {
		let divid = div.id;
		return this._reg._checkin[ divid ][ this._id ];
	}

	isHere( div ) {
		let divid = div.id;
		return this._reg._here[ divid ][ this._id ];
	}
}

class Division {
	constructor( id, data, reg, ev ) {
		if( defined( data )) { Object.keys( data ).forEach( key => { this[ `_${key}` ] = data[ key ]; }); }

		this._id  = id;
		this._reg = reg;
		this._ev  = ev;
	}

	get athletes() {
		return Object.keys( this._reg._checkin[ this._id ]).map( id => new Athlete( id, this._reg._athletes[ id ], this._reg ));
	}

	get id()          { return this._id; }
	get description() { return this._description; }
	get summary()     { return `${this._id.toUpperCase()} ${this._description}`; }
	get event()       { return this._ev._name; }
	get ring()        { return this._ring; }
	get staged()      { return this._staged; }

	get start() {
		let today = moment().format( 'M-D-YYYY' ); // MW starts should be complete datetime values
		return moment( `${today} ${this._start}` );
	}

	add( name ) {
		let athletes = this._reg._athletes;
		let found    = Object.values( athletes ).filter( a => a.name == name );
		let athlete  = undefined;
		let id       = undefined;
		let seed     = 'r2jOEUhk'; // Random seed
		if( found.length ) { 
			athlete = found[ 0 ]; 
			id      = athlete.id;
		} else { 
			id             = sha1.hex( name ).substring( 0, 8 ); 
			athlete        = { name: name, id: id }; 
			while( athletes[ id ]) { id = sha1.hex( id + seed ).substring( 0, 8 ); athlete.id = id; } // Avoid collision with another athlete
			athletes[ id ] = athlete;
		}
		this._reg._checkin[ this._id ][ id ] = true;
		this._reg._here[ this._id ][ id ]    = true;
	}

	duration() {
		if( this.ev.method == 'cutoff' ) {
			return this._athletes.length * 4;

		} else if( this.ev.method == 'single elimination' ) {
			return (this._athletes.length - 1) * 4;
		}
	}

	sendToRing() {
		this._staged = this._reg._divisions[ this.id ].staged = moment().format( 'M-D-YYYY h:mm A' );
	}

	returnFromRing() { 
		this._staged = this._reg._divisions[ this.id ].staged = undefined;
	}

	isReady() {
		return Object.values( this._reg._checkin[ this._id ]).every( checkin => checkin );
	}
}

class Event {
	constructor( id, data, reg ) {
		if( defined( data )) { Object.keys( data ).forEach( key => { this[ `_${key}` ] = data[ key ]; }); }
		let today = moment().format( 'M-D-YYYY' ); // MW starts should be complete datetime values

		this._id    = id;
		this._start = moment( `${today} ${this._start}` );
		this._reg   = reg;
	}

	get divisions() {
		return this._divisions.map( divid => new Division( divid, this._reg._divisions[ divid ], this._reg, this ));
	}

	get id()    { return this._id; }
	get name()  { return this._name; }
	get start() { return this._start; }

	sort( other ) {
		return this._start.subtract( other._start );
	}
}

// registration
//   athletes
//     id
//   checkin
//     div.id
//       athlete.id : true/false
//   divisions
//     div.id
//   events
//     id
//       divisions
//         div.id

class Registration {
	constructor( data ) {
		if( defined( data )) { Object.keys( data ).forEach( key => { this[ `_${key}` ] = data[ key ]; }); }
	}

	get events() {
		return Object.keys( this._events ).map( id => new Event( id, this._events[ id ], this )).sort(( a, b ) => a.sort( b ));
	}

	event( evid ) {
		return this._events[ evid ];
	}
}
