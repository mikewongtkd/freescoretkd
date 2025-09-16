FreeScore.Widget.DEDescription = class FSWidgetDEDescription extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="row">
			<div class="col-sm-11">
				<h1><span class="divid">New</span> <span class="description-text">Division</span></h1>
			</div>
			<div class="col-sm-1 text-right" style="padding-top: 2em;">
				<div class="input-group-btn">
					<button class="btn btn-default btn-undo disabled" type="button"><span class="fas fa-undo" style="line-height: 1.42857143;"></span></span>
					<button class="btn btn-default btn-edit" type="button"><span class="fas fa-pen" style="line-height: 1.42857143;"></span></span>
				</div>
			</div>
		</div>

		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.divid       = this.dom.find( '.divid' );
		this.display.description = this.dom.find( '.description-text' );

		// ===== BUTTONS
		this.button.edit = this.dom.find( '.btn-edit' );
		this.button.undo = this.dom.find( '.btn-undo' );

		// ===== STATE
		this.state = { manual : { override : false }, previous : null };

		// ===== BUTTON BEHAVIOR
		this.button.edit.off( 'click' ).click(() => {
			let divid       = this.app.state.division.name ? this.app.state.division.name.toUpperCase() : 'this new division';
			let description = this.app.state.division.description;
			
			alertify.prompt( 
				`Describe ${divid}`,
				`Provide a description for ${divid}`,
				description,
				( ev, value ) => { 
					this.button.undo.enable();

					this.app.state.division.description = value; 
					this.display.description.html( value ); 
					this.state.manual.override = true;
				},
				() => {}
			);
		});

		this.button.undo.enable = () => {
			this.button.undo.removeClass( 'disabled' );
			this.button.undo.off( 'click' ).click(() => {
				this.app.state.division.description = this.state.previous; 
				this.display.description.html( this.state.previous ); 

				this.button.undo.disable();
				this.state.manual.override = false;
			});
		};

		this.button.undo.disable = () => {
			this.button.undo.addClass( 'disabled' );
			this.button.undo.off( 'click' );
		};

		// ===== REFRESH BEHAVIOR
		this.refresh.all = () => {
			let division    = this.app.state.division;
			let divid       = division.name?.toUpperCase();
			let description = division.description;

			this.state.previous = division.description;
			this.display.divid.html( divid );
			this.display.description.html( description );
		}

		this.refresh.with = { settings : settings => {
			// Rank Age Gender Event
			const display = {
				rank: { 'white' : 'White Belt', 'yellow' : 'Yellow Belt', 'green' : 'Green Belt', 'blue' : 'Blue Belt', 'red' : 'Red Belt', 'black1' : 'Black Belt 1st Dan', 'black2' : 'Black Belt 2nd Dan', 'black3' : 'Black Belt 3rd Dan', 'black4' : 'Black Belt 4th Dan', 'black5' : 'Black Belt 5th Dan', 'black6' : 'Black Belt 6th Dan', 'black7' : 'Black Belt 7th Dan' },
				age: { 
					'4-5' : 'U5',
					'6-7' : 'U7',
					'8-9' : 'U9',
					'10-11' : 'Youth',
					'12-14' : 'Cadet',
					'15-17' : 'Junior',
					'18-30' : 'U30',
					'31-40' : 'U40',
					'31-50' : 'U50',
					'41-50' : 'U50',
					'51-60' : 'U60',
					'61+'   : 'O60',
					'61-65' : 'U65',
					'66+'   : 'O65'
				},
				gender: {
					'f' : "Women's",
					'm' : "Men's"
				},
				event: {
					'individual' : 'Individual',
					'pair' : 'Pair',
					'team' : 'Team'
				}

			}

			let divid       = settings.divid;
			let descriptors = [];

			if( this.state.manual.override ) { return; }

			if( display.gender?.[ settings.gender ]) {
				descriptors.push( display.gender[ settings.gender ]);
			}

			if( settings.rank != 'black' && display.rank?.[ settings.rank ]) {
				descriptors.push( display.rank[ settings.rank ]);
			}

			if( display.age?.[ settings.age ]) {
				descriptors.push( display.age[ settings.age ]);
			}

			if( display.event?.[ settings.event ]) {
				descriptors.push( display.event[ settings.event ]);
			}

			descriptors.push( 'Sport Poomsae' );

			this.button.undo.enable();

			let description = descriptors.join( ' ' );
			this.app.state.description = description;
			this.display.divid.html( divid.toUpperCase() );
			this.display.description.html( description );
		}};
	}
}
