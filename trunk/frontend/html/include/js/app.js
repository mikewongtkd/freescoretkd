FreeScore.App = class FSApp {
	constructor() {
		this._id      = self.crypto.randomUUID();
		this._button  = {};
		this._display = {};
		this._input   = {};
		this._network = new FreeScore.WebSocket();
		this._refresh = {};
		this._sound   = new FreeScore.Sound();
		this._state   = {};
		this._page    = {};
		this._widget  = {};
		this.on       = {
			connect : url => {
				this._network.set( url );
				return this;
			}
		};

		// Event Handler
		this._event = new FreeScore.EventServer( this );

		// Server Ping behavior
		this.ping = {};
		this.ping.off = () => { this.network.rm?.heard( 'server' ).command( 'ping' ).respond(() => { this.network.send({ type : 'server', action : 'stop ping' }); }); }
		this.ping.on  = () => {
			this.network.rm.add( 'server', 'ping', ping => {
				let timestamp = (new Date).toISOString();
				let pong = { type : 'client', action : 'pong', server : { ping : { timestamp : ping.server.timestamp }}, client : { pong : { timestamp }}};
				this.network.send( pong );
			});
		};

		// On Connect actions
		this.read = {
			division :   () => { this._network.connect({ type : 'division',   action : 'read' }); this.ping.on(); },
			ring :       () => { this._network.connect({ type : 'ring',       action : 'read' }); this.ping.on(); },
			tournament : () => { this._network.connect({ type : 'tournament', action : 'read' }); this.ping.on(); }
		};
	}

	get button()  { return this._button; }
	get display() { return this._display; }
	get event()   { return this._event; }
	get id()      { return this._id; }
	get input()   { return this._input; }
	get network() { return this._network; }
	get page()    { return this._page; }
	get refresh() { return this._refresh; }
	get sound()   { return this._sound; }
	get state()   { return this._state; }
	get widget()  { return this._widget; }


	// App caches for general UI/UX usage
	set button( value )  { this._button  = value; } // For button behavior
	set display( value ) { this._display = value; } // To reference general display components
	set input( value )   { this._input   = value; } // For input behavior
	set page( value )    { this._page    = value; } // For multipaged apps
	set refresh( value ) { this._refresh = value; } // Callbacks for app component behavior
	set state( value )   { this._state   = value; } // For app state (e.g. DFA graphs and transitions)
	set widget( value )  { this._widget  = value; } // Widgets

	request( request ) {
		this._network.connect( request );
	}
}
