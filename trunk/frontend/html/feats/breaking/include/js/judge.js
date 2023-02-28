
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
						"deductions" : $( '#tool-deductions .score-info .technical-deductions' ),
						"explanation" : $( '#tool-deductions .score-info .technical-explanation' )
					},
					"procedural" : { "deductions" : $( '#tool-deductions .score-info .procedural-deductions' )}
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
			display.athlete.technical.deductions.html( `Technical: -${deductions.technical}` );
			display.athlete.procedural.deductions.html( `Procedural: -${deductions.procedural}` );
			display.athlete.technical.explanation.html( `(${boards} boards &times; 0.2 points) - ${deductions.technical} tech. deduction =` );
			display.athlete.technical.score.html( score );
		},
		scoring : ( division ) => {
		},
		inspection : ( division ) => {
		}
	}
};
