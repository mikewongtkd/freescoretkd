FreeScore.Widget.DESettings = class FSWidgetDESettings extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="settings">
			<h4>Division Settings</h4>
			<div class="row">
				<div class="col-sm-2">
					<div class="form-group">
						<label for="judges-select">Judges</label>
						<select class="form-control" id="judges-select">
							<option value="3">3 Judges</option>
							<option value="5">5 Judges</option>
							<option value="7">7 Judges</option>
						</select>
					</div>
				</div>
				<div class="col-sm-2">
					<div class="form-group">
						<label for="age-select">Event</label>
						<select class="form-control" id="event-select">
							<option value="individual">Individual</option>
							<option value="pair">Pair</option>
							<option value="team">Team</option>
						</select>
					</div>
				</div>
				<div class="col-sm-2">
					<div class="form-group">
						<label for="method-select">Method</label>
						<select class="form-control" id="method-select">
							<option data-applies"individual,pair,team" value="cutoff">Cutoff</option>
							<option data-applies"individual,pair,team" value="se">Single Elimination</option>
							<option data-applies"individual" value="sbs">Side-by-Side</option>
						</select>
					</div>
				</div>
				<div class="col-sm-2">
					<div class="form-group">
						<label for="gender-select">Gender</label>
						<select class="form-control" id="gender-select">
							<option value="f">Female</option>
							<option value="m">Male</option>
							<option value="c">Mixed</option>
						</select>
					</div>
				</div>
				<div class="col-sm-2">
					<div class="form-group">
						<label for="age-select">Age</label>
						<select class="form-control" id="age-select">
							<option value="null"  data-aliases=""                    data-applies="individual,pair,team" >Unknown</option>
							<option value="4-5"   data-aliases="u5"                  data-applies="individual"           >U5 (4-5)</option>
							<option value="6-7"   data-aliases="u7,tiger"            data-applies="individual"           >Tiger (6-7)</option>
							<option value="8-9"   data-aliases="u9,dragon"           data-applies="individual"           >Dragon (8-9)</option>
							<option value="10-11" data-aliases="u11,youth"           data-applies="individual,pair,team" >Youth (10-11)</option>
							<option value="12-14" data-aliases="u14,cadet"           data-applies="individual,pair,team" >Cadet (12-14)</option>
							<option value="15-17" data-aliases="u17,junior"          data-applies="individual,pair,team" >Junior (15-17)</option>
							<option value="18-30" data-aliases="u30,senior,senior 1" data-applies="individual,pair,team" >U30 (18-30)</option>
							<option value="31-40" data-aliases="u40,senior 2"        data-applies="individual"           >U40 (31-40)</option>
							<option value="41-50" data-aliases="u50"                 data-applies="individual"           >U50 (41-50)</option>
							<option value="31-50" data-aliases="u50"                 data-applies="pair,team"            >U50 (31-50)</option>
							<option value="51-60" data-aliases="u60"                 data-applies="individual,pair,team" >U60 (51-60)</option>
							<option value="61+"   data-aliases="60+,o60"             data-applies="pair,team"            >O60 (61+)</option>
							<option value="61-65" data-aliases="u65"                 data-applies="individual"           >U65 (61-65)</option>
							<option value="66+"   data-aliases="65+,o65"             data-applies="individual"           >O65 (66+)</option>
						</select>
					</div>
				</div>
				<div class="col-sm-2">
					<div class="form-group">
						<label for="rank-select">Rank</label>
						<select class="form-control" id="rank-select">
							<option value="black">Black</option>
							<option value="white">White</option>
							<option value="yellow">Yellow</option>
							<option value="green">Green</option>
							<option value="blue">Blue</option>
							<option value="red">Red</option>
							<option value="black1" data-aliases="1st (?:dan|degree)">Black 1st Dan</option>
							<option value="black2" data-aliases="2nd (?:dan|degree)">Black 2nd Dan</option>
							<option value="black3" data-aliases="3rd (?:dan|degree)">Black 3rd Dan</option>
							<option value="black4" data-aliases="4th (?:dan|degree)">Black 4th Dan</option>
							<option value="black5" data-aliases="5th (?:dan|degree)">Black 5th Dan</option>
							<option value="black6" data-aliases="6th (?:dan|degree)">Black 6th Dan</option>
							<option value="black7" data-aliases="7th (?:dan|degree)">Black 7th Dan</option>
						</select>
					</div>
				</div>
			</div>
		</div>

		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.judges   = this.dom.find( '#judges-select' );
		this.display.event    = this.dom.find( '#event-select' );
		this.display.method   = this.dom.find( '#method-select' );
		this.display.gender   = this.dom.find( '#gender-select' );
		this.display.age      = this.dom.find( '#age-select' );
		this.display.rank     = this.dom.find( '#rank-select' );

		// ===== STATE
		this.state = { judges: 5, event: 'individual', method: 'cutoff', gender: null, age: null, rank: 'black', divid: null };

		// ===== REFRESH BEHAVIOR
		this.refresh.all = () => {
			this.refresh.judges();
			this.refresh.event();
			this.refresh.method();
			this.refresh.gender();
			this.refresh.age();
		}

		// ----------------------------------------
		this.refresh.judges = () => {
		// ----------------------------------------
			let judges = this.app.state.division?.judges;
			if( ! defined( judges )) { return; }

			this.state.judges = judges;
			this.display.judges.val( judges );
		}

		// ----------------------------------------
		this.refresh.event = () => {
		// ----------------------------------------
			let description = this.app.state.division?.description;
			if( ! defined( description )) { return; }

			let ev = null;
			if( description.match( /pair/i )) {
				ev = this.state.event = 'pair';
			} else if( description.match( /team/i )) {
				ev = this.state.event = 'team';
			} else {
				ev = this.state.event = 'individual';
			}

			this.display.event.val( ev );
		};

		// ----------------------------------------
		this.refresh.method = () => {
		// ----------------------------------------
			let method = this.app.state.division?.method;
			if( defined( method )) { 
				this.state.method = method;
			} else {
				this.state.method = method = 'cutoff';
			}
			this.display.method.val( method );
		};

		// ----------------------------------------
		this.refresh.gender = () => {
		// ----------------------------------------
			let description = this.app.state.division?.description;
			if( ! defined( description )) { return; }

			let gender = null;
			if( description.match( /\b(?:male|men)/i )) {
				gender = this.state.gender = 'm';

			} else if( description.match( /\b(?:female|women)/i )) {
				gender = this.state.gender = 'f';

			} else {
				gender = this.state.gender = 'c';
			}

			this.display.gender.val( gender );
		};

		// ----------------------------------------
		this.refresh.age = () => {
		// ----------------------------------------
			let description = this.app.state.division?.description;
			if( ! defined( description )) { return; }

			let age = null;
			this.display.age.find( 'option' ).each(( i, html ) => {
				let option  = $( html );
				if( option.val() == 'null' ) { return; }

				let choices = [ option.val() ].concat( option.attr( 'data-aliases' ).split( /,\s?/ ));
				let regex   = `\\b(?:${choices.join('|')})`;
				regex = regex.replace( /\-/, '\\-' );
				regex = regex.replace( /\+/, '\\+' );
				regex = new RegExp( regex, 'i' );
				
				if( description.match( regex )) {
					this.state.age = option.val();
					this.display.age.val( option.val());
					return false;
				}
			});
		};

		// ----------------------------------------
		this.refresh.rank = () => {
		// ----------------------------------------
			let description = this.app.state.division?.description;
			if( ! defined( description )) { return; }

			let age = null;
			this.display.rank.find( 'option' ).toArray().reverse().each(( html, i ) => {
				let option  = $( html );
				let aliases = option.attr( 'data-aliases' );
				let choices = aliases? [ option.val() ].concat( aliases.split( /,\s?/ )) : [ option.val() ];
				let regex   = `(?:${choices.join('|')})`;
				regex = regex.replace( /\-/, '\\-' );
				regex = regex.replace( /\+/, '\\+' );
				regex = new RegExp( regex, 'i' );
				
				if( description.match( regex )) {
					this.state.rank = option.val();
					this.display.rank.val( option.val());
					return false;
				}
			});
		};

		// ----------------------------------------
		this.refresh.divid = () => {
		// ----------------------------------------
		};

		// ===== CHANGE BEHAVIOR
		this.display.judges.on( 'change', ev => {
			let target = $( ev.target );
			let judges = target.val();
			this.app.state.division.judges = judges;
		});

		this.display.event.on( 'change', ev => {
			let target  = $( ev.target );
			let evname  = target.val();
			let methods = this.display.method.find( 'option' ).hide().toArray();
			let ages    = this.display.age.find( 'option' ).hide().toArray();

			methods.forEach( option => {
				let method = $(option);
				let applies = method.attr( 'data-applies' ).split( /,/ );
				if( applies.includes( evname )) {
					method.show();
				} else {
					method.hide();
				}
			});

			ages.forEach( option => {
				let age = $(option);
				let applies = age.attr( 'data-applies' ).split( /,/ );
				if( applies.includes( evname )) {
					age.show();
				} else {
					age.hide();
				}
			});
		});
	}
}
