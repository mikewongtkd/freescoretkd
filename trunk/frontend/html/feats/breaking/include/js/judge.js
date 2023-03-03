
var refresh = {
	on : {
		inspection: update => {
			let request  = update.request;
			let division = new Division( update.division );
			let id       = parseInt( request.athlete );
            let boards   = parseInt( request.boards );
            $( `#tool-inspection .inspection-list a[data-id="${id}"]` ).attr({ 'data-boards' : boards });
            $( `#tool-inspection .inspection-list a[data-id="${id}"] .badge` ).html( boards );
            if( state.current.athleteid == id ) { refresh.tool.deductions( division ); }
		},

		navigate: update => {
			let divid       = update.ring.current;
			let division    = update.ring.divisions.find( division => { return division.name == divid; });
			update.division = division;
			refresh.on.read( update ); 
			return; 
		},

		read: update => {
			let division = new Division( update.division );
			state.reset();
            state.current.divid     = division.name();
            state.current.athleteid = division.current.athleteid();
            refresh.tool.deductions( division );
            refresh.tool.scoring( division );
            refresh.tool.inspection( division );
            refresh.tool.help( division );
		},

		score: update => {
			let request   = update.request
			let division  = new Division( update.division );
			let athlete   = division.current.athlete();
			let athleteid = division.current.athleteid();
			if( athleteid == state.current.athleteid && request.judge == state.judge ) {
				if( request.score == 'clear' ) {
					setTimeout( () => { alertify.notify( `Score for ${athlete.name()} cleared by computer operator` ); sound.ok.play(); }, 500 );
				} else {
					setTimeout( () => { alertify.success( `Score for ${athlete.name()} successfully received by server` ); sound.ok.play(); }, 500 );
				}
			}
		}
	},
	scoring : {
		component : {
			score : athlete => {
				let boards  = athlete.boards();
				let score   = { "technical" : { "boards" : (boards * 0.2).toFixed( 1 )}, "presentation" : {}};
				let count   = boards == 0 ? 'Pending inspection' : `${boards} Board${boards > 1 ? 's' : ''} &rarr; +${score.technical.boards} pts`;
				let display = {
					"athlete" : {
						"technical" : { 
							"score" : $( '#tool-scoring .score-info .technical span' ),
						},
						"presentation" : {
							"score" : $( '#tool-scoring .score-info .presentation span' ),
						},
						"score" : $( '#tool-scoring .score-info .total-score .score' )
					}
				};
				let presentation = { 'categories' : [ 'technique', 'rhythm', 'style', 'creativity' ]};

				score.technical.difficulty = state.score.technical.difficulty;
				score.technical.summary    = score.technical.difficulty == 0 ? '&mdash;' : (parseFloat( score.technical.boards ) + parseFloat( score.technical.difficulty )).toFixed( 1 );
				score.presentation.summary = presentation.categories.some( x => state.score.presentation[ x ] == 0 ) ? '&mdash;' : (presentation.categories.reduce(( a, b ) => { return parseFloat( a ) + parseFloat( state.score.presentation[ b ]); }, 0.0 ).toFixed( 1 ));
				score.summary              = score.technical.summary == '&mdash;' || score.presentation.summary == '&mdash;' ? '&mdash;' : (parseFloat( score.technical.summary ) + parseFloat( score.presentation.summary )).toFixed( 1 );

				display.athlete.technical.score.html( score.technical.summary );
				display.athlete.presentation.score.html( score.presentation.summary );
				display.athlete.score.html( score.summary );

				let button = {
					send : $( '#tool-scoring .btn-send' )
				};

				button.send.off( 'click' ).click( ev => { 
					let copy = JSON.parse( JSON.stringify( state.score ));
					// Only the referee needs to send in technical and procedural deductions
					if( state.judge != 0 ) {
						delete copy.technical.deductions;
						delete copy.procedural;
					}
					let request = { data : { type : 'division', action : 'score', judge : state.judge, score : copy }};
					request.json = JSON.stringify( request.data );
					ws.send( request.json );
					sound.next.play();
					alertify.notify( `Sending score for ${athlete.name()}` );
				});
			}
		}
	},
	tool : {
		// ============================================================
		deductions : division => {
		// ============================================================
			let athlete = division.current.athlete();
			let display = {
				"athlete" : {
					"boards" : $( '#tool-deductions .score-info .board-count' ),
					"name" : $( '#tool-deductions .athlete-info' ),
					"technical" : { 
						"score" : $( '#tool-deductions .score-info .technical-score .score' ),
						"deductions" : $( '#tool-deductions .score-info .technical-deductions span' ),
						"explanation" : $( '#tool-deductions .score-info .technical-explanation' )
					},
					"procedural" : { "deductions" : $( '#tool-deductions .score-info .procedural-deductions span' )}
				},
				"division" : {
					"progress" : $( '#tool-deductions .division-info .division-progress' ),
					"summary" : $( '#tool-deductions .division-info .division-summary' )
				}
			};
			display.athlete.name.html( athlete.name());
			display.division.summary.html( division.summary());
			display.division.progress.html( division.progress());

			let boards     = athlete.boards();
			let count      = boards == 0 ? 'Boards pending inspection' : `${boards} Board${boards > 1 ? 's' : ''} at inspection`;
			let score      = (boards * 0.2).toFixed( 1 );
			let deductions = {
				technical  : ( state.score.technical.deductions.major + state.score.technical.deductions.minor ).toFixed( 1 ),
				procedural : state.score.procedural.deductions.toFixed( 1 )
			};
			display.athlete.boards.html( count );
			display.athlete.technical.deductions.html( deductions.technical );
			display.athlete.procedural.deductions.html( deductions.procedural );
			display.athlete.technical.explanation.html( `(${boards} boards &times; 0.2 points) - ${deductions.technical} tech. deduction =` );
			display.athlete.technical.score.html(( score - deductions.technical ).toFixed( 1 ));

			// ============================================================
			// DEDUCTIONS UI BEHAVIOR
			// ============================================================
			let button = {
				"procedural" : {
					"give" : $( '#tool-deductions .procedural-deductions a.give-procedural-deductions' ),
					"undo" : $( '#tool-deductions .procedural-deductions a.undo-procedural-deductions' )
				},
				"technical" : {
					"give" : {
						"major" : $( '#tool-deductions .major-technical-deductions a.give-technical-deductions' ),
						"minor" : $( '#tool-deductions .minor-technical-deductions a.give-technical-deductions' )
					},
					"undo" : {
						"major" : $( '#tool-deductions .major-technical-deductions a.undo-technical-deductions' ),
						"minor" : $( '#tool-deductions .minor-technical-deductions a.undo-technical-deductions' )
					}
				},
				"next" : $( '#tool-deductions .btn-next' )
			};

			function fixJsMath() {
				let fix = x => { return parseFloat( x.toFixed( 1 )); };
				state.score.procedural.deductions = fix( state.score.procedural.deductions );
				state.score.technical.deductions.major = fix( state.score.technical.deductions.major );
				state.score.technical.deductions.minor = fix( state.score.technical.deductions.minor );
			}

			button.procedural.give.off( 'click' ).click( ev => {
				state.score.procedural.deductions += 0.3;
				display.athlete.procedural.deductions.html( state.score.procedural.deductions.toFixed( 1 ));
			});
			button.procedural.undo.off( 'click' ).click( ev => {
				if( state.score.procedural.deductions <= 0 ) { return; }
				state.score.procedural.deductions -= 0.3; fixJsMath();
				display.athlete.procedural.deductions.html( state.score.procedural.deductions.toFixed( 1 ));
			});
			button.technical.give.major.off( 'click' ).click( ev => {
				state.score.technical.deductions.major += 0.3; fixJsMath();
				let sum = state.score.technical.deductions.major + state.score.technical.deductions.minor;
				display.athlete.technical.deductions.html( sum.toFixed( 1 ));
				display.athlete.technical.explanation.html( `(${boards} boards &times; 0.2 points) - ${sum.toFixed( 1 )} tech. deduction =` );
				display.athlete.technical.score.html(( score - sum ).toFixed( 1 ));
			});
			button.technical.undo.major.off( 'click' ).click( ev => {
				if( state.score.technical.deductions.major <= 0 ) { 
					if( state.score.technical.deductions.minor < 0.3 ) {
						state.score.technical.deductions.major = 0; 
						return; 
					}

					// Take from minors if no majors
					state.score.technical.deductions.minor -= 0.3; fixJsMath();
					state.score.technical.deductions.major += 0.3; fixJsMath();
				}

				state.score.technical.deductions.major -= 0.3;fixJsMath();
				let sum = state.score.technical.deductions.major + state.score.technical.deductions.minor;
				display.athlete.technical.deductions.html( sum.toFixed( 1 ));
				display.athlete.technical.explanation.html( `(${boards} boards &times; 0.2 points) - ${sum.toFixed( 1 )} tech. deduction =` );
				display.athlete.technical.score.html(( score - sum ).toFixed( 1 ));
			});
			button.technical.give.minor.off( 'click' ).click( ev => {
				state.score.technical.deductions.minor += 0.1;
				let sum = state.score.technical.deductions.major + state.score.technical.deductions.minor;
				display.athlete.technical.deductions.html( sum.toFixed( 1 ));
				display.athlete.technical.explanation.html( `(${boards} boards &times; 0.2 points) - ${sum.toFixed( 1 )} tech. deduction =` );
				display.athlete.technical.score.html(( score - sum ).toFixed( 1 ));
			});
			button.technical.undo.minor.off( 'click' ).click( ev => {
				if( state.score.technical.deductions.minor <= 0 ) { 
					if( state.score.technical.deductions.major < 0.3 ) {
						state.score.technical.deductions.minor = 0; 
						return; 
					}

					// Take from majors if no minors
					state.score.technical.deductions.major -= 0.3; fixJsMath();
					state.score.technical.deductions.minor += 0.3; fixJsMath();
				}
				state.score.technical.deductions.minor -= 0.1; fixJsMath();
				let sum = state.score.technical.deductions.major + state.score.technical.deductions.minor;
				display.athlete.technical.deductions.html( sum.toFixed( 1 ));
				display.athlete.technical.explanation.html( `(${boards} boards &times; 0.2 points) - ${sum.toFixed( 1 )} tech. deduction =` );
				display.athlete.technical.score.html(( score - sum ).toFixed( 1 ));
			});

			button.next.off( 'click' ).click( ev => {
				sound.next.play();
				$( '#nav-scoring' ).click();
			});
		},
		// ============================================================
		scoring : division => {
		// ============================================================
			let athlete = division.current.athlete();
			let boards  = athlete.boards();
			let score   = { "technical" : { "boards" : (boards * 0.2).toFixed( 1 )}, "presentation" : {}};
			let count   = boards == 0 ? 'Pending inspection' : `${boards} Board${boards > 1 ? 's' : ''} &rarr; +${score.technical.boards} pts`;
			let display = {
				"athlete" : {
					"boards" : $( '#tool-scoring .athlete-boards' ),
					"name" : $( '#tool-scoring .athlete-info' ),
				},
				"division" : {
					"progress" : $( '#tool-scoring .division-info .division-progress' ),
					"summary" : $( '#tool-scoring .division-info .division-summary' )
				}
			};
			display.athlete.name.html( athlete.name());
			display.division.summary.html( division.summary());
			display.division.progress.html( division.progress());
			display.athlete.boards.html( count );
			refresh.scoring.component.score( athlete );

			// ============================================================
			// SCORING UI BEHAVIOR
			// ============================================================
			let button = {
				"technical" : {
					"difficulty" : $( '#tool-scoring .scores .technical .difficulty button' ),
				},
				"presentation" : {
					"technique"  : $( '#tool-scoring .scores .presentation .technique button' ),
					"rhythm"     : $( '#tool-scoring .scores .presentation .rhythm button' ),
					"style"      : $( '#tool-scoring .scores .presentation .style button' ),
					"creativity" : $( '#tool-scoring .scores .presentation .creativity button' ),
				}
			};
			button.technical.difficulty.off( 'click' ).click( ev => {
				button.technical.difficulty.removeClass( 'active' );
				let target = $( ev.target );
				let value  = parseFloat( target.text());
				target.addClass( 'active' );
				state.score.technical.difficulty = value;
				refresh.scoring.component.score( athlete );
			});

			button.presentation.technique.off( 'click' ).click( ev => {
				button.presentation.technique.removeClass( 'active' );
				let target = $( ev.target );
				let value  = parseFloat( target.text());
				target.addClass( 'active' );
				state.score.presentation.technique = value;
				refresh.scoring.component.score( athlete );
			});

			button.presentation.rhythm.off( 'click' ).click( ev => {
				button.presentation.rhythm.removeClass( 'active' );
				let target = $( ev.target );
				let value  = parseFloat( target.text());
				target.addClass( 'active' );
				state.score.presentation.rhythm = value;
				refresh.scoring.component.score( athlete );
			});

			button.presentation.style.off( 'click' ).click( ev => {
				button.presentation.style.removeClass( 'active' );
				let target = $( ev.target );
				let value  = parseFloat( target.text());
				target.addClass( 'active' );
				state.score.presentation.style = value;
				refresh.scoring.component.score( athlete );
			});

			button.presentation.creativity.off( 'click' ).click( ev => {
				button.presentation.creativity.removeClass( 'active' );
				let target = $( ev.target );
				let value  = parseFloat( target.text());
				target.addClass( 'active' );
				state.score.presentation.creativity = value;
				refresh.scoring.component.score( athlete );
			});
		},
		// ============================================================
		inspection : division => {
		// ============================================================
			const max    = 15;
			let athletes = division.athletes();
			let list     = $( '#tool-inspection .inspection-list' );
			list.empty();

			athletes.forEach(( athlete, id ) => {
				let boards = athlete.boards();
				let name   = athlete.name();
				list.append( `<a class="list-group-item" data-athlete="${name}" data-id=${id} data-boards="${boards}">${name} <span class="badge">${boards == 0 ? '&mdash;' : boards}</span></a>` );
			});

			list.children( 'a' ).off( 'click' ).click( ev => {
				let target = $( ev.target );
				if( ! target.hasClass( 'list-group-item' )) { target = target.parent(); }
				let name    = target.attr( 'data-athlete' );
				let id      = target.attr( 'data-id' );
				let boards  = target.attr( 'data-boards' );

				$( '#board-number-pad .athlete-name' ).html( name );
				$( '#board-number-pad' ).modal( 'show' );
				$( '#board-number-pad .board-input' ).html( boards );
				$( '#board-number-pad .btn-confirm' ).attr({ 'data-id' : id });
				$( '#board-number-pad .btn-confirm' ).attr({ 'data-athlete' : name });
			});

			$( '#board-number-pad button' ).off( 'click' ).click( ev => {
				let input   = $( '#board-number-pad .board-input' );
				let send    = $( '#board-number-pad .btn-confirm' );
				let target  = $( ev.target );
				let value   = target.attr( 'data-value' );
				let boards  = input.text() == '' ? 0 : parseInt( input.text());

				if( value == 'clear' ) {
					boards = 0;
					input.empty();
					send.addClass( 'disabled' );
					return;
				}

				if( value == 'max' ) {
					boards = max;
					input.html( boards );
					send.removeClass( 'disabled' );
					return;
				}

				let update = parseInt( `${boards}${value}` );
				input.html( boards );
				if( update <= max ) { boards = update; input.html( boards ); send.removeClass( 'disabled' ); }
				if( update == 0 ) { boards = 0; send.addClass( 'disabled' ); }

			});

			$( '#board-number-pad .btn-confirm' ).off( 'click' ).click( ev => {
				let target  = $( ev.target );
				let input   = $( '#board-number-pad .board-input' );
				let send    = $( '#board-number-pad .btn-confirm' );
				let boards  = parseInt( input.text());
				let id      = target.attr( 'data-id' );
				let name    = target.attr( 'data-athlete' );

				let request = { data : { type : 'division', action : 'inspection', athlete : id, boards }};
				request.json = JSON.stringify( request.data );
				ws.send( request.json );
				alertify.notify( `Sending inspection confirmation to server. ${name} has ${boards} board${boards == 1 ? '' : 's'}` );
				$( '#board-number-pad' ).modal( 'hide' );

			});
		},
		// ============================================================
		help : division => {
		// ============================================================
			let summary = division.summary();
			$( '#tool-help .division-summary' ).html( summary );
			let agegroup = {
				'6-7'    : 'ages-6-9',
				'dragon' : 'ages-6-9',
				'u7'     : 'ages-6-9',
				'8-9'    : 'ages-6-9',
				'tiger'  : 'ages-6-9',
				'u9'     : 'ages-6-9',
				'10-11'  : 'ages-10-14',
				'youth'  : 'ages-10-14',
				'u12'    : 'ages-10-14',
				'12-14'  : 'ages-10-14',
				'cadet'  : 'ages-10-14',
				'u14'    : 'ages-10-14',
				'15-17'  : 'ages-10-14',
				'junior' : 'ages-15-up',
				'u17'    : 'ages-15-up',
				'18+'    : 'ages-15-up',
				'18-30'  : 'ages-15-up',
				'senior' : 'ages-15-up',
				'u30'    : 'ages-15-up'
			};

			let match = Object.keys( agegroup ).find( key => { let regex = new RegExp( key, 'i' ); return summary.match( regex ); });
			$( '.agegroup' ).removeClass( 'correct-board' );
			if( match ) { $( `.${agegroup[ match ]}` ).addClass( 'correct-board' ); }
		}
	}
};
