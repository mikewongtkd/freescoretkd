FreeScore.Widget.DEForms = class FSWidgetDEForms extends FreeScore.Widget {
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

		<div class="draw" style="margin-bottom: 1em;">
			<label for="poomsae-display">Designated Poomsae</label> <div class="btn-group"><button class="btn btn-xs border-0 btn-pool" type="button" style="background-color: transparent;"><span class="fas fa-pen"></span></button></div>
			<table class="table table-bordered table-condensed poomsae-display"></table>
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

		// ===== STATE
		this.state.age       = null;
		this.state.animation = { timer: null };
		this.state.draw      = { count: 0, complete: false, form: null };

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.draw    = this.dom.find( '.draw table.poomsae-display' );
		this.display.all     = this.dom.find( '.draw' );
		this.button.draw     = this.dom.find( '.btn-draw' );
		this.button.pool     = this.dom.find( '.btn-pool' );
		this.display.age     = { modal: { 
			all: $( '.modal-draw' ),
			hide: () => { $( '.modal-draw' ).modal( 'hide' ); }, 
			show: () => { $( '.modal-draw' ).modal( 'show' ); }
		}};

		// ===== BUTTONS
		this.button.modal = {
			ok: $( '.modal-draw .btn-ok' ),
			poomsae : $( '.modal-draw .btn-poomsae' )
		};

		this.select.modal = {
			draw : $( '.modal-draw select[name="age-group"]' )
		}

		// ===== REFRESH BEHAVIOR
		this.refresh.all = () => {
			this.refresh.draw.display();
			this.button.pool.off( 'click' ).click( ev => { this.refresh.draw.modal(); });
		};

		this.refresh.draw = {
			// ============================================================
			display: () => {
			// ============================================================
			// Refresh the draw display table
			// ------------------------------------------------------------
				this.display.draw.empty();
				let thead  = FreeScore.html.thead;
				let tbody  = FreeScore.html.tbody;
				let rounds = FreeScore.round.order.filter( round => round in this.app.state.division.forms );
				let tr     = FreeScore.html.tr;

				this.display.draw.append( thead, tbody );
				thead.append( '<tr class="active">' + rounds.map( round => `<th style="text-align: center;">${FreeScore.round.name[ round ]}</th>` ).join() + '</tr>' );
				tbody.append( tr );
				
				rounds.forEach( round => {
					let list = this.app.state.division.forms[ round ].map( form => {
						if( form.match( /^draw/i )) {
							let [ draw, age ] = form.split( /\-/ );
							if( age.match( /^wt25/i )) {
								return `${draw.capitalize()} (Customized Pool)`;
							} else if( age ) {
								return `${draw.capitalize()} (${age.capitalize()} Pool)`;
							} else {
								return draw.capitalize();
							}
						} else {
							return form;
						}
					}).join( ', ' );
					tr.append(`<td style="text-align: center;">${list}</td>` );
				});
			},
			// ============================================================
			modal: () => {
			// ============================================================
				let division = new Division( this.app.state.division );
				let inDraw   = this.dom.find( '.modal-draw' ).length > 0;
				if( inDraw ) {
					let modal = this.modal = this.dom.find( '.modal-draw' );
					$( 'body' ).append( modal );
				}

				let refresh = {
					pool : {
						decoding: key => {
							let [ method, hex ] = key.split( '-', 2 );
							this.button.modal.poomsae.toArray().forEach( el => {
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
							let sum = this.button.modal.poomsae.parent().find( '.active' ).toArray().map( el => $( el ).attr( 'data-value' )).reduce(( acc, cur ) => acc + parseInt( cur ), 0 );
							let hex = sum.toString( 16 ).padStart( 5, '0' );
							return `wt25-0x${hex}`;
						},
						// ========================================
						selection: () => {
						// ========================================
						// For each poomsae in the pool, activates the selected poomsae
						// ----------------------------------------
							this.button.modal.poomsae.removeClass( 'btn-primary active' ).addClass( 'btn-default' );
							pool.forEach( poomsae => {
								let button = this.button.modal.poomsae.parent().find( `[data-poomsae="${poomsae}"]` );
								button.removeClass( 'btn-default' ).addClass( 'btn-primary active' );
							});
						}
					},
					// ============================================================
					select : pool => {
					// ============================================================
					// Compares the customized pool to any of the designated
					// pools for a given age and then sets the age to the
					// correct designation or encodes the custom pool
					// ------------------------------------------------------------
						let ages = Object.keys( designated );
						const have = new Set( pool );
						let age = ages.find( age => {
							const want = new Set( designated[ age ]);
							return (have.difference( want ))?.size == 0 && (want.difference( have ))?.size == 0;
						});

						if( defined( age )) {
							this.select.modal.draw.val( age );
							this.state.age = age;
							delete this.state.pool;

						} else {
							this.select.modal.draw.val( 'custom' );
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
					let key = pool[ 0 ].replace( /^draw\-/, '' );
					if( key in designated ) {
						pool = designated[ key ];
						this.select.modal.draw.val( key );
					} else {
						refresh.pool.decoding( key );
						pool = this.button.modal.poomsae.parent().find( '.active' ).toArray().map( el => $( el ).attr( 'data-poomsae' ));
						this.select.modal.draw.val( 'custom' );
					}
					refresh.pool.selection();
				}

				// ----------------------------------------
				// MODAL SELECT BEHAVIOR
				// ----------------------------------------

				// ----------------------------------------
				this.select.modal.draw.change( ev => {
				// ----------------------------------------
				// Age group dropdown menu
				// ----------------------------------------
					let target = $( ev.target );
					let age    = target.val();
					if( age in designated ) {
						this.state.age = age;
						this.cookie.save( this.state.age );
						refresh.pool.selection( designated[ age ]);
						this.button.modal.ok.removeClass( 'disabled' );
					}
				});

				// ----------------------------------------
				// MODAL BUTTON BEHAVIOR
				// ----------------------------------------

				// ----------------------------------------
				this.button.modal.poomsae.off( 'click' ).click( ev => {
				// ----------------------------------------
				// Draw pool customization buttons
				// ----------------------------------------
					let target = $( ev.target );
					if( target.hasClass( 'active' )) {
						target.removeClass( 'btn-primary active' ).addClass( 'btn-default' );
					} else {
						target.removeClass( 'btn-default' ).addClass( 'btn-primary active' );
					}
					let pool = this.button.modal.poomsae.parent().find( '.active' ).toArray().map( el => $( el ).attr( 'data-poomsae' ));
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
					}
				});

				this.display.age.modal.show();
			}
		};
	}
}
