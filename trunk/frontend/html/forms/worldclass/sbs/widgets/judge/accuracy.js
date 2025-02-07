FreeScore.Widget.SBSJudgeAccuracy = class FSWidgetSBSJudgeAccuracy extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.header = this.dom.find( '.header' );
		this.display.chung  = { side: this.dom.find( '.chung.accuracy' )};
		this.display.hong   = { side: this.dom.find( '.hong.accuracy' )};
		this.display.common = { elements: this.dom.find( '.common' )};
		this.button.common  = {};
		this.button.chung   = {};
		this.button.hong    = {};

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
					if( athlete.info( 'noc' )) {
						let flag = ioc.flag( athlete.info( 'noc' ));
						info.noc.html( flag );
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
			});
		},
		this.refresh.common = division => {
			let start = division.current.matchStart();
			let match = division.current.match();
			let i     = division.current.formId();
			let forms = division.current.form.list();
			let form  = forms[ i ] + (i > 0 ? ` (${ordinal( i + 1 )} form)` : '');

			this.display.header.html( `<div class="div-summary"><span class="divid">${division.name().toUpperCase()}</span> &ndash; <span class="description">${division.description()}</span></div><div class="match-summary"><span class="round-name">${division.current.round.name()}</span> &ndash; <span class="match-number">Match ${match.number + start}</span> &ndash; <span class="form-name">${form}</span></div>` );

			let jname = this.app.state.current.jid == 0 ? 'R' : `J${this.app.state.current.jid}`;
			let flip  = this.button.common.flip = $( `<a class="btn flip btn-flip"><span class="fas fa-exchange-alt"></span></a>` );
			let next  = this.button.common.next = $( `<a class="btn next btn-next">Next <span class="fas fa-arrow-right"></span></a>` );
			let jid   = this.display.common.jid = $( `<div class="jid">${jname}</div>` );

			this.display.common.elements.append( flip, next, jid );

			// ===== ADD BUTTON BEHAVIOR
			this.button.common.flip.off( 'click' ).click( ev => {
				if( this.dom.hasClass( 'chung-right' )) {
					this.dom.removeClass( 'chung-right' );
					this.dom.addClass( 'chung-left' );
				} else {
					this.dom.removeClass( 'chung-left' );
					this.dom.addClass( 'chung-right' );
				}
			});

			this.button.common.next.off( 'click' ).click( ev => {
				this.event.trigger( 'next', { from: 'accuracy', to: 'presentation' });
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

				this.refresh.common( division );
				this.refresh.match( division );
			});
	}
}
