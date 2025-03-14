FreeScore.Widget.SEBracket = class FSWidgetSEBracket extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		this.dom.append( '<div class="header"></div><div class="bracket-graph" style="position: absolute; margin-top: 5%; height: 95%; width: 100%;"></div>' );

		this.svg  = SVG();
		this.draw = null;

		this.zoom = {
			out : {
				default: { left: 200, top: 0, width: 1050, height: 850 },
				ro8: { left: 200, top: 0, width: 1050, height: 850 },
				ro4: { left: 0, top: 0, width: 1000, height: 450 }
			}
		};

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.header   = this.dom.find( '.header' );
		this.display.bracket  = { graph : this.dom.find( '.bracket-graph' ) };

		// ===== ADD STATE INFORMATION
		this.state.animation = null;
		this.state.render = { radius: 40, height: 50, width: 350 };
		this.state.bracket = {};

		// ===== ADD REFRESH BEHAVIOR
		// ------------------------------------------------------------
		let reorder = matches => {
		// ------------------------------------------------------------
		// Helper function to reorder matches in bracket order rather
		// than sequential order
		//
			let order  = [];
			let middle = true;
			let copy   = matches.slice();
			while( copy.length > 0 ) {
				let a = copy.shift();
				let b = copy.pop();
				if( middle == true ) {
					order.splice( order.length / 2, 0, a, b );
					middle = false;
				} else {
					order.splice( (order.length / 2) + 1, 0, a, b );
					middle = true;
				}
			}

			order = order.filter( x => defined( x ));
			return order;
		};

		this.refresh.all = division => {
			this.refresh.header( division );
			this.refresh.bracket.graph( division );

			if( division.state.is.bracket()) { this.refresh.bracket.zoom( division ); }
		};

		this.refresh.header = division => {
			this.display.header.empty();
			this.display.header.html( `<h1><span class="divid">${division.name().toUpperCase()}</span> &ndash; <span class="description">${division.description()}</span></h1>` );
		};

		this.refresh.bracket = {
			edge: ( prev, pmatches, cmatch, active ) => { // Previous round ID, previous matches, current match, current match is active flag
				let color = { true: 'white', false: '#666' };
				let i     = cmatch.number;
				let j     = (i - 1) * 2;
				let a     = pmatches[ j ];
				let b     = pmatches[ j + 1 ]
				let x     = a?.number ? this.state.bracket[ prev ][ a.number ] : null;
				let y     = b?.number ? this.state.bracket[ prev ][ b.number ] : null;

				// Skip drawing edges for place-holder brackets
				if( x === null || y === null ) { return; }

				x.destination = cmatch;
				y.destination = cmatch;
				cmatch.source = { chung: x, hong: y };

				// Forward athlete to Chung in current match
				if( defined( a.winner ) && a.winner == a.chung ) {
					let start = x.anchor.destination.chung;
					let stop  = cmatch.anchor.source.chung;
					let hline = (stop[ 0 ] - start[ 0 ])/2;
					let vline = stop[ 1 ] - start[ 1 ];
					this.draw.path( `M${start.join( ',' )} h${hline} v${vline} h${hline}` ).stroke({ color: color[ active ], width: 4, linecap: 'round', linejoin: 'round' }).fill( 'none' );

				} else if( defined( a.winner ) && a.winner == a.hong ) {
					let start = x.anchor.destination.hong;
					let stop  = cmatch.anchor.source.chung;
					let hline = (stop[ 0 ] - start[ 0 ])/2;
					let vline = stop[ 1 ] - start[ 1 ];
					this.draw.path( `M${start.join( ',' )} h${hline} v${vline} h${hline}` ).stroke({ color: color[ active ], width: 4, linecap: 'round', linejoin: 'round' }).fill( 'none' );
				}

				// Forward athlete to Hong in current match
				if( defined( b.winner ) && b.winner == b.chung ) {
					let start = y.anchor.destination.chung;
					let stop  = cmatch.anchor.source.hong;
					let hline = (stop[ 0 ] - start[ 0 ])/2;
					let vline = stop[ 1 ] - start[ 1 ];
					this.draw.path( `M${start.join( ',' )} h${hline} v${vline} h${hline}` ).stroke({ color: color[ active ], width: 4, linecap: 'round', linejoin: 'round' }).fill( 'none' );

				} else if( defined( b.winner ) && b.winner == b.hong ) {
					let start = y.anchor.destination.hong;
					let stop  = cmatch.anchor.source.hong;
					let hline = (stop[ 0 ] - start[ 0 ])/2;
					let vline = stop[ 1 ] - start[ 1 ];
					this.draw.path( `M${start.join( ',' )} h${hline} v${vline} h${hline}` ).stroke({ color: color[ active ], width: 4, linecap: 'round', linejoin: 'round' }).fill( 'none' );
				}
			},
			graph: division => {
				let radius = this.state.render.radius;
				let height = this.state.render.height;
				let width  = this.state.render.width;

				if( ! defined( division )) { 
					this.display.header.empty(); 
					this.display.bracket.graph.empty(); 
					return; 
				}

				let rounds  = division.rounds().filter( round => round.match( /^ro/i ));
				let start   = 0;
				let prev    = null;
				let first   = rounds[ 0 ];
				let columns = rounds.length > 1 ? rounds.length - 1 : 1;
				let rows    = rounds.map( round => division.matches( round ).length ).reduce(( acc, cur ) => cur > acc ? cur : acc, 0 );
				// let bounds  = this.state.viewbox = this.zoom.out?.[ first ] ? this.zoom.out[ first ] : { left: 0, top: 0, width: (columns * (width + (3 * height))) + height, height: (rows * (4 * height)) + height };
				// let bounds  = this.state.viewbox = { left: (width + height)/2, top: 0, width: (columns * (width + (3 * height))) + height, height: (rows * (4 * height)) + height };
				let bounds = this.state.viewbox = this.zoom.out.default;
				console.log( 'ZOOM OUT', bounds ); // MW

				this.display.bracket.graph.empty();
				console.log( 'VIEWBOX BEFORE', this?.draw?.viewbox()); // MW
				if( defined( this.draw )) { this.draw.clear(); }
				$( 'svg' ).remove();
				this.draw = this.svg.addTo( '.bracket-graph' ).size( '100%', '100%' ).viewbox( bounds.left, bounds.top, bounds.width, bounds.height );
				$( '.bracket-graph svg' ).attr({ viewBox : this.state.viewbox });
				console.log( 'VIEWBOX AFTER', this?.draw?.viewbox()); // MW

				rounds.forEach(( round, i ) => { 
					let matches  = reorder( division.bracket.matches( round ));
					let yoffset  = (((4 - matches.length) / 2) * height * 3) / 2;
					let pmatches = [];

					if( prev ) { pmatches = reorder( division.matches( prev )); }

					// Render Round Names
					let rfill = round == division.current.roundId() ? 'gold' : '#ccc';
					let colx  = i * ((height * 3) + width);
					this.state.bracket[ round ] = { svg: {}};
					this.state.bracket[ round ].svg.label  = this.draw.plain( FreeScore.round.name?.[ round ] ).font({ size: '28pt' }).fill( rfill ).x( colx ).y( 0 );

					matches.forEach(( match, j ) => {
						if     ( matches.length == 1 ) { yoffset *= 2; }
						else if( j % 2 )               { yoffset *= 3; }

						let active = round == division.current.roundId() && match.order.includes( division.current.athleteId()) ? true : false;
						let x = (i * ((height * 3) + width));
						let y = (j * (height * 3 )) + yoffset + (3 * height) / 2;

						// Cache important points for current match
						let cmatch = this.state.bracket[ round ][ match.number ] = this.refresh.bracket.match( division, match, x, y, start, prev, pmatches, active );

						if( prev ) { 
							this.refresh.bracket.edge( prev, pmatches, cmatch, active ); 
						}
					});
					start += matches.length;
					prev = round;
				});

				$( 'svg:not( #display-bracket svg )' ).remove(); // Kludge fix to remove extra SVG elements (I don't know why they're being created)
			},
			match : ( division, match, x, y, start, prev, pmatches, active = 'default' ) => {
				let radius = this.state.render.radius;
				let height = this.state.render.height;
				let width  = this.state.render.width;
				let fill   = {
					match:  { true: 'gold',  false: '#666' },
					chung:  { true: '#03f',  false: '#014' },
					hong:   { true: '#f30',  false: '#410' },
					name:   { true: 'white', false: '#888' },
					number: { true: 'black', false: 'black' },
					winner: { true: 'gold',  false: '#660' }
				};
				let svg    = { chung : { bg: null, name: null, win: null }, hong : { bg: null, name: null, win: null }, match : { bg: null, label: null, number: null }, group : null };
				let group  = svg.group = this.draw.group();

				svg.match.bg = group.path( `M0,${radius} q0,-${radius} ${radius},-${radius} h${(2*height)-radius} v${(2*height)} h-${(2*height)-radius} q-${radius},0 -${radius},-${radius} v-${(2*(height-radius))}` ).fill( fill.match[ active ]);
				svg.chung.bg = group.path( `M0,0 h${width-radius} q${radius},0 ${radius},${radius} v${height - radius} h-${width} z` ).x( 2 * height ).fill( fill.chung[ active ]);
				svg.hong.bg  = group.path( `M0,0 h${width} v${height-radius} q0,${radius} -${radius},${radius} h-${width-radius} z` ).x( 2 * height ).y( height ).fill( fill.hong[ active ]);

				let chung = defined( match?.chung ) ? division.athlete( match.chung ) : { bye: true, display: { name: max_length => 'BYE' }};
				let hong  = defined( match?.hong )  ? division.athlete( match.hong )  : { bye: true, display: { name: max_length => 'BYE' }};

				if( chung?.bye && hong?.bye ) { 
					chung.display.name = hong.display.name = max_length => ''; 
					if( prev ) {
						let i = match.number;
						let j = (i - 1) * 2;
						let a = pmatches[ j ];
						let b = pmatches[ j + 1 ];
						if( defined( a?.winner )) { chung = division.athlete( a.winner ); }
						if( defined( b?.winner )) { hong  = division.athlete( b.winner ); }
					}
				}

				svg.match.label  = group.plain( 'Match' ).font({ size: '14pt' }).fill( fill.number[ active ]).x( (5 * height)/8 ).y( (3 * height)/16 );
				svg.match.number = group.plain( start + match.number ).font({ size: '36pt' }).fill( fill.number[ active ]).x( (3 * height)/4 ).y( (11 * height)/16 );

				svg.chung.name = group.plain( chung.display.name( 16 )).font({ size: '24pt' }).fill( fill.name[ active ]).x( 3 * height ).y( height/8 );
				svg.hong.name  = group.plain( hong.display.name( 16 )).font({ size: '24pt' }).fill( fill.name[ active ]).x( 3 * height ).y( (9 * height)/8 );

				// ===== DRAW THE WINNER DOT
				[ 'chung', 'hong' ].forEach( contestant => {
					if( match[ contestant ] === null ) { return; }
					if( match[ contestant ] != match.winner ) { return; }
					if( contestant == 'chung' ) {
						svg.chung.win = group.circle( height / 2 ).x( (9 * height)/4 ).y( height/4 ).fill( fill.winner[ active ] );
					} else {
						svg.hong.win  = group.circle( height / 2 ).x( (9 * height)/4 ).y( (5 * height/4)).fill( fill.winner[ active ] );
					}
				});
				group.x( x ).y( y );

				console.log( 'GROUP BBOX', group.bbox()); // MW

				return { 
					id: UUID.v4(), 
					number: match.number, 
					active, 
					svg, 
					anchor : { ul: [ x, y ], center: [ x + (((2 * height) + width) / 2), y + height ], lr: [ x + (2 * height) + width, y + (2 * height)], source : { chung : [ x, y + height/2], hong : [ x, y + (3 * height)/2 ]}, destination: { chung: [ x + (2*height) + width, y + height/2 ], hong: [ x + (2*height) + width, y + (3*height)/2 ]}}
				};
			},
			zoom : division => {
				let radius  = this.state.render.radius;
				let height  = this.state.render.height;
				let width   = this.state.render.width;
				let match   = division.current.match();
				let round   = division.current.roundId();
				let rounds  = division.rounds();
				let mnum    = match?.number;
				let current = this.state.bracket[ round ][ mnum ];
				let dest    = current?.destination;
				let other   = defined( dest ) ? (dest.source.chung.id == current.id ? dest.source.hong : dest.source.chung) : current;

				dest = defined( dest ) ? dest : current;

				// Zoom in
				let bounds = {
					default: { x: null, y: null, width: null, height: null },
					current: current?.svg?.group?.bbox() ? current.svg.group.bbox() : bounds.default,
					other: other?.svg?.group?.bbox() ? other.svg.group.bbox() : bounds.default,
					dest: dest?.svg?.group?.bbox() ? dest.svg.group.bbox() : bounds.default,
				};
				console.log( 'BOUNDS', bounds ); // MW
				bounds.left   = bounds.current.x; 
				bounds.top    = Math.min( ... [ bounds.current.y, bounds.other.y ].filter( x => x != null )); 
				bounds.width  = (bounds.dest.width + bounds.dest.x) - bounds.current.x;
				bounds.height = Math.max( ... [ bounds.current.y, bounds.other.y ].filter( x => x != null )) + bounds.current.height - bounds.top;
				let zoom = {};
				zoom.in = { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height };


				// Zoom back out
				let columns = rounds.length > 1 ? rounds.length - 1 : 1;
				let rows    = rounds.map( round => division.matches( round ).length ).reduce(( acc, cur ) => cur > acc ? cur : acc, 0 );
				bounds = this.state.viewbox;
				// zoom.out = { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height };
				zoom.out = this.zoom.out.default;
				console.log( 'ZOOM IN/OUT', zoom ); // MW

				let animating = defined( this.state.animation ) && this.state.animation.progress() != 1;
				if( ! animating ) {
					this.state.animation = this.draw.animate( 2000, 3000 ).viewbox( zoom.in ).animate( 2000, 3000 ).viewbox( zoom.out );
				}
			}
		};

		// ===== ADD NETWORK LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'division' )
			.command( 'update' ).respond( update => {
				let page     = this.app.page;
				let division = update?.division ? new Division( update.division ) : null;
				if( ! defined( division )) { return; }
				if( !( update?.request?.action == 'display' || update?.request?.action == 'read' )) { return; }
				if( page.num != page.for.bracket ) { return; }
				division.calculate.match.winners(); // Kludge until server can correctly cache the status updates properly

				this.refresh.all( division );
			})
		.heard( 'autopilot' )
			.command( 'update' ).respond( update => {
				let division = update?.division ? new Division( update.division ) : null;

				if( ! defined( division )) { return; }
				division.calculate.match.winners(); // Kludge until server can correctly cache the status updates properly

				this.refresh.all( division );
			});
	}
}
