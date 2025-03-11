FreeScore.Widget.SBSJudges = class FSWidgetJudges extends FreeScore.Widget {
	constructor( app, dom ) {
		super( app, dom );
		this._judge = [];
		const contestants = [ 'chung', 'hong' ];

		// ===== ADD THE DOM
		this.dom.html( `

		<h4>Judge Scores</h4>
		<table>
			<tr class="judge-row-status"></tr>
			<tr class="chung judge-row-accuracy"></tr>
			<tr class="chung judge-row-presentation"></tr>
			<tr class="chung judge-row-sum"></tr>
			<tr class="hong judge-row-accuracy"></tr>
			<tr class="hong judge-row-presentation"></tr>
			<tr class="hong judge-row-sum"></tr>
			<tr class="judge-row-clear"></tr>
		</table>
		` );

		// ===== PROVIDE ACCESS TO WIDGET DISPLAYS/INPUTS
		this.button.status = this.dom.children( 'a.btn.status' );

		// ===== ADD STATE
		this.state.users    = [];
		this.state.division = null;
		this.state.judges   = 0;

		// ===== ADD REFRESH BEHAVIOR
		// .judge.clear.score( division ) - Updates the "clear score" button behavior
		// .judge.scores( division )      - Updates the judges scores and spread
		// .judge.status( update )        - Updates the judge status when a user status or health changes
		// .judge.table( division )       - Updates the judge table
		this.refresh = {
			judge : { 
				clear : {
					// ------------------------------------------------------------
					score : () => {
					// ------------------------------------------------------------
						let division = this.state.division;
						if( ! defined( division )) { return; }
						division = new Division( division );

						// Get Match
						let match = division.current.match();
						let mnum  = division.current.matchNumber();
						
						for( let i = 0 ; i < this.state.judges; i++ ) {
							let judge = { id: i, name : i == 0 ? 'Referee' : `Judge ${i}` };
							this.judge[ i ].clear.off( 'click' ).click( ev => {
								app.sound.next.play();
								let names = contestants.filter( contestant => defined( match[ contestant ])).map( contestant => division.athlete( match[ contestant ]).name()).join( ' and ' );
								let dialog = {
									title : `Clear ${judge.name}'s score for Match ${mnum}`,
									message : `Click <b>OK</b> to clear <b>${judge.name}</b>&rsquo;s score for <b>${names}</b> in Match ${mnum} or <b>Cancel</b> to do nothing.`,
									ok : () => {
										contestants.filter( contestant => defined( match[ contestant ])).forEach( contestant => {
											let request = { type : 'division', action : 'clear judge score', judge : i, index: match[ contestant ]};
											app.network.send( request );
										});
										app.sound.ok.play();
										alertify.success( `${judge.name}'s score cleared for ${names} in Match ${mnum}` );
										return true;
									},
									cancel : () => { app.sound.prev.play(); return true; }
								};
								alertify.confirm( dialog.title, dialog.message, dialog.ok, dialog.cancel );
							});
						}
					},

					// ------------------------------------------------------------
					scores : () => {
					// ------------------------------------------------------------
						let division = this.state.division;
						if( ! defined( division )) { return; }
						division = new Division( division );

						let match = division.current.match();
						contestants.forEach( contestant => {
							[ 'score', 'spread' ].forEach( col => { [ 'acc', 'pre', 'sum' ].forEach( row => { this.display[ contestant ][ col ][ row ].empty(); }); });
							Object.values( this.judge ).forEach( judge => { 
								[ 'accuracy', 'presentation', 'sum' ].forEach( field => { judge[ contestant ][ field ].removeClass( 'ignore' ).empty(); });
							});
						});
					}
				},
				// ------------------------------------------------------------
				scores : ( aid = null ) => {
				// ------------------------------------------------------------
					this.refresh.judge.clear.scores();
					let division = this.state.division;
					if( ! defined( division )) { return; }
					let div = new Division( division );

					let match = aid === null ? div.current.match() : div.matches().find( match => [ match.chung, match.hong ].includes( aid ));
					if( ! defined( match )) { return; }

					contestants.filter( contestant => defined( match[ contestant ])).forEach( contestant => {
						aid = match[ contestant ];

						let current = { athlete : aid, round : division?.round, form : division?.form };
						if( ! defined( current.athlete ) || ! defined( current.round ) || ! defined( current.form )) { return; }
						let athlete  = division.athletes?.[ current.athlete ];
						if( ! defined( athlete )) { return; }

						let n        = division.judges;
						let scores   = athlete?.scores?.[ current.round ]?.forms?.[ current.form ]?.judge;
						let complete = athlete?.scores?.[ current.round ]?.forms?.[ current.form ]?.complete;
						let decision = athlete?.scores?.[ current.round ]?.forms?.some( form => form.decision );
						let value    = x => { let val = parseFloat( x ); if( isNaN( val )) { return 0.0; } else { return val; }};
						let spread   = { acc : [], pre : [], sum : []};
						scores.forEach(( score, jid ) => {
							let acc   = value( score.accuracy );
							let pre   = value( score.presentation );
							let sum   = acc + pre;
							let judge = this.judge[ jid ][ contestant ];

							// If the judge is not defined or the score is not complete, clear the score display
							if( ! defined( judge?.accuracy ) || ! defined( judge?.presentation ) || ! score.complete ) { 
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

						if( ! complete || decision ) { 
							[ 'score', 'spread' ].forEach( col => { [ 'acc', 'pre', 'sum' ].forEach( row => { this.display[ contestant ][ col ][ row ].empty(); }); });
							return; 
						}

						// Calculate score and spreads
						[ 'acc', 'pre', 'sum' ].forEach( row => {
							this.display[ contestant ].spread[ row ].html( (Math.max( ...spread[ row ]) - Math.min( ...spread[ row ])).toFixed( 1 ));
							let sum   = (a, c) => a + c;
							let value = {
								spread : Math.max( ...spread[ row ]) - Math.min( ...spread[ row ]),
								score : spread[ row ].reduce( sum ) /(n > 3 ? n - 2 : n )
							};
							if( row == 'sum' ) {
								value.score = (spread.acc.reduce( sum ) + spread.pre.reduce( sum )) / (n > 3 ? n - 2 : n);
							}
							this.display[ contestant ].score[ row ].html( value.score.toFixed( 2 ));
							this.display[ contestant ].spread[ row ].html( value.spread.toFixed( 1 ));
						});
					});
				},
				// ------------------------------------------------------------
				status : update => {
				// ------------------------------------------------------------
					let users = update?.users;
					let color = { strong : 'btn-success', good : 'btn-success', weak : 'btn-warning', bad : 'btn-danger', dead : 'btn-default', 'n/a' : 'btn-default', 'bye' : 'btn-default' }; 
					const all = 'btn-success btn-warning btn-danger btn-default';

					// User not defined
					if( ! defined( users )) { return; }

					users.forEach( user => {
						let found = user?.role?.match( /^(?:judge)?(\d+)/ );
						if( ! found ) { return; }

						let jid   = parseInt( found[ 1 ]);
						let jname = jid ? `Judge ${jid}` : 'Referee';
						console.log( jname, this.judge[ jid ], user ); // MW
						
						// Judge not initialized or judge status button not initialized
						if( ! this.judge?.[ jid ]?.status ) { return; }


						let jstat = this.judge[ jid ].status;

						if( user?.action == 'disconnect' && user?.role?.match( /^(?:judge)?/ )) {
							jstat.removeClass( all );
							jstat.addClass( color.bye );
							return;
						}

						if( color?.[ user?.health ]) {
							jstat.removeClass( all );
							jstat.addClass( color[ user.health ]);
							return;
						}
					});
				},
				// ------------------------------------------------------------
				table : () => {
				// ------------------------------------------------------------
					let division = this.state.division;
					if( ! defined( division )) { return; }

					// See if the table structure is the same as before, if so, skip
					let n = division.judges;
					if( this.state.judges == n ) { return; }
					const rows = [ 'status', 'accuracy', 'presentation', 'sum', 'clear' ];

					// ============================================================
					// DEFINE THE TABLE DOM
					// ============================================================
					let dom  = {};
					rows.forEach( row => { 
						let element = this.dom.find( `table tr.chung.judge-row-${row}, table tr.hong.judge-row-${row}` )
						if( element.length == 2 ) {
							contestants.forEach( contestant => {
								element = this.dom.find( `table tr.${contestant}.judge-row-${row}` ).first()
								if( ! dom?.[ contestant ]) { dom[ contestant ] = {}; }
								dom[ contestant ][ row ] = element;
							});
						} else if( element.length == 1 ) {
							dom[ row ] = element.first();

						} else if( element.length == 0 ) {
							element = this.dom.find( `table tr.judge-row-${row}` ).first();
							dom[ row ] = element;
						}

					});
					dom.allrows = this.dom.find( `table tr` );
					dom.allrows.empty();

					// ============================================================
					// POPULATE THE TABLE WITH CELLS
					// ============================================================
					let col = {
						label : {
							status: '<th>&nbsp;</th>',
							chung: {
								accuracy     : '<th class="chung acc">A</th>',
								presentation : '<th class="chung pre">P</th>',
								sum          : '<th class="chung sum">=</th>',
							},
							hong: {
								accuracy     : '<th class="hong acc">A</th>',
								presentation : '<th class="hong pre">P</th>',
								sum          : '<th class="hong sum">=</th>',
							},
							clear: '<th>&nbsp;</th>'
						},
						score : {
							status: '<th>Score</th>',
							chung: {
								accuracy     : '<th id="chung-score-acc" class="chung acc"></th>',
								presentation : '<th id="chung-score-pre" class="chung pre"></th>',
								sum          : '<th id="chung-score-sum" class="chung sum"></th>',
							},
							hong: {
								accuracy     : '<th id="hong-score-acc" class="hong acc"></th>',
								presentation : '<th id="hong-score-pre" class="hong pre"></th>',
								sum          : '<th id="hong-score-sum" class="hong sum"></th>',
							},
							clear: '<th>&nbsp;</th>'
						},
						spread : {
							status: '<th>Spread</th>',
							chung: {
								accuracy     : '<th id="chung-spread-acc" class="chung acc"></th>',
								presentation : '<th id="chung-spread-pre" class="chung pre"></th>',
								sum          : '<th id="chung-spread-sum" class="chung sum"></th>',
							},
							hong: {
								accuracy     : '<th id="hong-spread-acc" class="hong acc"></th>',
								presentation : '<th id="hong-spread-pre" class="hong pre"></th>',
								sum          : '<th id="hong-spread-sum" class="hong sum"></th>',
							},
							clear: '<th>&nbsp;</th>'
						}
					};
					// Prepend Labels
					rows.forEach( row => { 
						if( col.label?.[ row ]) {
							let cell = col.label[ row ];
							dom[ row ].append( cell );
						} else {
							contestants.forEach( contestant => {
								let cell = col.label[ contestant ]?.[ row ];
								if( ! defined( cell )) { return; }
								dom[ contestant ][ row ].append( cell ); 
							});
						}
					});
					// Add Judges
					for( let i = 0; i < 7; i++ ) {
						if( i >= n ) { break; }
						this.judge[ i ] = { status: null, clear: null, chung: {}, hong: {}};
						let id   = null;
						let cell = null;

						// Label/Status buttons
						id = `j${i}-label`;
						let name  = i == 0 ? 'R' : i;
						cell = `<th id="${id}"><button class="btn btn-xs btn-default">${name}</button></th>`;
						dom.status.append( cell );
						this.judge[ i ].status = $( `#${id} button` );

						contestants.forEach( contestant => {

							// Accuracy
							id   = `j${i}-${contestant}-acc`;
							cell = `<td id="${id}" class="acc"></td>`;
							dom[ contestant ].accuracy.append( cell );
							this.judge[ i ][ contestant ].accuracy = $( `#${id}` );

							// Presentation
							id   = `j${i}-${contestant}-pre`;
							cell = `<td id="${id}" class="pre"></td>`;
							dom[ contestant ].presentation.append( cell );
							this.judge[ i ][ contestant ].presentation = $( `#${id}` );

							// Sum
							id   = `j${i}-${contestant}-sum`;
							cell = `<td id="${id}" class="sum"></td>`;
							dom[ contestant ].sum.append( cell );
							this.judge[ i ][ contestant ].sum = $( `#${id}` );
						});

						// Clear
						id   = `j${i}-clr`;
						cell = `<td id="${id}" class="clear"><button class="btn btn-xs btn-danger"><span class="fas fa-times"></span></button></td>`;
						dom.clear.append( cell );
						this.judge[ i ].clear = $( `#${id} button` );
					}
					// Append Score & Spread Stats
					rows.forEach( row => {
						if( col.score?.[ row ] && col.spread?.[ row ]) {
							dom[ row ].append( col.score[ row ]);
							dom[ row ].append( col.spread[ row ]);
						} else {
							let cell = null;
							contestants.forEach( contestant => {
								cell = col.score[ contestant ]?.[ row ];
								dom[ contestant ][ row ].append( cell ); 
								cell = col.spread[ contestant ]?.[ row ];
								dom[ contestant ][ row ].append( cell ); 
							});
						}
					});
					contestants.forEach( contestant => {
						this.display[ contestant ] = {};
						[ 'score', 'spread' ].forEach( col => {
							this.display[ contestant ][ col ] = {};
							[ 'acc', 'pre', 'sum' ].forEach( row => {
								this.display[ contestant ][ col ][ row ] = $( `#${contestant}-${col}-${row}` );
							});
						});
					});

					this.state.judges = n;
				}
			},
			// ------------------------------------------------------------
			judges : () => {
			// ------------------------------------------------------------
				let division = this.state.division;
				if( ! defined( division )) { return; }

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
					this.state.division = division;

					this.refresh.judges();
					this.refresh.judge.status( update );
					this.refresh.judge.scores();
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
					this.state.division = division;

					this.refresh.judges();
					this.refresh.judge.status( update );
					this.refresh.judge.scores();
				})
		// ============================================================
		.heard( 'users' )
		// ============================================================
			.command( 'update' )  
				.respond( update => { 
					this.refresh.judge.status( update );
				});

		// ===== ADD EVENT LISTENER/RESPONSE HANDLERS
		this.event
			.listen( 'division-show' )
				.respond(( type, source, message ) => {
					if( message.divid == message.current ) {
						this.dom.show();
					} else {
						this.dom.hide();
					}
				})
			.listen( 'athlete-select' )
			.listen( 'athlete-deselect' )
				.respond(( type, source, message ) => {
					this.refresh.judge.scores( message?.aid );
				});

	}

	get judge() { return this._judge; }
}
