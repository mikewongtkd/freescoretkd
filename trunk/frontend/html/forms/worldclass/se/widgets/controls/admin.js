FreeScore.Widget.SEAdmin = class FSWidgetAdmin extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="administration">
			<h4>Administration</h4>
			<div class="list-group">
				<button class="list-group-item admin-button" id="admin-edit"><span class="fas fa-edit"></span> Edit Division</button>
				<button class="list-group-item admin-button" id="admin-screen"><span class="fas fa-desktop"></span> External Screen</button>
				<button class="list-group-item admin-button" id="admin-view"><span class="fas fa-list-ol"></span> Change View</button>
				<button class="list-group-item admin-button" id="admin-results"><span class="fas fa-medal"></span> Show Results</button>
				<button class="list-group-item admin-button" id="admin-history"><span class="fas fa-history"></span> Division History</button>
			</div>
		</div>

		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.button.edit       = this.dom.find( '#admin-edit' );
		this.button.history    = this.dom.find( '#admin-history' );
		this.button.results    = this.dom.find( '#admin-results' );
		this.button.screen     = this.dom.find( '#admin-screen' );
		this.button.view       = this.dom.find( '#admin-view' );
		this.display.all       = this.dom.find( '.administration' );

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.buttons = division => {
			let divid   = division.name();
			let athlete = division.current.athlete();
			let current = division.current.athleteId();
			let round   = division.current.roundId();
			let form    = division.current.formId();
			let url = {
				edit    : `../division/editor.php?file=${tournament.db}/${ring.num}/${divid}`,
				history : `../history.php?ring=${ring.num}`,
				results : `../report/results.php?ring=${ring.num}&divid=${divid}`,
				screen  : `index.php?ring=${ring.num}`
			};

			Object.keys( url ).forEach( admin => {
				this.button?.[ admin ].off( 'click' ).click( ev => {
					this.sound.next.play();
					if( admin == 'edit' ) {
						alertify.alert( 
							`Edit Division ${divid.toUpperCase()}`, 
							'Make sure that judges are not scoring before editing.', 
							() => {
								this.sound.ok.play();
								window.open( url?.[ admin ], '_blank' );
							});
					} else {
						this.sound.next.play();
						window.open( url?.[ admin ], '_blank' );
					}
				});
			});

			this.button.view.off( 'click' ).click( ev => {
				this.sound.ok.play();
				this.network.send({ type: 'division', action: 'display' });
			});
		}

		// ===== ADD NETWORK LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'ring' )
			.command( 'update' )  
				.respond( update => {
					let division = this.app.state.current.division;
					if( ! defined( division )) { return; }

					division = new Division( division );
					this.refresh.buttons( division );
				})
		.heard( 'division' )
			.command( 'update' )  
				.respond( update => {
					let division = update?.division;
					if( ! defined( division )) { return; }

					division = new Division( division );
					this.refresh.buttons( division );
				});
	}
}
