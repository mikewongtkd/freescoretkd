FreeScore.Widget.SBSJudgeAccuracy = class FSWidgetSBSJudgeAccuracy extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );
		const cat = { acc: [ 'minor', 'major' ], pre: [ 'power', 'rhythm', 'ki' ]};

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.header = this.dom.find( '.header' );
		this.display.chung  = { side: this.dom.find( '.chung.accuracy' )};
		this.display.hong   = { side: this.dom.find( '.hong.accuracy' )};
		this.display.common = { elements: this.dom.find( '.common' )};
		this.display.items  = { header: [], body: []};
		this.button.common  = {};
		this.button.chung   = {};
		this.button.hong    = {};

		// ===== ADD STATE
		this.state.division  = { show : null };

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.match = division => {
			let match    = division.current.match();
			let chung    = defined( match.chung ) ? division.athlete( match.chung ) : null;
			let hong     = defined( match.hong )  ? division.athlete( match.hong )  : null;
			let athletes = { chung, hong };

			Object.entries( athletes ).forEach(([ contestant, athlete ]) => {
				let tdc  = this.display[ contestant ];

				// ===== ATHLETE INFO
				let info = {
					all: $( '<div class="athlete"></div>' ),
					name: $( '<div class="name"></div>' ),
					noc: $( '<div class="noc"></div>' )
				};

				info.all.empty().append( info.name, info.noc );
				tdc.side.empty().append( info.all );
				if( defined( athlete )) {
					info.name.html( athlete.display.name( 16 ));
					let noc = athlete.info( 'noc' );
					if( defined( noc )) {
						let flag = ioc.flag( noc );
						info.noc.html( `<img src="${flag}">` );
						info.noc.show();
					} else {
						info.noc.hide();
					}
				} else {
					info.name.html( '<i>BYE</i>' );
					info.noc.hide();
					return;
				}

				// ===== SCORE SUMMARY
				let score = {
					all: $( '<div class="score"></div>' ),
					total: $( '<div class="total"></div>' ),
					subtotal: {
						accuracy:     $( '<div class="accuracy subtotal"></div>' ),
						presentation: $( '<div class="presentation subtotal"></div>' )
					}
				};
				score.all.append( score.total, score.subtotal.accuracy, score.subtotal.presentation );
				tdc.score = score;
				tdc.side.append( score.all );

				// ===== ACCURACY BUTTONS
				let tbc = this.button[ contestant ];
				let button = {
					panel : $( '<div class="accuracy buttons"></div>' ),
					add: {
						major: $( '<a class="btn btn-major add">-0.3</a>' ),
						minor: $( '<a class="btn btn-minor add">-0.1</a>' )
					},
					remove: {
						major: $( '<a class="btn btn-major remove">+0.3</a>' ),
						minor: $( '<a class="btn btn-minor remove">+0.1</a>' )
					}
				};
				
				button.panel.append( button.remove.major, button.add.major, button.add.minor, button.remove.minor );
				tbc.score = button;
				tdc.side.append( button.panel );

				// ===== DISPLAY ITEMS WITH ADJUSTABLE FONTS
				this.display.items.body = [ 
					info.name,
					score.total, score.subtotal, 
					button.add.major, button.add.minor, button.remove.major, button.remove.minor
				];

				// ===== DEDUCTION BUTTON BEHAVIOR
				[ 'add', 'remove' ].forEach( action => {
					[ 'major', 'minor' ].forEach( deduction => {
						tbc.score[ action ][ deduction ].off( 'click' ).click( ev => {
							let value = deduction == 'minor' ? 0.1 : 0.3;
							let acc   = this.app.state.score[ contestant ];
							let score = cat.acc.map( category => acc[ category ]).reduce(( acc, cur ) => acc + cur, 0 );
							if( action == 'add' ) {
								if( (score + value) < 4.0 ) { acc[ deduction ] += value; }
								else { acc[ deduction ] = deduction == 'minor' ? 4.0 - acc.major : 4.0 - acc.minor; }
							} else {
								if( acc[ deduction ] >= value ) {
									acc[ deduction ] -= value;

								} else if( (score - value) > 0.0 ) { 
									let remainder = value - acc[ deduction ];
									acc[ deduction ] = 0;
									deduction == 'minor' ? acc.major -= remainder : acc.minor -= remainder;

								} else { 
									acc.major = 0.0; 
									acc.minor = 0.0; 
								}
							}
							acc[ deduction ] = parseFloat( acc[ deduction ].toFixed( 1 ));
							this.refresh.score();
							this.app.state.save();
						});
					});
				});
			});
		},
		this.refresh.common = division => {
			let start = division.current.matchStart();
			let match = division.current.match();
			let i     = division.current.formId();
			let forms = division.current.form.list();
			let form  = forms[ i ] + (i > 0 ? ` (${ordinal( i + 1 )} form)` : '');

			this.display.header.html( `<div class="div-summary"><span class="divid">${division.name().toUpperCase()}</span> &ndash; <span class="description">${division.description()}</span></div><div class="match-summary"><span class="round-name">${division.current.round.name()}</span> &ndash; <span class="match-number">Match ${match.number + start}</span> &ndash; <span class="form-name">${form}</span></div>` );

			let jname  = this.app.state.current.judge == 0 ? 'R' : `J${this.app.state.current.judge}`;
			let config = this.button.common.config = $( `<a class="btn config btn-config"><span class="fas fa-cog"></span></a>` );
			let next   = this.button.common.next = $( `<a class="btn next btn-next">Next <span class="fas fa-arrow-right"></span></a>` );
			let jid    = this.display.common.jid = $( `<div class="jid">${jname}</div>` );

			this.display.common.elements.append( config, next, jid );

			this.display.items.header = [ this.display.header ];

			// ===== ADD BUTTON BEHAVIOR
			this.button.common.config.off( 'click' ).click( ev => {
				this.app.modal.display.config.show();
			});
			this.button.common.next.off( 'click' ).click( ev => {
				this.app.page.show.presentation();
				this.app.state.save();
			});
		};
		this.refresh.score = () => {
			let sum = (score, categories) => parseFloat( categories.map( category => score[ category ]).reduce(( acc, cur ) => acc + cur, 0 ).toFixed( 1 ));
			[ 'chung', 'hong' ].forEach( contestant => {
				let tdc      = this.display[ contestant ];
				let score    = this.app.state.score[ contestant ];
				let subtotal = {
					accuracy: 4.0 - sum( score, cat.acc ),
					presentation: cat.pre.some( category => score[ category ] < 0.5 ) ? '&ndash;' : sum( score, cat.pre )
				};
				let total = isNaN( subtotal.presentation ) ? '&ndash;' : ( subtotal.accuracy + subtotal.presentation).toFixed( 1 );
				[ 'accuracy', 'presentation' ].forEach( category => subtotal[ category ] = isNaN( subtotal[ category ]) ? subtotal[ category ] : subtotal[ category ].toFixed( 1 ));
				tdc.score?.total?.html( `<label>Total</label>${total}` );
				tdc.score?.subtotal?.accuracy?.html( `<label>Accuracy</label>${subtotal.accuracy}` );
				tdc.score?.subtotal?.presentation?.html( `<label>Presentation</label>${subtotal.presentation}` );
			});
		};

		this.reset = () => {
			this.display.header.empty();
			this.display.chung.side.empty();
			this.display.hong.side.empty();
			this.display.common.empty();
		};

		// ===== ADD NETWORK LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'division' )
			.command( 'update' ).respond( update => {
				let division = update?.division;

				if( ! defined( division )) { this.reset(); return; }
				division = new Division( division );

				if( update.request.action == 'score' ) { return; }

				this.refresh.common( division );
				this.refresh.match( division );
				this.refresh.score();
			});
	}
}
