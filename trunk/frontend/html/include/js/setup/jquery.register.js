String.prototype.capitalize = function() {
	return this.charAt( 0 ).toUpperCase() + this.slice( 1 );
};

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

		var width        = tournament.rings.width;
		var height       = tournament.rings.height;

		var register     = o.register = { 
			events       : { data : [], view : html.div.clone() },
			rings        : { data : [], view : html.div.clone() },
			roles        : { data : [], view : html.div.clone() },
			judges       : { data : [], view : html.div.clone() },
			confirmation : {            view : html.div.clone() },
		};

		register.events       .view .addClass( "competition" );
		register.rings        .view .addClass( "floorplan" )    .css( "width", width * 200 ) .css( "height", height * 200 ) .hide();
		register.roles        .view .addClass( "roles" )        .hide();
		register.judges       .view .addClass( "court" )        .hide();
		register.confirmation .view .addClass( "confirmation" ) .hide();


		// ===== REMOVE LOCAL AND SITE COOKIES
		$.removeCookie( 'ring'  ); $.removeCookie( 'ring',  { path: '/' });
		$.removeCookie( 'role'  ); $.removeCookie( 'role',  { path: '/' });
		$.removeCookie( 'judge' ); $.removeCookie( 'judge', { path: '/' });

		// ====================
		// SELECTION FUNCTIONS
		// ====================

		// ----------------------------------------
		var selectRing = function() {
		// ----------------------------------------
			text.html( "Choose your ring number:" );
			o.register.rings.view .fadeIn();
			for( var j = 0; j < o.register.rings.data.length; j++ ) {
				var mat = o.register.rings.data[ j ];
				var x   = mat.attr( "goto-x" );
				var y   = mat.attr( "goto-y" );
				mat.animate( { left: x, top: y, opacity: 1.0 } );
			}
			o.register.rings.view .attr( "animate", "on-initialization" );
		};

		// ----------------------------------------
		var selectJudge = function( options ) {
		// ----------------------------------------
			o.max_judges = options.judges || 3;

			text.html( "Which judge?" );
			for( var k = 0; k < o.max_judges; k++ ) { 
				var judge = addJudge( k+1 ); 
				o.register.judges.data.push( judge ); 
				o.register.judges.view.append( judge ); 
			}

			o.register.judges.view.fadeIn( 500, function() {
				var scale = 200;
				if( o.register.judges.data.length == 5 ) { scale = 160; }
				if( o.register.judges.data.length == 7 ) { scale = 120; }
				console.log( o.register.judges.data );
				for( var i = 0; i < o.register.judges.data.length; i++ ) {
					var judge = o.register.judges.data[ i ];
					judge.animate( { left: i * scale } );
				}
			});
		};

		// ====================
		// REGISTER EVENT
		// ====================
		var addEvent   = function( name, image, url, x ) {
			var	event = html.div.clone() .addClass( "event" );
			var color = html.div.clone() .addClass( "color" );
			var greys = html.div.clone() .addClass( "greys" );
			color.css( "background-image", "url( '../images/bg/" + image + ".color.jpg' )" );
			greys.css( "background-image", "url( '../images/bg/" + image + ".greys.jpg' )" );
			event.animate( { left : (x * 200) } );
			event.attr( "name",  name );
			event.attr( "image", image );
			event.attr( "url",   url );
			var label = html.div.clone() .addClass( "label" ) .html( name );
			event.append( color, greys, label );
			o.register.events.data.push( event );
			var callback = function( name ) { return function() {
				for( var i = 0; i < o.register.events.data.length; i++ ) {
					var event = o.register.events.data[ i ];

					if( event.attr( "name" ) == name ) {
						event.children( ".greys" ).fadeOut();
						event.animate( { left: 100 } );
						o.event = { name : event.attr( "name" ), image : event.attr( "image" ), url : event.attr( "url" ) };

					} else {
						event.fadeOut( 500, function() {
							o.register.events.view .delay( 500 ) .fadeOut( 500, selectRing );
						});
					}
				}
			}};
			event.click( callback( name ));
			return event;
		};

		if( defined( url ) ) {
			o.event = {};
			if( url.match( /grassroots/ ) != null ) { o.event.name = "Grassroots",  o.event.image = "grassroots-01", o.event.url = "../forms/grassroots/" }
			if( url.match( /worldclass/ ) != null ) { o.event.name = "World Class", o.event.image = "poomsae-02",    o.event.url = "../forms/worldclass/" }
			o.register.events.view .hide();
			selectRing();

		} else {
			o.register.events.view.append( 
				addEvent( "Grassroots",  "grassroots-01", "../forms/grassroots/", 0 ),
				addEvent( "World Class", "poomsae-02",    "../forms/worldclass/", 1 )
			);
		}

		// ====================
		// REGISTER RING
		// ====================
		var addRing    = function( num, x, y ) {
			var mat          = html.div.clone() .addClass( "mat" );
			var playingField = html.div.clone() .addClass( "playing-field" ) .html( num );
			var rings        = o.register.rings;
			mat.attr( "num", num );
			mat.css( "opacity", 0.5 );
			mat.attr( "goto-x", x );
			mat.attr( "goto-y", y );
			mat.append( playingField );

			var gotoX    = (parseInt(rings.view.css( "width"  )) / 2) - 100;
			var gotoY    = (parseInt(rings.view.css( "height" )) / 2) - 100;


			if( rings.view.attr( "animate" ) == "on-initialization" ) {
				mat.animate( { left: x, top: y, opacity: 1.0 } )
			}

			var callback = function( num ) {
				return function() {
					for( var i = 0; i < tournament.rings.count; i++ ) {
						var ring = o.register.rings.data[ i ];
						var j    = ring.attr( "num" );
						if( j == num ) { 
							ring.animate( { left: gotoX, top: gotoY } );
							$.cookie( "ring", num, { path: '/' } );

						} else { 
							ring.fadeOut( 500, function() { 
								rings.view.fadeOut( 500, function() {
									if(
										defined( url ) && (
											(url.match( /judge/ )       != null) ||
											(url.match( /index/ )       != null) ||
											(url.match( /coordinator/ ) != null)
										)
									) {
										if( url.match( /judge/ )       != null ) { 
											var url = 'http://' + o.server + '/cgi-bin/freescore/forms/' + o.event.url + 'rest/' + o.tournament.db + '/' + $.cookie( "ring" ) + '/judges';
											$.ajax( {
												type:    'GET',
												url:     url,
												data:    {},
												success: selectJudge,
												error:   function( response ) { },
											});


										} else if( url.match( /index/ )       != null ) { 
											$.cookie( "role", "display", { path: '/' } ); 
											updateConfirmation(); 
											var ring = $.cookie( "ring" );
											text.html( "Confirm Registration for Display in Ring " + ring + ":" );
											o.register.confirmation.view .fadeIn();

										} else if( url.match( /coordinator/ ) != null ) { 
											$.cookie( "role", "coordinator", { path: '/' } ); 
											updateConfirmation(); 
											var ring = $.cookie( "ring" );
											text.html( "Confirm Registration for Coordinator in Ring " + ring + ":" );
											o.register.confirmation.view .fadeIn();
										}
									} else {
										text.html( "What is your role in ring " + $.cookie( "ring" ) + ":" ); 
										o.register.roles.view.fadeIn( 500 ); 
									}
								}); 
							}); 
						}
					}
				};
			}
			mat.click( callback( num ) );
			return mat;
		}

		for( var y = 0; y < height; y++ ) {
			for( var x = 0; x < width; x++ ) {
				if( o.register.rings.data.length > tournament.rings.count  ) { continue; }
				var xpos = x * 200;
				var ypos = y * 200;
				if( tournament.rings.formation == "loop" && height == 2) { // formation = [loop|rows]
					var half = tournament.rings.count / 2;
					xpos = o.register.rings.data.length >= half ? (half - (x + 1)) * 200 : xpos;
				}

				if( tournament.rings.count % 2 ) { // If there is an odd ring
					if      ( width > height ) { if( o.register.rings.data.length == Math.round( tournament.rings.count/2 ) && o.register.rings.data.length % 2 ) { ypos += 100; }} // center the odd ring
					else if ( height > width ) { if( o.register.rings.data.length == tournament.rings.count && o.register.rings.length % 2 ) { xpos += 100; }} // center the odd ring
				}
				var ring = addRing( (o.register.rings.data.length + 1), xpos, ypos );
				o.register.rings.data.push( ring ); // MW TODO Separate data from view
				o.register.rings.view.append( ring );
			}
		}
		
		// ====================
		// REGISTER ROLE
		// ====================
		var addRole  = function( roleName, left ) {
			var role  = html.div.clone() .addClass( "role" ) .attr( "role", roleName ) .css( "top", 0 ) .css( "left", left );
			var src   = "../images/roles/" + roleName.toLowerCase() + ".png";
			var img   = html.img.clone() .attr( "src", src ) .attr( "height", 100 );
			var label = html.p.clone() .append( roleName );
			role.append( img, label );
			var callback = function( roleName ) {
				return function() {
					for( var i = 0; i < o.register.roles.data.length; i++ ) {
						var role = o.register.roles.data[ i ];
						if( role.attr( "role" ) == roleName ) {
							role.children( "p" ).remove();
							role.children( "img" ).animate( { height: 200 } );

							if( role.attr( "role" ) == "Judge" ) {
								role.animate( { left: 200 }, 400, 'swing', function() {
									o.register.roles.view .delay( 300 ) .fadeOut( 500, function() { 
										var url = 'http://' + o.server + '/cgi-bin/freescore/forms/' + o.event.url + 'rest/' + o.tournament.db + '/' + $.cookie( "ring" ) + '/judges';
										$.ajax( {
											type:    'GET',
											url:     url,
											data:    {},
											success: selectJudge,
											error:   function( response ) { },
										});
									});});
							} else {
								role.animate( { left: 200 }, 400, 'swing', function() {
									role .delay( 300 ) .fadeOut( 400, function () {
										o.register.roles.view .fadeOut( 400, function() {
											$.cookie( "role", roleName.toLowerCase(), { path: '/' } );
											updateConfirmation();
											var ring = $.cookie( "ring" );
											text.html( "Confirm Registration for " + roleName + " in Ring " + ring + ":" );
											o.register.confirmation.view .fadeIn();
										});
									});
								});
							}
						} else {
							role.fadeOut();
						}
					}
				};
			};
			role.click( callback( roleName ));
			return role;
		}

		o.register.roles.data.push( addRole( 'Coordinator', '0px' ));
		o.register.roles.data.push( addRole( 'Judge', '200px' ));
		o.register.roles.data.push( addRole( 'Display', '400px' ));
		for( var i = 0; i < o.register.roles.data.length; i++ ) {
			o.register.roles.view.append( o.register.roles.data[ i ] );
		}

		// ====================
		// REGISTER JUDGE
		// ====================
		var addJudge  = function( num ) {
			var judge = html.div.clone() .addClass( "judge" ) .attr( "num", num ) .css( "top", 0 );
			var src   = "../images/roles/judge.png";
			var img   = html.img.clone() .attr( "src", src ) .attr( "height", 100 );
			var label = html.p.clone() .append( "Judge " + num );
			judge.append( img, label );
			var callback = function( num ) {
				return function() {
					for( var i = 0; i < o.register.judges.data.length; i++ ) {
						var judge = o.register.judges.view[ i ];
						if( judge.attr( "num" ) == num ) {
							judge.children( "p" ).remove();
							judge.children( "img" ).animate( { height: 200 }, 400, 'swing', function() {
								o.register.judges.view .delay( 300 ) .fadeOut( 400, function() {
									var ring = $.cookie( "ring" );
									text.html( "Confirm Registration for Judge " + num + " in Ring " + ring + ":" );
									$.cookie( "role", "judge", { path: '/' } );
									$.cookie( "judge", num, { path: '/' } );
									updateConfirmation();
									o.register.confirmation.view .fadeIn();
								});
							});
						} else {
							judge.fadeTo( 500, 0.25 );
						}
					}
				};
			};
			judge.click( callback( num ));
			return judge;
		}

		// ====================
		// REGISTRATION CONFIRMATION
		// ====================
		var updateConfirmation = function() {
			o.register.rings.view .attr( "animate", "none" );
			var event = addEvent( o.event.name, o.event.image, o.event.url, 0 );
			event.children( ".greys" ).hide();
			var ring  = addRing( parseInt( $.cookie( "ring" )), 0, 0 ) .css( "left", "200px" ) .css( "opacity", "1.0" );
			var role  = String( $.cookie( "role" ));
			if( role == "judge" ) {
				var num   = $.cookie( "judge" );
				role = addJudge( num );
				role.css( 'left', '400px' );
				if( defined( o.event ) ) { url = o.event.url + "/judge.php"; }
			} else {
				if      ( role == "display"     ) { if( ! defined( url )) { url = o.event.url + "/index.php"; } }
				else if ( role == "coordinator" ) { if( ! defined( url )) { url = o.event.url + "/coordinator.php"; } }
				role = addRole( role.capitalize(), '400px' );
			}
			url = url.replace( /\/\/+/g, "/" );
			
			var ok   = html.div.clone() .addClass( "ok" )   .html( "OK" )   .click( function() { location = url; } );
			var back = html.div.clone() .addClass( "back" ) .html( "Back" ) .click( function() { location.reload(); } );
			ring.off();

			event.off();
			ring.off();
			role.off();

			o.register.confirmation.view.empty();
			o.register.confirmation.view.append( event, ring, role, ok, back );
		}

		w.append( h1, text, o.register.events.view, o.register.rings.view, o.register.roles.view, o.register.judges.view, o.register.confirmation.view );
		w.addClass( "register" );
	},
	_init: function( ) {
		var o = this.options;
		var e = this.options.elements;
		var w = this.element;
	}
});
