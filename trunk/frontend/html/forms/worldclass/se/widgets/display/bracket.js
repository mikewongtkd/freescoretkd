FreeScore.Widget.SEBracket = class FSWidgetSEBracket extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		this.dom.append( '<div class="header"></div><div class="bracket-graph" style="padding-top: 5%"></div>' );

		this.svg  = SVG();
		this.draw = null;

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.header   = this.dom.find( '.header' );
		this.display.bracket  = { graph : this.dom.find( '.bracket-graph' ) };

		// ===== ADD STATE INFORMATION
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

		this.refresh.header = division => {
			this.display.header.empty();
			this.display.header.html( `<h1><span class="divid">${division.name().toUpperCase()}</span> &ndash; <span class="description">${division.description()}</span></h1>` );
		};

		this.refresh.bracket = {
			graph : division => {
				let radius = this.state.render.radius;
				let height = this.state.render.height;
				let width  = this.state.render.width;

				if( ! defined( division )) { 
					this.display.header.empty(); 
					this.display.bracket.graph.empty(); 
					return; 
				}

				let rounds  = division.rounds();
				let start   = 0;
				let prev    = null;
				let first   = rounds[ 0 ];
				let columns = rounds.length > 1 ? rounds.length - 1 : 1;
				let rows    = rounds.map( round => division.matches( round ).length ).reduce(( acc, cur ) => cur > acc ? cur : acc, 0 );
				let bounds  = { left: (width + height)/2, top: 0, width: columns * (width + (3 * height)), height: rows * (4 * height)};

				this.display.bracket.graph.empty();
				if( this.draw ) { 
					this.draw.clear(); 
				} else {
					this.draw = this.svg.addTo( '.bracket-graph' ).size( '100%', '100%' ).viewbox( bounds.left, bounds.top, bounds.width, bounds.height );
				}

				rounds.forEach(( round, i ) => { 
					let matches  = reorder( division.bracket.matches( round ));
					let yoffset  = (((4 - matches.length) / 2) * height * 3) / 2;
					let pmatches = [];

					if( prev ) { pmatches = reorder( division.matches( prev )); }
					this.state.bracket[ round ] = { svg: {}};
					this.state.bracket[ round ].svg.label  = this.draw.plain( FreeScore.round.name?.[ round ] ).font({ size: '28pt' }).fill( round == division.current.roundId() ? 'gold' : '#ccc' ).x( (i * ((height * 3) + width)) ).y( 0 );

					matches.forEach(( match, j ) => {
						if     ( matches.length == 1 ) { yoffset *= 2; }
						else if( j % 2 )               { yoffset *= 3; }

						let active = round == division.current.roundId() && match.order.includes( division.current.athleteId()) ? true : false;
						let x = (i * ((height * 3) + width));
						let y = (j * (height * 3 )) + yoffset + (3 * height) / 2;

						// Cache important points for current match
						let cmatch = this.state.bracket[ round ][ match.number ] = this.refresh.bracket.match( division, match, x, y, start, active );

						// Draw the edges to the previous matches
						if( prev ) {
							let color    = { true: 'white', false: '#666' };
							let a         = pmatches.shift();
							let b         = pmatches.shift();
							let x         = a?.number ? this.state.bracket[ prev ][ a.number ] : null;
							let y         = b?.number ? this.state.bracket[ prev ][ b.number ] : null;

							// Skip drawing edges for place-holder brackets
							if( x === null || y === null ) { return; }

							x.destination = cmatch;
							y.destination = cmatch;
							cmatch.source = { chung: x, hong: y };

							if( a.winner == a.chung ) {
								let start = x.anchor.destination.chung;
								let stop  = cmatch.anchor.source.chung;
								let hline = (stop[ 0 ] - start[ 0 ])/2;
								let vline = stop[ 1 ] - start[ 1 ];
								this.draw.path( `M${start.join( ',' )} h${hline} v${vline} h${hline}` ).stroke({ color: color[ active ], width: 4, linecap: 'round', linejoin: 'round' }).fill( 'none' );

							} else if( a.winner == a.hong ) {
								let start = x.anchor.destination.hong;
								let stop  = cmatch.anchor.source.chung;
								let hline = (stop[ 0 ] - start[ 0 ])/2;
								let vline = stop[ 1 ] - start[ 1 ];
								this.draw.path( `M${start.join( ',' )} h${hline} v${vline} h${hline}` ).stroke({ color: color[ active ], width: 4, linecap: 'round', linejoin: 'round' }).fill( 'none' );
							}

							if( b.winner == b.chung ) {
								let start = y.anchor.destination.chung;
								let stop  = cmatch.anchor.source.hong;
								let hline = (stop[ 0 ] - start[ 0 ])/2;
								let vline = stop[ 1 ] - start[ 1 ];
								this.draw.path( `M${start.join( ',' )} h${hline} v${vline} h${hline}` ).stroke({ color: color[ active ], width: 4, linecap: 'round', linejoin: 'round' }).fill( 'none' );

							} else if( b.winner == b.hong ) {
								let start = y.anchor.destination.hong;
								let stop  = cmatch.anchor.source.hong;
								let hline = (stop[ 0 ] - start[ 0 ])/2;
								let vline = stop[ 1 ] - start[ 1 ];
								this.draw.path( `M${start.join( ',' )} h${hline} v${vline} h${hline}` ).stroke({ color: color[ active ], width: 4, linecap: 'round', linejoin: 'round' }).fill( 'none' );
							}
						}
					});
					start += matches.length;
					prev = round;
				});

				$( 'svg:not( #display-bracket svg )' ).remove(); // Kludge fix to remove extra SVG elements (I don't know why they're being created)
			},
			match : ( division, match, x, y, start, active = 'default' ) => {
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
				let svg    = { chung : { bg: null, name: null, win: null }, hong : { bg: null, name: null, win: null }, match : { bg: null, label: null, number: null }};

				svg.match.bg = this.draw.path( `M0,${radius} q0,-${radius} ${radius},-${radius} h${(2*height)-radius} v${(2*height)} h-${(2*height)-radius} q-${radius},0 -${radius},-${radius} v-${(2*(height-radius))}` ).x( x ).y( y ).fill( fill.match[ active ]);
				svg.chung.bg = this.draw.path( `M0,0 h${width-radius} q${radius},0 ${radius},${radius} v${height - radius} h-${width} z` ).x( x + 2 * height ).y( y ).fill( fill.chung[ active ]);
				svg.hong.bg  = this.draw.path( `M0,0 h${width} v${height-radius} q0,${radius} -${radius},${radius} h-${width-radius} z` ).x( x + 2 * height ).y( y + height ).fill( fill.hong[ active ]);

				let chung = defined( match?.chung ) ? division.athlete( match.chung ) : { bye: true, display: { name: max_length => 'BYE' }};
				let hong  = defined( match?.hong )  ? division.athlete( match.hong )  : { bye: true, display: { name: max_length => 'BYE' }};

				if( chung?.bye && hong?.bye ) { chung.display.name = hong.display.name = max_length => ''; }

				svg.match.label  = this.draw.plain( 'Match' ).font({ size: '14pt' }).fill( fill.number[ active ]).x( x + (5 * height)/8 ).y( y + (3 * height)/16 );
				svg.match.number = this.draw.plain( start + match.number ).font({ size: '36pt' }).fill( fill.number[ active ]).x( x + (3 * height)/4 ).y( y + (11 * height)/16 );

				svg.chung.name = this.draw.plain( chung.display.name( 16 )).font({ size: '24pt' }).fill( fill.name[ active ]).x( x + 3 * height ).y( y + height/8 );
				svg.hong.name  = this.draw.plain( hong.display.name( 16 )).font({ size: '24pt' }).fill( fill.name[ active ]).x( x + 3 * height ).y( y + (9 * height)/8 );

				// ===== DRAW THE WINNER DOT
				[ 'chung', 'hong' ].forEach( contestant => {
					if( match[ contestant ] === null ) { return; }
					if( match[ contestant ] != match.winner ) { return; }
					if( contestant == 'chung' ) {
						svg.chung.win = this.draw.circle( height / 2 ).x( x + (9 * height)/4 ).y( y + height/4 ).fill( fill.winner[ active ] );
					} else {
						svg.hong.win  = this.draw.circle( height / 2 ).x( x + (9 * height)/4 ).y( y + (5 * height/4)).fill( fill.winner[ active ] );
					}
				});


				return { id: crypto.randomUUID(), active, svg, anchor : { ul: [ x, y ], center: [ x + (((2 * height) + width) / 2), y + height ], lr: [ x + (2 * height) + width, y + (2 * height)], source : { chung : [ x, y + height/2], hong : [ x, y + (3 * height)/2 ]}, destination: { chung: [ x + (2*height) + width, y + height/2 ], hong: [ x + (2*height) + width, y + (3*height)/2 ]}}};
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
				let bounds  = {};

				dest = defined( dest ) ? dest : current;

				// Zoom in
				bounds = { left: current.anchor.ul[ 0 ], top : Math.min( current.anchor.ul[ 1 ], other.anchor.ul[ 1 ]), right: Math.max( current.anchor.lr[ 0 ], dest.anchor.lr[ 0 ]), bottom: Math.max( current.anchor.lr[ 1 ], other.anchor.lr[ 1 ])};
				bounds.width  = height + bounds.right - bounds.left;
				bounds.height = height + bounds.bottom - bounds.top;
				bounds.left   -= height/2;
				bounds.top    += height/2;
				bounds.x = bounds.left;
				bounds.y = bounds.top;
				let zoom = {};
				zoom.in = [ bounds.x, bounds.y, bounds.width, bounds.height ];


				// Zoom back out
				let columns = rounds.length > 1 ? rounds.length - 1 : 1;
				let rows    = rounds.map( round => division.matches( round ).length ).reduce(( acc, cur ) => cur > acc ? cur : acc, 0 );
				bounds = { x: (width + height)/2, y: 0, width: columns * (width + (3 * height)), height: rows * (4 * height)};
				zoom.out = [ bounds.x, bounds.y, bounds.width, bounds.height ];

				let animating = this.state.animation && this.state.animation.process() != 1;
				if( ! animating ) {
					this.state.animation = this.draw.animate( 2000, 3000 ).viewbox( zoom.in ).animate( 2000, 3000 ).viewbox( zoom.out );
				}
			}
		};

		// ===== ADD NETWORK LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'division' )
			.command( 'update' ).respond( update => {
				let division = update?.division ? new Division( update.division ) : null;

				this.refresh.header( division );
				this.refresh.bracket.graph( division );
				if( division.state.is.bracket()) { this.refresh.bracket.zoom( division ); }
			});
	}
}
