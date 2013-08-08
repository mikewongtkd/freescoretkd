(function( $ ) {
	$.widget( "freescore.mergeDialog", {
		options: {
			autoShow: true,
		},
		_create: function() { },
		_init: function() {
			var selection = this.options.selection;
			var divisions = this.options.divisions;
			var div       = $( "<div />" );
			var canvas    = $( "<canvas />" ) .attr( 'width', 2048 ) .attr( 'height', 1024 ) .addClass( 'division-visualization' );
			var callback  = this.options.callback;

			this.element .append( canvas );
			this.element .scrollLeft( 512 ) .scrollTop( 512 );
			var divisionsToHexagons = function( selection, divisions ) {
				var origin = selection.vector.split( ", " ).map( function( x ) { return parseInt( x ); });
				var c = {
					blue   : { stroke : '#009', fill : '#99f', hover : '#eef' },
					green  : { stroke : '#090', fill : '#9f9', hover : '#efe' },
					yellow : { stroke : '#980', fill : '#fe9', hover : '#ffe' }
				}; 
				// Shift hexagons that are 2 distance over to be 3 distance to avoid overlap
				var translate = {
					'0,-2,0'   : [  0, -3,  0 ], '1,-1,0'   : [  0, -2, -1 ], '0,-1,-1'  : [  0, -1, -2 ],
					'0,0,-2'   : [  0,  0, -3 ], '0,1,-1'   : [  1,  0, -2 ], '1,0,-1'   : [  2,  0, -1 ],
					'2,0,0'    : [  3,  0,  0 ], '1,0,1'    : [  2,  1,  0 ], '1,1,0'    : [  1,  2,  0 ],
					'0,2,0'    : [  0,  3,  0 ], '-1,1,0'   : [  0,  2,  1 ], '0,1,1'    : [  0,  1,  2 ],
					'0,0,2'    : [  0,  0,  3 ], '0,-1,1'   : [ -1,  0,  2 ], '-1,0,1'   : [ -2,  0,  1 ],
					'-2,0,0'   : [ -3,  0,  0 ], '-1,0,-1'  : [ -2, -1,  0 ], '-1,-1,0'  : [ -1, -2,  0 ],
				};
				var hexagons  = [];
				for( var i in divisions ) {
					var division = divisions[ i ];
					var vector   = division.vector.split( ", " ).map( function( x ) { return parseInt( x ); });
					var dAge     = origin[ 0 ] - vector[ 0 ];
					var dBelt    = origin[ 1 ] - vector[ 1 ];
					var dWeight  = origin[ 2 ] - vector[ 2 ];
					var distance = Math.abs( dAge ) + Math.abs( dBelt ) + Math.abs( dWeight );

					if( division.gender != selection.gender ) { continue; }

					var rank   = division.rank.replace( /Black Belt \((... Dan.*)\)/, "$1" ).replace( /higher/, 'up' );
					var weight = division.weight.replace( /\((.*)\)/, "weight\n$1" );
					var hexagon = { x : dAge, y : dBelt, z : dWeight, size : 64, id : division.id, description : division.age + "\n" + division.gender + " " + rank + "\n" + weight };

					if     ( distance == 0 ) { 
						hexagon.stroke = c.blue.stroke;
						hexagon.fill   = c.blue.fill;   
						hexagons.push( hexagon );

					} else if( distance == 1 ) { 
						hexagon.stroke = c.green.stroke;
						hexagon.fill   = c.green.fill;
						hexagons.push( hexagon );

					} else if( distance == 2 ) { 
						hexagon.stroke = c.yellow.stroke; 
						hexagon.fill   = c.yellow.fill; 
						var vector     = hexagon.x.toString() + "," + hexagon.y.toString() + "," + hexagon.z.toString();
						var position   = translate[ vector ]
						hexagon.x      = position[ 0 ];
						hexagon.y      = position[ 1 ];
						hexagon.z      = position[ 2 ];
						hexagons.push( hexagon );

					} else { continue; } // Skip divisions that are more than 2 categories away; differences too great to be safe
				};
				return hexagons;
			};

			var drawHexagon = function( canvas, hexagon ) {
				var angle   = Math.PI/6;
				var radius  = Math.cos( Math.PI/12 ) * 2;
				var origin  = { 
					x : (canvas.width()/2) + (Math.cos( angle ) * hexagon.x * radius * hexagon.size) - (Math.cos( angle ) * hexagon.z * radius * hexagon.size),
					y : (canvas.height()/2) + (hexagon.y * radius * hexagon.size) + (Math.sin( angle ) * hexagon.x * radius * hexagon.size ) + (Math.sin( angle ) * hexagon.z * radius * hexagon.size )
				};

				var points = [];
				for (var i = 1; i <= 6; i += 1) {
					points.push([ 
						Math.floor( origin.x + hexagon.size * Math.cos(i * 2 * angle)), 
						Math.floor( origin.y + hexagon.size * Math.sin(i * 2 * angle))
					]);
				}

				canvas.drawLine( {
					layer: true,
					closed: true,
					fillStyle: hexagon.fill,
					strokeStyle: hexagon.stroke,
					strokeWidth: 1,	
					shadowColor: "#999",
					shadowBlur: 10,
					shadowX: -5, shadowY: 10,
					mouseover: function( layer ) {
						$(this).css( 'cursor', 'hand' );
						$(this).animateLayer( layer, {
							strokeWidth: 8
						});
					},
					mouseout: function( layer ) {
						$(this).css( 'cursor', 'auto' );
						$(this).animateLayer( layer, {
							strokeWidth: 1
						});
					},
					click: function( layer ) { callback( hexagon.id ); },
					x1: points[ 0 ][ 0 ], y1: points[ 0 ][ 1 ],
					x2: points[ 1 ][ 0 ], y2: points[ 1 ][ 1 ],
					x3: points[ 2 ][ 0 ], y3: points[ 2 ][ 1 ],
					x4: points[ 3 ][ 0 ], y4: points[ 3 ][ 1 ],
					x5: points[ 4 ][ 0 ], y5: points[ 4 ][ 1 ],
					x6: points[ 5 ][ 0 ], y6: points[ 5 ][ 1 ],
				});
				canvas.drawText({
					layer: true,
					x : origin.x,
					y : origin.y,
					fillStyle : "#000",
					strokeStyle : "#000",
					fontSize : "9pt",
					fontFamily: "Calibri, Arial, sans-serif",
					text : hexagon.description,
					fromCenter : true,
					click: function( layer ) { callback( hexagon.id ); },
				});
			};
			var hexagons = divisionsToHexagons( selection, divisions );
			for( var i in hexagons ) { var hexagon = hexagons[ i ]; drawHexagon( canvas, hexagon ); }
		},
		_destroy: function() {}
	});
})( jQuery );
