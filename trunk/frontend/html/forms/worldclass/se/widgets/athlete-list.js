FreeScore.Widget.SEAthleteList = class FSWidgetSEAthleteList extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.division = { header : $( '#division-header' ) };
		this.display.match    = { list : this.dom };

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
			penalty : {
				icons : ( athlete, round, form ) => {
					let penalties = athlete.penalties( round, form );
					const iconmap = { bounds : 'share-square', restart : 'redo', timelimit : 'clock', misconduct : 'comment-slash' };
					const signmap = { bounds : '-', restart : '-', timelimit : '-', misconduct : '&times;' };
					return Object.keys( iconmap ).map( penalty => {
						if( ! penalties?.[ penalty ] || ! parseFloat( penalties[ penalty ])) { return; }
						let icon  = iconmap[ penalty ];
						let value = penalties[ penalty ];
						let sign  = signmap[ penalty ];
						if( penalty == 'misconduct' && value >= 2 ) {
							alertify.error( `${athlete.name()} has committed 2 misconduct violations and should be disqualified!` );
						}
						return `<span class="athlete-penalty"><span class="fas fa-${icon}"></span>&nbsp;${sign}${value}</span>`;
					}).join( '&nbsp;' );
				}
			}
		};
		this.refresh.division = {
			cache : update => {
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
			}
		};
		this.refresh.match = {
			list : () => {
				let division = this.state.division.shown();
				if( ! defined( division )) { return; }

				// ===== POPULATE THE ATHLETE LIST
				let round = division.current.roundId();
				let start = division.prev.rounds()?.map( r => division.matches( r )?.length )?.reduce(( a, c ) => a += c, 0 );
				this.display.match.list.empty();
				division.matches( round ).forEach( match => {
					let mid  = `${round}-${match.number}`;
					let mnum = parseInt( match.number ) + parseInt( start );
					this.display.match[ mid ] = $( `<div class="list-group-item match-number">Match ${mnum}</div>` );
					this.display.match.list.append( this.display.match[ mid ]);
					match.order.forEach( aid => {
						let athlete   = new Athlete( division.data().athletes[ aid ]);
						let score     = athlete.score( round ); 
						let form      = division.current.formId();
						let button    = html.a.clone().addClass( "list-group-item" ).attr({ 'data-athlete-id' : aid });
						let name      = html.span.clone().addClass( "athlete-name" ).append( athlete.name() );
						let penalties = html.span.clone().addClass( "athlete-penalties" ).html( this.refresh.athlete.penalty.icons( athlete, round, form ));
						let total     = html.span.clone().addClass( "athlete-score" ).append( score.summary() );
						let current   = parseInt( division.current.athleteId());
						let k         = division.current.formId();
						let id        = athlete.id();
						let shown     = division.name() == this.state.division.show;

						if( match.order.includes( current )) { this.display.match[ mid ].addClass( 'active' ); } else { this.display.match[ mid ].removeClass( 'active' ); }
						if(      match.chung == id ) { button.addClass( 'chung' ); }
						else if( match.hong  == id ) { button.addClass( 'hong' ); }

						// ===== CURRENT ATHLETE
						if( id == current && shown ) { 
							button.addClass( "active" ); 
							button.off( 'click' ).click(( ev ) => { 
								this.sound.prev.play();
								this.event.trigger( 'athlete-deselect' );
							});

						// ===== ATHLETE IN CURRENT DIVISION
						} else if( shown ) {
							button.off( 'click' ).click(( ev ) => { 
								var target = $( ev.target );
								if( ! target.is( 'a' )) { target = target.parents( 'a' ); }
								this.sound.next.play(); 
								this.display.match.list.find( '.list-group-item' ).removeClass( 'selected-athlete' ); 
								target.addClass( 'selected-athlete' ); 
								this.event.trigger( 'athlete-select', { aid : target.attr( 'data-athlete-id' )});
							});

						// ===== ATHLETE IN ANOTHER DIVISION
						} else {
							button.off( 'click' );
						}
						button.append( name, penalties, total );
						this.display.match.list.append( button );
					});
				});
			}
		};

		this.refresh.ring = {
			cache : update => {
				let ring = update?.ring;
				if( ! defined( ring )) { return; }

				let divisions = ring?.divisions;
				if( ! defined( divisions )) { return; }

				this.state.divisions = divisions;
			}
		};

		// ===== ADD NETWORK LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'ring' )
			.command( 'update' ).respond( update => { 
				this.refresh.ring.cache( update );

				if((! this.state.division.show) && this.app.page.num == 2 ) {
					this.app.page.transition();
				}
				this.refresh.match.list();       
			})
		.heard( 'division' )
			.command( 'update' ).respond( update => {
				this.refresh.division.cache( update );
				let division = update?.division;

				// Refresh the athlete list if this is the division being shown;
				// otherwise simply update in the background.
				if( division?.name != this.state.division.show ) { return; }
				this.refresh.match.list();
			});

		// ===== ADD EVENT LISTENER/RESPONSE HANDLERS
		this.event
			.listen( 'athlete-deselect' )
				.respond(( type, source, message ) => {
					this.display.match.list.find( '.list-group-item' ).removeClass( 'selected-athlete' ); 
				})
			.listen( 'division-show' )
				.respond(( type, source, message ) => {
					this.state.division.show = message.divid;
					this.refresh.match.list();
				});
	}
}
