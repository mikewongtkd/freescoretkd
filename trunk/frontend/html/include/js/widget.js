FreeScore.Widget = class FSWidget {
	constructor( app, dom ) {
		this._refresh = {};
		this._app     = app;
		this._dom     = $( dom );

		this.listen( app.network );

	}

	listen( network ) {
		network.register( this );
	}

	handle( update ) {
	}

	get refresh() {
		return this._refresh;
	}

	set refresh( value ) {
		this._refresh = value;
	}

	set widget( value ) {
		this._widget = value;
	}
}
