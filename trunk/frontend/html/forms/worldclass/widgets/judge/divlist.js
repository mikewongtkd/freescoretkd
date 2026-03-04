FreeScore.Widget.DivList = class FSWidgetDivList extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="judge-notes">
			<table>
				<thead>
					<th class="order">#</th>
					<th class="name">Name</th>
					<th class="form1">Form1</th>
					<th class="form2">Form2</th>
					<th class="average">Avg</th>
				</thead>
				<tbody>
				</tbody>
			</table>
		</div>
		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.display.name   = this.dom.find( '.judge-notes th.name' );
		this.display.form1  = this.dom.find( '.judge-notes th.form1' );
		this.display.form2  = this.dom.find( '.judge-notes th.form2' );
		this.display.tbody  = this.dom.find( '.judge-notes tbody' );
		this.display.all    = this.dom.find( '.judge-notes' );

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.list = ( division = null ) => {
			if( ! defined( division )) {
				if( ! defined( this.app.state.division )) { return; }
				division = new Division( this.app.state.division );
			}
			let cform = division.current.formId();
			let forms = division.current.form.list();
			this.display.form1.html( forms[ 0 ]);
			if( cform == 0 ) { this.display.form1.addClass( 'current-form' ); } else { this.display.form1.removeClass( 'current-form' ); }
			if( forms.length == 2 ) {
				this.display.form2 = this.dom.find( '.judge-notes th.form2' );
				if( cform == 1 ) { this.display.form2.addClass( 'current-form' ); } else { this.display.form2.removeClass( 'current-form' ); }
				if( this.display.form2.length == 0 ) {
					let form2 = this.display.form2 = $( `<th class="form2">${forms[ 1 ]}</th>` );
					this.display.form1.after( form2 );
				} else {
					this.display.form2.html( forms[ 1 ]);
				}
			} else {
				this.display.form2 = this.dom.find( '.judge-notes th.form2' );
				if( this.display.form2.length > 0 ) {
					this.display.form2.remove()
				}
			}
			let tbody = this.display.tbody;
			tbody.empty();
			division.current.athletes().forEach(( athlete, i ) => {
				let name     = athlete.display.name();
				let score    = athlete.score( division.current.roundId());
				let current  = i == division.current.athleteId() ? ' current' : '';
				let jid      = this.app.state.jid;
				let tr       = $( '<tr />' );
				let sum      = 0;
				let count    = 0;
				tr.append( `<td class="order ${current}">${i + 1}</td><td class="name ${current}">${name}</td>` );

				for( let j = 0; j < count; j++ ) {
					let form     = score.form( j );
					let judge    = form.judge( jid );
					let complete = judge.score.is.complete();
					let acc      = judge.score.accuracy();
					let pre      = judge.score.presentation();
					let decision = form.decision.awarded();

					if( decision ) {
						tr.append( `<td class="form${j+1} ${current}"><span class="decision">${decision.code}</span></td>` );

					} else if( complete ) {
						tr.append( `<td class="form${j+1} ${current}"><span class="accuracy">${acc}</span>/<span class="presentation">${pre}</span></td>` );
						sum += parseFloat( acc ) + parseFloat( pre );
						count++;

					} else {
						tr.append( `<td class="form${j+1} ${current}"><span class="accuracy">&ndash;</span>/<span class="presentation">&ndash;</span></td>` );
					}
				}
				let mean = sum/count;
				let d    = score.decision.awarded();

				if( defined( d )) {
					let form     = score.form( d );
					let decision = form.decision.awarded();
					tr.append( `<td class="average ${current}">${decision.code}</td>` );

				} else if( sum > 0 ) {
					tr.append( `<td class="average ${current}">${mean.toFixed( 2 )}</td>` );

				} else {
					tr.append( `<td class="average ${current}">&ndash;</td>` );
				}
				tbody.append( tr );
			});
		}

		// ===== ADD LISTENER/RESPONSE HANDLERS
		this.network.on
		.heard( 'division' )
			.command( 'update' )
				.respond( update => { 
					let division = update?.division;
					if( ! division ) { return; }
					division = new Division( division );

					this.refresh.list( division );
				});
	}
}
