FreeScore.Widget.SEScoreboard = class FSWidgetSEScoreboard extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );
		const contestants = [ 'chung', 'hong' ];

		this.dom.append( '<div class="header"></div><div class="chung contestant"></div><div class="hong contestant"></div>' );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.header = this.dom.find( '.header' );
		this.display.chung  = { side : this.dom.find( '.chung.contestant' ) };
		this.display.hong   = { side : this.dom.find( '.hong.contestant' ) };

		// ===== ADD STATE
		this.state.division = null;

		// ===== ADD REFRESH BEHAVIOR
		this.refresh = {
			athlete : {
				display : ( division, contestant ) => { // Convention: contestant = 'chung' | 'hong'
					let divid = division.name();
					if( divid == this.state.division?.name ) { return; }

					let tdc  = this.display[ contestant ];
					let tdcs = tdc.side;

					tdcs.empty();
					let noc     = tdc.noc     = $( '<div class="noc"></div>' );
					let name    = tdc.name    = $( '<div class="name"></div>' );
					let athlete = tdc.athlete = $( `<div class="${contestant} athlete"></div>` );
					athlete.append( noc, name );
					tdcs.append( athlete );
					noc.hide();

					let score = tdc.score = $( `<div class="${contestant} score"></div>` );
					let total = tdc.total = $( `<div class="${contestant} total"></div>` );
					tdcs.append( score );

					tdc.judge = [];
					let judges = tdc.judges = $( `<div class="${contestant} judges"></div>` );
					let n = division.judges();
					for( let i = 0; i < n; i++ ) {
						let judge = i == 0 ? 'r' : `j${i}`;
						tdc.judge[ i ] = $( `<div class="court-size-${n} judge ${judge}"></div>` );
						judges.append( tdc.judge[ i ]);
					}
					score.append( judges );
					score.append( total );

					this.state.division = division;
				},
				scores : ( chung, hong ) => {
					let div   = this.state.division;
					let round = div.current.roundId();
					let match = { chung, hong };


					contestants.forEach( contestant => {
						let tdc = this.display[ contestant ];
						tdc.name.empty();
						tdc.noc.empty();
						tdc.judge.forEach( judge => judge.empty());

						let athlete = match[ contestant ];
						if( ! defined( athlete )) {
							tdc.name.html( '<i>BYE</i>' );
							return;
						}

						let flag = ioc.flag( athlete.info( 'noc' ));
						tdc.name.html( athlete.display.name( 18 ));
						tdc.noc.html( `<img src="${flag}">` ).show();
							
					});

					let i = div.current.formId();
					let form = { chung : {}, hong : {} };

					let athletes = { chung, hong };
					Object.entries( athletes ).forEach(([ contestant, athlete ]) => {
						form[ contestant ].score    = defined( athlete ) ? athlete.score( round ).form( i ) : new Score();
						form[ contestant ].complete = form[ contestant ].score.is.complete();
					});

					if( form.chung.complete && form.hong.complete ) {
						// ===== UPDATE JUDGE SCORE ENTRIES
						Object.entries( athletes ).forEach(([ contestant, athlete ]) => {
							if( ! defined( athlete )) { return; }
							let tdc = this.display[ contestant ];
							tdc.judge.forEach(( display, i ) => {
								let judge = form[ contestant ].score.judge( i );
								display.empty();
								if( judge.score.is.complete()) { 
									let ignore = {
										acc : judge.score.ignore.accuracy() ? 'ignore' : '',
										pre : judge.score.ignore.presentation() ? 'ignore' : ''
									};
									display.html( `<div class="accuracy score ${ignore.acc}">${judge.score.accuracy()}</div><div class="presentation score ${ignore.pre}">${judge.score.presentation()}</div>` ); 
								}
							});
						});

						// ===== UPDATE MAIN SCOREBOARD

					} else {
						// ===== MARK JUDGE SCORE ENTRIES AS HAVING BEEN RECEIVED OR PENDING
						Object.entries( athletes ).forEach(([ contestant, athlete ]) => {
							let tdc = this.display[ contestant ];
							tdc.judge.forEach(( display, i ) => {
								let judge = form[ contestant ].score.judge( i );
								display.empty();
								if( judge.is.complete()) { display.html( '<div class="score received">&check;</div>' ); }
							});
						});
					}
				}
			},
			header: division => {
				this.display.header.empty();
				this.display.header.html( `<h1><span class="divid">${division.name().toUpperCase()}</span> &ndash; <span class="description">${division.description()}</span></h1><h2>${division.current.round.display.name()}</h2>` );
			}
		};

		// ===== ADD NETWORK LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'division' )
			.command( 'update' ).respond( update => {
				let division = update?.division ? new Division( update.division ) : null;
				let chung    = division.current.chung();
				let hong     = division.current.hong();

				contestants.forEach( contestant => this.refresh.athlete.display( division, contestant ));
				this.refresh.header( division );
				this.refresh.athlete.scores( chung, hong );
			});
	}
}
