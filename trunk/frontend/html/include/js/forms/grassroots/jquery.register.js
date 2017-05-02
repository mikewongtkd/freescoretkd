$.widget( "freescore.register", {
	options: { autoShow: true, max_judges: 3 },
	_create: function() {
		var o            = this.options;
		var e            = this.options.elements = {};
		var w            = this.element;
		var html         = e.html     = FreeScore.html;
		var tournament   = o.tournament;
		var referer      = $.url().param( 'referer' );
		var role         = $.url().param( 'role' );
		var url          = o.url      = defined( referer ) ? referer : role;

		var h1           = html.h1.clone() .html( "Register" );
		var text         = html.p.clone();

		var register     = o.register = { 
			rings        : { data : [], view : html.div.clone() },
			roles        : { data : [], view : html.div.clone() },
			judges       : { data : [], view : html.div.clone() },
			confirmation : {            view : html.div.clone() },
		};

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
				ring.dom.animate( { left: x, top: y } );
			}
			register.rings.view .attr( "animate", "on-initialization" );
		};

		// ------------------------------------------------------------
		register.rings.select = function( num ) { return function() {
		// ------------------------------------------------------------
			for( var i = 0; i < tournament.rings.length; i++ ) {
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
		register.rings.add = function( num, x, y, gotoX, gotoY ) {
		// ------------------------------------------------------------

			var dom          = html.div.clone() .addClass( "mat" );
			var playingField = html.div.clone() .addClass( "playing-field" ) .html( num );
			var rings        = register.rings;
			dom.append( playingField );

			var selectX = (parseInt( rings.view.css( "width" ))/2) - 100;
			var selectY = (parseInt( rings.view.css( "height" ))/2) - 100;

			if( dom.attr( "animate" ) == "on-initialization" ) { dom.animate( { left: selectX, top: selectY } ) }
			dom.click( register.rings.select( num ));
			return { num: num, x: x, y: y, start: { x: gotoX, y: gotoY }, select : { x : selectX, y : selectY }, dom: dom };
		}

		// ------------------------------------------------------------
		register.roles.show = function() { 
		// ------------------------------------------------------------
			console.log( 'roles.show url:', o.url );
			if( defined( o.url ) && ( o.url.match( /judge|index|display/   ) != null)) {
				if( o.url.match( /judge/ )       != null ) { 
					// ===== GET NUMBER OF JUDGES AND SHOW THE JUDGES
					var port = ':3080/';
					var url = 'http://' + o.server + port + o.tournament.db + '/' + $.cookie( "ring" ) + '/judges';
					$.ajax( {
						type:    'GET',
						url:     url,
						data:    {},
						success: register.judges.show,
						error:   function( response ) { },
					});

				} else if( o.url.match( /index/ )       != null ) { 
					$.cookie( "role", "display", { path: '/' } ); 
					register.confirmation.show();

				} else if( o.url.match( /display/ ) != null ) { 
					$.cookie( "role", "display", { path: '/' } ); 
					register.confirmation.show();
				}
			} else {
				text.html( "What is your role in Ring " + $.cookie( "ring" ) + ":" ); 
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
							var port = ':3080/';
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
			var src   = "../../images/roles/" + name.toLowerCase().replace( /\s+/, '-' ) + ".png";
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
			var src   = "../../images/roles/judge.png";
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

			// ===== SHOW RING NUMBER
			var ring  = register.rings.add( parseInt( $.cookie( "ring" )), 0, 0, 0, 0, true );
			ring.dom.css( "left", "0px" );
			var role  = String( $.cookie( "role" ));

			// ===== SHOW JUDGE NUMBER OR OTHER ROLE
			if( role == "judge" ) {
				var num   = $.cookie( "judge" );
				role = register.judges.add( num );
				role.dom.css( 'left', '200px' );
				url = "./judge.php";
			} else {
				if      ( role == "display"           ) { url = "./index.php"; }
				role = register.roles.add( role.capitalize(), '200px' );
			}
			url = url.replace( /\/\/+/g, "/" );
			
			var ok   = html.div.clone() .addClass( "ok" )   .html( "OK" )   .click( function() { location = url; } );
			var back = html.div.clone() .addClass( "back" ) .html( "Back" ) .click( function() { location.reload(); } );

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
					if      ( width > height ) { if( i == half ) { ypos += 100; } else if( i > half ) { xpos -= 200; }}
					else if ( height > width ) { if( i == k-1  ) { xpos -= 100; }}
				}
				var ring = register.rings.add( num, x, y, xpos, ypos );
				register.rings.data.push( ring );
				register.rings.view.append( ring.dom );
				i++;
			}
		}
		register.rings.show();
	
		// ===== STEP 2. SHOW THE ROLES
		register.roles.data.push( register.roles.add( 'Judge',   '0px'   ));
		register.roles.data.push( register.roles.add( 'Display', '200px' ));
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
