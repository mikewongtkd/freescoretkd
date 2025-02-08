FreeScore.Widget.SBSPoomsaeDraw = class FSWidgetSBSPoomsaeDraw extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		const designated = {
			cadet: [ 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback' ],
			junior: [ 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon' ],
			u30: [ 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae' ],
			u40: [ 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae' ],
			u50: [ 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon' ],
			u60: [ 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon', 'Hansu' ],
			u65: [ 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon', 'Hansu' ],
			o65: [ 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon', 'Hansu' ]
		};

		this.dom.append( '<div class="header"></div><div class="poomsae draw"></div>' );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.header  = this.dom.find( '.header' );
		this.display.poomsae = { draw: this.dom.find( '.poomsae.draw' )};

		// ===== ADD STATE
		this.state.animation = { timer: null };
		this.state.draw = { count: 0, complete: false, form: null };

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.header = division => {
			let match = division.current.match();
			let start = division.current.matchStart();
			let mnum  = parseInt( match.number ) + start;
			let fnum  = division.form.count() > 1 ? `${ordinal( parseInt( division.current.formId()) + 1 )} Form` : '';

			
			this.display.header.empty();
			this.display.header.html( `<h1><span class="divid">${division.name().toUpperCase()}</span> &ndash; <span class="description">${division.description()}</span></h1><h2><span class="round-name">${division.current.round.display.name()}</span> &ndash; <span class="match-number">Match ${mnum}</span> &ndash; <span class="form-name">${fnum}</span></h2>` );
		};
		this.refresh.poomsae = { 
			draw : division => {
				if( ! defined( division )) { 
					this.display.header.empty(); 
					this.display.poomsae.draw.empty(); 
					return; 
				}

				let form  = null;
				let forms = division.current.form.list();
				let n     = division.form.count();
				let draw  = division.form.draw();
				let fid   = division.current.formId();

				// Form is already predetermined
				if( defined( forms[ fid ]) && ! forms[ fid ].match( /^draw/i )) {
					form = forms[ fid ];

				// Form has been previously drawn
				} else if( defined( draw[ fid ])) {
					form = draw[ fid ];

				}

				if( defined( form )) {
					let tdpn = this.display.poomsae.name = $( `<div class="drawn poomsae name">${form}</div>` );
					this.display.poomsae.draw.append( tdpn );
					return;
				}

				// Draw form
				let age   = undefined;
				let match = forms[ fid ].match( /^draw-(\w+)$/ );
				if( match ) {
					age = match[ 1 ];

				} else {
					age = [ 'cadet', 'junior', 'u30', 'u40', 'u50', 'u60', 'u65', 'o65' ].find( age => { 
						let re = new RegExp( age, 'i' );
						return division.description().match( re ); 
					});
				}

				if( ! defined( age )) {
					alertify.error( `No age information found for ${division.summary()}` );
					return;
				}

				let pool = designated?.[ age ];
				if( ! defined( pool )) {
					alertify.error( `No designated poomsae defined for age ${age}` );
					return;
				}

				// Remove previously drawn poomsae (no repeats)
				pool = pool.filter( form => ! draw.includes( form ));

				this.display.poomsae.draw.empty();
				if( this.state.animation.timer ) { clearInterval( this.state.animation.timer ); }
				this.state.draw.count    = 0;
				this.state.draw.form     = null;
				this.state.draw.complete = false;

				let tdpn = this.display.poomsae.name = $( `<div class="poomsae name"></div>` );
				this.display.poomsae.draw.append( tdpn );
				this.state.animation.timer = setInterval(() => {
					if( this.state.draw.count > 7 ) {
						this.state.draw.complete = true;
						clearInterval( this.state.animation.timer );

						let request = { type: 'division', action: 'draw', draw: { form, complete: true }};
						app.network.send( request );

					} else if( this.state.draw.count > 5 ) {
						this.state.draw.form = form;
						tdpn.addClass( 'drawn' );

					} else {
						let i = Math.floor( Math.random() * pool.length );
						form = pool[ i ];
					}
					tdpn.fadeOut( 300, () => tdpn.html( form ).fadeIn( 300 ));
					this.state.draw.count++;
				}, 1200 );
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

				if( update.request.action == 'draw' ) { return; }

				this.refresh.header( division );
				this.refresh.poomsae.draw( division );
			});
	}
}
