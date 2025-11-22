FreeScore.Widget.DEDraws = class FSWidgetDEDraws extends FreeScore.Widget {
	static ranks  = [ 'yellow', 'green', 'blue', 'red' ];
	static agemap = { '6-7': 'dragon', '8-9': 'tiger', '10-11': 'youth', '12-14': 'cadet', '15-17': 'junior', '18-30': 'u30', '31-40': 'u40', '31-50': 'u50', '41-50': 'u50', '51-60': 'u60', '61+': 'o60', '61-65': 'u65', '66+': 'o65' };
	static designated = {
		'yellow':[ 'Taegeuk 1', 'Taegeuk 2' ], // Not WT
		'green': [ 'Taegeuk 1', 'Taegeuk 2', 'Taegeuk 3', 'Taegeuk 4' ], // Not WT
		'blue':  [ 'Taegeuk 3', 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6' ], // Not WT
		'red':   [ 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8' ], // Not WT
		'6-7':   [ 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang' ], // Not WT
		'8-9':   [ 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang' ], // Not WT
		'10-11': [ 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang' ], // Not WT
		'12-14': [ 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback' ],
		'15-17': [ 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon' ],
		'18-30': [ 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae' ],
		'31-40': [ 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae' ],
		'31-50': [ 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon' ],
		'41-50': [ 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon' ],
		'51-60': [ 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon', 'Hansu' ],
		'61+':   [ 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon', 'Hansu' ],
		'61-65': [ 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon', 'Hansu' ],
		'66+':   [ 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon', 'Hansu' ],
		'none':  []
	};

	constructor( app, dom ) {
		super( app, dom );
		// ===== ADD THE DOM
		this.dom.append( `

		<div class="draw" style="margin-bottom: 1em;">
			<div>
				<h4>Poomsae Draw Pools</h4>
			</div>
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
								<label>Select a Draw Pool by Rank or Age</label>
								<select class="form-control" name="age-group">
									<option value="" disabled>Select One...</option>
									<option disabled><hr></hr></option>
									<optgroup data-applies="individual" label="Color Belt Poomsae Pool">
										<option data-applies="individual" value="yellow">Yellow Belt (all ages)</option>
										<option data-applies="individual" value="green">Green Belt (all ages)</option>
										<option data-applies="individual" value="blue">Blue Belt (all ages)</option>
										<option data-applies="individual" value="red">Red Belt (all ages)</option>
									</optgroup>
									<option data-applies="individual" disabled><hr></hr></option>
									<optgroup data-applies="individual,pair,team" label="Black Belt Poomsae Pool">
										<option data-applies="individual"           value="6-7">Dragon (6-7)</option>
										<option data-applies="individual"           value="8-9">Tiger (8-9)</option>
										<option data-applies="individual,pair,team" value="10-11">Youth (10-11)</option>
										<option data-applies="individual,pair,team" value="12-14">Cadet (12-14)</option>
										<option data-applies="individual,pair,team" value="15-17">Junior (15-17)</option>
										<option data-applies="individual,pair,team" value="18-30">U30 (18-30)</option>
										<option data-applies="individual"           value="31-40">U40 (31-40)</option>
										<option data-applies="pair,team"            value="31-50">U50 (31-50)</option>
										<option data-applies="individual"           value="41-50">U50 (41-50)</option>
										<option data-applies="individual,pair,team" value="51-60">U60 (51-60)</option>
										<option data-applies="pair,team"            value="61+">O60 (61+)</option>
										<option data-applies="individual"           value="61-65">U65 (61-65)</option>
										<option data-applies="individual"           value="66+">O65 (66+)</option>
									</optgroup>
									<option data-applies="individual,pair,team" disabled><hr></hr></option>
									<optgroup data-applies="individual,pair,team" label="Special Pool">
										<option data-applies="individual,pair,team" value="custom">Custom</option>
										<option data-applies="individual,pair,team" value="none">None</option>
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
							<button type="button" class="btn btn-primary btn-ok ">OK</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.draw    = this.dom.find( '.draw table.poomsae-display' );
		this.display.all     = this.dom.find( '.draw' );
		this.button.pool     = null;
		this.display.modal   = {
			all: $( '.modal-draw' ),
			hide: () => { $( '.modal-draw' ).modal( 'hide' ); }, 
			show: () => { $( '.modal-draw' ).modal( 'show' ); }
		};

		// ===== BUTTONS
		this.button.modal = {
			ok: $( '.modal-draw .btn-ok' ),
			poomsae: $( '.modal-draw .btn-poomsae' )
		};

		this.select.modal = {
			draw : $( '.modal-draw select[name="age-group"]' )
		}

		// ===== REFRESH BEHAVIOR
		this.refresh.all = () => {
			this.refresh.draw.display();
			this.refresh.button.pool();
		};

		this.refresh.button = {
			pool: () => {
				this.button.pool = this.display.draw.find( '.btn-pool' );
				this.button.pool.off( 'click' ).click( ev => { 
					let target = $( ev.target ).hasClass( 'btn' ) ? $( ev.target ) : $( ev.target ).parent( 'button' );
					let round  = target.attr( 'data-round' );
					let i      = parseInt( target.attr( 'data-form' ));
					this.refresh.draw.modal( round, i ); 
				});
			}
		};

		this.refresh.draw = {
			// ============================================================
			display: () => {
			// ============================================================
			// Refresh the draw display table
			// ------------------------------------------------------------
				let thead  = FreeScore.html.thead.clone();
				let tbody  = FreeScore.html.tbody.clone();
				let tr     = FreeScore.html.tr.clone();
				let rounds = FreeScore.round.order.filter( round => round in this.app.state.division.forms );

				this.display.draw.empty();
				this.display.draw.append( thead, tbody );
				thead.append( '<tr class="active">' + rounds.map( round => `<th colspan=2 style="text-align: center;">${FreeScore.round.name[ round ]}</th>` ).join() + '</tr>' );
				tbody.append( tr );
				
				rounds.forEach( round => {
					let cols  = [];
					let forms = this.app.state.division.forms[ round ];
					for( let i = 0; i < 2; i++ ) {
						let form  = forms[ i ];
						let label = FreeScore.html.span.clone().addClass( `${round}-${i}-display` );
						label.append( this.refresh.draw.label( round, i, form ));
						cols.push( label );
					}

					cols = cols.map( form => { let td = FreeScore.html.td.clone().css({ 'text-align': 'center' }); td.append( form ); return td; });
					tr.append( cols );
				});
			},

			// ============================================================
			label: ( round, i, form ) => {
			// ============================================================
			// Display each draw pool in the display table, e.g. Draw (Youth)
			// ------------------------------------------------------------
				let edit  = `<button class="btn btn-xs btn-default btn-pool" data-round="${round}" data-form="${i}" type="button" style="margin-left: 1em;"><span class="fas fa-pen"></span></button>`;

				if( ! defined( form )) { 
					return [ 'None', edit ];

				} else if( form == 'none' ) {
					return [ 'None', edit ];

				} else if( form.match( /^draw/i )) {
					let [ draw, age ] = form.split( /\-/ );
					if( age ) {
						if( age.match( /^wt25/i )) {
							return [ `${draw.capitalize()} (Customized)`, edit ];
						} else {
							return [ `${draw.capitalize()} (${age.capitalize()})`, edit ];
						}

					// Draw for unspecified age group
					} else {
						return [ draw.capitalize(), edit ];
					}
				} else {
					return [ form, edit ];
				}
			},

			// ============================================================
			modal: ( round, i ) => {
			// ============================================================
				let division = new Division( this.app.state.division );
				let inDraw   = this.dom.find( '.modal-draw' ).length > 0;
				if( inDraw ) {
					let modal = this.modal = this.dom.find( '.modal-draw' );
					$( 'body' ).append( modal );
				}

				let refresh = {
					form : {
						key : () => {
							let key = this.select.modal.draw.val();
							if( key in FSWidgetDEDraws.designated ) {
								refresh.pool.selection( FSWidgetDEDraws.designated[ key ]);
								if( Object.keys( FSWidgetDEDraws.agemap ).includes( key )) { key = FSWidgetDEDraws.agemap[ key ]; }

							} else if( key == 'custom' ) {
								key = refresh.key.encoding();
								refresh.pool.selection( key );

							} else if( key == 'none' ) {
								refresh.pool.selection([]);
							}
							this.button.modal.ok.attr({ 'data-form-key': key }); // Set form
							return key;
						}
					},
					key : {
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
						}
					},
					pool : {
						// ========================================
						selection: pool => {
						// ========================================
						// For each poomsae in the pool, lights up the poomsae button
						// ----------------------------------------
							this.button.modal.poomsae.removeClass( 'btn-primary active' ).addClass( 'btn-default' );
							pool?.forEach( poomsae => {
								let button = this.button.modal.poomsae.parent().find( `[data-poomsae="${poomsae}"]` );
								button.removeClass( 'btn-default' ).addClass( 'btn-primary active' );
							});
						}
					},
					// ============================================================
					select : pool => {
					// ============================================================
					// Updates the draw pool selection button bar.
					// Compares the customized pool to any of the designated
					// pools for a given age and then sets the age to the
					// correct designation or encodes the custom pool
					// ------------------------------------------------------------
						let keys = Object.keys( FSWidgetDEDraws.designated );
						let age  = this.app.state?.settings?.age;
						const have = new Set( pool );
						let key = keys.filter( key => {
							const want = new Set( FSWidgetDEDraws.designated[ key ]);
							return (have.difference( want ))?.size == 0 && (want.difference( have ))?.size == 0;
						});

						// Only 1 match, select the match (true for some ages and all ranks)
						if( key.length == 1 ) { 
							key = key[ 0 ]; 

						// Some ages share the same pools with other ages. Select same age group as in settings (if possible)
						} else if( key.length >  1 ) {
							key = key.find( key => key == age );

						// Key not found: must be a custom pool
						} else { 
							key = null; 
						}

						// Select preset pool or custom pool
						if( defined( key )) {
							this.select.modal.draw.val( key );
							this.button.modal.ok.attr({ 'data-form-key': FSWidgetDEDraws.agemap[ age ]}); // Set form

						} else {
							this.select.modal.draw.val( 'custom' );
							this.button.modal.ok.attr({ 'data-form-key': refresh.key.encoding() });
						}
					}
				};

				// ----------------------------------------
				// MODAL BEHAVIOR
				// ----------------------------------------
				// Initialize values based on division data
				this.button.modal.ok.attr({ 'data-round': round, 'data-form': i });

				let title = this.display.modal.all.find( '.modal-title' );
				title.html( `Update the Draw Pool for the ${ordinal( i + 1 )} Form in ${FreeScore.round.name[ round ]}` );

				let pool = division.form.pool();
				if( pool ) {
					let key = pool[ 0 ].replace( /^draw\-/, '' );
					let age = this.age( key );
					if( age ) {
						pool = FSWidgetDEDraws.designated[ age ];
						this.select.modal.draw.val( age );

					} else {
						refresh.key.decoding( key );
						pool = this.button.modal.poomsae.parent().find( '.active' ).toArray().map( el => $( el ).attr( 'data-poomsae' ));
						this.select.modal.draw.val( 'custom' );
					}
					refresh.pool.selection( pool );
				}

				// ----------------------------------------
				// MODAL SELECT BEHAVIOR
				// ----------------------------------------

				// ----------------------------------------
				this.select.modal.draw.change( ev => {
				// ----------------------------------------
				// Age group select menu
				// ----------------------------------------
					let target = $( ev.target );
					refresh.form.key();
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
					let key   = refresh.form.key();
					let round = this.button.modal.ok.attr( 'data-round' );
					let i     = parseInt( this.button.modal.ok.attr( 'data-form' ));
					let Round = FreeScore.round.name[ round ];
					if( this.button.modal.ok.hasClass( 'disabled' )) {
						alertify.notify( 'Please select an age group.' );

					} else {
						// Write age to database
						key       = key in FSWidgetDEDraws.agemap ? FSWidgetDEDraws.agemap[ key ] : key;
						let belt  = FSWidgetDEDraws.ranks.includes( key ) ? ' belt' : ''
						let age   = this.age( key );
						let group = '';
						let label = $( `.${round}-${i}-display` );
						let nth   = ordinal( i + 1 );

						if( age && age in FSWidgetDEDraws.designated ) {
							if( key == 'none' ) {
								group = `No draw for ${nth} form in ${Round}`;

							} else {
								group = `Using the <b>${key.capitalize()}${belt}</b> poomsae pool for the ${nth} form in ${Round}`
							}
						} else {
							group = `<b>Custom</b> poomsae pool for ${nth} form in ${Round}`;
						}
						
						let form = key;
						if( ! defined( this.app.state.division.forms[ round ])) { this.app.state.division.forms[ round ] = []; }
						if( key == 'none' ) {
							if( i == 0 ) {
								this.app.state.division.forms[ round ] = [];

							} else if( i == 1  ) {
								if( this.app.state.division.forms.length >= 2 ) { this.app.state.division.forms.splice( 1 ); }
							}
						} else {
							form = this.app.state.division.forms[ round ][ i ] = `draw-${form}`;
						}

						console.log( 'MODAL OK', 'ROUND', round, 'FORM IDX', i, 'KEY', key, 'AGE', age, 'FORM', form, 'LABEL', label ); // MW

						label.empty()
						label.append( this.refresh.draw.label( round, i, form ));
						this.refresh.button.pool();
						alertify.success( `${group} selected.` );
						this.display.modal.hide();
					}
				});

				this.display.modal.show();
			}
		};
	}

	age( age = null ) {
		if( ! defined( age )) { age = this.app.state.settings.age; }
		let keys = Object.values( FSWidgetDEDraws.agemap );
		if( keys.includes( age )) {
			let i      = keys.indexOf( age );
			let ranges = Object.keys( FSWidgetDEDraws.agemap );
			return ranges[ i ];

		} else if( FSWidgetDEDraws.ranks.includes( age )) {
			return age;

		} else {
			return null;
		}
	}
}
