FreeScore.App = class FSApp {
	constructor() {
		this._button  = {};
		this._display = {};
		this._input   = {};
		this._network = new FreeScore.WebSocket();
		this._refresh = {};
		this._sound   = new FreeScore.Sound();
		this._state   = {};
		this._widget  = {};
		this.on       = {
			connect : url => {
				this._network.set( url );
				return this;
			}
		};

		this._event = {
			trigger : ( type, source, message ) => {
				if( ! type in this.event.listeners ) {
					let name = source.constructor.name;
					console.log( `No listeners for event ${type} from ${name}`, message );
					return;
				}

				let listeners = this.event.listeners[ type ];

				if( ! defined( listeners ) || ! Array.isArray( listeners )) {
					let name = source.constructor.name;
					console.log( `Listeners not defined as array for event ${type} from ${name}`, message );
					return;
				}

				listeners.forEach( listener => {
					listener.event.handle( type, source, message );
				});
			},
			listeners : {},
			register : ( type, listener ) => {
				if( ! type in this.event.listeners ) {
					this.event.listeners[ type ] = [];
				}

				let listeners = this.event.listeners[ type ];

				if( ! defined( listeners ) || ! Array.isArray( listeners )) {
					let name = listener.constructor.name;
					console.log( `Registering ${name} as a listener: Failed, listener not defined as array for event ${type}` );
					return;
				}

				let found = listeners.find( widget => widget.id == listener.id );
				if( found ) { return; }

				listeners.push( listener );

			},
			remove : ( type, listener ) => {
				if( ! type in this.event.listeners ) { return; }

				let listeners = this.event.listeners[ type ];

				if( ! defined( listeners ) || ! Array.isArray( listeners )) {
					let name = listener.constructor.name;
					console.log( `Removing ${name} as a listener: Failed, listener not defined as array for event ${type}` );
					return;
				}

				let found = listeners.findIndex( widget => widget.id == listener.id );
				if( found < 0 ) { return; }

				this.event.listeners[ type ].splice( found, 1 );
			}
		};

		this.ping = {
			off: () => { this.network.rm?.response( 'server' ).handle( 'ping' ).by( () => { this.network.send({ type : 'server', action : 'stop ping' }); }); }
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
	get event()   { return this._event; }
	get input()   { return this._input; }
	get network() { return this._network; }
	get refresh() { return this._refresh; }
	get sound()   { return this._sound; }
	get state()   { return this._state; }
	get widget()  { return this._widget; }


	// App caches for general UI/UX usage
	set button( value )  { this._button  = value; } // For button behavior
	set display( value ) { this._display = value; } // To reference general display components
	set input( value )   { this._input   = value; } // For input behavior
	set refresh( value ) { this._refresh = value; } // Callbacks for app component behavior
	set state( value )   { this._state   = value; } // For app state (e.g. DFA graphs and transitions)
	set widget( value )  { this._widget  = value; } // Widgets

	request( request ) {
		this._network.connect( request );
	}
}
