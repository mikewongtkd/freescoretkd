$.widget( "freescore.register", {
	options: { autoShow: true },
	_create: function() {
		var o            = this.options;
		var e            = this.options.elements = {};
		var w            = this.element;
		var html         = e.html     = FreeScore.html;
		var tournament   = o.tournament;
		var referer      = o.referer  = $.url().param( 'referer' );
		var role         = o.role     = $.url().param( 'role' );

		var h1           = html.h1.clone() .html( "Register" );
		var text         = html.p.clone();

		var register     = o.register = { 
			network      : {},
			rings        : { data : [], view : html.div.clone() },
			roles        : { data : [], view : html.div.clone() },
			judges       : { data : [], view : html.div.clone() },
			confirmation : {            view : html.div.clone() },
		};

		var sound = e.sound = {};
		sound.send  = new Howl({ urls: [ "../../sounds/upload.mp3", "../../sounds/upload.ogg"   ]});
		sound.next  = new Howl({ urls: [ "../../sounds/next.mp3",   "../../sounds/next.ogg"   ]});
		sound.prev  = new Howl({ urls: [ "../../sounds/prev.mp3",   "../../sounds/prev.ogg"   ]});

		register.rings        .view .addClass( "floorplan" )    .hide();
		register.roles        .view .addClass( "roles" )        .hide();
		register.judges       .view .addClass( "court" )        .hide();
		register.confirmation .view .addClass( "confirmation" ) .hide();

		// ===== REMOVE LOCAL AND SITE COOKIES
		[ 'ring', 'role', 'judge' ].forEach((cookie) => { Cookies.remove( cookie ); });

		// ============================================================
		// UI FUNCTIONS AND CALLBACKS (WIDGET LOGIC DEFINED AFTERWARDS)
		// ============================================================
		
		// ------------------------------------------------------------
		register.network.error = function() {
		// ------------------------------------------------------------
			alertify.error( "Cannot contact the worldclass server. Reconnecting..." );
			setTimeout( function() { location.reload( true ); }, 5000 );
		};

		// ------------------------------------------------------------
		register.network.init = function() {
		// ------------------------------------------------------------
			var ws = e.ws;
			ws.onmessage = register.network.receive;
			ws.onclose   = register.network.error;

			var id = Cookies.get( 'id' );
			if( id ) {
				var request = { data: { type: 'division', action: 'judge departure' }};
				request.json = JSON.stringify( request.data );
				ws.send( request.json );
			}

			var request = { data: { type: 'division', action: 'judge query' }};
			request.json = JSON.stringify( request.data );
			ws.send( request.json );
		};

		// ------------------------------------------------------------
		register.network.receive = function( response ) {
		// ------------------------------------------------------------
			var update = JSON.parse( response.data );

			if( update.type == 'division' ) {
				if( update.action == 'judges' ) { 
					var judges = o.judges = update.judges; 
					if( register.judges.view.is( ':hidden' )) { return; }

					// Enable the button for non-registered judges; disable the button otherwise
					judges.forEach(( judge, i ) => { register.judges.data[i].id = judge.id; });
					register.judges.data.forEach((judge, i) => {
						if( judge.id ) { judge.disable(); } else { judge.enable(); }
					});
				} else if( update.action == 'judge goodbye' ) {
					Cookies.remove( 'id' );
				}
			}
		};

		// ------------------------------------------------------------
		register.rings.add = function( num, x, y, gotoX, gotoY ) {
		// ------------------------------------------------------------

			var dom          = html.div.clone() .addClass( "mat" );
			var playingField = html.div.clone() .addClass( "playing-field" ) .html( num );
			var view         = register.rings.view;
			dom.append( playingField );

			var selectX = (parseInt( view.css( "width" ))/2)  - 100;
			var selectY = (parseInt( view.css( "height" ))/2) - 100;

			if( dom.attr( "animate" ) == "on-initialization" ) { dom.animate( { left: selectX, top: selectY } ) }
			dom.click( register.rings.select( num ));
			return { num: num, x: x, y: y, start: { x: gotoX, y: gotoY }, select : { x : selectX, y : selectY }, dom: dom };
		};

		// ------------------------------------------------------------
		register.rings.select = function( selected ) { return function() {
		// ------------------------------------------------------------
			register.rings.data.forEach(( ring ) => {
				if( ring.num != selected ) { ring.dom.fadeOut( 500 ); return; }

				e.sound.next.play();
				ring.dom.animate( { left: ring.select.x, top: ring.select.y } );
				Cookies.set( 'ring', selected );
				register.rings.view .delay( 750 ) .fadeOut( 500 ) .queue( register.roles.show );
				e.ws = new WebSocket( 'ws://' + o.server + ':3088/worldclass/' + o.tournament.db + '/' + selected ); 
				e.ws.onopen  = register.network.init;
				e.ws.onerror = register.network.error;
			});
		}};

		// ------------------------------------------------------------
		register.rings.show = function() {
		// ------------------------------------------------------------
			text.html( "Choose your ring number:" );
			register.rings.view .fadeIn();
			console.log( register );
			for( var j = 0; j < register.rings.data.length; j++ ) {
				var ring    = register.rings.data[ j ];
				var x       = ring.start.x;
				var y       = ring.start.y;
				ring.dom.animate( { left: x, top: y } );
			}
			register.rings.view .attr( "animate", "on-initialization" );
		};

		// ------------------------------------------------------------
		register.roles.add = function( name, left ) {
		// ------------------------------------------------------------
			var dom   = html.div.clone() .addClass( "role" ) .attr( "role", name ) .css( "top", 0 ) .css( "left", left );
			var src   = "../../images/roles/" + name.toLowerCase().replace( /\s+/, '-' ) + ".png";
			var img   = html.img.clone() .attr( "src", src ) .attr( "height", 100 );
			var label = html.p.clone() .append( name );
			dom.append( img, label );
			dom.click( register.roles.select( name ));
			return { name: name, x: left, dom: dom };
		};

		// ------------------------------------------------------------
		register.roles.show = function() { 
		// ------------------------------------------------------------
			if( 
				defined( referer ) && (referer.match( /(judge|index|operator)/ ) != null) ||
				defined( o.role )
			) {
				var role = defined( referer ) ? referer : o.role;
				if( role.match( /judge/ ))    { register.judges.show(); } else
				if( role.match( /index/ ))    { Cookies.set( 'role', 'display' );           register.confirmation.show(); } else
				if( role.match( /operator/ )) { Cookies.set( 'role', 'computer operator' ); register.confirmation.show(); }
			} else {
				text.html( "What is your role in Ring " + Cookies.get( 'ring' ) + ":" ); 
				register.roles.view .fadeIn( 500 ); 
			}
		}; 

		// ------------------------------------------------------------
		register.roles.select = function( roleName ) { return function() {
		// ------------------------------------------------------------
			register.roles.data.forEach(( role, i ) => {
				if( role.name == roleName ) {
					role.dom.children( "p" ).remove(); // Remove labels
					role.dom.children( "img" ).animate( { height: 200 } );

					if( role.name == "Judge" ) {
						e.sound.next.play();
						role.dom.animate( { left: 200 }, 400, 'swing', register.judges.show );
					} else {
						e.sound.next.play();
						Cookies.set( 'role', roleName.toLowerCase());
						
						// Make the selected role large and center, then fade to the confirmation view
						role.dom .animate( { left: 200 }, 400, 'swing' ) .delay( 100 ) .fadeOut( 200 )
						register.roles.view .delay( 450 ) .fadeOut( 200 ) .queue( register.confirmation.show );
					}
				} else {
					role.dom.fadeOut();
				}
			});
		}};

		// ------------------------------------------------------------
		register.judges.add  = function( num ) {
		// ------------------------------------------------------------
			var dom     = html.div.clone() .addClass( "judge" ) .attr( "num", num ) .css( "top", 0 );
			var src     = "../../images/roles/judge.png";
			var img     = html.img.clone() .attr( "src", src ) .attr( "height", 100 );
			var name    = num == 0 ? 'Referee' : 'Judge ' + num;
			var label   = html.p.clone() .append( name );
			var disable = function() { this.dom.fadeTo( 500, 0.25 );   this.dom.off( 'click' ).click( register.judges.override( this.num )); };
			var enable  = function() { this.dom.css({ opacity: 1.0 }); this.dom.off( 'click' ).click( register.judges.select( this.num )) };
			var id      = defined( o.judges ) && defined( o.judges[ num ] ) && defined( o.judges[ num ].id ) ? o.judges[ num ].id : undefined;
			dom.append( img, label );
			var judge   = { id: id, num: num, name : name, dom: dom, enable: enable, disable: disable };
			judge.enable();
			return judge;
		};

		// ------------------------------------------------------------
		register.judges.override = function( num ) { return function() {
		// ------------------------------------------------------------
			var judge   = register.judges.data[ num ];
			var title   = judge.name + ' already registered';
			var message = judge.name + ' is already registered on another device. Override?';
			var ok      = register.judges.select( num );
			var cancel  = function() {};
			alertify.confirm( title, message, ok, cancel );
		}},

		// ------------------------------------------------------------
		register.judges.select = function( num ) { return function() {
		// ------------------------------------------------------------
			register.judges.data.forEach(( judge, i ) => {
				if( judge.num != num ) { judge.disable(); return; }

				e.sound.next.play();

				// Generate random ID
				var random = String( Math.round( Math.random() * Math.pow( 10, 16 )));
				var cache  = defined( Cookies.get( 'id' )) ? Cookies.get( 'id' ) : undefined;
				var id     = cache ? cache : sha3_224( random );
				console.log( cache, id, num );

				Cookies.set( 'id', id );
				Cookies.set( 'role', 'judge' );
				Cookies.set( 'judge-request', num );

				// Fade out to confirmation view
				judge.dom.children( "p" ).remove(); // Remove labels
				judge.dom.off( 'click' );
				judge.dom.children( "img" ).animate( { height: 200 }, 400, 'swing' );
				register.judges.view .delay( 800 ) .fadeOut( 400 ) .queue( register.confirmation.show );
			});
		}};

		// ------------------------------------------------------------
		register.judges.show = function() {
		// ------------------------------------------------------------
			register.roles.view .hide();
			var judges = o.judges;

			if( ! defined( judges )) { text.html( "Database Error: Judges not defined." ); return; }
			if( judges.length == 0 ) {
				text.html( "No Divisions Found" );
				alertify.error( "Please instruct computer operator to create a division." );
				setTimeout( function() { location.reload(); }, 5000 );
				return;
			}
			text.html( "Which judge?" );
			register.judges.data = [];
			judges.forEach(( j, i ) => {
				var judge = register.judges.add( i ); 
				judge.id = j.id;
				register.judges.data.push( judge ); 
				register.judges.view.append( judge.dom ); 
				if( judge.id ) { judge.disable(); }
			});

			register.judges.view.fadeIn( 500, function() {
				var scale = 200;
				if( register.judges.data.length == 5 ) { scale = 160; }
				if( register.judges.data.length == 7 ) { scale = 120; }
				register.judges.data.forEach(( judge, i ) => { judge.dom.animate( { left: i * scale } ); });
			});
		};

		// ------------------------------------------------------------
		register.confirmation.show = function() {
		// ------------------------------------------------------------
			var selected = { ring: parseInt( Cookies.get( 'ring' )), role: String( Cookies.get( 'role' )), judge: parseInt( Cookies.get( 'judge-request' )) };
			Cookies.remove( 'judge-request' );

			var id = Cookies.get( 'id' );
			var label = selected.judge == 0 ? "Referee" : "Judge " + selected.judge;
			if( selected.role == "judge" ) { text.html( "Confirm Registration for " + label + " in Ring " + selected.ring + ":" ); }
			else                           { text.html( "Confirm Registration for " + selected.role.capitalize() + " in Ring " + selected.ring + ":" ); }

			register.confirmation.view.fadeIn();
			register.rings.view .attr( "animate", "none" );

			// ===== SHOW RING NUMBER
			var ring  = register.rings.add( selected.ring, 0, 0, 0, 0, true );
			ring.dom.css( "left", "0px" );

			// ===== SHOW JUDGE NUMBER OR OTHER ROLE
			var role    = undefined;
			var referer = o.referer;
			if( selected.role.match( /judge/ )) {
				var num   = selected.judge;
				role      = register.judges.add( num );
				role.dom.css( 'left', '200px' );
				referer = "./judge.php";
			} else {
				if ( selected.role.match( /display/  )) { referer = "./index.php?ring=" + selected.ring; } else 
				if ( selected.role.match( /operator/ )) { referer = "./coordinator.php?ring=" + selected.ring; }
				role = register.roles.add( selected.role.capitalize(), '200px' );
			}
			referer = referer.replace( /\/\/+/g, "/" );
			
			var ok   = html.div.clone() .addClass( "ok" )   .html( "OK" )   .click( function() { 
				Cookies.set( 'role', selected.role );
				if( selected.role == 'judge' ) { Cookies.set( 'judge', selected.judge ); }

				// Send registration request to broadcast to peers
				var request = { data: { type: 'division', action: 'judge registration', num: num, id: id }};
				request.json = JSON.stringify( request.data );
				e.ws.send( request.json );
				e.sound.send.play(); 
				setTimeout( function() { location = referer; }, 500 ); 
			});
			var back = html.div.clone() .addClass( "back" ) .html( "Back" ) .click( function() { e.sound.prev.play(); setTimeout( function() { location.reload(); }, 250 );} );

			// ===== DISABLE ON-CLICK HANDLERS
			ring.dom.off();
			role.dom.off();

			register.confirmation.view.empty();
			register.confirmation.view.append( ring.dom, role.dom, ok, back );
		}

		// ============================================================
		// WIDGET LOGIC
		// ============================================================

		// ===== STEP 1. SHOW THE RINGS
		var k      = tournament.rings.length;
		var height = k >= 16 ? 4 : k >= 11 ? 3 : k >= 4 ? 2 : 1;
		var width  = Math.ceil( k / height );
		var half   = Math.floor( k/2 );
		var odd    = k % 2 && (height > 1 && width > 1);
		var i      = 0;
		register.rings.view .css( "width", width * 200 ) .css( "height", height * 200 ) 
		for( var y = 0; y < height; y++ ) {
			for( var x = 0; x < width; x++ ) {
				var num = tournament.rings[ i ];;
				var xpos = x * 200;
				var ypos = y * 200;

				if( odd ) {
					if      ( width > height ) { if( i == half  ) { ypos += 100; } else if( i > half ) { xpos -= 200; }}
					else if ( height > width ) { if( i == k - 1 ) { xpos -= 100; }}
				}
				var ring = register.rings.add( num, x, y, xpos, ypos );
				register.rings.data.push( ring );
				register.rings.view.append( ring.dom );
				i++;
			}
		}
		register.rings.show();
	
		// ===== STEP 2. SHOW THE ROLES
		register.roles.data.push( register.roles.add( 'Judge',             '0px'   ));
		register.roles.data.push( register.roles.add( 'Computer Operator', '200px' ));
		register.roles.view.append( register.roles.data.map( function( role ) { return role.dom; } ));

		w.append( h1, text, register.rings.view, register.roles.view, register.judges.view, register.confirmation.view );
		w.addClass( "register" );
	},
	_init: function( ) {
		var o = this.options;
		var e = this.options.elements;
		var w = this.element;

	}
});
