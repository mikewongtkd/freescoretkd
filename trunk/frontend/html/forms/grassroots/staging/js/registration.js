class Athlete {
	constructor( id, data, reg ) {
		if( defined( data )) { Object.keys( data ).forEach( key => { this[ `_${key}` ] = data[ key ]; }); }
		this._reg = reg;
		this._id  = id;
	}

	get name() { return this._name; }

	checkin( divid ) {
		this._reg._checkin[ divid ][ this._id ] = true;
	}

	hasCheckedIn( div ) {
		let divid = div.id;
		return this._reg._checkin[ divid ][ this._id ];
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
	get event()       { return this._ev._name; }

	get start() {
		let today = moment().format( 'M-D-YYYY' ); // MW starts should be complete datetime values
		return moment( `${today} ${this._start}` );
	}

	duration() {
		if( this.ev.method == 'cutoff' ) {
			return this._athletes.length * 4;

		} else if( this.ev.method == 'single elimination' ) {
			return (this._athletes.length - 1) * 4;
		}
	}

	isReady() {
		return Object.values( this._reg.checkin[ this._id ]).every( checkin => checkin );
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
}