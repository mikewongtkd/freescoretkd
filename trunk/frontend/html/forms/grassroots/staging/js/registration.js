class Athlete {
	constructor( id, data, reg ) {
		if( defined( data )) { Object.keys( data ).forEach( key => { this[ key ] = data[ key ]; }); }
		this.reg = reg;
		this.id  = id;
	}

	checkin( divid ) {
		reg.checkin[ divid ][ this.id ] = true;
	}
}

class Division {
	constructor( id, data, reg, ev ) {
		if( defined( data )) { Object.keys( data ).forEach( key => { this[ key ] = data[ key ]; }); }

		this.id  = id;
		this.reg = reg;
		this.ev  = ev;
	}

	get athletes() {
		return Object.keys( this.reg.checkin[ this.id ]).map( id => new Athlete( id, this.reg.athletes[ id ], reg ));
	}

	duration() {
		if( this.ev.method == 'cutoff' ) {
			return this.athletes.length * 4;

		} else if( this.ev.method == 'single elimination' ) {
			return (this.athletes.length - 1) * 4;
		}
	}

	isReady() {
		return Object.values( reg.checkin[ this.id ]).every( checkin => checkin );
	}
}

class Event {
	constructor( id, data, reg ) {
		if( defined( data )) { Object.keys( data ).forEach( key => { this[ key ] = data[ key ]; }); }

		let time  = this.start.match( /(?<hour>\d+):(?<minute>\d+)\s*(?<ampm>pm)/i );
		let start = new Date();
		start.setHours( parseInt( time.groups.hour + (time.groups.ampm ? 12 : 0)));
		start.setMinutes( parseInt( time.groups.minute ));
		start.setSeconds( 0 );

		this.id    = id;
		this.start = start;
		this.reg   = reg;
	}

	get divisions() {
		return this.divisions.map( divid => new Division( divid, reg.divisions[ divid ], reg, this ));
	}

	get id()    { return this.id; }
	get name()  { return this.name; }
	get start() { return this.start; }

	sort( other ) {
		return this.start - other.start;
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
		if( defined( data )) { Object.keys( data ).forEach( key => { this[ key ] = data[ key ]; }); }
	}

	events() {
		return Object.keys( this.events ).map( id => new Event( id, this.events[ id ], this )).sort(( a, b ) => a.sort( b ));
	}
}
