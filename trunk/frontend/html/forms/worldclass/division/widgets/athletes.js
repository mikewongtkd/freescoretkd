FreeScore.Widget.DEAthletes = class FSWidgetDEAthletes extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		this.dom.append( `
			<div class="panel panel-primary">
				<div class="panel-heading">
					<h4 class="panel-title">List of Athletes in this Division <span class="meta" style="float: right;">Please type LAST NAME in UPPERCASE</span></h4>
				</div>
				<textarea id="athletes" class="panel-body"></textarea>
				<div class="panel-footer">
					<button type="button" id="btn-cancel"    class="btn btn-warning pull-left"><span class="glyphicon glyphicon-remove-sign"></span> Cancel and Exit</button>
					<button type="button" id="btn-save"      class="btn btn-success pull-right"><span class="glyphicon glyphicon-save"></span> Save and Exit</button>
					<button type="button" id="btn-randomize" class="btn btn-primary pull-right disabled" style="margin-right: 30px;"><span class="fas fa-random"></span> Randomize Order</button>
					<div class="clearfix"></div>
				</div>
			</div>
		`);
		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.textarea = this.dom.find( '#athletes' );
		this.display.editor   = CodeMirror.fromTextArea( document.getElementById( 'athletes' ), { lineNumbers: true, autofocus: true, mode: 'freescore' });
		this.display.doc      = this.display.editor.getDoc();
		this.display.editor.setSize( '100%', '360px' );

		// ===== BUTTONS
		this.button.cancel    = this.dom.find( '#btn-cancel' );
		this.button.save      = this.dom.find( '#btn-save' );
		this.button.randomize = this.dom.find( '#btn-randomize' );

		// ===== BUTTON BEHAVIOR
		this.button.cancel.off( 'click' ).click(() => { 
			this.app.sound.prev.play();
			setTimeout(() => { window.close(); }, 500 );
		});

		this.button.randomize.enable = () => {
			this.button.randomize.removeClass( 'disabled' );
			this.button.randomize.off( 'click' ).click( ev => {
				let list = this.app.state.division.athletes;
				list.sort(() => Math.random() - 0.5 ); // Shuffle
				list.sort(( a, b ) => {
					let x = isNaN( parseFloat( a?.info?.seed )) ? 0 : parseFloat( a.info.seed );
					let y = isNaN( parseFloat( b?.info?.seed )) ? 0 : parseFloat( b.info.seed );
					console.log( x, y, y - x );
					return y - x;
				}); // Sort: note athletes with equivalent seed values will have already been shuffled and remain shuffled
				this.refresh.all();
			});
		};

		this.button.randomize.disable = () => {
			this.button.randomize.addClass( 'disabled' );
			this.button.randomize.off( 'click' );
		};

		this.button.save.enable = () => {
			this.button.save.removeClass( 'disabled' );
			this.button.save.off( 'click' ).click( ev => {
				this.app.sound.next.play();

				let division = new Division( this.app.state.division );
				let message = { type: 'division', action: 'write', division: division.data() };
				this.app.network.send( message );
				alertify.message( `Saving division ${division.name().toUpperCase()} ${division.description()}...` );
			});
		};

		this.button.save.disable = () => {
			this.button.save.addClass( 'disabled' );
			this.button.save.off( 'click' ).click(() => {
				this.app.state.validate();
				this.app.state.errors.forEach( error => { 
					alertify.error( error ); 
				});
				this.app.sound.error.play();
			});
		};
		
		// ===== REFRESH BEHAVIOR

		// ----------------------------------------
		this.refresh.all = () => {
		// ----------------------------------------
			let list = this.app.state.division.athletes;
			let text = list.map( athlete => {
				let info = athlete?.info;
				if( defined( info )) {
					info = Object.keys( info ).map( key => `${key}=${info[ key ]}` ).join( "\t" );
					if( info ) { info = `\t${info}`; }
					return `${athlete?.name}${info}`;
				}
				return athlete?.name
			}).join( "\n" );
			this.display.doc.setValue( text );
			this.refresh.tabs();
		};

		// ----------------------------------------
		this.refresh.tabs = () => {
		// ----------------------------------------
		// Make info columns align nicely
			setTimeout(() => {
				const tabstops = [ 360, 540, 720, 900, 1080 ];
				$( '.CodeMirror-code pre' ).each(( i, line ) => {
					line = $( line );
					line.find( '.cm-tab' ).each(( j, tab ) => {
						tab = $( tab );
						let tabstop  = tabstops[ j ];
						let position = tab.position();
						let width    = tabstop - position.left;
						tab.css({ width: `${width}px` });
					});
				});
			}, 50 );
		};

		// ===== LISTENER/RESPONSE HANDLERS
		this.display.doc.on( 'change', () => {
			let lines    = this.display.doc.getValue().trim().split( "\n" );
			let athletes = lines.map( line => { 
				let athlete  = {};
				let values   = line.split( "\t" );
				let info     = {};
				athlete.name = values.shift().trim();
				values.forEach( keypair => {
					let [ key, value ] = keypair.split( '=' );
					info[ key ] = value;
				});
				if( Object.keys( info ).length > 0 ) { athlete.info = info; }
				return athlete;
			});
			this.app.state.division.athletes = athletes;
			if( athletes.length > 1 ) { this.button.randomize.enable(); } else { this.button.randomize.disable(); }
			this.app.refresh.rounds();
			this.refresh.tabs();
			this.button.save.enable(); // MW
		});
	}
};
