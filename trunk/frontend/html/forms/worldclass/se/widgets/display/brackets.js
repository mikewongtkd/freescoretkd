FreeScore.Widget.SEMatchList = class FSWidgetSEMatchList extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		this.dom.append( '<div class="header"></div><div class="bracket-graph"></div>' );

		this.svg  = SVG();
		this.draw = null;

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.header   = this.dom.find( '.header' );
		this.display.bracket  = { graph : this.dom.find( '.bracket-graph' ) };

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.header = division => {
			this.display.header.empty();
			this.display.header.html( `<h1><span class="divid">${division.name().toUpperCase()}</span> &ndash; <span class="description">${division.description()}</span></h1><h2>${division.current.round.display.name()}</h2>` );
		};
		this.refresh.bracket = {
			graph : division => {
				if( ! defined( division )) { 
					this.display.header.empty(); 
					this.display.match.list.empty(); 
					return; 
				}
				this.display.bracket.graph.empty();
				this.draw = this.svg.addTo( '.bracket-graph' ).size( '100%', '100%' );

				let rounds = division.rounds();
				rounds.forEach(( round, i ) => { 
					let matches = division.matches( round );
					matches.forEach(( match, j ) => this.refresh.bracket.match( match, i * 400, j * 200 ));
				});

			},
			match : ( match, x, y ) => {
				draw.rect(100,100).animate().fill('#f03').move(100,100)
			}
		};

		// ===== ADD NETWORK LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'division' )
			.command( 'update' ).respond( update => {
				let division = update?.division ? new Division( update.division ) : null;

				this.refresh.header( division );
				this.refresh.bracket.graph( division );
			});
	}
}
