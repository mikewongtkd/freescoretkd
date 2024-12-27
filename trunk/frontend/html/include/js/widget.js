FreeScore.Widget = class FSWidget {
	constructor() {
		this._refresh = {};

	}

	listen( network ) {
		network.register( this );
	}

	handle( update ) {
	}
}
