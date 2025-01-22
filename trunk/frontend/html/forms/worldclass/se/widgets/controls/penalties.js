FreeScore.Widget.SEPenalties = class FSWidgetPenalties extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="penalties">
			<h4>Penalties</h4>
			<div class="list-group">
				<button class="list-group-item penalty-button" id="give-penalty" style="border-radius: 4px;"><span class="fas fa-caret-down"></span> Expand Penalty Menu</button>
				<button class="list-group-item penalty-button show-toggle" style="display:none;" id="out-of-bounds"><span class="fas fa-share-square"></span> Out-of-bounds</button>
				<button class="list-group-item penalty-button show-toggle" style="display:none;" id="restart"      ><span class="fas fa-redo"></span> Restart Form</button>
				<button class="list-group-item penalty-button show-toggle" style="display:none;" id="over-time"    ><span class="fas fa-clock"></span> Over Time</button>
				<button class="list-group-item penalty-button show-toggle" style="display:none;" id="misconduct"   ><span class="fas fa-comment-slash"></span> Misconduct</button>
				<button class="list-group-item penalty-button show-toggle" style="display:none;" id="clear-penalty"><span class="fas fa-times-circle"></span> Clear Penalties</button>
			</div>
		</div>

		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.button.penalize   = this.dom.find( '#give-penalty' );
		this.button.clear      = this.dom.find( '#clear-penalty' );
		this.button.bounds     = this.dom.find( '#out-of-bounds' );
		this.button.restart    = this.dom.find( '#restart' );
		this.button.timelimit  = this.dom.find( '#over-time' );
		this.button.misconduct = this.dom.find( '#misconduct' );
		this.display.all       = this.dom.find( '.penalties' );
		this.display.accordion = this.dom.find( '.show-toggle' );

		// ===== WIDGET STATE
		this.state.penalties = { shown : false };

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.accordion = {
			hide: () => {
				if( ! this.state.penalties.shown ) { return; }
				this.refresh.accordion.menu.max();
				this.sound.prev.play();
				this.display.accordion.hide();
				this.state.penalties.shown = false;
			},
			menu : {
				min : () => {
					this.button.penalize.html( '<span class="fas fa-caret-up"></span> Minimize Penalty Menu' );
					this.button.penalize.css({ 'border-bottom-right-radius': '0', 'border-bottom-left-radius': '0' });
				},
				max : () => {
					this.button.penalize.html( '<span class="fas fa-caret-down"></span> Expand Penalty Menu' );
					this.button.penalize.css({ 'border-bottom-right-radius': '4px', 'border-bottom-left-radius': '4px' });
				}
			},
			show: () => {
				if( this.state.penalties.shown ) { return; }
				this.refresh.accordion.menu.min();
				this.sound.next.play();
				this.display.accordion.show();
				this.state.penalties.shown = true;
			},
			toggle: () => {
				if( this.state.penalties.shown ) {
					this.refresh.accordion.menu.max();
					this.sound.prev.play();
					this.display.accordion.hide();
				} else {
					this.refresh.accordion.menu.min();
					this.sound.next.play();
					this.display.accordion.show();
				}
				this.state.penalties.shown = ! this.state.penalties.shown;
			}
		};

		this.refresh.buttons = division => {
			let athlete = division.current.athlete();
			let current = division.current.athleteId();
			let round   = division.current.roundId();
			let form    = division.current.formId();

			this.button.penalize.off( 'click' ).click( ev => { this.refresh.accordion.toggle(); });

			let aname = { bounds : 'an <b>Out of Bounds</b>', restart : 'a <b>Form Restart</b>', timelimit : 'an <b>Over Time</b>', misconduct : 'a <b>Misconduct</b>' };
			[ 'bounds', 'restart', 'timelimit', 'misconduct' ].forEach( penalty => {
				this.button?.[ penalty ]?.off( 'click' )?.click( ev => {
					this.sound.ok.play();
					athlete.penalize?.[ penalty ]( round, form );
					this.network.send({ type: 'division', action: 'award penalty', penalties: athlete.penalties( round, form ), athlete_id: current });
					alertify.warning( `${athlete.name()} is given ${aname?.[ penalty ]} penalty` );
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
