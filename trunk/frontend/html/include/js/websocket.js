FreeScore.ResponseManager = class FSResponseManager {
	constructor( websocket ) {
		this.context   = {};
		this.table     = {}; // Dispatch table
		this.websocket = websocket;
		this._catch    = error => console.log( error );

		// ===== DEFAULT HANDLERS
		this.add( 'server', 'ping', ping => {
			let timestamp = (new Date).toISOString();
			let pong = { type : 'client', action : 'pong', server : { ping : { timestamp : ping.server.timestamp }}, client : { pong : { timestamp }}};
			this.websocket.network.send( pong );
		});
		this.add( 'users', 'update' );
		this.add( 'autopilot' );
		this.add( 'autopilot', 'score' );
		this.add( 'autopilot', 'scoreboard' );
		this.add( 'autopilot', 'leaderboard' );
		this.add( 'division' );
		this.add( 'ring' );
		this.add( 'tournament' );
	}

	add( type, action = null, handler = null ) {
		this.response( type );
		if( action === null ) {
			action = 'update';
			handler = update => {
				let request = update.request;
				let type    = request.type;
				let action  = request.action;

				try {
					this.dispatch( type, action, update );
				} catch( error ) {

					this._catch( error );
				}
			}

		} else if( handler === null ) {
			handler = update => {};
		}
		this.table[ type ][ action ] = handler;
	}

	by( handler ) {
		this.add( this.context.type, this.context.action, handler );
		return this;
	}

	dispatch( type, action, update ) {
		if( ! (type in this.table )) { 
			if( alertify ) { 
				if( update.error ) { throw new Error( update.error ); }
				alertify.error( `No handler for Type ${type} response` ); 
			} 
			console.log( update ); 
			return; 
		}
		if( ! (action in this.table[ type ])) { 
			if( alertify ) { 
				if( update.error ) { throw new Error( update.error ); }
				alertify.error( `No handler for Type ${type} action ${action} response` ); 
			} 
			console.log( update ); 
			return; 
		}

		this.table[ type ][ action ]( update );
	}

	handle( action ) {
		this.context.action = action;
		return this;
	}

	pass() {
		let handler = update => {};
		this.add( this.context.type, this.context.action, handler );
		return this;
	}
	
	response( type ) {
		if( !( type in this.table )) {
			this.table[ type ] = {};
		}
		this.context.type = type;
		return this;
	}

};

FreeScore.WebSocket = class FSWebSocket {
	constructor() {
		this.rm        = null;
		this.url       = null;
		this.ws        = null;
		this.listeners = [];
	}

	connect( request ) {
		this.network = {
			open: () => {
				this.network.send( request );
			},
			message: response => { 
				let update = JSON.parse( response.data );
				let type   = update.type;
				let action = update.action;

				if( type != 'server' || action != 'ping' ) {
					console.log( update );
				}

				this.listeners.forEach( listener => listener.refresh( update ));

				try {
					this.rm.dispatch( type, action, update );
				} catch( error ) {
					this.rm._catch( error );
				}
			},
			send: data => {
				let request = { data };
				request.json = JSON.stringify( request.data ); 
				this.ws.send( request.json );
			}
		};
		this.rm = new FreeScore.ResponseManager( this );
		this.ws = new WebSocket( this.url );
		this.ws.onopen    = this.network.open;
		this.ws.onmessage = this.network.message;
		this.on           = {
			response : type => {
				return this.rm.response( type );
			}
		};
	}

	catch( callback ) {
		this.rm._catch = callback;
	}

	close() {
		this.ws.close();
	}

	handle( update ) {
		this.rm.dispatch( update.type, update.action, update );
	}

	reconnect( url ) {
		this.close();
		this.url = url;
		this.ws = new WebSocket( this.url );
		this.ws.onopen    = this.network.open;
		this.ws.onmessage = this.network.message;
	}

	register( listener ) {
		this.listeners.push( listener );
	}

	send( message ) {
		this.network.send( message );
	}

	set( url ) {
		this.url = url;
	}
}
