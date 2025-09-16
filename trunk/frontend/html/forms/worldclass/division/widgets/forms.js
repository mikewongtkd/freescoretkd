FreeScore.Widget.DEForms = class FSWidgetDEForms extends FreeScore.Widget {
	static complete   = [ 'Taegeuk 1', 'Taegeuk 2', 'Taegeuk 3', 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon', 'Hansu' ];
	static ranks      = [ 'yellow', 'green', 'blue', 'red' ];
	static agemap     = { '6-7': 'dragon', '8-9': 'tiger', '10-11': 'youth', '12-14': 'cadet', '15-17': 'junior', '18-30': 'u30', '31-40': 'u40', '31-50': 'u50', '41-50': 'u50', '51-60': 'u60', '61+': 'o60', '61-65': 'u65', '66+': 'o65' };
	static rounds     = [ 'prelim', 'semfin', 'finals' ];
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
		this.state.round     = {};

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.forms   = this.dom.find( '.forms table.poomsae-display' );
		this.display.all     = this.dom.find( '.forms' );

		// ===== REFRESH BEHAVIOR
		this.refresh.all = () => {
			this.refresh.forms.display();
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
				let rounds = FSWidgetDEForms.rounds.filter( round => round in this.app.state.division.forms );

				this.display.forms.empty();
				this.display.forms.append( thead, tbody );
				thead.append( '<tr class="active">' + rounds.map( round => `<th style="text-align: center;">${FreeScore.round.name[ round ]}</th>` ).join() + '</tr>' );
				tbody.append( tr );
				
				rounds.forEach( round => {
					let list = this.app.state.division.forms[ round ].join( ', ' );
					tr.append(`<td style="text-align: center;">${list}</td>` );
				});
			}
		};
	}

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
