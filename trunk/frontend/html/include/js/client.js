class Client {
	constructor( client ) {
		this.client = client;
		this._name   = client.role;
		this._id     = client.cid;
		this._cid    = client.cid;
		this._jid    = null;

		if( this.client.role.match( /judge/i )) {
			let match  = this.client.role( /judge(\d+)/i );
			let jid    = parseInt( match[ 1 ]);
			this._jid  = jid;
			this._name = jid == 0 ? 'Referee' : `Judge ${jid}`;
		}
	}

	get id()   { return this._cid; }
	get cid()  { return this._cid; }
	get jid()  { return this._jid; }
	get name() { return this._name; }
}

class Clients {
	constructor( data ) {
		this.clients = data?.map( client => new Client( client ));
	}

	judges() {
		if( this.clients === undefined ) { return []; }
		return this.clients.filter( client => client.jid !== null );
	}
}

