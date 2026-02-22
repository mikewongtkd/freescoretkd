FreeScore.Widget.DEForms = class FSWidgetDEForms extends FreeScore.Widget {
	static full_list  = [ 'Taegeuk 1', 'Taegeuk 2', 'Taegeuk 3', 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon', 'Hansu' ];
	static ranks      = [ 'yellow', 'green', 'blue', 'red' ];
	static agemap     = { '6-7': 'dragon', '8-9': 'tiger', '10-11': 'youth', '12-14': 'cadet', '15-17': 'junior', '18-30': 'u30', '31-40': 'u40', '31-50': 'u50', '41-50': 'u50', '51-60': 'u60', '61+': 'o60', '61-65': 'u65', '66+': 'o65' };
	static round      = { belongsTo: { cutoff: round => [ 'prelim', 'semfin', 'finals' ].includes( round ), sbs: round => round.match( /^ro/i ), se: round => round.match( /^ro/i )}};
	static order      = [{ round: 'prelim', form: 0}, { round : 'prelim', form: 1 }, { round: 'semfin', form: 0 }, { round: 'semfin', form: 1 }, { round: 'finals', form: 0 }, { round: 'finals', form: 1 }];
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
		'66+':   [ 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon', 'Hansu' ]
	};

	constructor( app, dom ) {
		super( app, dom );
		// ===== ADD THE DOM
		this.dom.append( `

		<div class="forms" style="margin-bottom: 1em;">
			<h4>Designated Poomsae</h4>
			<table class="table table-bordered table-condensed poomsae-display"></table>
		</div>

		` );

		// ===== STATE
		this.state.select = {};

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.forms = this.dom.find( '.forms table.poomsae-display' );
		this.display.all   = this.dom.find( '.forms' );

		// ===== REFRESH BEHAVIOR
		this.refresh.all = () => {
			this.refresh.forms.display();
		};

		this.refresh.form = {
			select: {
				dom: ( forms, round, i ) => {

					// Initialize the DOM
					let select   = this.state.select?.[ round ]?.[ i ] ? this.state.select[ round ][ i ] : FreeScore.html.select.clone().attr({ 'data-round': round, 'data-form': i, 'name': `${round}-${i}` }).addClass( 'form-control' );
					let form     = forms?.[ round ]?.[ i ] && ([ 'None', 'Choice' ].includes( forms[ round ][ i ]) || FSWidgetDEForms.full_list.includes( forms[ round ][ i ])) ? forms[ round ][ i ] : 'None';
					let rank     = this.app.state.settings.rank;
					let age      = this.app.state.settings.age;
					let poolname = null;

					select.empty();

					// Create optgroups
					let list     = [];
					let selected = FSWidgetDEForms.order.map( selected => forms?.[ selected.round ]?.[ selected.form ] ? forms[ selected.round ][ selected.form ] : 'None' ).filter( form => form != 'None' && form != 'Choice' )

					if( rank && Object.keys( FSWidgetDEForms.designated ).includes( rank )) {
						list = FSWidgetDEForms.designated[ rank ].filter( form => ! selected.includes( form ));
						poolname = `${rank.capitalize()} Belts`;

					} else if( age && Object.keys( FSWidgetDEForms.designated ).includes( age )) {
						list = FSWidgetDEForms.designated[ age ].filter( form => ! selected.includes( form ));
						poolname = age;
					}
					let other  = FSWidgetDEForms.full_list.filter( form => ! (selected.includes( form ) || list.includes( form ) || form == select.val()));
					let groups = [
						{ label: 'Special Options', list: [ 'None', 'Choice' ] },
						{ label: `Compulsory Poomsae for ${poolname}`, list },
						{ label: 'Already Selected', list: selected },
						{ label: 'Other Poomsae', list: other }
					];

					groups.forEach( group => {
						if( group.list.length == 0 ) { return; }
						let optgroup = FreeScore.html.optgroup.clone().attr({ label: group.label });
						group.list.forEach( form => {
							let option = FreeScore.html.option.clone().val( form ).html( form );
							optgroup.append( option );
						});
						select.append( optgroup );
					});

					select.val( form );
					if( ! this.state.select[ round ]) { this.state.select[ round ] = []; }
					this.state.select[ round ][ i ] = select;
					return select;

				},
				behavior: ( forms, round ) => {
					// Prepare DOM behavior
					let first  = this.state.select[ round ][ 0 ];
					let second = this.state.select[ round ][ 1 ];
					let assign = target => {
						let round = target.attr( 'data-round' );
						let i     = target.attr( 'data-form' );
						let form  = target.val();
						if( this.app.state?.division?.forms?.[ round ]?.[ i ] ) {
							this.app.state.division.forms[ round ][ i ] = form;
						}
						return form;
					};

					second.enable = () => {
						second.removeClass( 'disabled' ).prop( 'disabled', false );
					};

					second.disable = () => {
						second.addClass( 'disabled' ).prop( 'disabled', true );
						second.val( 'None' );
						if( ! forms?.[ round ]) { forms[ round ] = []; }
					};

					first.off( 'change' ).on( 'change', ev => {
						let target = $( ev.target );
						if( first.val() == 'None' ) { second.disable(); } else { second.enable(); }
						let form = assign( target );
						this.app.state.settings.rounds.forEach( round => {
							for( let i = 0; i < 2; i++ ) {
								this.refresh.form.select.dom( forms, round, i );
							}
						});
					});

					second.off( 'change' ).on( 'change', ev => {
						let target = $( ev.target );
						let form   = assign( target );
						this.app.state.settings.rounds.forEach( round => {
							for( let i = 0; i < 2; i++ ) {
								this.refresh.form.select.dom( forms, round, i );
							}
						});
					});

					// Enact DOM behavior
					if( first.val() == 'None' ) { second.disable(); } else { second.enable(); }
				}
			}
		};

		this.refresh.forms = {
			// ============================================================
			display: () => {
			// ============================================================
			// Refresh the designated poomsae display table
			// ------------------------------------------------------------
				let thead  = FreeScore.html.thead.clone();
				let tbody  = FreeScore.html.tbody.clone();
				let tr     = FreeScore.html.tr.clone();
				let method = this.app.state?.division?.method ? this.app.state.division.method : 'cutoff';
				let forms  = this.app.state?.division?.forms ? this.app.state.division.forms : {};
				let rounds = Object.keys( forms );

				if( method == 'sbs' ) { return; } // SBS uses random draw, not designated draws

				// Filter rounds
				if( method == 'cutoff' || ! defined( method )) {
					rounds = this.app.state.settings.rounds = rounds.length > 0 ? rounds.filter( round => FSWidgetDEForms.round.belongsTo.cutoff( round )) : [ 'finals' ];
				} else {
					rounds = this.app.state.settings.rounds = rounds.length > 0 ? rounds.filter( round => FSWidgetDEForms.round.belongsTo[ method ]( round )) : [ 'ro2' ];
				}

				// Ensure rounds are in proper order
				rounds = FreeScore.round.order.filter( round => rounds.includes( round ));

				this.display.forms.empty();
				this.display.forms.append( thead, tbody );
				thead.append( '<tr class="active">' + rounds.map( round => `<th style="text-align: center;">${FreeScore.round.name[ round ]}</th>` ).join() + '</tr>' );
				tbody.append( tr );

				rounds.forEach( round => { 
					let td = $( `<td style="text-align: center;"><div class="row"><div class="col-sm-6 form-cell cell-${round}-0"></div><div class="col-sm-6 form-cell cell-${round}-1"></div></div></td>` );
					tr.append( td );
					for( let i = 0; i < 2; i++ ) {
						let label  = FreeScore.html.label.clone().attr({ 'for': `${round}-${i}` }).html( `${i == 0 ? '1st' : '2nd'} Form` );
						let select = this.refresh.form.select.dom( forms, round, i );
						td.find( `.cell-${round}-${i}` ).append( label, select );
					}
					this.refresh.form.select.behavior( forms, round );
				});
			}
		};
	}

	// Helper function used elsewhere in editor app
	age( age = null ) {
		if( ! defined( age )) { age = this.state.age; }
		let ages = Object.values( FSWidgetDEForms.agemap );
		if( ages.includes( age )) {
			let i      = ages.indexOf( age );
			let ranges = Object.keys( FSWidgetDEForms.agemap );
			return ranges[ i ];

		} else if( FSWidgetDEForms.ranks.includes( age )) {
			return age;

		} else {
			return null;
		}
	}
}
