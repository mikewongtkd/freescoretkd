FreeScore.Widget.SBSPoomsaeDraw = class FSWidgetSBSPoomsaeDraw extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		this.dom.append( '<div class="header"></div><div class="poomsae draw"></div>' );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.header  = this.dom.find( '.header' );
		this.display.poomsae = { draw: this.dom.find( '.poomsae.draw' )};

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.all = division => {
			this.refresh.header( division );
		};
		this.refresh.header = division => {
			let match = division.current.match();
			let mnum  = division.current.matchNumber();
			let fnum  = division.form.count() > 1 ? `&ndash; <span class="form-name">${ordinal( parseInt( division.current.formId()) + 1 )} Form</span>` : '';
			
			this.display.header.empty();
			this.display.header.html( `<h1><span class="divid">${division.name().toUpperCase()}</span> &ndash; <span class="description">${division.description()}</span></h1><h2><span class="round-name">${division.current.round.display.name()}</span> &ndash; <span class="match-number">Match ${mnum}</span> ${fnum}</h2>` );
		};
		this.refresh.poomsae = { 
			draw : update => {
				let poomsae = update.request;
				let form    = poomsae?.draw?.form;

				if( ! defined( form )) { return; }

				let tdpn = this.display.poomsae.name = $( `<div class="poomsae name"></div>` );
				this.display.poomsae.draw.empty().append( tdpn );
				tdpn.fadeOut( 200, () => tdpn.html( form ).fadeIn( 200 ));
				if( poomsae.draw.complete ) { tdpn.addClass( 'drawn' ); }
				return;
			}
		};

		// ===== ADD NETWORK LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'division' )
			.command( 'update' ).respond( update => {
				let division = update?.division ? new Division( update.division ) : null;

				if( ! defined( division )) { 
					this.display.header.empty();
					this.display.poomsae.draw.empty();
					return; 
				}

				this.refresh.header( division );
				this.refresh.poomsae.draw( update );
			});
	}
}
