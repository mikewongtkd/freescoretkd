FreeScore.Widget.SBSDrawPoomsae = class FSWidgetSBSDrawPoomsae extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );
		const designated = {
			yellow: [ 'Taegeuk 1', 'Taegeuk 2' ], // Not WT
			green:  [ 'Taegeuk 1', 'Taegeuk 2', 'Taegeuk 3', 'Taegeuk 4' ], // Not WT
			blue:   [ 'Taegeuk 3', 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6' ], // Not WT
			red:    [ 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8' ], // Not WT
			dragon: [ 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang' ], // Not WT
			tiger:  [ 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang' ], // Not WT
			youth:  [ 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang' ], // Not WT
			cadet:  [ 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback' ],
			junior: [ 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon' ],
			u30:    [ 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae' ],
			u40:    [ 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae' ],
			u50:    [ 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon' ],
			u60:    [ 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon', 'Hansu' ],
			u65:    [ 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon', 'Hansu' ],
			o65:    [ 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon', 'Hansu' ]
		};

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="draw">
			<h4>Draw Poomsae</h4>
			<div class="well well-sm" style="text-align: center;">Draw Poomsae Required</div>
			<button class="btn btn-block btn-draw">Draw Poomsae</button>
			<button class="btn btn-block btn-pool">Edit Poomsae Pool</button>
			<div class="modal modal-draw fade" tabindex="-1" role="dialog" style="display: none;">
				<div class="modal-dialog modal-lg" role="document">
					<div class="modal-content">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h4 class="modal-title">Update the Draw Pool</h4>
						</div>
						<div class="modal-body">
							<div class="form-group">
								<label>Select a Draw Pool</label>
								<select class="form-control" name="age-group">
									<option value="">Select One...</option>
									<option disabled><hr></hr></option>
									<optgroup label="Color Belt Poomsae Pool">
										<option value="yellow">Yellow Belt (all ages)</option>
										<option value="green">Green Belt (all ages)</option>
										<option value="blue">Blue Belt (all ages)</option>
										<option value="red">Red Belt (all ages)</option>
									</optgroup>
									<option disabled><hr></hr></option>
									<optgroup label="Black Belt Poomsae Pool">
										<option value="dragon">Dragon (6-7)</option>
										<option value="tiger">Tiger (8-9)</option>
										<option value="youth">Youth (10-11)</option>
										<option value="cadet">Cadet (12-14)</option>
										<option value="junior">Junior (15-17)</option>
										<option value="u30">U30 (18-30)</option>
										<option value="u40">U40 (31-40)</option>
										<option value="u50">U50 (41-50)</option>
										<option value="u60">U60 (51-60)</option>
										<option value="u65">U65 (61-65)</option>
										<option value="o65">O65 (66+)</option>
									</optgroup>
									<option disabled><hr></hr></option>
									<optgroup label="Custom Pool">
										<option value="custom">Custom</option>
									</optgroup>
								</select>
							</div>
							<div class="form-group">
								<p><label>Customize the Draw Pool</label></p>
								<div class="btn-group">
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00001" data-poomsae="Taegeuk 1">T1</button>
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00002" data-poomsae="Taegeuk 2">T2</button>
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00004" data-poomsae="Taegeuk 3">T3</button>
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00008" data-poomsae="Taegeuk 4">T4</button>
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00016" data-poomsae="Taegeuk 5">T5</button>
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00032" data-poomsae="Taegeuk 6">T6</button>
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00064" data-poomsae="Taegeuk 7">T7</button>
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00128" data-poomsae="Taegeuk 8">T8</button>
								</div>
								<div class="btn-group">
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00256" data-poomsae="Koryo">KR</button>
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00512" data-poomsae="Keumgang">KG</button>
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="01024" data-poomsae="Taeback">TB</button>
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="02048" data-poomsae="Pyongwon">PW</button>
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="04096" data-poomsae="Shipjin">SJ</button>
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="08192" data-poomsae="Jitae">JT</button>
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="16384" data-poomsae="Chonkwon">CK</button>
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="32768" data-poomsae="Hansu">HS</button>
									<button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="65536" data-poomsae="Ilyeo" disabled>IY</button>
								</div>
							</div>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-primary btn-ok disabled">OK</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		` );

		// ===== ADD STATE
		this.state.division  = null;
		this.state.age       = null;
		this.state.animation = { timer: null };
		this.state.draw      = { count: 0, complete: false, form: null };

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.draw    = this.dom.find( '.draw .well' );
		this.display.all     = this.dom.find( '.draw' );
		this.button.draw     = this.dom.find( '.btn-draw' );
		this.button.pool     = this.dom.find( '.btn-pool' );
		this.display.age     = { modal: { 
			all: $( '.modal-draw' ),
			hide: () => { $( '.modal-draw' ).modal( 'hide' ); }, 
			show: () => { $( '.modal-draw' ).modal( 'show' ); }
		}};

		this.button.modal = {
			draw : {
				select: $( '.modal-draw select[name="age-group"]' ),
				custom: $( '.modal-draw .btn-poomsae' ),
			},
			ok: $( '.modal-draw .btn-ok' )
		};

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.draw = {
			behavior: pool => {
				return (ev = null) => {
					// If already drawing, ignore button
					if( this.state.animation.timer ) { this.sound.error.play(); return; }
					this.button.draw.addClass( 'disable' );

					let tdd = this.display.draw;
					tdd.html( 'Drawing Poomsae...' );
					this.sound.next.play();

					// ===== INITIALIZE DRAW BEHAVIOR
					this.state.draw.count    = 0;
					this.state.draw.form     = null;
					this.state.draw.complete = false;

					// ===== PERFORM THE DRAW
					this.state.animation.timer = setInterval(() => {
						let form  = this.state.draw.form;
						let count = this.state.draw.count;

						// GO TO SCORING
						if( count > 10 ) {
							clearInterval( this.state.animation.timer );
							this.state.animation.timer = null;

							let request = { type: 'division', action: 'display' };
							this.network.send( request );

						// SHOW FINAL SELECTED FORM
						} else if( count > 3 ) {
							tdd.html( `<b>${form}</b> ${11 - this.state.draw.count}s` );
							this.state.draw.form = form;
							this.state.draw.complete = true;

							if( count == 4 ) {
								let request = { type: 'division', action: 'draw', draw: { form, complete: true }};
								this.network.send( request );
								this.sound.ok.play(); 
							}

						// RANDOM DRAW FORM
						} else {
							// Random draw, ensuring the draw is different from the previous draw
							let i = Math.floor( Math.random() * pool.length );
							this.state.draw.form = form = pool[ i ];
							tdd.html( form );

							let request = { type: 'division', action: 'draw', draw: { form, complete: false }};
							this.network.send( request );
							this.sound.next.play();
						}
						this.state.draw.count++;
					}, 1000 );
				};
			},
			button: division => {

				this.button.draw.removeClass( 'disabled' );
				let age  = this.state.age;
        let pool = age && designated?.[ age ] ? designated[ age ] : this.state?.pool;

				if( ! defined( pool )) {
					alertify.error( `No designated poomsae defined for age ${age}` );
					return;
				}

				// Remove previously drawn poomsae (no repeats)
				let draw = division.form.draw();
				pool = pool.filter( form => ! draw.includes( form ));

				let i = division.current.formId();

				if( defined( draw[ i ])) {
					this.button.draw.off( 'click' ).click( ev => {
						alertify.confirm( 
							'Re-draw form?', 
							'Once published, the form draw should not be changed unless there is a very good reason. Are you certain you want to re-draw the form?',
							() => {
								let redraw = this.refresh.draw.behavior( pool );
								redraw();
							},
              () => {}
						);
					});
				} else {
					this.button.draw.off( 'click' ).click( this.refresh.draw.behavior( pool ));
				}
			},
			// ============================================================
			modal: division => {
			// ============================================================
				let inDraw = this.dom.find( '.modal-draw' ).length > 0;
				if( inDraw ) {
					let modal = this.display.age.modal.all.detach();
					$( 'body' ).append( modal );
				}

				let refresh = {
					custom : {
						pool: pool => {
							this.button.modal.draw.custom.removeClass( 'btn-primary active' ).addClass( 'btn-default' );
							pool.forEach( poomsae => {
								let button = this.button.modal.draw.custom.parent().find( `[data-poomsae="${poomsae}"]` );
								button.removeClass( 'btn-default' ).addClass( 'btn-primary active' );
							});
						}
					},
					pool : {
						decoding: key => {
							let [ method, hex ] = key.split( '-', 2 );
							this.button.modal.draw.custom.toArray().forEach( el => {
								let button = $( el );
								let value  = button.attr( 'data-value' );
								let active = (hex & value) / value ? true : false;
								if( active ) {
									button.removeClass( 'btn-default' ).addClass( 'btn-primary active' );
								} else {
									button.addClass( 'btn-default' ).removeClass( 'btn-primary active' );
								}
							});
						},
						encoding: () => {
							// Encodes the selected poomsae as a bit string and converts to hex
							let sum = this.button.modal.draw.custom.parent().find( '.active' ).toArray().map( el => $( el ).attr( 'data-value' )).reduce(( acc, cur ) => acc + parseInt( cur ), 0 );
							let hex = sum.toString( 16 ).padStart( 5, '0' );
							return `wt25-0x${hex}`;
						}
					},
					select : pool => {
						let ages = Object.keys( designated );
						const have = new Set( pool );
						let age = ages.find( age => {
							const want = new Set( designated[ age ]);
							return (have.difference( want ))?.size == 0 && (want.difference( have ))?.size == 0;
						});

						if( defined( age )) {
							this.button.modal.draw.select.val( age );
							this.state.age = age;
							delete this.state.pool;

						} else {
							this.button.modal.draw.select.val( 'custom' );
							this.state.pool = pool;
							this.state.age  = refresh.pool.encoding();
						}

						this.cookie.save( this.state.age ); // Cache to cookie; after 'OK' is clicked, write to database
						this.button.modal.ok.removeClass( 'disabled' );
					}
				};

				// ----------------------------------------
				// MODAL BEHAVIOR
				// ----------------------------------------
				// Initialize values based on division data
				let pool = division.form.pool();
				if( pool ) {
					console.log( 'POOL', pool ); // MW
					let key = pool[ 0 ].replace( /^draw\-/, '' );
					console.log( 'POOL', pool, key ); // MW
					if( key in designated ) {
						pool = designated[ key ];
						this.button.modal.draw.select.val( key );
					} else {
						refresh.pool.decoding( key );
						pool = this.button.modal.draw.custom.parent().find( '.active' ).toArray().map( el => $( el ).attr( 'data-poomsae' ));
						this.button.modal.draw.select.val( 'custom' );
					}
				}

				// ----------------------------------------
				this.button.modal.draw.select.change( ev => {
				// ----------------------------------------
				// Age group dropdown menu
				// ----------------------------------------
					let target = $( ev.target );
					let age    = target.val();
					if( age in designated ) {
						this.state.age = age;
						this.cookie.save( this.state.age );
						refresh.custom.pool( designated[ age ]);
						this.button.modal.ok.removeClass( 'disabled' );
					}
				});

				// ----------------------------------------
				this.button.modal.draw.custom.off( 'click' ).click( ev => {
				// ----------------------------------------
				// Draw pool customization buttons
				// ----------------------------------------
					let target = $( ev.target );
					if( target.hasClass( 'active' )) {
						target.removeClass( 'btn-primary active' ).addClass( 'btn-default' );
					} else {
						target.removeClass( 'btn-default' ).addClass( 'btn-primary active' );
					}
					let pool = this.button.modal.draw.custom.parent().find( '.active' ).toArray().map( el => $( el ).attr( 'data-poomsae' ));
					refresh.select( pool );
				});

				// ----------------------------------------
				this.button.modal.ok.off( 'click' ).click( ev => {
				// ----------------------------------------
				// OK Button
				// ----------------------------------------
					if( this.button.modal.ok.hasClass( 'disabled' )) {
						alertify.notify( 'Please select an age group.' );

					} else {
						// Write age to database
						let request = { type: 'division', action: 'draw select age', age: this.state.age };
						let group   = this.state.age in designated ? `Poomsae pool for <b>${this.state.age.capitalize()}</b>` : '<b>Custom</b> poomsae pool';
						this.network.send( request );
						alertify.success( `${group} selected.` );
						this.sound.ok.play();
						this.display.age.modal.hide();
						this.refresh.draw.button( division );
					}
				});

				this.display.age.modal.show();
			},
			// ============================================================
			poomsae: division => {
			// ============================================================
				if( ! defined( division )) { 
					this.display.all.hide();
					this.display.draw.empty(); 
					this.button.draw.addClass( 'disabled' );
					return; 
				}

				this.display.age.modal.hide();
				this.display.draw.empty().html( 'Draw Poomsae Required' );
				this.button.draw.html( 'Draw Poomsae' );
				this.button.pool.off( 'click' ).click( ev => { this.refresh.draw.modal( division ); });

				let form  = null;
				let forms = division.form.pool();
				let draw  = division.form.draw();
				let n     = division.form.count();
				let fid   = division.current.formId();

				// Form has been previously manually drawn
				if( defined( draw[ fid ]) && forms && ! forms[ fid ].match( /^draw/i )) {
					form = draw[ fid ];
					this.display.draw.empty().html( form );

				// Form has been previously systematically drawn
				} else if( defined( draw[ fid ])) {
					form = draw[ fid ];
					this.display.draw.empty().html( form );
					this.button.draw.html( 'Re-draw Poomsae' );
					this.state.draw.complete = true;
					this.display.all.show();

        // Form has not been drawn
				} else {
          let mnum  = division.current.matchNumber();
          alertify.notify( `Poomsae draw for Match ${mnum} required. Click on <i>Draw Poomsae</i> to proceed.` );
          this.display.all.show();
          this.button.draw.removeClass( 'disabled' );
        }

				// Draw form
				let age = undefined;

				// Check cache
				if( defined( this.state.age )) {
					age = this.state.age;

				// Check cookie
				} else if( this.cookie.value()) {
					age = this.state.age = this.cookie.value();

				// See if the draw information specifies age
				} else {
					let found = forms ? forms[ fid ]?.match( /^draw-([\w\-]+)$/ ) : null;
					if(  found ) {
						age = found[ 1 ];
						this.state.age = age;
						this.cookie.save( age );

            // Parse the WT 2025 encoding
            if( age.match( /^wt25\-/ )) {
              let [encoding, hex] = age.split( '-', 2 );
              let selected = parseInt( hex, 16 );
              this.state.pool = [];
							this.button.modal.draw.custom.toArray().forEach( el => {
								let button  = $( el );
								let value   = button.attr( 'data-value' );
								let poomsae = button.attr( 'data-poomsae' );
								let active  = (selected & value) / value ? true : false;
								if( active ) { this.state.pool.push( poomsae ); }
              });
            }

					// Maybe the division description can tell us the age?
					} else {
						age = Object.keys( designated ).find( age => { 
							let re = new RegExp( age, 'i' );
							return division.description().match( re ); 
						});
						if( defined( age )) {
							this.state.age = age;
							this.cookie.save( age );
            }
					}
				}
				if( ! defined( age )) { 
					this.refresh.draw.modal( division ); 

				} else {
					this.refresh.draw.button( division );
				}
			}
		};

		// ===== ADD NETWORK LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'ring' )
			.command( 'update' ).respond( update => {
				let division = update?.ring?.current ? update?.ring?.divisions.find( division => division.name == update.ring.current ) : null;
				division = defined( division ) ? new Division( division ) : null;

				if( ! defined( division )) { 
					this.display.all.hide();
					return; 
				}

				// Reset the age selection
				if( defined( this.state.division ) && this.state.division.name == division.name ) {
					this.state.age = this.cookie.value();

				} else {
					this.cookie.remove();
					this.state.age = null;
				}

				this.refresh.draw.poomsae( division );
			})
		.heard( 'division' )
			.command( 'update' ).respond( update => {
				let division = update?.division ? new Division( update.division ) : null;

				if( ! defined( division )) { 
					this.display.header.empty();
					this.display.poomsae.draw.empty();
					return; 
				}

				// Ignore Draw Requests (which are sent by this app)
				if( update.request.action == 'draw' ) { return; }

				// Refresh for all other requests
				this.refresh.draw.poomsae( division );
			});
	}
}
