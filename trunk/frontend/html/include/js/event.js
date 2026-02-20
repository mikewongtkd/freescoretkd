FreeScore.EventClient = class FSEventClient {
	constructor( widget ) {
		this._widget  = widget;
		this._app     = widget?.app ? widget.app : widget;
		this._context = [];
		this._handler = {};
	}

	handle( type, source, message ) {
		let caller   = this.widget?.app ? this.widget : this.app;
		let callback = caller?.event?.handler?.[ type ];
		if( ! defined( callback )) {
			let name = caller.constructor.name;
			console.log( `${name} registered to handle event ${type}, but no callback defined` );
			return;
		}
		callback( type, source, message );
	}

	ignore( type ) {
		this.app.event.unregister( type, this );
	}

	listen( type ) {
		this._context.push( type ); // Add type to context
		return this;
	}

	respond( callback ) {
		let caller = this.widget?.app ? this.widget : this.app;
		this._context.forEach( type => {
			this.handler[ type ] = callback;
			this.app.event.register( type, caller );
		});
		this._context = []; // Clear context after assigning the callbacks
		return this;
	}

	trigger( type, message = null, source = null ) { 
		this.app.event.trigger( type, message, source ); 
	}

	get app()     { return this._app; }
	get handler() { return this._handler; }
	get widget()  { return this._widget; }

}

FreeScore.EventServer = class FSEventServer extends FreeScore.EventClient {
	constructor( widget ) {
		super( widget );
		this._listeners = {};
	}

	ignore( type ) {
		this.unregister( type, this );
	}

	register( type, listener ) {
		let listeners = this.listeners?.[ type ];

		if( ! defined( listeners ))       { listeners = this.listeners[ type ] = []; }
		if( ! Array.isArray( listeners )) { listeners = this.listeners[ type ] = []; }

		// Avoid redundant registrations
		let found = listeners.find( widget => widget.id == listener.id );
		if( found ) { return; }

		if( listener?.app ) {
			listeners.push( listener ); // widgets get lower priority
		} else {
			listeners.unshift( listener ); // app gets highest priority
		}
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

	trigger( type, message = null, source = null ) {
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
		if( source === null ) { source = this.app; }

		listeners.forEach( listener => {
			listener.event.handle( type, source, message );
		});
	}

	get listeners() { return this._listeners; }
}
