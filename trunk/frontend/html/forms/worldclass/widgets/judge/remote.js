FreeScore.Widget.Remote = class FSWidgetRemote extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="navigate">
			<div class="navigate-label athlete-label">Athlete</div>
			<div class="btn-navigate prev athlete" data-type="division" data-action="athlete prev" data-sound="prev"><span class="fas fa-arrow-left"></span></div><div class="btn-navigate next athlete" data-type="division" data-action="athlete next" data-sound="next"><span class="fas fa-arrow-right"></span></div>

			<div class="navigate-label form-label">Form</div>
			<div class="btn-navigate prev form" data-type="division" data-action="form prev" data-sound="prev">1<sup>st</sup></div><div class="btn-navigate next form" data-type="division" data-action="form next" data-sound="next">2<sup>nd</sup></div>

			<div class="navigate-label form-label">Round</div>
			<div class="btn-navigate prev round" data-type="division" data-action="round prev" data-sound="prev"><span class="fas fa-arrow-left"></span></div><div class="btn-navigate next round" data-type="division" data-action="round next" data-sound="next"><span class="fas fa-arrow-right"></span></div>

			<div class="navigate-label form-label">Division</div>
			<div class="btn-navigate prev division" data-type="ring" data-action="division prev" data-sound="prev"><span class="fas fa-arrow-left"></span></div><div class="btn-navigate next division" data-type="ring" data-action="division next" data-sound="next"><span class="fas fa-arrow-right"></span></div>

			<div class="navigate-label form-label">Display</div>
			<div class="btn-navigate display-mode" data-type="division" data-action="display" data-sound="ok">Leaderboard</div>
		</div>
		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.all     = $( '.navigate' );
		this.button.athlete  = { prev: $( '.btn-navigate.prev.athlete' ),  next: $( '.btn-navigate.next.athlete' )};
		this.button.form     = { prev: $( '.btn-navigate.prev.form' ),     next: $( '.btn-navigate.next.form' )};
		this.button.round    = { prev: $( '.btn-navigate.prev.round' ),    next: $( '.btn-navigate.next.round' )};
		this.button.division = { prev: $( '.btn-navigate.prev.division' ), next: $( '.btn-navigate.next.division' )};
		this.button.mode     = $( '.btn-navigate.display-mode' );
		this.button.navigate = $( '.btn-navigate' );

		this.button.navigate.off( 'click' ).click( ev => {
			let target  = $( ev.target ); target = target.hasClass( 'btn-navigate' ) ? target : target.parents( '.btn-navigate' );
			let type    = target.data( 'type' );
			let action  = target.data( 'action' );
			let sound   = target.data( 'sound' );

			let message = { type, action, judge: this.app.state.current.judge };
			this.network.send( message );

			this.app.sound[ sound ].play();
		});

		this.refresh.buttons = division => {
			let button   = this.button;
			let count    = division.form.count();
			let state    = division.current.state() == 'score' ? 'Score' : 'Leaderboard';
			let disable  = button => button.addClass( 'disabled' );
			let enable   = button => button.removeClass( 'disabled' );
			let rounds   = division.rounds();
			let round    = {
				current: division.current.roundId(),
				first:   rounds.at(  0 ),
				last:    rounds.at( -1 )
			};
			let athletes = division.current.athletes();
			let athlete  = {
				current: division.current.athleteId(),
				first:   athletes.at(  0 ).id(),
				last:    athletes.at( -1 ).id()
			};
			let forms    = division.current.form.list()
			let form     = {
				current: division.current.formId(),
				first:   0,
				last:    forms.length - 1
			};

			if( round.current   == round.first )   { disable( button.round.prev );   } else { enable( button.round.prev ); }
			if( round.current   == round.last )    { disable( button.round.next );   } else { enable( button.round.next ); }
			if( athlete.current == athlete.first ) { disable( button.athlete.prev ); } else { enable( button.athlete.prev ); }
			if( athlete.current == athlete.last )  { disable( button.athlete.next ); } else { enable( button.athlete.next ); }
			if( form.current    == form.first )    { disable( button.form.prev );    } else { enable( button.form.prev ); }
			if( form.current    == form.last )     { disable( button.form.next );    } else { enable( button.form.next ); }

			this.button.mode.html( state );
		};

		// ===== ADD LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'division' )
			.command( 'update' )
				.respond( update => { 
					let division = update?.division;
					if( ! division ) { return; }
					division = new Division( division );

					this.refresh.buttons( division );
				});
	}
}
