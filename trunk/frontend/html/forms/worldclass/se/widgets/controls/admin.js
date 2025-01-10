FreeScore.Widget.SEDecision = class FSWidgetDecision extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="decision">
			<h4>Decision</h4>
			<div class="list-group">
				<button class="list-group-item decision-button" id="withdraw"><span class="fas fa-user-minus"></span> Withdraw</button>
				<button class="list-group-item decision-button" id="disqualify"><span class="fas fa-user-times"></span> Disqualify</button>
				<button class="list-group-item decision-button" id="clear-decision"><span class="fas fa-times-circle"></span> Clear Decisions</button>
			</div>
		</div>

		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.button.withdraw   = this.dom.find( '#withdraw' );
		this.button.disqualify = this.dom.find( '#disqualify' );
		this.button.clear      = this.dom.find( '#clear-decision' );
		this.display.all       = this.dom.find( '.decision' );

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.buttons = division => {
			let athlete = division.current.athlete();
			let current = division.current.athleteId();
			let round   = division.current.roundId();
			let form    = division.current.formId();

			this.button.penalize.off( 'click' ).click( ev => { this.refresh.accordion.toggle(); });

			let aname = { bounds : 'an <b>Out of Bounds</b>', restart : 'a <b>Form Restart</b>', timelimit : 'an <b>Over Time</b>', misconduct : 'a <b>Misconduct</b>' };
			[ 'bounds', 'restart', 'timelimit', 'misconduct' ].forEach( penalty => {
				this.button?.[ penalty ]?.off( 'click' )?.click( ev => {
					this.sound.error.play();
					athlete.penalize?.[ penalty ]( round, form );
					this.network.send({ type: 'division', action: 'award penalty', penalties: athlete.penalties( round, form ), athlete_id: current });
					alertify.error( `${athlete.name()} is given ${aname?.[ penalty ]} penalty` );
					this.refresh.accordion.hide();
				});
			});

			this.button.clear.off( 'click' ).click( ev => {
				this.sound.ok.play();
				athlete.penalize.clear( round, form );
				this.network.send({ type: 'division', action: 'award penalty', penalties: athlete.penalties( round, form ), athlete_id: current });
				alertify.success( `${athlete.name()} has been <b>cleared of all penalties</b>` );
				this.refresh.accordion.hide();
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
				})
		.heard( 'division' )
			.command( 'update' )  
				.respond( update => {
					let division = update?.division;
					if( ! defined( division )) { return; }

					division = new Division( division );
					this.refresh.buttons( division );
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
				});


	}
}
