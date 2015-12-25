$.widget( "freescore.register", {
	options: { autoShow: true, max_judges: 3 },
	_create: function() {
		var o            = this.options;
		var e            = this.options.elements = {};
		var w            = this.element;
		var html         = e.html     = FreeScore.html;
		var tournament   = o.tournament;
		var url          = o.url      = $.url().param( 'referer' );

		var h1           = html.h1.clone() .html( "Register" );
		var text         = html.p.clone() .html( "Choose your Poomsae event: " );

		var register     = o.register = { 
			events       : { data : [], view : html.div.clone() },
			rings        : { data : [], view : html.div.clone() },
			roles        : { data : [], view : html.div.clone() },
			judges       : { data : [], view : html.div.clone() },
			confirmation : {            view : html.div.clone() },
		};

		register.events       .view .addClass( "competition" );
		register.rings        .view .addClass( "floorplan" )    .hide();
		register.roles        .view .addClass( "roles" )        .hide();
		register.judges       .view .addClass( "court" )        .hide();
		register.confirmation .view .addClass( "confirmation" ) .hide();


		// ===== REMOVE LOCAL AND SITE COOKIES
		$.removeCookie( 'ring'  ); $.removeCookie( 'ring',  { path: '/' });
		$.removeCookie( 'role'  ); $.removeCookie( 'role',  { path: '/' });
		$.removeCookie( 'judge' ); $.removeCookie( 'judge', { path: '/' });

		// ============================================================
		// UI FUNCTIONS AND CALLBACKS (WIDGET LOGIC DEFINED AFTERWARDS)
		// ============================================================

		// ------------------------------------------------------------
		register.rings.show = function() {
		// ------------------------------------------------------------
			text.html( "Choose your ring number:" );
			register.rings.view .fadeIn();
			for( var j = 0; j < register.rings.data.length; j++ ) {
				var ring    = register.rings.data[ j ];
				var x       = ring.start.x;
				var y       = ring.start.y;
				var opacity = ring.enabled ? 1.0 : 0.35;
				if( ! enabled ) { ring.dom.off() };
				ring.dom.animate( { left: x, top: y, opacity: opacity } );
			}
			register.rings.view .attr( "animate", "on-initialization" );
		};

		// ------------------------------------------------------------
		register.rings.select = function( num ) { return function() {
		// ------------------------------------------------------------
			for( var i = 0; i < tournament.rings.count; i++ ) {
				var ring = register.rings.data[ i ];
				var j    = ring.num;
				if( j == num ) { 
					ring.dom.animate( { left: ring.select.x, top: ring.select.y } );
					$.cookie( "ring", num, { path: '/' } );
					register.rings.view .delay( 750 ) .fadeOut( 500, register.roles.show );

				} else { 
					ring.dom.fadeOut( 500 ); 
				}
			}
		}};

		// ------------------------------------------------------------
		register.rings.add = function( num, x, y, gotoX, gotoY, enabled ) {
		// ------------------------------------------------------------

			var dom          = html.div.clone() .addClass( "mat" );
			var playingField = html.div.clone() .addClass( "playing-field" ) .html( num );
			var rings        = register.rings;
			dom.css( "opacity", 0.5 );
			dom.append( playingField );

			var selectX = (parseInt( rings.view.css( "width" ))/2) - 100;
			var selectY = (parseInt( rings.view.css( "height" ))/2) - 100;
			var opacity = enabled ? 1.0 : 0.35;

			if( dom.attr( "animate" ) == "on-initialization" ) { dom.animate( { left: selectX, top: selectY, opacity: opacity } ) }

			if( enabled ) { dom.click( register.rings.select( num ) ) };
			return { num: num, x: x, y: y, start: { x: gotoX, y: gotoY }, select : { x : selectX, y : selectY }, dom: dom, enabled: enabled };
		}

		var availableEvents = {
			grassroots: { name: "Grassroots",  image: "grassroots-01", url: "../forms/grassroots/" },
			worldclass: { name: "World Class", image: "poomsae-02",    url: "../forms/worldclass/" }
		};

		// ------------------------------------------------------------
		register.events.select = function( name ) { return function() {
		// ------------------------------------------------------------
			for( var i = 0; i < register.events.data.length; i++ ) {
				var selected = register.events.data[ i ];

				if( selected.name == name ) {
					selected.dom.children( ".greys" ).fadeOut( 500 );
					selected.dom.animate( { left: 100 } );
					o.event = { name : selected.name, image : selected.image, url : selected.url };
					register.events.view .delay( 800 ) .fadeOut( 500, register.rings.show );

				} else {
					selected.dom.fadeOut( 500 );
				}
			}
		}};

		// ------------------------------------------------------------
		register.events.add   = function( ev, x ) {
		// ------------------------------------------------------------
			var name  = ev.name;
			var image = ev.image;
			var url   = ev.url;
			var	dom   = html.div.clone() .addClass( "event" );
			var color = html.div.clone() .addClass( "color" );
			var greys = html.div.clone() .addClass( "greys" );
			color.css( "background-image", "url( '../images/bg/" + image + ".color.jpg' )" );
			greys.css( "background-image", "url( '../images/bg/" + image + ".greys.jpg' )" );
			dom.animate( { left : (x * 200) } );
			dom.attr( "name",  name );
			dom.attr( "image", image );
			dom.attr( "url",   url );
			var label = html.div.clone() .addClass( "label" ) .html( name );
			dom.append( color, greys, label );

			dom.click( register.events.select( name ));
			return { name: name, image: image, url: url, dom: dom };
		};

		// ------------------------------------------------------------
		register.roles.show = function() { 
		// ------------------------------------------------------------
			if(
				defined( url ) && (
					(url.match( /judge/ )       != null) ||
					(url.match( /index/ )       != null) ||
					(url.match( /coordinator/ ) != null)
				)
			) {
				if( url.match( /judge/ )       != null ) { 
					// ===== GET NUMBER OF JUDGES AND SHOW THE JUDGES
					var port = ':3088';
					if     ( o.event.url.match( /grassroots/ )) { port = ':3080/'; }
					else if( o.event.url.match( /worldclass/ )) { port = ':3088/'; }
					var url = 'http://' + o.server + port + o.tournament.db + '/' + $.cookie( "ring" ) + '/judges';
					$.ajax( {
						type:    'GET',
						url:     url,
						data:    {},
						success: register.judges.show,
						error:   function( response ) { },
					});

				} else if( url.match( /index/ )       != null ) { 
					$.cookie( "role", "display", { path: '/' } ); 
					register.confirmation.show();

				} else if( url.match( /coordinator/ ) != null ) { 
					$.cookie( "role", "coordinator", { path: '/' } ); 
					register.confirmation.show();
				}
			} else {
				text.html( "What is your role in ring " + $.cookie( "ring" ) + ":" ); 
				register.roles.view .fadeIn( 500 ); 
			}
		}; 

		// ------------------------------------------------------------
		register.roles.select = function( roleName ) { return function() {
		// ------------------------------------------------------------
			for( var i = 0; i < register.roles.data.length; i++ ) {
				var role = register.roles.data[ i ];
				if( role.name == roleName ) {
					role.dom.children( "p" ).remove();
					role.dom.children( "img" ).animate( { height: 200 } );

					if( role.name == "Judge" ) {
						role.dom.animate( { left: 200 }, 400, 'swing', function() {
							var port = ':3088';
							if     ( o.event.url.match( /grassroots/ )) { port = ':3080/'; }
							else if( o.event.url.match( /worldclass/ )) { port = ':3088/'; }
							var url = 'http://' + o.server + port + o.tournament.db + '/' + $.cookie( "ring" ) + '/judges';
							$.ajax( {
								type:    'GET',
								url:     url,
								data:    {},
								success: register.judges.show,
								error:   function( response ) { },
							});
						});
					} else {
						$.cookie( "role", roleName.toLowerCase(), { path: '/' } );
						role.dom.animate( { left: 200 }, 400, 'swing', function() {
							role.dom .delay( 300 ) .fadeOut( 400, function () {
								register.roles.view .fadeOut( 400, register.confirmation.show );
							});
						});
					}
				} else {
					role.dom.fadeOut();
				}
			}
		}};

		// ------------------------------------------------------------
		register.roles.add = function( name, left ) {
		// ------------------------------------------------------------
			var dom   = html.div.clone() .addClass( "role" ) .attr( "role", name ) .css( "top", 0 ) .css( "left", left );
			var src   = "../images/roles/" + name.toLowerCase() + ".png";
			var img   = html.img.clone() .attr( "src", src ) .attr( "height", 100 );
			var label = html.p.clone() .append( name );
			dom.append( img, label );
			dom.click( register.roles.select( name ));
			return { name: name, x: left, dom: dom };
		}

		// ------------------------------------------------------------
		register.judges.show = function( ajaxResponse ) {
		// ------------------------------------------------------------
			register.roles.view .hide();
			console.log( ajaxResponse ); // MW
			o.max_judges = ajaxResponse.judges || 3;

			text.html( "Which judge?" );
			for( var k = 0; k < o.max_judges; k++ ) { 
				var judge = register.judges.add( k+1 ); 
				register.judges.data.push( judge ); 
				register.judges.view.append( judge.dom ); 
			}

			register.judges.view.fadeIn( 500, function() {
				var scale = 200;
				if( register.judges.data.length == 5 ) { scale = 160; }
				if( register.judges.data.length == 7 ) { scale = 120; }
				for( var i = 0; i < register.judges.data.length; i++ ) {
					var judge = register.judges.data[ i ];
					judge.dom.animate( { left: i * scale } );
				}
			});
		};

		// ------------------------------------------------------------
		register.judges.select = function( num ) { return function() {
		// ------------------------------------------------------------
			for( var i = 0; i < register.judges.data.length; i++ ) {
				var judge = register.judges.data[ i ];
				if( judge.num == num ) {
					$.cookie( "role", "judge", { path: '/' } );
					$.cookie( "judge", num, { path: '/' } );

					judge.dom.children( "p" ).remove();
					judge.dom.children( "img" ).animate( { height: 200 }, 400, 'swing' );
					register.judges.view .delay( 800 ) .fadeOut( 400, register.confirmation.show );
				} else {
					judge.dom.fadeTo( 500, 0.25 );
				}
			}
		}};

		// ------------------------------------------------------------
		register.judges.add  = function( num ) {
		// ------------------------------------------------------------
			var dom   = html.div.clone() .addClass( "judge" ) .attr( "num", num ) .css( "top", 0 );
			var src   = "../images/roles/judge.png";
			var img   = html.img.clone() .attr( "src", src ) .attr( "height", 100 );
			var label = html.p.clone() .append( num == 1 ? "Referee" : "Judge " + (num - 1) );
			dom.append( img, label );
			dom.click( register.judges.select( num ));
			return { num: num, dom: dom };
		}

		// ------------------------------------------------------------
		register.confirmation.show = function() {
		// ------------------------------------------------------------
			var selected = { ring: $.cookie( "ring" ), role: $.cookie( "role" ), judge: $.cookie( "judge" ) };

			var label = selected.judge == 1 ? "Referee" : "Judge " + (selected.judge - 1);
			if( selected.role == "judge" ) { text.html( "Confirm Registration for " + label + " in Ring " + selected.ring + ":" ); }
			else                           { text.html( "Confirm Registration for " + selected.role.capitalize() + " in Ring " + selected.ring + ":" ); }

			register.confirmation.view.fadeIn();
			register.rings.view .attr( "animate", "none" );

			// ===== SHOW EVENT
			var ev = register.events.add( o.event, 0 );
			ev.dom.children( ".greys" ).hide();

			// ===== SHOW RING NUMBER
			var ring  = register.rings.add( parseInt( $.cookie( "ring" )), 0, 0, 0, 0, true );
			ring.dom.css( "left", "200px" ) .css( "opacity", "1.0" );
			var role  = String( $.cookie( "role" ));

			// ===== SHOW JUDGE NUMBER OR OTHER ROLE
			if( role == "judge" ) {
				var num   = $.cookie( "judge" );
				role = register.judges.add( num );
				role.dom.css( 'left', '400px' );
				if( defined( o.event ) ) { url = o.event.url + "/judge.php"; }
			} else {
				if      ( role == "display"     ) { if( ! defined( url )) { url = o.event.url + "/index.php"; } }
				else if ( role == "coordinator" ) { if( ! defined( url )) { url = o.event.url + "/coordinator.php"; } }
				role = register.roles.add( role.capitalize(), '400px' );
			}
			url = url.replace( /\/\/+/g, "/" );
			
			var ok   = html.div.clone() .addClass( "ok" )   .html( "OK" )   .click( function() { location = url; } );
			var back = html.div.clone() .addClass( "back" ) .html( "Back" ) .click( function() { location.reload(); } );

			// ===== DISABLE ON-CLICK HANDLERS
			ev.dom.off();
			ring.dom.off();
			role.dom.off();

			register.confirmation.view.empty();
			register.confirmation.view.append( ev.dom, ring.dom, role.dom, ok, back );
		}

		// ============================================================
		// WIDGET LOGIC
		// ============================================================

		// ===== STEP 1. SHOW THE EVENTS (OR SKIP IF URL DEFINED)
		if( defined( url ) ) {
			o.event = {};
			if( url.match( /grassroots/ ) != null ) { o.event = availableEvents.grassroots; }
			if( url.match( /worldclass/ ) != null ) { o.event = availableEvents.worldclass; }
			register.events.view.hide();

		} else {
			register.events.data.push( 
				register.events.add( availableEvents.grassroots, 0 ),
				register.events.add( availableEvents.worldclass, 1 )
			);
			register.events.view.append( register.events.data.map( function( ev ) { return ev.dom; } ));
		}

		// ===== STEP 2. SHOW THE RINGS
		var width  = tournament.rings.width;
		var height = tournament.rings.height;
		var format = tournament.rings.formation; // formation = [loop|rows]
		var enable = tournament.rings.enable;
		var k      = tournament.rings.count;
		var half   = Math.floor( k/2 );
		var odd    = k % 2 && (height > 1 && width > 1);
		register.rings.view .css( "width", width * 200 ) .css( "height", height * 200 ) 
		for( var y = 0; y < height; y++ ) {
			for( var x = 0; x < width; x++ ) {
				var n = register.rings.data.length;
				var enabled = ! defined( enable ) || enable.indexOf( n + 1 ) >= 0;
				if( n >= k ) { continue; }
				var xpos = x * 200;
				var ypos = y * 200;
				var loop = ((n % (2 * width)) >= width) && format == "loop";
				if( loop ) { xpos = (width - ((n % width)+1)) * 200; }

				if( odd ) {
					if      ( width > height ) { if( n == half ) { ypos += 100; } else if( n > half ) { xpos -= 200; }}
					else if ( height > width ) { if( n == k-1  ) { xpos -= 100; }}
				}
				var ring = register.rings.add( (n + 1), x, y, xpos, ypos, enabled );
				register.rings.data.push( ring );
				register.rings.view.append( ring.dom );
			}
		}
		if( defined( url ) ) {
			register.rings.show();
		}
	
		// ===== STEP 3. SHOW THE ROLES
		register.roles.data.push( register.roles.add( 'Coordinator', '0px'   ));
		register.roles.data.push( register.roles.add( 'Judge',       '200px' ));
		register.roles.data.push( register.roles.add( 'Display',     '400px' ));
		register.roles.view.append( register.roles.data.map( function( role ) { return role.dom; } ));

		w.append( h1, text, register.events.view, register.rings.view, register.roles.view, register.judges.view, register.confirmation.view );
		w.addClass( "register" );
	},
	_init: function( ) {
		var o = this.options;
		var e = this.options.elements;
		var w = this.element;
	}
});
