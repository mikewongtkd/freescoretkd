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
	}

	get button()  { return this._button; }
	get display() { return this._display; }
	get input()   { return this._input; }
	get network() { return this._network; }
	get refresh() { return this._refresh; }
	get sound()   { return this._sound; }
	get state()   { return this._state; }

	// Common case is to read the current division
	connect( url ) {
		this._network.set( url );
		this._network.connect({ type : 'division', action : 'read' });
	}

	request( request ) {
		this._network.connect( request );
	}
}
