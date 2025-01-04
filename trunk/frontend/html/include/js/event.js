if( ! defined( FreeScore.Event )) {
	FreeScore.Event = {};
}

FreeScore.Event.Client = class FSEventClient {
	constructor( app ) {
		this._app     = app;
		this._handler = {};
	}
	handle( type, source, message ) {
		let callback = this?.event?.handler?.[ type ];
		if( ! defined( callback )) {
			let name = this.constructor.name;
			console.log( `${name} registered to handle event ${type}, but no callback defined` );
			return;
		}
		callback( type, source, message );
	}

	ignore( type ) {
		this.app.event.unregister( type, this );
	}

	listen( type, callback ) {
		this.handler[ type ] = callback;
		this.app.event.register( type, this );
	}

	trigger( type, message ) { 
		this.app.event.trigger( type, this, message ); 
	}

	get app()     { return this._app; }
	get handler() { return this._handler; }

}

FreeScore.Event.Server = class FSEventServer extends FreeScore.Event.Client {
	constructor( app ) {
		super( app );
		this._listeners = {};
	}

	ignore( type ) {
		this.unregister( type, this );
	}

	register( type, listener ) {
		let listeners = this.listeners?.[ type ];

		if( ! defined( listeners ))       { listeners = this.listeners[ type ] = []; }
		if( ! Array.isArray( listeners )) { listeners = this.listeners[ type ] = []; }

		let found = listeners.find( widget => widget.id == listener.id );
		if( found ) { return; }

		listeners.push( listener );
	}
	
	unregister( type, listener ) {
		let listeners = this.listeners?.[ type ];
		if( ! defined( listeners )) { return; }

		if( ! Array.isArray( listeners )) {
			let name = listener.constructor.name;
			console.log( `Removing ${name} as a listener: Failed, listener not defined as array for event ${type}` );
			return;
		}

		let found = listeners.findIndex( widget => widget.id == listener.id );
		if( found < 0 ) { return; }

		this.listeners[ type ].splice( found, 1 );
	}

	trigger( type, source, message ) {
		let listeners = this.listeners?.[ type ];
		if( ! defined( listeners )) {
			let name = source.constructor.name;
			console.log( `No listeners for event ${type} from ${name}`, message );
			return;
		}

		if( ! Array.isArray( listeners )) {
			let name = source.constructor.name;
			console.log( `Listeners not defined as array for event ${type} from ${name}`, message );
			return;
		}

		listeners.forEach( listener => {
			listener.event.handle( type, source, message );
		});
	}

	get listeners() { return this._listeners; }
}
