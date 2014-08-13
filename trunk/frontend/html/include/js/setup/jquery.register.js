String.prototype.capitalize = function() {
	return this.charAt( 0 ).toUpperCase() + this.slice( 1 );
};

$.widget( "freescore.register", {
	options: { autoShow: true },
	_create: function() {
		var o            = this.options;
		var e            = this.options.elements = {};
		var w            = this.element;
		var html         = o.html     = { div : $( "<div />" ), h1 : $( "<h1 />" ), p : $( "<p />" ), img : $( "<img />" ) };
		var tournament   = o.tournament;

		var h1           = html.h1.clone() .html( "Register" );
		var text         = html.p.clone() .html( "Choose your ring number: " );

		var rings        = o.rings   = [];
		var roles        = o.roles   = [];
		var judges       = o.judges  = [];
		var width        = tournament.rings.width;
		var height       = tournament.rings.height;
		var floorplan    = html.div.clone() .addClass( "floorplan" ) .css( "width", width * 200 ) .css( "height", height * 200 );
		var jobs         = html.div.clone() .addClass( "roles" ) .hide();
		var court        = html.div.clone() .addClass( "court" ) .hide();
		var confirmation = html.div.clone() .addClass( "confirmation" ) .hide();

		// ===== REMOVE LOCAL COOKIES
		$.removeCookie( 'ring'  );
		$.removeCookie( 'role'  );
		$.removeCookie( 'judge' );

		// ===== REMOVE SITE COOKIES
		$.removeCookie( 'ring',  { path: '/' });
		$.removeCookie( 'role',  { path: '/' });
		$.removeCookie( 'judge', { path: '/' });

		// ====================
		// REGISTER RING
		// ====================
		var addRing    = function( num, x, y ) {
			var mat          = html.div.clone() .addClass( "mat" );
			var playingField = html.div.clone() .addClass( "playing-field" ) .html( num );
			mat.attr( "num", num );
			mat.css( "opacity", 0.5 );
			mat.animate( { left: x, top: y, opacity: 1.0 } );
			mat.append( playingField );

			var gotoX    = (parseInt(floorplan.css( "width"  )) / 2) - 100;
			var gotoY    = (parseInt(floorplan.css( "height" )) / 2) - 100;
			var callback = function( num ) {
				return function() {
					for( var i = 0; i < tournament.rings.count; i++ ) {
						var ring = o.rings[ i ];
						var j    = ring.attr( "num" );
						if( j == num ) { 
							ring.animate( { left: gotoX, top: gotoY } );
							$.cookie( "ring", num, { path: '/' } );

						} else { 
							ring.fadeOut( 500, function() { 
								floorplan.fadeOut( 500, function() {
									text.html( "What is your role in ring " + $.cookie( "ring" ) + ":" ); 
									jobs.fadeIn( 500 ); 
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
				if( rings.length > tournament.rings.count  ) { continue; }
				var xpos = x * 200;
				var ypos = y * 200;
				if( tournament.rings.formation == "loop" && height == 2) { // formation = [loop|rows]
					var half = tournament.rings.count / 2;
					xpos = rings.length >= half ? (half - (x + 1)) * 200 : xpos;
				}

				if( tournament.rings.count % 2 ) { // If there is an odd ring
					if      ( width > height ) { if( rings.length == Math.round( tournament.rings.count/2 ) && rings.length % 2 ) { ypos += 100; }} // center the odd ring
					else if ( height > width ) { if( rings.length == tournament.rings.count && rings.length % 2 ) { xpos += 100; }} // center the odd ring
				}
				var ring = addRing( (rings.length + 1), xpos, ypos );
				rings.push( ring );
				floorplan.append( ring );
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
					for( var i = 0; i < o.roles.length; i++ ) {
						var role = o.roles[ i ];
						if( role.attr( "role" ) == roleName ) {
							role.children( "p" ).remove();
							role.children( "img" ).animate( { height: 200 } );

							if( role.attr( "role" ) == "Judge" ) {
								role.animate( { left: 200 }, 400, 'swing', function() {
									jobs .delay( 300 ) .fadeOut( 500, function() { 
										text.html( "Which judge?" );
										court.fadeIn( 500, function() {
										for( var i = 0; i < o.judges.length; i++ ) {
											var judge = o.judges[ i ];
											judge.animate( { left: i * 200 } );
										}
									});});
								});
							} else {
								role.animate( { left: 200 }, 400, 'swing', function() {
									role .delay( 300 ) .fadeOut( 400, function () {
										jobs .fadeOut( 400, function() {
											$.cookie( "role", roleName.toLowerCase(), { path: '/' } );
											updateConfirmation();
											var ring = $.cookie( "ring" );
											text.html( "Confirm Registration for " + roleName + " in Ring " + ring + ":" );
											confirmation .fadeIn();
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

		roles.push( addRole( 'Coordinator', '0px' ));
		roles.push( addRole( 'Judge', '200px' ));
		roles.push( addRole( 'Display', '400px' ));
		for( var i = 0; i < roles.length; i++ ) {
			jobs.append( roles[ i ] );
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
					for( var i = 0; i < o.judges.length; i++ ) {
						var judge = o.judges[ i ];
						if( judge.attr( "num" ) == num ) {
							judge.children( "p" ).remove();
							judge.children( "img" ).animate( { height: 200 }, 400, 'swing', function() {
								court .delay( 300 ) .fadeOut( 400, function() {
									var ring = $.cookie( "ring" );
									text.html( "Confirm Registration for Judge " + num + " in Ring " + ring + ":" );
									$.cookie( "role", "judge", { path: '/' } );
									$.cookie( "judge", num, { path: '/' } );
									updateConfirmation();
									confirmation .fadeIn();
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
		for( var i = 0; i < 3; i++ ) { 
			var judge = addJudge( i+1 ); 
			judges.push( judge ); 
			court.append( judge ); 
		}

		// ====================
		// REGISTRATION CONFIRMATION
		// ====================
		var updateConfirmation = function() {
			var ring  = addRing( parseInt( $.cookie( "ring" )), 0, 0 );
			var role  = String( $.cookie( "role" ));
			if( role == "judge" ) {
				var num   = $.cookie( "judge" );
				role = addJudge( num );
				role.css( 'left', '200px' );
			} else {
				role = addRole( role.capitalize(), '200px' );
			}
			var url  = $.url().param( 'referer' );
			var ok   = html.div.clone() .addClass( "ok" )   .html( "OK" )   .click( function() { location = url; } );
			var back = html.div.clone() .addClass( "back" ) .html( "Back" ) .click( function() { location.reload(); } );
			confirmation.empty();
			confirmation.append( ring, role, ok, back );
		}


		w.append( h1, text, floorplan, jobs, court, confirmation );
		w.addClass( "register" );
	},
	_init: function( ) {
		var o = this.options;
		var e = this.options.elements;
		var w = this.element;
	}
});
