FreeScore.CommsProtocol = class FSCommsProtocol {
	constructor( app ) {
		this._app      = app;
		this._request  = {};
		this._validate = {};
	}

	send( type, action, request = {}) {
		request.type   = type;
		request.action = action;
		this.app.network.send( request );
	}

	get request()  { return this._request; }
	get validate() { return this._validate; }
}
