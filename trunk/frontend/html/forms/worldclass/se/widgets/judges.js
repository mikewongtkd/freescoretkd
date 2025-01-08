FreeScore.Widget.SEJudges = class FSWidgetJudges extends FreeScore.Widget {
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

		// ===== ADD REFRESH BEHAVIOR
		// .judge.clear.score( division ) - Updates the "clear score" button behavior
		// .judge.scores( division )      - Updates the judges scores and spread
		// .judge.status( update )        - Updates the judge status when a user status or health changes
		// .judge.table( division )       - Updates the judge table
		this.refresh = {
			judge : { 
				clear : {
					// ------------------------------------------------------------
					score : division => {
					// ------------------------------------------------------------
						// Get Athlete
						let athlete = division.athletes[ division.current ];

						for( let i = 0 ; i < this.state.judges; i++ ) {
							let judge = { id: i, name : i == 0 ? 'Referee' : `Judge ${i}` };
							this.judge[ i ].clear.off( 'click' ).click( ev => {
								app.sound.next.play();
								let dialog = {
									title : `Clear ${judge.name}'s score for ${athlete.name}`,
									message : ``,
									ok : () => {
										let request = { type : 'division', action : 'clear judge score', judge : i };
										app.network.send( request );
										app.sound.ok.play();
										alertify.success( `${judge.name}'s score cleared for ${athlete.name}` );
										return true;
									},
									cancel : () => { app.sound.prev.play(); return true; }
								};
								alertify.confirm( dialog.title, dialog.message, dialog.ok, dialog.cancel );
							});
						}
					}
				},
				// ------------------------------------------------------------
				scores : division => {
				// ------------------------------------------------------------
					let current = { athlete : division?.current, round : division?.round, form : division?.form };
					if( ! defined( current.athlete ) || ! defined( current.round ) || ! defined( current.form )) { return; }

					let n      = division.judges;
					let scores = division.athletes?.[ current.athlete ]?.scores?.[ current.round ]?.forms?.[ current.form ]?.judge;
					let value  = x => { let val = parseFloat( x ); if( isNaN( val )) { return 0.0; } else { return val; }};
					let spread = { acc : [], pre : [], sum : []};
					scores.forEach(( score, jid ) => {
						let acc   = value( score.accuracy );
						let pre   = value( score.presentation );
						let sum   = acc + pre;
						let judge = this.judge[ jid ];

						// If the judge is not defined, clear the scores 
						if( ! defined( this.judge?.[ jid ]?.accuracy ) || ! defined( this.judge?.[ jid ]?.presentation )) { 
							judge.accuracy.removeClass( 'ignore' ).empty();
							judge.presentation.removeClass( 'ignore' ).empty();
							judge.sum.removeClass( 'ignore' ).empty();
							return; 
						}

						// Update the scores otherwise
						judge.accuracy.html( acc.toFixed( 1 )).removeClass( 'ignore' );
						judge.presentation.html( pre.toFixed( 1 )).removeClass( 'ignore' );
						judge.sum.html( sum.toFixed( 1 ));

						if( n > 3 ) {
							if( score?.minacc || score?.maxacc ) { judge.accuracy.addClass( 'ignore' );     } else { spread.acc.push( acc ); }
							if( score?.minpre || score?.maxpre ) { judge.presentation.addClass( 'ignore' ); } else { spread.pre.push( pre ); }
						} else {
							spread.acc.push( acc );
							spread.pre.push( pre );
						}
						spread.sum.push( sum );
					});
				},
				// ------------------------------------------------------------
				status : update => {
				// ------------------------------------------------------------
					let user  = update?.user;
					let color = { strong : 'btn-success', good : 'btn-success', weak : 'btn-warning', bad : 'btn-danger', dead : 'btn-default', 'n/a' : 'btn-default', 'bye' : 'btn-default' }; 
					const all = 'btn-success btn-warning btn-danger btn-default';

					// User not defined
					if( ! defined( user )) { return; }

					// Judge not initialized or judge status button not initialized
					if( ! this.judge?.[ jid ]?.status ) { return; }

					if( user?.action == 'disconnect' && user?.role?.match( /^judge/ )) {
						let match = user.role.match( /^judge(\d+)/ );
						let jid   = match[ 1 ];
						this.judge[ jid ].status.removeClass( all );
						this.judge[ jid ].status.addClass( color.bye );
						return;
					}

					if( color?.[ user?.health ]) {
						this.judge[ jid ].status.removeClass( all );
						this.judge[ jid ].status.addClass( color[ user.health ]);
						return;
					}
				},
				// ------------------------------------------------------------
				table : division => {
				// ------------------------------------------------------------
					// See if the table structure is the same as before, if so, skip
					let n = division.judges;
					if( this.state.judges == n ) { return; }

					let dom  = {};
					let rows = [ 'status', 'accuracy', 'presentation', 'sum', 'clear' ];
					rows.forEach( row => dom[ row ] = this.dom.find( `tr.judge-row-${row}` ).first());
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
							status       : '<th>Score</th>',
							accuracy     : '<th id="score-acc" class="acc"></th>',
							presentation : '<th id="score-pre" class="pre"></th>',
							sum          : '<th id="score-sum" class="sum"></th>',
							clear        : '<th>&nbsp;</th>',
						},
						spread : {
							status       : '<th>Spread</th>',
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
					for( let i = 0; i < 7; i++ ) {
						if( i >= n ) { break; }
						this.judge[ i ] = {};
						let id = null;

						// Label/Status buttons
						id = `j${i}-label`;
						let name  = i == 0 ? 'R' : i;
						let label = `<th id="${id}"><button class="btn btn-xs btn-default">${name}</button></th>`;
						dom.status.append( label );
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
						dom.clear.append( clear );
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
			// ------------------------------------------------------------
			judges : division => {
			// ------------------------------------------------------------
				this.refresh.judge.table( division );
				this.refresh.judge.clear.score( division );
			}
		};

		// ===== ADD LISTENER/RESPONSE HANDLERS
		this.network.on
			// ============================================================
			.heard( 'division' )
			// ============================================================
			.command( 'update' )  
				.respond( update => { 
					let division = update.division;
					this.refresh.judges( division );
					this.refresh.judge.scores( division );
				})
			// ============================================================
			.heard( 'ring' )
			// ============================================================
			.command( 'update' )  
				.respond( update => { 
					let ring = update.ring;
					if( ! defined( ring )) { return; }

					let division = ring.divisions.find( div => div.name == ring.current );
					if( ! defined( division )) { return; }

					this.refresh.judges( division );
				})
			// ============================================================
			.heard( 'users' )
			// ============================================================
			.command( 'update' )  
				.respond( update => { 
					this.refresh.judge.status( update );
				});

		// ===== ADD EVENT LISTENER/RESPONSE HANDLERS
		this.event.listen( 'division-show', ( type, source, message ) => {
			if( message.divid == message.current ) {
				this.dom.show();
			} else {
				this.dom.hide();
			}

		});

	}

	get judge() { return this._judge; }
}
