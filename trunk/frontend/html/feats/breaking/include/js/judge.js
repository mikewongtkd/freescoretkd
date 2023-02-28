
var refresh = {
	tool : {
		deductions : ( division ) => {
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
			// BEHAVIOR
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
			});
		},
		scoring : ( division ) => {
		},
		inspection : ( division ) => {
		}
	}
};
