FreeScore.Widget = class FSWidget {
	constructor( app, dom ) {
		this._refresh = {};
		this._app     = app;
		this._dom     = $( dom );
		this._button  = {};
		this._input   = {};
		this._sound   = app.sound;
		this._state   = {};

		this.listen( app.network );

	}

	listen( network ) {
		network.register( this );
	}

	response( type ) {
		return this._app.network.rm.response( type );
	}

	get button()         { return this._button; }
	get input()          { return this._input; }
	get refresh()        { return this._refresh; }
	get sound()          { return this._sound; }
	get state()          { return this._state; }

	set refresh( value ) { this._refresh = value; }
}
