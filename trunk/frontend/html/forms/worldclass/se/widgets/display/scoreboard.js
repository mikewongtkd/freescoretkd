FreeScore.Widget.SEMatchList = class FSWidgetSEMatchList extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );
		const contestants = [ 'chung', 'hong' ];

		this.dom.append( '<div class="score chung"></div><div class="score hong"></div>' );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.chung = { score : this.dom.find( '.chung.score' ) };
		this.display.hong  = { score : this.dom.find( '.hong.score' ) };

		// ===== ADD STATE
		this.state.division = null;

		// ===== ADD REFRESH BEHAVIOR
		this.refresh = {
			athlete : {
				display : ( division, contestant ) => {
					let divid = division.name();
					if( divid == this.state.division.name ) { return; }

					let tdcs = this.display[ contestant ].score;

					tdcs.empty();
					let name = this.display[ contestant ].name = $('<div class="name"></div>' );
					let noc  = this.display[ contestant ].noc  = $('<div class="noc"></div>' );
					tdcs.append( name, noc );
					noc.hide();

					tdcs.judge = [];
					let n = division.judges();
					for( let i = 0; i < n; i++ ) {
						let judge = i == 0 ? 'r' : `j${i}`;
						tdcs.judge[ i ] = $( `<div class="${n}-judges judge ${judge}"></div>` );
						tdcs.append( tdcs.judge[ i ]);
					}

					this.state.division = division;
				},
				scores : ( chung, hong ) => {
					let div   = this.state.division;
					let round = div.current.roundId();
					let match = { chung, hong };

					tdc.name.empty();
					tdc.noc.empty();
					tdc.judge.forEach( judge => judge.empty());

					contestants.forEach( contestant => {
						let athlete = match[ contestant ];
						if( ! defined( athlete )) {
							tdc.name.html( '<i>BYE</i>' );
							return;
						}

						let tdc  = this.display[ contestant ];
						let flag = ioc.flag( athlete.info( noc ));
						tdc.name.html( athlete.display.name( 18 ));
						tdc.noc.html( `<img src="${flag}">` ).show();
							
					});

					let complete = {
						chung: ! defined( chung ) || chung.score( round ).is.complete(),
						hong:  ! defined( hong )  || hong.score( round ).is.complete()
					};

					if( complete.chung && complete.hong ) {
					}
				}
			},
			
		};

		// ===== ADD NETWORK LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'division' )
			.command( 'update' ).respond( update => {
				let division = update?.division ? new Division( update.division ) : null;
				let chung    = division.current.chung();
				let hong     = division.current.hong();

				contestants.forEach( contestant => this.refresh.athlete.display( division, contestant ));
				this.refresh.athlete.scores( chung, hong );
			});
	}
}
