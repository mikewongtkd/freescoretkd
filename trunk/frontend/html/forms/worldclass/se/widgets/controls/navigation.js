FreeScore.Widget.SENavigation = class FSWidgetNavigation extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="navigate-division">
			<h4>Division</h4>
			<div class="list-group">
				<a class="list-group-item" id="navigate-division"><span class="glyphicon glyphicon-play"></span><span id="navigate-division-label">Start Scoring this Division</span></a>
			</div>
		</div>

		<div class="navigate-athlete">
			<h4>Athlete</h4>
			<div class="list-group">
				<a class="list-group-item" id="navigate-athlete"><span class="glyphicon glyphicon-play"></span><span id="navigate-athlete-label">Start Scoring this Athlete</span></a>
			</div>
		</div>

		<div class="navigate-round">
			<h4>Round</h4>
			<div class="btn-group btn-group-justified">
				<a class="btn btn-primary" id="navigate-prev-round">Previous</a>
				<a class="btn btn-primary" id="navigate-next-round">Next</a>
			</div>
		</div>

		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.button.previous  = this.dom.find( '#navigate-prev-round' );
		this.button.next      = this.dom.find( '#navigate-next-round' );
		this.button.score     = this.dom.find( '#navigate-division' );
		this.button.nav       = {
			athlete  : this.dom.find( '.navigate-athlete a' ),
			division : this.dom.find( '.navigate-division a' ),
			round    : this.dom.find( '.navigate-round a' ),
		};
		this.display.nav      = {
			athlete  : this.dom.find( '.navigate-athlete' ),
			division : this.dom.find( '.navigate-division' ),
			round    : this.dom.find( '.navigate-round' )
		};
		this.display.label    = {
			division : this.dom.find( '#navigate-division-label' ),
			athlete  : this.dom.find( '#navigate-athlete-label' )
		};

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.nav = {
			athlete : ( athlete ) => {
				this.display.label.athlete.html( `Start Scoring for ${athlete.name}` );
			},
			division : divid => {
				this.button.score.off( 'click' ).click( ev => { 
					this.display.label.division.html( `Start Scoring Division ${divid.toUpperCase()}` );
					this.sound.ok.play(); 
					this.network.send({ type: 'division', action: 'navigate', target: { destination: 'division', divid }} ); 
					if( ring == 'staging' ) { 
						alertify.success( "Transferred division from staging to ring. Starting to score division." ); 
						setTimeout( function() { location.reload(); }, 3000 );
					}
				})
			},
			round : division => {
				// ===== GET ROUNDS
				let rounds = division?.rounds;
				let order  = division?.order;

				let i = rounds.findIndex( round => round == division?.round );
				this.button.nav.round.removeClass( 'disabled' );

				if( i == -1 ) {
					this.button.nav.round.addClass( 'disabled' );
					alertify.error( `Navigation Widget: Current round ${division?.round} not found` );
					return;
				} 

				if( i == 0 ) {
					this.button.previous.addClass( 'disabled' );
					this.button.previous.off( 'click' );

				} 

				if( i == (rounds.length - 1) || division?.flight ) {
					this.button.next.addClass( 'disabled' );
					this.button.next.off( 'click' );
				}

				if( ! this.button.previous.hasClass( 'disabled' )) { 
					let round = rounds[ i - 1 ];
					if( round in order ) {
						this.button.previous.off( 'click' ).click( ev => {
							this.sound.prev.play();
							this.network.send({ type: 'division', action: 'navigate', target: { destination: 'round', round }});
						});
					} else {
						this.button.previous.addClass( 'disabled' );
						this.button.previous.off( 'click' );
					}
				}

				if( ! this.button.next.hasClass( 'disabled' ))     { 
					let round = rounds[ i + 1 ];
					if( round in order ) {
						this.button.next.off( 'click' ).click( ev => {
							this.sound.next.play();
							this.network.send({ type: 'division', action: 'navigate', target: { destination: 'round', round }});
						});
					} else {
						this.button.next.addClass( 'disabled' );
						this.button.next.off( 'click' );
					}
				}
			}
		};

		// ===== ADD LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'ring' )
			.command( 'update' )  
				.respond( update => { 
					let ring     = update?.ring;
					let division = ring?.divisions?.find( div => div.name == ring?.current );
					if( ! defined( division )) { return; }
					this.refresh.nav.round( division );       
				})
		.heard( 'division' )
			.command( 'update' )
				.respond( update => {
					let division = update?.division;
					if( ! defined( division )) { return; }
					this.refresh.nav.round( division );       
				});

		// ===== ADD EVENT LISTENER/RESPONSE HANDLERS
		this.event
		.listen( 'division-show' )
			.respond(( type, source, message ) => {
				let division = this.app.state.divisions?.find( div => div.name == message.divid );

				if( message.divid == message.current ) {
					this.display.nav.division.hide();
					this.display.nav.athlete.hide();

					if( defined( division )) {

						this.refresh.nav.round( division );

						if( this.button.next.hasClass( 'disabled' ) && this.button.previous.hasClass( 'disabled' )) {
							this.display.nav.round.hide();
						} else {
							this.display.nav.round.show();
						}

					} else {
						alertify.error( `Division ${message.divid.toUpperCase()} not found in App division cache` );
						this.display.nav.round.hide();
					}
				} else {
					this.refresh.nav.division( message.divid );
					this.display.nav.division.show();

					this.display.nav.athlete.hide();
					this.display.nav.round.hide();
				}
			})
		.listen( 'athlete-select' )
			.respond(( type, source, message ) => {
				let division = this.app.state.current.division;
				let athlete  = division.athletes[ message.aid ];
				this.refresh.nav.athlete( athlete );
				this.display.nav.athlete.show();
			})
		.listen( 'athlete-deselect' )
			.respond(( type, source, message ) => {
				this.display.nav.athlete.hide();
			});
	}
}
