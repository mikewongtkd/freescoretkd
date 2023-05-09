FreeScore.ResponseManager = class FSResponseManager {
	constructor() {
		this.context = {};
		this.table   = {}; // Dispatch table

		// ===== DEFAULT HANDLERS
		this.add( 'server', 'ping', ping => {
			let timestamp = (new Date).toISOString();
			let pong = { type : 'client', action : 'pong', server : { ping : { timestamp : ping.server.timestamp }}, client : { pong : { timestamp }}};
			network.send( pong );
		});
		this.add( 'users', 'update' );
		this.add( 'autopilot' );
		this.add( 'autopilot', 'score' );
		this.add( 'autopilot', 'scoreboard' );
		this.add( 'autopilot', 'leaderboard' );
		this.add( 'division' );
		this.add( 'ring' );
	}

	add( type, action = null, handler = null ) {
		this.response( type );
		if( action === null ) {
			action = 'update';
			handler = update => {
				let request = update.request;
				let type    = request.type;
				let action  = request.action;

				if( !( type in this.table ))           { console.log( `No handler for ${type} response`, update ); return; }
				if( !( action in this.table[ type ] )) { console.log( `No handler for ${type} ${action} action`, update ); return; }

				this.dispatch( type, action, update );
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
		if( update.type != 'server' && update.action != 'ping' ) {
			console.log( update );
		}

		if( ! (type in this.table ))          { alertify.error( `No handler for ${type} response` ); console.log( update ); return; }
		if( ! (action in this.table[ type ])) { alertify.error( `No handler for ${type} ${action} action` ); console.log( update ); return; }

		this.table[ type ][ action ]( update );
	}

	handle( action ) {
		this.context.action = action;
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
	constructor( url, onopen ) {
		this.ws = new WebSocket( url );
		this.rm = new FreeScore.ResponseManager();
		this.network = {
			open: () => {
				network.send( onopen );
			},
			message: response => { 
				let update = JSON.parse( response.data );
				let type   = update.type;
				let action = update.action;

				if( type != 'server' || action != 'ping' ) {
					console.log( update );
				}

				this.rm.dispatch( type, action, update );
			},
			send: data => {
				let request = { data };
				request.json = JSON.stringify( request.data ); 
				this.ws.send( request.json );
			}
		};
		this.ws.onopen    = this.network.open;
		this.ws.onmessage = this.network.message;
		this.on           = {
			response : type => {
				return this.rm.response( type );
			}
		};
	}

	send( message ) {
		this.network.send( message );
	}
}
