FreeScore.App = class FSApp {
	constructor() {
		this._button  = {};
		this._display = {};
		this._input   = {};
		this._network = new FreeScore.WebSocket();
		this._refresh = {};
		this._sound   = new FreeScore.Sound();
		this._state   = {};
		this.on       = {
			connect : url => {
				this._network.set( url );
				return this;
			}
		};

		this.ping = {
			off: () => { this._network.add( 'server', 'ping', (() => { this.send({ type : 'server', action : 'stop ping' }); }).bind( this._network )); }
		};

		this.read = {
			division : () => {
				this._network.connect({ type : 'division', action : 'read' });
			},
			ring : () => {
				this._network.connect({ type : 'ring', action : 'read' });
			},
			tournament : () => {
				this._network.connect({ type : 'tournament', action : 'read' });
			},
		};
	}

	get button()  { return this._button; }
	get display() { return this._display; }
	get input()   { return this._input; }
	get network() { return this._network; }
	get refresh() { return this._refresh; }
	get sound()   { return this._sound; }
	get state()   { return this._state; }

	// App caches for general UI/UX usage
	set button( value )  { this._button  = value; } // For button behavior
	set display( value ) { this._display = value; } // To reference general display components
	set input( value )   { this._input   = value; } // For input behavior
	set refresh( value ) { this._refresh = value; } // Callbacks for app component behavior
	set state( value )   { this._state   = value; } // For app state (e.g. DFA graphs and transitions)

	request( request ) {
		this._network.connect( request );
	}
}
