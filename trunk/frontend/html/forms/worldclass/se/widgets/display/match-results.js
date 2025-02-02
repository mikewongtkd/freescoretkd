FreeScore.Widget.SEMatchResults = class FSWidgetSEMatchResults extends FreeScore.Widget {
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

		// ===== HELPER FUNCTION
		let precision = ( value, precision = 2, fallback = '' ) => isNaN( parseFloat( value )) ? fallback : parseFloat( value ).toFixed( precision );

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

					let score        = tdc.score        = $( `<div class="${contestant} score"></div>` );
					let report       = tdc.report       = $( `<div class="${contestant} report"></div>` );
					let form1        = tdc.form1        = $( `<div class="form-1"></div>` );
					let form2        = tdc.form2        = $( `<div class="form-2"></div>` );
					let total        = tdc.total        = $( `<div class="total"></div>` );

					tdcs.append( score );

					report.append( total );

					score.append( form1 );
					score.append( form2 );
					score.append( report );

					this.state.division = division;
				},
				scores : ( chung, hong ) => {
					let div   = this.state.division;
					let round = div.current.roundId();
					let match = { chung, hong, data: div.current.match() };

					// ===== RESET DISPLAY AND SHOW ATHLETE INFO
					contestants.forEach( contestant => {
						let tdc = this.display[ contestant ];
						tdc.name.empty();
						tdc.noc.empty();
						tdc.judge.forEach( judge => judge.empty());
						tdc.side.removeClass( 'win active waiting' );

						let athlete = match[ contestant ];
						if( ! defined( athlete )) {
							tdc.name.html( '<i>BYE</i>' );
							return;
						}

						let flag = ioc.flag( athlete.info( 'noc' ));
						tdc.name.html( athlete.display.name( 16 ));
						if( flag ) {
							tdc.noc.html( `<img src="${flag}">` ).show();
						} else {
							tdc.noc.hide();
						}
							
					});

					let i = div.current.formId();
					let form = { chung : {}, hong : {} };
					let athletes = { chung, hong };
					Object.entries( athletes ).forEach(([ contestant, athlete ]) => {
						form[ contestant ].score    = defined( athlete ) ? athlete.score( round ).form( i ) : new Score();
						form[ contestant ].complete = form[ contestant ].score.is.complete();
					});
				}
			},
			header: division => {
				let match = division.current.match();
				let start = division.prev.rounds().map( round => division.matches( round ).length ).reduce(( acc, cur ) => acc + cur, 0 );
				let mnum  = parseInt( match.number ) + start;
				let fnum  = division.form.count() > 1 ? `(${ordinal( parseInt( division.current.formId()) + 1 )} Form)` : '';
				let fname = division.current.form.name();

				this.display.header.empty();
				this.display.header.html( `<h1><span class="divid">${division.name().toUpperCase()}</span> &ndash; <span class="description">${division.description()}</span></h1><h2><span class="round-name">${division.current.round.display.name()}</span> &ndash; <span class="match-number">Match ${mnum} Results</span></h2>` );
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
