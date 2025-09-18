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
		};

		this.button.randomize.disable = () => {
			this.button.randomize.addClass( 'disabled' );
			this.button.randomize.off( 'click' );
		};

		this.button.save.enable = () => {
			this.button.save.removeClass( 'disabled' );
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
				}
				return `${athlete?.name}${info}`;
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

		// ----------------------------------------
		this.refresh.rounds = () => {
		// ----------------------------------------
		// Called by Settings widget as well as internally
		// Updates Forms widget
			let method   = this.app.state.division.method;
			let rounds   = [];
			let athletes = this.app.state.division.athletes;
			let n        = athletes.length;
			let form     = 'Choice';

			// Cutoff (which is also the default)
			if( method == 'cutoff' || ! defined( method )) {
				if( n <= 8  ) { rounds = [ 'finals' ];                     } else
				if( n <= 20 ) { rounds = [ 'semfin', 'finals' ];           } else
				              { rounds = [ 'prelim', 'semfin', 'finals' ]; }

			this.app.widget.forms.display.state.rounds = rounds;

			// Single Elimination or Side-by-Side
			} else {
				let d = n <= 1 ? 1 : Math.ceil( Math.log( n )/Math.log( 2 ));
				for( let i = d; i >= 1; i-- ) { rounds.push( `ro${2**i}` ); }
				if( method == 'sbs' ) {
					let age = this.app.widget.forms.display.age( this.app.widget.settings.display.age );
					form = `draw-${age}`
				}
			}

			// Init round and forms
			this.app.state.division.round = rounds[ 0 ];
			let forms = this.app.state.division.forms = this.app.state.division.forms ? this.app.state.division.forms : {};
			rounds.forEach( round => {
				if( round in forms ) { return; }
				forms[ round ] = [ 'Choice' ];
			});

			console.log( 'ROUNDS', rounds, 'FORMS', forms ); // MW

			this.app.widget.forms.display.refresh.all();

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
			this.refresh.rounds();
			this.refresh.tabs();
		});
	}
};
