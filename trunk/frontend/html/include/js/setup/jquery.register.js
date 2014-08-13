$.widget( "freescore.register", {
	options: { autoShow: true },
	_create: function() {
		var o          = this.options;
		var e          = this.options.elements = {};
		var w          = this.element;
		var html       = o.html     = { div : $( "<div />" ), h1 : $( "<h1 />" ), p : $( "<p />" ), img : $( "<img />" ) };
		var tournament = o.tournament;

		var h1         = html.h1.clone() .html( "Register" );
		var text       = html.p.clone() .html( "Choose your ring number: " );

		var rings      = o.rings   = [];
		var roles      = o.roles   = [];
		var judges     = o.judges  = [];
		var width      = tournament.rings.width;
		var height     = tournament.rings.height;
		var floorplan  = html.div.clone() .addClass( "floorplan" ) .css( "width", width * 200 ) .css( "height", height * 200 );
		var jobs       = html.div.clone() .addClass( "roles" ) .hide();
		var court      = html.div.clone() .addClass( "court" ) .hide();

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
							$.cookie( "ring", num );

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
									role .delay( 300 ) .fadeOut();
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
									text.html( "Confirm Registration" );
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

		for( var i = 0; i < 3; i++ ) { var judge = addJudge( i+1 ); judges.push( judge ); court.append( judge ); }

		// ====================
		// REGISTRATION CONFIRMATION
		// ====================
		// MW Add code here

		w.append( h1, text, floorplan, jobs, court );
		w.addClass( "register" );
	},
	_init: function( ) {
		var o = this.options;
		var e = this.options.elements;
		var w = this.element;
	}
});
