FreeScore.Widget.SEDecision = class FSWidgetDecision extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="decision">
			<h4>Decision</h4>
			<div class="list-group">
				<button class="list-group-item decision-button" id="winner"><span class="fas fa-trophy"></span> Winner</button>
			</div>
			<div class="list-group">
				<button class="list-group-item decision-button" id="withdraw"><span class="fas fa-user-minus"></span> Withdraw</button>
				<button class="list-group-item decision-button" id="disqualify"><span class="fas fa-user-times"></span> Disqualify</button>
				<button class="list-group-item decision-button" id="clear-decision"><span class="fas fa-times-circle"></span> Clear Decisions</button>
			</div>
		</div>

		` );

		// ===== RECORD WIDGET STATE
		this.state.notified = [];
		this.state.notify = message => {
			if( this.state.notified.includes( message )) { return; }
			alertify.notify( message );
			this.state.notified.push( message );
		}

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.button.withdraw   = this.dom.find( '#withdraw' );
		this.button.disqualify = this.dom.find( '#disqualify' );
		this.button.winner     = this.dom.find( '#winner' );
		this.button.clear      = this.dom.find( '#clear-decision' );
		this.display.all       = this.dom.find( '.decision' );

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.buttons = division => {
			let athlete = division.current.athlete();
			let current = division.current.athleteId();
			let round   = division.current.roundId();
			let form    = division.current.formId();
			let match   = division.current.match();
			let mnum    = division.current.matchNumber();
			let method  = division.current.method();

			if([ match.chung, match.hong ].some( athlete => ! defined( athlete ))) {
				this.button.winner.parent().show();
				this.state.notify( `Match ${mnum} is uncontested. Press the <i>Winner</i> decision button to award the win to ${athlete.name()}.` );

				this.button.winner.off( 'click' ).click( ev => {
					this.network.send({ type: 'division', action: 'award min score' });
					this.sound.ok.play();
					alertify.success( `${athlete.name()} has been awarded a minimum score` );
				});
			} else {
				this.button.winner.parent().hide();
			}

			let action = { withdraw : 'has <b>Withdrawn (WDR)</b>', disqualify : 'has been <b>Disqualified (DSQ)</b>' };
			[ 'withdraw', 'disqualify' ].forEach( decision => {
				this.button?.[ decision ]?.off( 'click' )?.click( ev => {
					this.sound.next.play();
					if( method == 'cutoff' || method == 'se' ) {
						let dialog = {
							title : `${decision.capitalize()} ${athlete.name()}?`,
							message : `Click <b>OK</b> to ${decision} ${athlete.name()} or <b>Cancel</b> to do nothing.`,
							ok : () => {
							this.sound.ok.play();
							this.network.send({ type: 'division', action: 'award punitive', decision, athlete_id: current });
							alertify.error( `${athlete.name()} ${action?.[ decision ]}` );
							},
							cancel : () => { this.sound.prev.play(); }
						};
						alertify.confirm( dialog.title, dialog.message, dialog.ok, dialog.cancel );

					} else if( method == 'sbs' ) {
						let callback = aid => {
							this.sound.ok.play();
							this.network.send({ type: 'division', action: 'award punitive', decision, athlete_id: aid });
							let athlete = division.athlete( aid );
							alertify.error( `${athlete.name()} ${action?.[ decision ]}` );
						};
						this.app.modal.selectContestant.refresh( division, decision, '', callback );
					}
				});
			});

			this.button.clear.off( 'click' ).click( ev => {
				if( method == 'cutoff' || method == 'se' ) {
					this.sound.ok.play();
					this.network.send({ type: 'division', action: 'award punitive', decision: 'clear', athlete_id: current });
					alertify.success( `${athlete.name()} has been <b>cleared of decisions</b>` );

				} else if( method == 'sbs' ) {
					let callback = aid => { 
						this.sound.ok.play();
						this.network.send({ type: 'division', action: 'award punitive', decision: 'clear', athlete_id: aid });
						let athlete = division.athlete( aid );
						alertify.success( `${athlete.name()} has been <b>cleared of decisions</b>` );
					};
					this.app.modal.selectContestant.refresh( division, 'clear decisions for', '', callback );
				}
			});
		}

		// ===== ADD NETWORK LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'ring' )
			.command( 'update' )  
				.respond( update => {
					let division = this.app.state.current.division;
					if( ! defined( division )) { return; }

					division = new Division( division );
					this.refresh.buttons( division );
					this.display.all.show();
				})
		.heard( 'division' )
			.command( 'update' )  
				.respond( update => {
					let division = update?.division;
					if( ! defined( division )) { return; }

					division = new Division( division );
					this.refresh.buttons( division );
					this.display.all.show();
				});

		// ===== ADD EVENT LISTENER/RESPONSE HANDLERS
		this.event
			.listen( 'division-show' )
				.respond(( type, source, message ) => {
					if( message.divid == message.current ) {
						this.display.all.show();
					} else {
						this.display.all.hide();
					}
				})
			.listen( 'athlete-select' )
				.respond(( type, source, message ) => {
					this.display.all.hide();
				})
			.listen( 'athlete-deselect' )
				.respond(( type, source, message ) => {
					this.display.all.show();
				});

	}
}
