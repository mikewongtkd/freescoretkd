FreeScore.Widget = class FSWidget {
	constructor( app, dom, options = null ) {
		this._refresh = {};
		this._app     = app;
		this._button  = {};
		this._dom     = dom.match( /^#/ ) ? $( dom ) : $( `#${dom}` );
		this._input   = {};
		this._options = options;
		this._sound   = app.sound;
		this._state   = {};
		this._event   = {
			trigger : ( type, message ) => { 
				this.app.event.trigger( type, this, message ); 
			},
			handle : ( type, source, message ) => {
				if( ! type in this.event.handler ) {
					let name = this.constructor.name;
					console.log( `${name} registered to handle event ${type}, but no handler defined` );
					return;
				}
				let callback = this.event.handler[ type ];
				callback( type, source, message );
			},
			handler : {},
			ignore : type => {
				this.app.event.ignore( type, this );
			},
			listen : ( type, callback ) => {
				this.event.handler[ type ] = callback;
				this.app.event.register( type, this );
			}
		}
		this._id = self.crypto.randomUUID();

		this.listen( app.network );
	}

	listen( network ) {
		network.register( this );
	}

	heard( type ) {
		return this._app.network.rm.heard( type );
	}

	get app()     { return this._app; }
	get button()  { return this._button; }
	get event()   { return this._event; }
	get id()      { return this._id; }
	get input()   { return this._input; }
	get refresh() { return this._refresh; }
	get sound()   { return this._sound; }
	get state()   { return this._state; }

	set refresh( value ) { this._refresh = value; }
}
