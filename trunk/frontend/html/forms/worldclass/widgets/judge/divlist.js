FreeScore.Widget.DivList = class FSWidgetDivList extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );

		// ===== ADD THE DOM
		this.dom.append( `

		<div class="div-list">
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
		this.display.name   = this.dom.find( '.division-list th.name' );
		this.display.form1  = this.dom.find( '.division-list th.form1' );
		this.display.form2  = this.dom.find( '.division-list th.form2' );
		this.display.tbody  = this.dom.find( '.division-list tbody' );
		this.display.all    = this.dom.find( '.division-list' );

		// ===== ADD REFRESH BEHAVIOR
		this.refresh.list = division => {
			let forms = division.current.form.list();
			this.display.description.html( division.description());
			this.display.round.html( division.current.round() );
			this.display.form1.html( forms[ 0 ]);
			if( forms.length == 2 ) {
				this.display.form2.html( forms[ 1 ]).show();
			} else {
				this.display.form2.hide()
			}
			let tbody = this.display.tbody;
			tbody.empty();
			division.current.athletes().forEach(( athlete, i ) => {
				let name  = athlete.display.name();
				let score = athlete.score( division.current.roundId());
				let jid   = this.app.state.jid;
				let tr    = `<tr><td class="order">${i + 1}</td><td class="name">${name}</td>`;
				let avg   = 0;
				let count = 0;
				score.forms.list().forEach(( form, j ) => {
					let judge  = form.judge( jid );
					let scored = judge.score.is.complete();
					let dec    = form.decision.awarded();
					let acc    = judge.score.accuracy();
					let pre    = judge.score.presentation();

					if( dec ) {
						tr.append( `<td class="form${j+1}"><span class="decision">${dec.code}</span></td>` );
					} else if( scored ) {
						tr.append( `<td class="form${j+1}"><span class="accuracy">${acc}</span>/<span class="presentation">${pre}</span></td>` );
						avg += parseFloat( acc ) + parseFloat( pre );
						count++;
					} else {
						tr.append( `<td class="form${j+1}"><span class="accuracy">&ndash;</span>/<span class="presentation">&ndash;</span></td>` );
					}
				});
				tr.append( `<td class="average">${count > 0 ? (avg/count).toFixed( 2 ) : '&ndash;'}</td>` );
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
