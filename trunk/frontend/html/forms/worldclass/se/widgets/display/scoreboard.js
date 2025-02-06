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
					let total        = tdc.total        = $( `<div class="total"></div>` );
					let penalties    = tdc.penalties    = $( `<div class="penalties"></div>` );
					let subtotals    = tdc.subtotals    = $( '<div class="subtotals"></div>' );
					let sublabels    = tdc.sublabels    = $( '<div class="labels"><div class="accuracy-label">A</div><div class="presentation-label">P</div></div>' );
					let accuracy     = tdc.accuracy     = $( `<div class="accuracy mean"></div>` );
					let presentation = tdc.presentation = $( `<div class="presentation mean"></div>` );
					let labels       = tdc.labels       = $( '<div class="labels"><div class="accuracy-label">A</div><div class="presentation-label">P</div></div>' );
					tdcs.append( score );

					tdc.judge = [];
					let judges = tdc.judges = $( `<div class="${contestant} judges"></div>` );
					let n = division.judges();
					for( let i = 0; i < n; i++ ) {
						let judge = i == 0 ? 'r' : `j${i}`;
						tdc.judge[ i ] = $( `<div class="court-size-${n} judge ${judge}"></div>` );
						judges.append( tdc.judge[ i ]);
					}
					subtotals.append( sublabels, accuracy, presentation );
					report.append( total, penalties, subtotals );
					score.append( judges );
					score.append( report );
					score.append( labels );

					this.state.division = division;
				},
				penalties : form => {
					let map  = { icon: { bounds: 'share-square', restart: 'redo', timelimit: 'clock', misconduct: 'comment-slash' }, name: { bounds: 'Out-of-bounds', restart: 'Restart', timelimit: 'Over time', misconduct: 'Misconduct' }};
					let data = form.penalty().data();
					return Object.keys( data ).sort(( a, b ) => a.localeCompare( b )).map( penalty => {
						let value = precision( data[ penalty ], 1, 0 );
						let icon  = map.icon[ penalty ];
						let name  = map.name[ penalty ];
						if( value == 0 ) { return; }
						if( penalty == 'misconduct' ) {
							return `<div class="penalty"><span class="penalty-icon fas fa-${icon}"></span><span class="penalty-value">&times;${parseInt( value )}</span><br><span class="penalty-name">${name}</span></div>`;
						} else {
							return `<div class="penalty"><span class="penalty-icon fas fa-${icon}"></span><span class="penalty-value">-${value}</span><br><span class="penalty-name">${name}</span></div>`;
						}
					}).join( '' );
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
						form[ contestant ].score    = defined( athlete ) ? athlete.score( round ).form( i ) : new Form();
						form[ contestant ].complete = form[ contestant ].score.is.complete();
					});

					if( form.chung.complete && form.hong.complete ) {
						// ===== UPDATE JUDGE SCORE ENTRIES
						Object.entries( athletes ).forEach(([ contestant, athlete ]) => {
							if( ! defined( athlete )) { return; }
							let tdc = this.display[ contestant ];
							tdc.labels.show();
							tdc.judge.forEach(( display, i ) => {
								let judge = form[ contestant ].score.judge( i );
								display.empty();
								if( judge.score.is.complete()) { 
									let ignore = {
										acc : judge.score.ignore.accuracy() ? 'ignore' : '',
										pre : judge.score.ignore.presentation() ? 'ignore' : ''
									};
									display.html( `<div class="jid">${ i == 0 ? 'R' : 'J' + (i+1)}</div><div class="accuracy score ${ignore.acc}">${judge.score.accuracy()}</div><div class="presentation score ${ignore.pre}">${judge.score.presentation()}</div>` ); 
								}
							});
						});

						// ===== UPDATE SCORE REPORT (COLORED AREA)
						Object.entries( athletes ).forEach(([ contestant, athlete ]) => {
							let tdc = this.display[ contestant ];

							[ 'total', 'penalties', 'accuracy', 'presentation' ].forEach( field => tdc[ field ].empty());

							let fcs          = form[ contestant ].score;
							let total        = precision( fcs.adjusted().total, 2, '&ndash;' );
							let penalties    = this.refresh.athlete.penalties( fcs );
							let accuracy     = precision( fcs.accuracy());
							let presentation = precision( fcs.presentation());
							let decision     = fcs.decision.awarded();
							if( decision ) { total = decision.code; }

							tdc.sublabels.show();
							tdc.total.html( total );
							tdc.penalties.html( penalties );
							tdc.accuracy.html( accuracy );
							tdc.presentation.html( presentation );

							if( div.form.count() == 1 && match.data.winner == athlete.id()) {
								let other = contestant == 'chung' ? 'hong' : 'chung';
								let tdo   = this.display[ other ];
								tdc.side.addClass( 'win' );
								tdc.penalties.append( '<div class="win-dot"></div>' );
								tdo.side.addClass( 'waiting' );
							}
						});

					} else {
						// ===== SHOW CURRENT AND WAITING ATHLETES
						if( div.current.athleteId() == match.data.chung ) {
							this.display[ 'chung' ].side.addClass( 'active' );
							this.display[ 'hong' ].side.addClass( 'waiting' );
						} else if( div.current.athleteId() == match.data.hong ) {
							this.display[ 'hong' ].side.addClass( 'active' );
							this.display[ 'chung' ].side.addClass( 'waiting' );
						}

						// ===== MARK JUDGE SCORE ENTRIES AS HAVING BEEN RECEIVED OR PENDING
						Object.entries( athletes ).forEach(([ contestant, athlete ]) => {
							let tdc = this.display[ contestant ];
							tdc.labels.hide();
							tdc.sublabels.hide();
							tdc.judge.forEach(( display, i ) => {
								let judge = form[ contestant ].score.judge( i );
								display.empty();
								if( judge.score.is.complete()) { display.html( `<div class="jid">${ i == 0 ? 'R' : 'J' + (i+1)}</div><div class="score received">&check;</div>` ); }
							});
						});
					}
				}
			},
			header: division => {
				let match = division.current.match();
				let start = division.current.matchStart();
				let mnum  = parseInt( match.number ) + start;
				let fnum  = division.form.count() > 1 ? `(${ordinal( parseInt( division.current.formId()) + 1 )} Form)` : '';
				let fname = division.current.form.name();

				this.display.header.empty();
				this.display.header.html( `<h1><span class="divid">${division.name().toUpperCase()}</span> &ndash; <span class="description">${division.description()}</span></h1><h2><span class="round-name">${division.current.round.display.name()}</span> &ndash; <span class="match-number">Match ${mnum}</span> &ndash; <span class="form-name">${fname} ${fnum}</span></h2>` );
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
