FreeScore.Widget.DESettings = class FSWidgetDESettings extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="settings">
			<h4>Division Settings</h4>
			<div class="row">
				<div class="col-sm-1">
					<div class="form-group">
						<label for="divcode-text">Prefix</label>
						<input type="text" class="form-control" id="divcode-text" value="P"></input>
					</div>
				</div>
				<div class="col-sm-1">
					<div class="form-group">
						<label for="judges-select">Judges</label>
						<select class="form-control" id="judges-select">
							<option value="3">3</option>
							<option value="5" selected>5</option>
							<option value="7">7</option>
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
							<option data-applies="individual,pair,team" value="cutoff">Cutoff</option>
							<option data-applies="individual,pair,team" value="se"    >Single Elimination</option>
							<option data-applies="individual,pair,team" value="sbs"   >Side-by-Side</option>
						</select>
					</div>
				</div>
				<div class="col-sm-1">
					<div class="form-group">
						<label for="gender-select">Gender</label>
						<select class="form-control" id="gender-select">
							<option data-applies="individual,team"      value="f">F</option>
							<option data-applies="individual,team"      value="m">M</option>
							<option data-applies="pair"                 value="c">Mixed</option>
							<option data-applies="individual,pair,team" value="null">Not Specified</option>
						</select>
					</div>
				</div>
				<div class="col-sm-2">
					<div class="form-group">
						<label for="age-select">Age</label>
						<select class="form-control" id="age-select">
							<option value="4-5"   data-aliases="u5"                  data-applies="individual"           >U5 (4-5)</option>
							<option value="6-7"   data-aliases="u7,dragon"           data-applies="individual"           >Tiger (6-7)</option>
							<option value="8-9"   data-aliases="u9,tiger"            data-applies="individual"           >Dragon (8-9)</option>
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
							<option value="null"  data-aliases=""                    data-applies="individual,pair,team" >Unknown</option>
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
				<div class="col-sm-1">
					<div class="form-group">
						<label for="group-select">Group</label>
						<select class="form-control" id="group-select">
							<option value="null">-</option>
							<option value="a">A</option>
							<option value="b">B</option>
							<option value="c">C</option>
							<option value="d">D</option>
							<option value="e">E</option>
							<option value="f">F</option>
							<option value="g">G</option>
							<option value="h">H</option>
						</select>
					</div>
				</div>
			</div>
		</div>

		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.divcode  = this.dom.find( '#divcode-text' );
		this.display.judges   = this.dom.find( '#judges-select' );
		this.display.event    = this.dom.find( '#event-select' );
		this.display.method   = this.dom.find( '#method-select' );
		this.display.gender   = this.dom.find( '#gender-select' );
		this.display.age      = this.dom.find( '#age-select' );
		this.display.rank     = this.dom.find( '#rank-select' );

		// ===== REFRESH BEHAVIOR
		this.refresh.all = () => {
			this.refresh.divcode();
			this.refresh.judges();
			this.refresh.event();
			this.refresh.method();
			this.refresh.gender();
			this.refresh.age();
			this.refresh.description();
		}

		// ----------------------------------------
		this.refresh.divcode = () => {
		// ----------------------------------------
			let settings = this.app.state.settings;
			let name     = this.app.state.division?.name ? this.app.state.division.name : this.app.state.settings.divcode;
			let match    = name?.match?.( /^([A-Za-z]+)/ );
			let divcode  = match ? match[ 0 ] : 'p';
			settings.divcode = divcode = divcode?.toLowerCase();
			this.display.divcode.val( divcode.toUpperCase() );
		}

		// ----------------------------------------
		this.refresh.judges = () => {
		// ----------------------------------------
			let judges = this.app.state.division?.judges ? this.app.state.division.judges : this.app.state.settings.judges;
			this.display.judges.val( judges );
		}

		// ----------------------------------------
		this.refresh.event = () => {
		// ----------------------------------------
		// MUST be called before this.refresh.age();
			let description = this.app.state.division?.description;
			if( ! defined( description )) { return; }

			// Find event information in description
			let ev = null;
			if( description.match( /pair/i )) {
				ev = this.app.state.settings.event = 'pair';
			} else if( description.match( /team/i )) {
				ev = this.app.state.settings.event = 'team';

			// Default to individual
			} else {
				ev = this.app.state.settings.event = 'individual';
			}

			this.display.event.val( ev );
		};

		// ----------------------------------------
		this.refresh.method = () => {
		// ----------------------------------------
			let method = this.app.state.division?.method;
			if( defined( method )) { 
				this.app.state.division.method = method;
				if( method == 'sbs' ) {
					this.app.widget.draws.display.dom.show();
					this.app.widget.forms.display.dom.hide();
				} else {
					this.app.widget.draws.display.dom.hide();
					this.app.widget.forms.display.dom.show();
				}
			} else {
				this.app.state.division.method = 'cutoff';
				this.app.widget.draws.display.dom.hide();
				this.app.widget.forms.display.dom.show();
			}
			this.display.method.val( method );
		};

		// ----------------------------------------
		this.refresh.gender = () => {
		// ----------------------------------------
			let settings    = this.app.state.settings;
			let description = this.app.state.division?.description;
			if( ! defined( description )) {
				let gender = this.app.state.settings.gender === null ? 'null' : this.app.state.settings.gender;
				this.display.gender.val( gender );
				return;
			}

			let gender = null;
			if( description.match( /\b(?:male|men)/i )) {
				gender = settings.gender = 'm';

			} else if( description.match( /\b(?:female|women)/i )) {
				gender = settings.gender = 'f';

			} else {
				gender = settings.gender = 'c';
			}

			this.display.gender.val( gender );
		};

		// ----------------------------------------
		this.refresh.age = () => {
		// ----------------------------------------
		// Depends on this.refresh.event()
			let description = this.app.state.division?.description;
			let ev          = this.app.state.settings.event;
			if( ! defined( description )) {
				let age = this.app.state.settings.age === null ? 'null' : this.app.state.settings.age;
				this.display.age.val( age );
				return;
			}

			// Search description for age
			let found = false;
			this.display.age.find( 'option' ).each(( i, option ) => {
				let age = $( option );
				if( age.val() == 'null' ) { return; }

				let choices = [ age.val() ].concat( age.attr( 'data-aliases' ).split( /,\s?/ ));
				let events  = age.attr( 'data-applies' ) ? age.attr( 'data-applies' ).split( /,\s?/ ) : [];
				let regex   = `\\b(?:${choices.join('|')})`;
				regex = regex.replace( /\-/, '\\-' );
				regex = regex.replace( /\+/, '\\+' );
				regex = new RegExp( regex, 'i' );
				
				// Skip if not a match
				if( ! description.match( regex ) || ! events.includes( ev )) { return; }

				// Mark match as found and break from the loop
				this.app.state.settings.age = age.val();
				this.display.age.val( age.val());
				found = true;
				return false;
			});

			// Default to unknown
			if( ! found ) {
				this.app.state.settings.age = 'null';
				this.display.age.val( 'null' );
			}
		};

		// ----------------------------------------
		this.refresh.rank = () => {
		// ----------------------------------------
			let description = this.app.state.division?.description;
			if( ! defined( description )) { return; }

			// Search description for rank
			let found = false;
			this.display.rank.find( 'option' ).toArray().reverse().each(( option, i ) => {
				let rank    = $( option );
				let aliases = rank.attr( 'data-aliases' );
				let choices = aliases? [ rank.val() ].concat( aliases.split( /,\s?/ )) : [ rank.val() ];
				let regex   = `(?:${choices.join('|')})`;
				regex = regex.replace( /\-/, '\\-' );
				regex = regex.replace( /\+/, '\\+' );
				regex = new RegExp( regex, 'i' );
				
				if( description.match( regex )) {
					this.app.state.settings.rank = rank.val();
					this.display.rank.val( rank.val());
					found = true;
					return false;
				}
			});

			// Default to black belt
			if( ! found ) {
				this.app.state.settings.rank = 'black';
				this.display.rank.val( 'black' );
			}
		};

		// ----------------------------------------
		this.refresh.description = () => {
		// ----------------------------------------
			let settings = this.app.state.settings;
			let divcode  = settings.divcode ? settings.divcode : this.display.divcode.val();
			let evname   = settings.event ? settings.event : this.display.event.val();
			let gender   = settings.gender ? settings.gender : this.display.gender.val();
			let age      = settings.age ? settings.age : this.display.age.val();
			let ages     = this.display.age.find( 'option' ).toArray().map( option => $( option )).filter( option => { let events = option.attr( 'data-applies' ) ? option.attr( 'data-applies' ).split( /,\s?/ ) : []; return events.includes( evname ); }).map( option => option.val() );
			let i        = ages.indexOf( age );
			let rank     = settings.rank ? settings.rank : this.display.rank.val();

			let divnum  = i * 3;
			if( evname == 'pair' ) { divnum += 40; } else if( evname == 'team' ) { divnum += 70; }
			if( gender == 'f' ) { divnum += 1; } else if( gender == 'm' ) { divnum += 2; }
			switch( rank ) {
				case 'white'  : divnum += 500; break;
				case 'yellow' : divnum += 400; break;
				case 'green'  : divnum += 300; break;
				case 'blue'   : divnum += 200; break;
				case 'red'    : divnum += 100; break;
			}

			let divid = null;
			if( divnum <  10  ) { divid = `${divcode.toLowerCase()}00${divnum}`; } else
			if( divnum <  100 ) { divid = `${divcode.toLowerCase()}0${divnum}`; } else
			if( divnum >= 100 ) { divid = `${divcode.toLowerCase()}${divnum}`; }

			settings.divid = this.app.state.division.name = divid;
			this.app.widget.description.display.refresh.with.settings( settings );
		};

		// ===== CHANGE BEHAVIOR

		// ----------------------------------------
		this.display.divcode.on( 'change', ev => {
		// ----------------------------------------
			let settings = this.app.state.settings;
			let target   = $( ev.target );
			let divcode  = target.val().toLowerCase();
			settings.divcode = divcode;
			this.refresh.description();
		});

		// ----------------------------------------
		this.display.judges.on( 'change', ev => {
		// ----------------------------------------
			let settings = this.app.state.settings;
			let target   = $( ev.target );
			let judges   = target.val();
			this.app.state.division.judges = settings.judges = judges;
			this.refresh.description();
		});

		// ----------------------------------------
		this.display.event.on( 'change', ev => {
		// ----------------------------------------
			let settings = this.app.state.settings;
			let target   = $( ev.target );
			let evname   = target.val();
			let methods  = this.display.method.find( 'option' ).toArray();
			let genders  = this.display.gender.find( 'option' ).toArray();
			let ages     = this.display.age.find( 'option' ).toArray();

			settings.event = evname;

			methods.forEach( option => {
				let method = $(option);
				let events = method.attr( 'data-applies' ) ? method.attr( 'data-applies' ).split( /,/ ) : [];
				if( events.includes( evname )) {
					method.show();
				} else {
					if( this.display.method.val() == method.val() ) {
						this.display.method.val( 'cutoff' );
						settings.method = this.app.state.division.method = 'cutoff';
					}
					method.hide();
				}
			});

			genders.forEach( option => {
				let gender = $(option);
				let events = gender.attr( 'data-applies' ) ? gender.attr( 'data-applies' ).split( /,/ ) : [];
				if( events.includes( evname )) {
					gender.show();
				} else {
					if( this.display.gender.val() == gender.val() ) {
						if( evname == 'pair' ) {
							this.display.gender.val( 'c' );
							settings.gender = 'c';
						} else {
							this.display.gender.val( 'null' );
							settings.gender = null;
						}
					}
					gender.hide();
				}
			});

			ages.forEach( option => {
				let age = $(option);
				let events = age.attr( 'data-applies' ) ? age.attr( 'data-applies' ).split( /,/ ) : [];
				if( events.includes( evname )) {
					age.show();
				} else {
					if( this.display.age.val() == age.val() ) {
						this.display.age.val( 'null' );
						settings.age = null;
					}
					age.hide();
				}
			});

			this.app.refresh.rounds();
			this.refresh.description();
		});

		// ----------------------------------------
		this.display.method.on( 'change', ev => {
		// ----------------------------------------
			let settings = this.app.state.settings;
			let target   = $( ev.target );
			let method   = target.val();
			this.app.state.division.method = settings.method = method;

			if( method == 'sbs' ) {
				this.app.widget.draws.display.dom.show();
				this.app.widget.forms.display.dom.hide();
			} else {
				this.app.widget.draws.display.dom.hide();
				this.app.widget.forms.display.dom.show();
			}

			this.app.refresh.rounds();
			this.refresh.description();
		});

		// ----------------------------------------
		this.display.gender.on( 'change', ev => {
		// ----------------------------------------
			let settings = this.app.state.settings;
			let target = $( ev.target );
			let gender = target.val();
			settings.gender = gender;

			this.refresh.description();
		});

		// ----------------------------------------
		this.display.age.on( 'change', ev => {
		// ----------------------------------------
			let settings = this.app.state.settings;
			let target   = $( ev.target );
			let age      = target.val();
			settings.age = age;

			this.refresh.description();
		});

		// ----------------------------------------
		this.display.rank.on( 'change', ev => {
		// ----------------------------------------
			let settings  = this.app.state.settings;
			let target    = $( ev.target );
			let rank      = target.val();
			settings.rank = rank;

			this.app.refresh.rounds();
			this.refresh.description();
		});
	}
}
