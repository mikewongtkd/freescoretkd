FreeScore.Widget.SEScoreboard = class FSWidgetSEScoreboard extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );
		const contestants = [ 'chung', 'hong' ];

		this.dom.append( '<div class="header"></div><div class="score chung"></div><div class="score hong"></div>' );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.chung = { score : this.dom.find( '.chung.score' ) };
		this.display.hong  = { score : this.dom.find( '.hong.score' ) };

		// ===== ADD STATE
		this.state.division = null;

		// ===== ADD REFRESH BEHAVIOR
		this.refresh = {
			athlete : {
				display : ( division, contestant ) => { // Convention: contestant = 'chung' | 'hong'
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

					let i = division.current.formId();
					let form = { chung : {}, hong : {} };

					let athletes = { chung, hong };
					Object.entries( athletes ).forEach(([ contestant, athlete ]) => {
						form[ contestant ].score    = defined( athlete ) ? athlete.score( round ).form( i );
						form[ contestant ].complete = form[ contestant ].score.is.complete();
					});

					if( form.chung.complete && form.hong.complete ) {
						// ===== UPDATE JUDGE SCORE ENTRIES
						Object.entries( athletes ).forEach(([ contestant, athlete ]) => {
							if( ! defined( athlete )) { return; }
							let tdcs = this.display[ contestant ].score;
							tdcs.judge.forEach(( display, i ) => {
								let judge = form[ contestant ].score.judge( i );
								display.empty();
								if( judge.is.complete()) { 
									let ignore = {
										acc : judge.score.ignore.accuracy() ? 'ignore' : '',
										pre : judge.score.ignore.presentation() ? 'ignore' : ''
									};
									display.html( `<div class="accuracy score ${ignore.acc}">${judge.score.accuracy()}</div><div class="presentation score ${ignore.pre}">${judge.score.presentation}</div>` ); 
								}
							});
						});

						// ===== UPDATE MAIN SCOREBOARD

					} else {
						// ===== MARK JUDGE SCORE ENTRIES AS HAVING BEEN RECEIVED OR PENDING
						Object.entries( athletes ).forEach(([ contestant, athlete ]) => {
							let tdcs = this.display[ contestant ].score;
							tdcs.judge.forEach(( display, i ) => {
								let judge = form[ contestant ].score.judge( i );
								display.empty();
								if( judge.is.complete()) { display.html( '<div class="score received">&check;</div>' ); }
							});
						});
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
