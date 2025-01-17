FreeScore.ResponseManager = class FSResponseManager {
	constructor( listener, websocket ) {
		this.context   = { type : null, action : []};
		this.table     = {}; // Dispatch table
		this.listener  = listener;
		this.websocket = websocket;
		this._catch    = error => console.log( error );
		this.debug     = true;
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
			if( this.debug && type != 'server' && action != 'ping' ) {
				console.log( `[...${this.listener?.id?.substring( 32 )}] ${this.listener.constructor.name} is ignoring a ${type} ${action} network message`, update );
			}
			return; 
		}

		// Execute handler from the dispatch table
		if( this.debug && type != 'server' && action != 'ping' ) {
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
				let update = JSON.parse( response.data );
				let type   = update.type;
				let action = update.action;

				if( this.debug && type != 'server' || action != 'ping' ) {
					console.log( 'WEBSOCKET CONNECT', update );
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
