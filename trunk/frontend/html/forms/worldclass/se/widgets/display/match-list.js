FreeScore.Widget.SEMatchList = class FSWidgetSEMatchList extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		this.dom.append( '<div class="header"></div><div class="match-list"></div>' );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.header   = this.dom.find( '.header' );
		this.display.match    = { list : this.dom.find( '.match-list' ) };

		// ===== ADD STATE
		this.state.division  = { show : null };

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.header = division => {
			this.display.header.empty();
			this.display.header.html( `<h1><span class="divid">${division.name().toUpperCase()}</span> &ndash; <span class="description">${division.description()}</span></h1><h2><span class="round-name">${division.current.round.display.name()}</span></h2>` );
		};
		this.refresh.match = {
			list : division => {
				if( ! defined( division )) { 
					this.display.header.empty(); 
					this.display.match.list.empty(); 
					return; 
				}

				// ===== POPULATE THE ATHLETE LIST
				let round = division.current.roundId();
				let start = division.prev.rounds()?.map( r => division.matches( r )?.length )?.reduce(( a, c ) => a += c, 0 );
				this.display.match.list.empty();
				let matches = division.matches( round );
				let current = matches.find( match => [ match.chung, match.hong ].includes( division.current.athleteId()));

				// Paginate by up to every 4 matches
				let page = {
					start: Math.floor(( current.number - 1 )/ 4 ) * 4,
					stop: matches.length < 4 ? start + matches.length : start + 4
				};
				matches.slice( page.start, page.stop ).forEach( match => {
					let active  = match.number == current.number ? ' active' : '';
					let mid     = `${round}-${match.number}`;
					let mnum    = parseInt( match.number ) + parseInt( start );
					let tdmm    = this.display.match[ mid ];
					if( ! defined( tdmm )) {
						tdmm = this.display.match[ mid ] = {};
					}
					tdmm.all = $( `<div class="match ${round}${active}" data-match-id="${mid}">
							<div class="match-chung"><div class="win"></div><div class="noc"></div><div class="name"></div></div>
							<div class="match-hong"><div class="win"></div><div class="noc"></div><div class="name"></div></div>
							<div class="match-number ${mid}"><div class="number">${mnum}</div></div>
						</div>` );
					this.display.match.list.append( tdmm.all );
					tdmm.chung = { all: tdmm.all.find( '.match-chung' )};
					tdmm.hong  = { all: tdmm.all.find( '.match-hong' )};
					[ 'chung', 'hong' ].forEach( contestant => {
						[ 'win', 'noc', 'name' ].forEach( field => {
							tdmm[ contestant ][ field ] = tdmm[ contestant ].all.find( `.${field}` );
						});
					});
					[ 'chung', 'hong' ].forEach( contestant => {
						let aid = match[ contestant ];
						let dom = tdmm[ contestant ];
						if( ! defined( aid )) {
							dom.name.html( '<i>BYE</i>' );
							dom.noc.empty().hide();
							dom.win.empty().hide();
						} else {
							let athlete = division.athletes().find( athlete => athlete.id() == aid );
							let length  = round == 'ro2' ? 32 : 16;
							let wrap    = round == 'ro2' && athlete.display.name().length > 16;
							dom.name.html( athlete.display.name( length )).css({ 'line-height' : wrap ? '1.2em' : '', 'top' : wrap ? '6px' : '' });
							if( athlete.info( 'noc' )) {
								let flag = ioc.flag( athlete.info( 'noc' ));
								if( flag ) {
									dom.noc.html( `<img src="${flag}">` ).show();
								} else {
									dom.noc.empty().hide();
								}
							} else {
								dom.noc.empty().hide();
							}
							if( match?.winner == aid ) {
								dom.win.html( '&nbsp;' ).show();
							} else {
								dom.win.empty().hide();
							}
						}
					});
				});
			}
		};

		// ===== ADD NETWORK LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'division' )
			.command( 'update' ).respond( update => {
				let division = update?.division ? new Division( update.division ) : null;

				this.refresh.header( division );
				this.refresh.match.list( division );
			});
	}
}
