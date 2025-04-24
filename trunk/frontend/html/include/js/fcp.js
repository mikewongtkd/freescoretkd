FreeScore.CommsProtocol = class FSCommsProtocol {
	constructor( app ) {
		this._app      = app;
		this._request  = {};
		this._validate = {};

		this._request.user = {
			pong: ( timestamp ) => {
				this.send( 'user', 'pong', { ring: this.app.ring });
			},
			stopPing: ( serverTimestamp, clientTimestamp ) => {
				let request = { 
					ring: this.app.ring, 
					server: { ping: { timestamp: serverTimestamp }}, 
					client: { pong: { timestamp: clientTimestamp }}
				}
				this.send( 'user', 'stop ping', request );
			}
		};
	}

	onConnect( type, action, request = {}) {
		request.type   = type;
		request.action = action;
		this.app.network.send( request );
	}

	receive( type ) {
		return this.app.network.rm?.heard( type );
	}

	send( type, action, request = {}) {
		request.type   = type;
		request.action = action;
		this.app.network.send( request );
	}

	get app()      { return this._app; }
	get request()  { return this._request; }
	get validate() { return this._validate; }
}
