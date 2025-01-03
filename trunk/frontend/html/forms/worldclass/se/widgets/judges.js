FreeScore.Widget.Judges = class FSWidgetJudges extends FSWidget {
	constructor( app, dom ) {
		super( app, dom );
		this._judge = [];

		// ===== ADD THE DOM
		this.dom.html( `

		<h4>Judge Scores</h4>
		<table>
			<tr class="judge-row-status"></tr>
			<tr class="judge-row-accuracy"></tr>
			<tr class="judge-row-presentation"></tr>
			<tr class="judge-row-sum"></tr>
			<tr class="judge-row-clear"></tr>
		</table>

		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.button.status = this.dom.children( 'a.btn.status' );

		// ===== ADD STATE
		this.state.judges = null;

		// ===== ADD REFRESH BEHAVIOR
		this.refresh = {
			judge : { 
				clear : {
					score : update => {
						let division = update?.division;
						if( ! division ) {
						}
						for( let i = 0 ; i < this.state.judges; i++ ) {
							this.judge[ i ].clear.off( 'click' ).click( ev => {
								app.sound.next.play();
								let name = {
									athlete : 
									judge : i == 0 ? 'Referee' : `Judge ${i}`,
								};
								let dialog = {
									title : `Clear ${name}'s score for athlete`,
									message : ``,
									ok : () => {
										let request = { type : 'division', action : 'clear judge score', judge : i };
										app.network.send( request );
										app.sound.ok.play();
										alertify.success( `${name} cleared for ${athlete}` );
										return true;
									},
									cancel : () => { app.sound.prev.play(); return true; }
								};
								alertify.confirm( dialog.title, dialog.message, dialog.ok, dialog.cancel );
							});
						}
					}
				},
				count : update => {
					let n = update.judges?.length;
					if( defined( update.ring )) {
						let ring = update.ring;
						if( defined( ring.divisions )) {
							let current = ring.divisions.find( div => div.name == ring.current );
							if( ! defined( n )) { n = current.judges; }
						}
					} else if( defined( update.division )) {
						if( ! defined( n )) { n = update.division?.judges; }
					}
					return n;
				},
				table : update => {
					// See if the table structure is the same as before, if so, skip
					let n = this.refresh.judge.count( update );
					if( this.state.judgees == n ) { return; }

					let dom  = {};
					let rows = [ 'status', 'accuracy', 'presentation', 'sum', 'clear' ];
					rows.forEach( row => dom[ row ] = this.dom.find( `tr.judge-row-${row}` )).first();
					dom.allrows = this.dom.find( 'table tr' );
					dom.allrows.empty();
					let col = {
						label : {
							status       : '<th>&nbsp;</th>',
							accuracy     : '<th class="acc">A</th>',
							presentation : '<th class="pre">P</th>',
							sum          : '<th class="sum">=</th>',
							clear        : '<th>&nbsp;</th>',
						},
						score : {
							status       : '<th class="acc">Score</th>',
							accuracy     : '<th id="score-acc" class="acc"></th>',
							presentation : '<th id="score-pre" class="pre"></th>',
							sum          : '<th id="score-sum" class="sum"></th>',
							clear        : '<th>&nbsp;</th>',
						},
						spread : {
							status       : '<th class="acc">Spread</th>',
							accuracy     : '<th id="spread-acc" class="acc"></th>',
							presentation : '<th id="spread-pre" class="pre"></th>',
							sum          : '<th id="spread-sum" class="sum"></th>',
							clear        : '<th>&nbsp;</th>',
						}
					};
					// Prepend Labels
					rows.forEach( row => { 
						dom[ row ].append( col.label[ row ]); 
					});
					// Add Judges
					for( i = 0; i < 7; i++ ) {
						if( i >= n ) { break; }
						this.judge[ i ] = {};
						let id = null;

						// Label/Status buttons
						id = `j${i}-label`;
						let name  = i == 0 ? 'R' : i;
						let label = `<th id="${id}"><button class="btn btn-xs btn-default">${name}</button></th>`;
						dom.label.append( label );
						this.judge[ i ].status = $( `#${id} button` );

						// Accuracy
						id = `j${i}-acc`;
						let acc = `<td id="${id}" class="acc"></td>`;
						dom.accuracy.append( acc );
						this.judge[ i ].accuracy = $( `#${id}` );

						// Presentation
						id = `j${i}-pre`;
						let pre = `<td id="${id}" class="pre"></td>`;
						dom.accuracy.append( pre );
						this.judge[ i ].presentation = $( `#${id}` );

						// Sum
						id = `j${i}-sum`;
						let sum = `<td id="${id}" class="sum"></td>`;
						dom.accuracy.append( sum );
						this.judge[ i ].sum = $( `#${id}` );

						// Clear
						id = `j${i}-clr`;
						let clear = `<td id="${id}" class="clear"><button class="btn btn-xs btn-danger"><span class="fas fa-times"></span></button></td>`;
						dom.accuracy.append( sum );
						this.judge[ i ].clear = $( `#${id} button` );
					}
					// Append Score & Spread Stats
					rows.forEach( row => {
						dom[ row ].append( col.score[ row ]);
						dom[ row ].append( col.spread[ row ]);
					});

					this.state.judges = n;
				}
			},
			judges : update => {
				this.refresh.judge.table( update );
				this.refresh.judge.clear.score( update );
			};
		};

		// ===== ADD LISTENER/RESPONSE HANDLERS
		this.app.on
			// ============================================================
			.heard( 'division' )
			// ============================================================
			.command( 'update' )  
				.respond( update => { 
					this.refresh.status( update, 'Showing Score' );
				})
			// ============================================================
			.heard( 'ring' )
			// ============================================================
			.command( 'update' )  
				.respond( update => { 
					this.refresh.status( update, 'Showing Score' );
				})
			// ============================================================
			.heard( 'users' )
			// ============================================================
			.command( 'update' )  
				.respond( update => { 
					this.refresh.status( update, 'Showing Score' );
				})
	}

	get judge() { return this._judge; }
}
