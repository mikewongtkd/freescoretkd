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
			division : this.dom.find( '.navigate-division a' ),
			round    : this.dom.find( '.navigate-round a' ),
		};
		this.display.nav      = {
			division : this.dom.find( '.navigate-division' ),
			round    : this.dom.find( '.navigate-round' )
		};

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.nav = {
			division : divid => {
				this.button.score.off( 'click' ).click( ev => { 
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
				if( typeof rounds == 'object' ) { rounds = Object.keys( rounds ); }

				// If rounds not defined, assume cutoff method with appropriate rounds
				if( ! defined( rounds )) {
					if( defined( division?.order )) {
						rounds = new Set( Object.keys( division.order ));
						if(      rounds.has( 'prelim' )) { rounds.add( 'semfin' ); rounds.add( 'finals' ); } 
						else if( rounds.has( 'semfin' )) { rounds.add( 'finals' ); }
						rounds = [ ...rounds ];

					} else if( defined( division?.round )) {
						rounds = [ division?.round ];

					} else {
						this.button.nav.round.addClass( 'disabled' );
						alertify.error( `Round is not defined for division ${div?.name?.toUpperCase()}` );
						return;
					}
				}
				let i = rounds.findIndex( div => div.name == division?.round );
				this.button.nav.round.removeClass( 'disabled' );

				if( i == -1 ) {
					this.button.nav.round.addClass( 'disabled' );
					alertify.error( `Current round ${division?.round} not found` );
					return;

				} else if( i == 0 ) {
					this.button.previous.addClass( 'disabled' );
					this.button.previous.off( 'click' );

				} else if( i == (rounds.length - 1)) {
					this.button.next.addClass( 'disabled' );
					this.button.next.off( 'click' );
				}

				function navigate_to_round( target ) {
					let round = target == 'next' ? rounds[ i + 1 ] : rounds[ i - 1 ];
					this.sound?.[ target ]?.play();
					this.network.send({ type: 'division', action: 'navigate', target: { destination: 'round', round }} ); 
				}

				if( ! this.button.previous.hasClass( 'disabled' )) { navigate_to_round( 'previous' ); }
				if( ! this.button.next.hasClass( 'disabled' ))     { navigate_to_round( 'next' ); }
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
		this.event.listen( 'division-show', ( type, source, message ) => {
			let division = this.app.state.divisions?.find( div => div.name == message.divid );

			if( message.divid == message.current ) {
				this.display.nav.division.hide();
				if( defined( division )) {
					this.refresh.nav.round( division );
					this.display.nav.round.show();

				} else {
					alertify.error( `Division ${message.divid.toUpperCase()} not found in App division cache` );
					this.display.nav.round.hide();
				}
			} else {
				this.refresh.nav.division( message.divid );
				this.display.nav.division.show();
				this.display.nav.round.hide();
			}
		});
	}
}
