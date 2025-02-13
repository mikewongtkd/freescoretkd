FreeScore.Widget.SBSDrawPoomsae = class FSWidgetSBSDrawPoomsae extends FreeScore.Widget {
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

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="draw">
			<h4>Draw Poomsae</h4>
			<div class="well well-sm" style="text-align: center;"></div>
			<button class="btn btn-draw">Draw Poomsae</button>
			<div class="modal fade" tabindex="-1" role="dialog" style="display: none;">
				<div class="modal-dialog" role="document">
					<div class="modal-content">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h4 class="modal-title">Modal title</h4>
						</div>
						<div class="modal-body">
							<p class="modal-message"></p>
							<label>Age Group:</label>
							<div class="btn-group" data-toggle="buttons">
								<label class="btn btn-primary"><input type="radio" name="age-group" value="cadet">Cadet (12-14)</label>
								<label class="btn btn-primary"><input type="radio" name="age-group" value="junior">Junior (15-17)</label>
								<label class="btn btn-primary"><input type="radio" name="age-group" value="u30">U30 (18-30)</label>
								<label class="btn btn-primary"><input type="radio" name="age-group" value="u40">U40 (31-40)</label>
								<label class="btn btn-primary"><input type="radio" name="age-group" value="u50">U50 (41-50)</label>
								<label class="btn btn-primary"><input type="radio" name="age-group" value="u60">U60 (51-60)</label>
								<label class="btn btn-primary"><input type="radio" name="age-group" value="u65">U65 (61-65)</label>
								<label class="btn btn-primary"><input type="radio" name="age-group" value="o65">O65 (66+)</label>
							</div>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
							<button type="button" class="btn btn-primary">OK</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		` );

		// ===== ADD STATE
		this.state.division = null;
		this.state.age = null;
		this.state.draw     = { count: 0, complete: false, form: null };

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.draw = this.dom.find( '.well' );
		this.display.all  = this.dom.find( '.draw' );
		this.button.draw  = this.dom.find( '.btn-draw' );
		this.display.age  = { modal: { 
			hide: () => { this.dom.find( '.draw .modal' ).hide(); }, 
			show: () => { this.dom.find( '.draw .modal' ).fadeIn(); }, 
			title: this.dom.find( '.draw .modal .modal-title' ), 
			message: this.dom.find( '.draw .modal .modal-message' ), 
		}};

		this.button.age  = { modal: {
			buttons: this.dom.find( '.draw .modal input[name="age-group"]' ),
			ok: this.dom.find( '.draw .modal .btn-primary' )
		}};

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.draw = {
			button: () => {
				let age = this.state.age;
				if( ! defined( age )) {
				}

				let pool = designated?.[ age ];
				if( ! defined( pool )) {
					alertify.error( `No designated poomsae defined for age ${age}` );
					return;
				}

				// Remove previously drawn poomsae (no repeats)
				pool = pool.filter( form => ! draw.includes( form ));

				if( this.state.animation.timer ) { clearInterval( this.state.animation.timer ); }
				this.state.draw.count    = 0;
				this.state.draw.form     = null;
				this.state.draw.complete = false;

				let tdpn = this.display.poomsae.name = $( `<div class="poomsae name"></div>` );
				this.display.poomsae.draw.empty().append( tdpn );
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
			},
			modal: division => {
				let modal = {
					title: `No age information found for ${division.name().toUpperCase()}`,
					message: `No age information found for ${division.summary()}. Please select an age group for this division.`
				};
				this.display.age.modal.title.html( modal.title );
				this.display.age.modal.message.html( modal.message );
				this.display.age.modal.show();
			},
			poomsae: division => {
				if( ! defined( division )) { 
					this.display.all.hide();
					this.display.draw.empty(); 
					this.button.draw.addClass( 'disabled' );
					return; 
				}
				this.display.age.modal.hide();

				let form  = null;
				let forms = division.current.form.list();
				let n     = division.form.count();
				let draw  = division.form.draw();
				let fid   = division.current.formId();

				// Form has been previously manually drawn
				if( defined( forms[ fid ]) && ! forms[ fid ].match( /^draw/i )) {
					form = forms[ fid ];
					this.display.draw.empty().html( form );
					this.button.draw.addClass( 'disabled' );
					this.display.all.hide();
					return;

				// Form has been previously systematically drawn
				} else if( defined( draw[ fid ])) {
					form = draw[ fid ];
					this.display.draw.empty().html( form );
					this.button.draw.addClass( 'disabled' );
					this.display.all.show();
					return;
				}

				this.display.all.show();
				this.button.draw.removeClass( 'disabled' );

				// Draw form
				let age = undefined;

				// Check cache
				if( defined( this.state.age )) {
					age = this.state.age;

				// Check cookie
				} else if( $.cookie( 'poomsae-draw-age' )) {
					age = this.state.age = $.cookie( 'poomsae-draw-age' );

				// See if the draw information specifies age
				} else {
					let found = forms[ fid ].match( /^draw-(\w+)$/ );
					if(  found ) {
						age = match[ 1 ];
						this.state.age = age;
						$.cookie( 'poomsae-draw-age', age );

					// Maybe the division description can tell us the age?
					} else {
						age = [ '\bcadet', '\bjunior', '\bu30\b', '\bu40\b', '\bu50\b', '\bu60\b', '\bu65\b', '\bo65\b' ].find( age => { 
							let re = new RegExp( age, 'i' );
							return division.description().match( re ); 
						});
						if( defined( age )) {
							this.state.age = age;
							$.cookie( 'poomsae-draw-age', age );
						}
					}
				}

				if( ! defined( age )) {
				}
			}
		}

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

				// Reset the age selection
				if( defined( this.state.division ) && this.state.division.name != division.name ) {
					if( this.state.division.name == division.name ) {
						this.state.age = $.cookie( 'poomsae-draw-age' );

					} else {
						$.removeCookie( 'poomsae-draw-age' );
						this.state.age = null;
					}
				}

				this.refresh.poomsae.draw( division );
			});
	}
}
