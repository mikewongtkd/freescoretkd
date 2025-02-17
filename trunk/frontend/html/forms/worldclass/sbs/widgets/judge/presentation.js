FreeScore.Widget.SBSJudgePresentation = class FSWidgetSBSJudgePresentation extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );
		const cat = { acc: [ 'minor', 'major' ], pre: [ 'power', 'rhythm', 'ki' ]};
		const contestants = [ 'chung', 'hong' ];

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.header = this.dom.find( '.header' );
		this.display.chung  = { side: this.dom.find( '.chung.presentation' ), power: {}, rhythm: {}, ki: {}};
		this.display.hong   = { side: this.dom.find( '.hong.presentation' ), power: {}, rhythm: {}, ki: {}};
		this.display.common = { elements: this.dom.find( '.common' )};
		this.button.common  = {};
		this.button.chung   = { power: {}, rhythm: {}, ki: {}};
		this.button.hong    = { power: {}, rhythm: {}, ki: {}};
		this.slider         = {};
		this.slider.chung   = {};
		this.slider.hong    = {};

		// ===== ADD STATE
		this.state.division  = { show : null };

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.match = division => {
			let match    = division.current.match();
			let chung    = match.chung ? division.athlete( match.chung ) : null;
			let hong     = match.hong  ? division.athlete( match.hong )  : null;
			let athletes = { chung, hong };

			Object.entries( athletes ).forEach(([ contestant, athlete ]) => {
				let tdc  = this.display[ contestant ];

				// ===== ATHLETE INFO
				let info = {
					all: $( '<div class="athlete"></div>' ),
					name: $( '<div class="name"></div>' ),
					noc: $( '<div class="noc"></div>' )
				};

				info.all.append( info.name, info.noc );
				tdc.side.append( info.all );
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

				// ===== PRESENTATION BUTTONS
				let tbc = this.button[ contestant ];
				let tsc = this.slider[ contestant ];
				let button = {
					panel:  $( '<form class="presentation inputs"></form>' ),
					power:  $( `<div class="power"><label>Power</label><div class="display" type="text" /><a class="btn btn-nudge-up"><span class="fas fa-caret-up"></span></a><input id="${contestant}-power-slider" type="text" data-slider-min="0.5" data-slider-max="2.0" data-slider-step="0.1" data-slider-value="0.0" data-slider-orientation="vertical"/><a class="btn btn-nudge-down"><span class="fas fa-caret-down"></span></a></div>` ),
					rhythm: $( `<div class="rhythm"><label>Rhythm</label><div class="display" type="text" /><a class="btn btn-nudge-up"><span class="fas fa-caret-up"></span></a><input id="${contestant}-rhythm-slider" type="text" data-slider-min="0.5" data-slider-max="2.0" data-slider-step="0.1" data-slider-value="0.0" data-slider-orientation="vertical"/><a class="btn btn-nudge-down"><span class="fas fa-caret-down"></span></a></div>` ),
					ki:     $( `<div class="ki"><label>Energy</label><div class="display" type="text" /><a class="btn btn-nudge-up"><span class="fas fa-caret-up"></span></a><input id="${contestant}-ki-slider" type="text" data-slider-min="0.5" data-slider-max="2.0" data-slider-step="0.1" data-slider-value="0.0" data-slider-orientation="vertical"/><a class="btn btn-nudge-down"><span class="fas fa-caret-down"></span></a></div>` ),
				};
				
				button.panel.append( button.power, button.rhythm, button.ki );
				tbc.score = button;
				tdc.side.append( button.panel );

				// ===== INITIALIZE SUBWIDGETS
				cat.pre.forEach( cat => {
					let subwidget = tbc.score[ cat ];
					let display   = tdc[ cat ].value = subwidget.find( '.display' );
					let nudge     = tbc[ cat ].nudge = {
						up:   subwidget.find( '.btn-nudge-up' ),
						down: subwidget.find( '.btn-nudge-down' )
					};
					let slider = tsc[ cat ] = $( `#${contestant}-${cat}-slider` ).slider({ reversed: true })
					slider.getValue = () => slider.slider( 'getValue' );
					slider.setValue = value => slider.slider( 'setValue', value );

					let value = this.app.state.score[ contestant ][ cat ];
					if( value > 0 ) {
						slider.setValue( value );
						display.html( value );
						setTimeout( () => { this.refresh.score(); }, 250 );
					}

				});

				// ===== PRESENTATION UI BEHAVIOR
				cat.pre.forEach( cat => {
					let slider  = tsc[ cat ];
					let display = tdc[ cat ].value;
					let nudge   = { up: tbc[ cat ].nudge.up, down: tbc[ cat ].nudge.down };
					let update  = () => {
						let value = slider.getValue();
						display.html( value.toFixed( 1 ));
						this.app.state.score[ contestant ][ cat ] = value;
						this.app.state.save();
						this.refresh.score();
					}
					slider.off( 'change' ).on( 'change', ev => update());
					nudge.up.off( 'click' ).click( ev => {
						let value = slider.getValue();
						if( value < 2.0 ) { 
							slider.setValue( value + 0.1 ); 
							update();
						}
					});
					nudge.down.off( 'click' ).click( ev => {
						let value = slider.getValue();
						if( value > 0.5 ) { 
							slider.setValue( value - 0.1 ); 
							update();
						}
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

			let jname = this.app.state.current.judge == 0 ? 'R' : `J${this.app.state.current.judge}`;
			let config = this.button.common.config = $( `<a class="btn config btn-config"><span class="fas fa-cog"></span></a>` );
			let back  = this.button.common.back = $( `<a class="btn back btn-back">Back <span class="fas fa-arrow-left"></span></a>` );
			let send  = this.button.common.send = $( `<a class="btn send btn-send">Send <span class="fas fa-check-circle"></span></a>` );
			let jid   = this.display.common.jid = $( `<div class="jid">${jname}</div>` );

			this.display.common.elements.append( config, back, send, jid );

			// ===== ADD BUTTON BEHAVIOR
			this.button.common.config.off( 'click' ).click( ev => {
				this.app.modal.display.config.show();
			});
			this.button.common.back.off( 'click' ).click( ev => {
				this.app.page.show.accuracy();
				this.app.state.save();
			});

			this.button.common.send.off( 'click' ).click( ev => {
				let current = this.app.state.current;
				let score   = this.app.state.score;
				let start   = division.current.matchStart();
				current.score = score;
				let send    = () => {
					let request = { type: 'division', action: 'score', score: { divid: current.divid, match: current.match, form: current.form, chung: current.score.chung, hong: current.score.hong }};
					this.network.send( request );
					alertify.message( `Sending scores for Match ${current.match + start}` );
				};

				// Check for incomplete score
				let incomplete = contestants.find( contestant => cat.pre.some( category => score[ contestant ][ category ] < 0.5 ));
				if( defined( incomplete )) {
					alertify.error( `Please complete scoring presentation for ${incomplete.capitalize()} contestant.` );
					return;
				}

				// Check for perfect score
				let perfect = contestants.find( contestant => cat.acc.every( category => score[ contestant ][ category ] == 0.0 ));
				if( defined( perfect )) {
					alertify.confirm( 
						`${perfect.capitalize()} has 4.0 Accuracy`, 
						`${perfect.capitalize()} contestant has perfect 4.0 accuracy. Is this intended?`, 
						() => { send() }, 
						() => {}
					);
					return;
				}

				// All checks passed
				send();
			});
		};
		this.refresh.score = () => {
			let sum = (score, categories) => parseFloat( categories.map( category => score[ category ]).reduce(( acc, cur ) => acc + cur, 0 ).toFixed( 1 ));
			contestants.forEach( contestant => {
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

				if( update.request.action == 'score' ) {
					let current = this.app.state.current;
					let start   = division.current.matchStart();
					if( update.request.score.judge == current.judge ) { alertify.success( `Score for Match ${current.match + start} successfully sent` ); return; }
					else { return; }
				}

				this.refresh.common( division );
				this.refresh.match( division );
				this.refresh.score();
			});
	}
}
