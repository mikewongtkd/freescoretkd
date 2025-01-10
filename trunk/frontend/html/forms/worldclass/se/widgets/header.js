FreeScore.Widget.SEHeader = class FSWidgetHeader extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.html( `
		<a class="btn btn-warning"><span class="glyphicon glyphicon-menu-left"></span> Back</a> <span id="division-summary"></span>
		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.button.back     = this.dom.find( 'a.btn' );
		this.display.summary = this.dom.find( '#division-summary' );
		this.display.round   = $( '#division-round' );
		this.display.forms   = $( '#current-form' );

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.header = division => {
			let round   = division.round.id();
			let current = division.current.formId();
			this.display.summary.html( division.summary() );
			this.display.round.html( division.current.round.display.name());

			let forms = division.form.list().map(( form, i ) => { 
				return i == current ? `<a class="btn btn-sm btn-primary disabled" data-form-id="${i}">${form}</a>` : form = `<a class="btn btn-sm btn-default navigate-form" data-form-id="${i}" data-navigate="${i}" data-form-name="${form}">${form}</a>`;
			});

			this.display.forms.empty();
			this.display.forms.append( forms );
			this.button.form = this.display.forms.find( '.navigate-form' );
			this.button.form.each(( i, btn ) => {
				let button = $( btn );
				button.off( 'click' ).click(( ev ) => {
					let j    = button.attr( 'data-navigate' );
					let form = button.attr( 'data-form-name' );
					this.sound.next.play();

					let dialog = {
						title : `Start scoring ${ordinal(( parseInt( j ) +1))} form ${form}?`,
						message :`Click <b class="text-danger">OK</b> to start scoring ${form} or <b class="text-warning">Cancel</b> to do nothing.`,
						ok : () => {
							this.network.send({ type : 'division', action : 'navigate', target : { destination: 'form', index: j }});
							this.sound.ok.play();
							alertify.success( `Scoring for ${form}` );

							return true;
						},
						cancel : () => { this.sound.prev.play(); return true; }
					};
					alertify.confirm( dialog.title, dialog.message, dialog.ok, dialog.cancel );
				});
			});
		}

		// ===== ADD NETWORK LISTENER/RESPONSE HANDLERS
		this.network.on
			.heard( 'division' )
				.command( 'update' )
					.respond( update => {
						let division = update?.division;
						if( ! defined( division )) { return; }
						division = new Division( division );
						this.refresh.header( division );
					});

		// ===== ADD EVENT LISTENER/RESPONSE HANDLERS
		this.event.listen( 'division-show' )
			.respond(( type, source, message ) => {
				let division = this.app.state.current.division;
				division = new Division( division );
				this.refresh.header( division );
			});

		// ===== ADD BUTTON BEHAVIORS
		this.button.back.off( 'click' ).click( ev => { this.event.trigger( 'ring-show' ); });

	}
}
