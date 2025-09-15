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
		this.refresh.all = () => {
			let list = this.app.state.division.athletes;
			let text = list.map( athlete => athlete?.name).join( "\n" );
			this.display.doc.setValue( text );
		}

		// ===== LISTENER/RESPONSE HANDLERS
		this.display.doc.on( 'change', () => {
			let lines    = this.display.doc.getValue().trim().split( "\n" );
			let athletes = lines.map( line => { 
				let athlete  = {};
				let values   = line.split( "\t" );
				athlete.name = values.shift().trim();
				values.forEach( keypair => {
					let [ key, value ] = keypair.split( '=' );
					athlete[ key ] = value;
				});
				return athlete;
			});
			this.app.state.division.athletes = athletes;
		});
	}
};
