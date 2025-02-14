FreeScore.ResponseManager = class FSResponseManager {
	constructor( listener, websocket ) {
		this.context   = { type : null, action : []};
		this.table     = {}; // Dispatch table
		this.listener  = listener;
		this.websocket = websocket;
		this._catch    = error => console.log( error );
		this.debug     = 1; // 0 to disable, 1 for basic information, 2 for more detailed information
	}

	add( type, action = null, handler = null ) {
		this.heard( type );
		if( action === null ) {
			action = 'update';
			handler = update => {
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

	command( action ) {
		this.context.action.push( action );
		return this;
	}

	dispatch( type, action, update ) {
		// Ignore if there's no handler
		if( ! defined( this.table?.[ type ]?.[ action ])) { 
			if( this.debug > 1 && type != 'server' && action != 'ping' ) {
				console.log( `[...${this.listener?.id?.substring( 32 )}] ${this.listener.constructor.name} is ignoring a ${type} ${action} network message`, update );
			}
			return; 
		}

		// Execute handler from the dispatch table
		if( this.debug > 1 && type != 'server' && action != 'ping' ) {
			console.log( `[...${this.listener?.id?.substring( 32 )}] ${this.listener.constructor.name} is processing a ${type} ${action} network message` );
		}
		this.table[ type ][ action ]( update );
	}

	heard( type ) {
		if( ! defined( this.table?.[ type ])) {
			this.table[ type ] = {};
		}
		this.context.type = type;
		return this;
	}

	pass() {
		let handler = update => {};
		this.context.action.forEach( action => this.add( this.context.type, action, handler ));
		this.context.action = [];
		return this;
	}
	
	respond( handler ) {
		this.context.action.forEach( action => this.add( this.context.type, action, handler ));
		this.context.action = [];
		return this;
	}

};

FreeScore.WebSocket = class FSWebSocket {
	constructor( listener ) {
		this.rm        = null;
		this.url       = null;
		this.ws        = null;
		this.listener  = listener;
		this.listeners = [];
	}

	connect( request ) {
		this.network = {
			open: () => {
				this.network.send( request );
			},
			message: response => { 
				let update  = JSON.parse( response.data );
				let type    = update.type;
				let action  = update.action;
				let request = update?.request;

				if( this.rm.debug > 0 && ! (type == 'server' && action == 'ping' )) {
					console.log( 'NETWORK MESSAGE', update );
				}

				// ------------------------------------------------------------
				// ENSURE THAT THE MESSAGE IS FOR THE GIVEN RING
				// ------------------------------------------------------------
				// Only the staging ring listens to all broadcasts
				let ring = { listener: this.listener?.ring, broadcast: null };
				ring.broadcast = [ update?.request?.ring, update?.ring?.name, update?.ring ].find( ring => {
					let is = {
						defined: typeof ring == 'undefined' || ring === null,
						staging: typeof ring == 'string' && ring == 'staging',
						ringnum: Number.isInteger( ring )
					};
					return is.defined && (is.staging || is.ringnum);
				});
				if(( typeof ring.listener == 'undefined' || ring.listener === null ) && ring.listener != ring.broadcast && ring.listener != 'staging' ) {
					if( this.rm?.debug > 1 ) { console.log( `Ignoring message for ring ${ring.broadcast}`, update ); }
					return;
				}

				try {
					this.rm.dispatch( type, action, update );
					this.listeners.forEach( listener => listener.rm.dispatch( type, action, update ));
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
		this.rm = new FreeScore.ResponseManager( this.listener, this );
		this.ws = new WebSocket( this.url );
		this.ws.onopen    = this.network.open;
		this.ws.onmessage = this.network.message;
		this.on           = {
			heard : type => {
				return this.rm.heard( type );
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
		let type   = update?.type;
		let action = update?.action;
		this.rm.dispatch( type, action, update );
		this.listeners.forEach( listener => listener.rm.dispatch( type, action, update ));
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
