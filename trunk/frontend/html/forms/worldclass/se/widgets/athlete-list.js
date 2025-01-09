FreeScore.Widget.SEAthleteList = class FSWidgetSEAthleteList extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.division = { header : $( '#division-header' ) };
		this.display.athlete  = { list : this.dom };

		// ===== ADD STATE
		this.state.division  = { show : null };
		this.state.divisions = [];
		this.state.division.shown = () => {
			if( $.cookie( 'divid' )) { this.state.division.show = $.cookie( 'divid' ); }
			let division = this.state.divisions.find( div => div.name == this.state.division.show );
			if( ! defined( division )) { return undefined; }
			return new Division( division );
		}

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.athlete = {
			list : () => {
				let division = this.state.division.shown();
				if( ! defined( division )) { return; }

				// ===== POPULATE THE ATHLETE LIST
				let round = division.current.roundId();
				this.display.athlete.list.empty();
				division.current.athletes( round ).forEach(( athlete, aid ) => {
					let score     = athlete.score( round ); 
					let button    = html.a.clone().addClass( "list-group-item" ).attr({ 'data-athlete-id' : aid });
					let name      = html.span.clone().addClass( "athlete-name" ).append( athlete.name() );
					let penalties = html.span.clone().addClass( "athlete-penalties" ).append( athlete.penalties( round, division.current.formId() ) /* iconize( athlete.penalties( round, n )) */ );
					let total     = html.span.clone().addClass( "athlete-score" ).append( score.summary() );
					let current   = parseInt( division.current.athleteId());
					let k         = division.current.formId();
					let id        = athlete.id();
					let shown     = division.name() == this.state.division.show;

					// ===== CURRENT ATHLETE
					if( id == current && shown ) { 
						button.addClass( "active" ); 
						button.off( 'click' ).click(( ev ) => { 
							this.display.athlete.list.find( '.list-group-item' ).removeClass( 'selected-athlete' ); 
							this.event.trigger( 'athlete-deselect' );
						});

					// ===== ATHLETE IN CURRENT DIVISION
					} else if( shown ) {
						if( id == division.next.athleteId() ) { button.addClass( "on-deck" ); } // Athlete on deck
						button.off( 'click' ).click(( ev ) => { 
							var target = $( ev.target );
							if( ! target.is( 'a' )) { target = target.parents( 'a' ); }
							this.sound.next.play(); 
							this.display.athlete.list.find( '.list-group-item' ).removeClass( 'selected-athlete' ); 
							target.addClass( 'selected-athlete' ); 
							this.event.trigger( 'athlete-select', { aid : target.attr( 'data-athlete-id' )});
						});

					// ===== ATHLETE IN ANOTHER DIVISION
					} else {
						button.off( 'click' );
					}
					button.append( name, penalties, total );
					this.display.athlete.list.append( button );
				});

			}
		}

		// ===== ADD NETWORK LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'ring' )
			.command( 'update' ).respond( update => { 
				let ring = update?.ring;
				if( ! defined( ring )) { return; }

				let divisions = ring?.divisions;
				if( ! defined( divisions )) { return; }

				this.state.divisions = divisions;
				if((! this.state.division.show) && this.app.page.num == 2 ) {
					this.app.page.transition();
				}
				this.refresh.athlete.list();       
			})
		.heard( 'division' )
			.command( 'update' ).respond( update => {
				let division = update?.division;
				if( ! defined( division )) { return; }
				
				// Update the cache
				let found = this.state.divisions.findIndex( div => div.name == division.name );
				if( found < 0 ) { 
					// Not in the cache -> add the division to the cache
					this.state.divisions.push( division ); 
				} else {
					// In the cache -> replace the existing entry
					this.state.divisions.splice( found, 1, division );
				}

				// Refresh the athlete list if this is the division being shown;
				// otherwise simply update in the background.
				if( division.name != this.state.division.show ) { return; }
				this.refresh.athlete.list();
			})

		// ===== ADD EVENT LISTENER/RESPONSE HANDLERS
		this.event
			.listen( 'division-show' )
				.respond(( type, source, message ) => {
					this.state.division.show = message.divid;
					this.refresh.athlete.list();
				});
	}
}
