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

		// Read Commands (may be redundant to requests; this is OK, as the
		// following are intended only to be used on initial connection.)
		this.read = {
			division:   () => { this.send( 'division',   'read' ); },
			ring:       () => { this.send( 'ring',       'read' ); },
			tournament: () => { this.send( 'tournament', 'read' ); }
		}

		this.when = {
			receiving: ( type ) => {
				return this.app.network.rm?.heard( type );
			}
		};
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
