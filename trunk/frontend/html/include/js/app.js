FreeScore.App = class FSApp {
	constructor( ring = null ) {
		this._id      = UUID.v4();
		this._ring    = ring;
		this._button  = {};
		this._display = {};
		this._input   = {};
		this._modal   = {};
		this._network = new FreeScore.WebSocket( this );
		this._comms   = new FreeScore.CommsProtocol( this );
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

		// Response behavior to Server Ping
		this.ping = {};
		this.ping.off = () => { this.comms.receive( 'user' ).command( 'ping' ).respond(() => { this.comms.request.user.stopPing(); }
		this.ping.on  = () => {
			this.comms.receive( 'user' ).command( 'ping' ).respond( ping => {
				let timestamp = (new Date).toISOString();
				this.comms.request.user.pong( ping.server.timestamp, timestamp );
			});
		};

		// On Connect actions
		this.read = {
			division :   () => { this.comms.onConnect( 'division',   'read' ); this.ping.on(); },
			ring :       () => { this.comms.onConnect( 'ring',       'read' ); this.ping.on(); },
			tournament : () => { this.comms.onConnect( 'tournament', 'read' ); this.ping.on(); }
		};
	}

	get button()  { return this._button; }
	get comms()   { return this._comms; }
	get display() { return this._display; }
	get event()   { return this._event; }
	get id()      { return this._id; }
	get input()   { return this._input; }
	get modal()   { return this._modal; }
	get network() { return this._network; }
	get page()    { return this._page; }
	get refresh() { return this._refresh; }
	get ring()    { return this._ring; }
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
