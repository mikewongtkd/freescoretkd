FreeScore.ResponseManager = class FSResponseManager {
	constructor( websocket ) {
		this.context   = { type : null, action : []};
		this.table     = {}; // Dispatch table
		this.websocket = websocket;
		this._catch    = error => console.log( error );
	}

	add( type, action = null, handler = null ) {
		this.heard( type );
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

	command( action ) {
		this.context.action.push( action );
		return this;
	}

	dispatch( type, action, update ) {
		if( ! defined( this.table?.[ type ])) { 
			if( alertify ) { 
				if( update?.error ) { throw new Error( update.error ); }
				// console.log( `No handler for response object ${type}` ); 
				// alertify.error( `No handler for response object ${type}` ); 
			} 
			console.log( update ); 
			return; 
		}
		if( ! (this.table?.[ type ]?.[ action ])) { 
			if( alertify ) { 
				if( update?.error ) { throw new Error( update.error ); }
				// console.log( `No handler for response object ${type} action ${action}` ); 
				// alertify.error( `No handler for response object ${type} action ${action}` ); 
			} 
			console.log( update ); 
			return; 
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

				this.listeners.forEach( listener => listener.rm.dispatch( type, action, update ));

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
