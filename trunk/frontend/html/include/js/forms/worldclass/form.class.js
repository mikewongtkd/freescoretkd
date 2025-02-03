class Form {
	constructor( form = { major: 0, minor: 0, power: 0, rhythm: 0, ki: 0, penalty: { bounds: 0.0, restart: 0.0, timelimit: 0.0, misconduct: 0 }}) {
		this.form = form;
		this.award = {
			penalty: function( category ) {
				// Initialize penalties
				if( ! defined( form?.penalty )) { form.penalty = { bounds: 0.0, restart: 0.0, timelimit: 0.0, misconduct: 0 }; }
				[ 'bounds', 'timelimit', 'restart', 'misconduct' ].forEach(( category, i ) => { form.penalty[ category ] = defined( form.penalty[ category ]) ? form.penalty[ category ] : 0; });

				// Award the penalty
				if( category == 'bounds'     ) { form.penalty.bounds     = parseFloat( form.penalty.bounds     ) + 0.3; }
				if( category == 'timelimit'  ) { form.penalty.timelimit  = parseFloat( form.penalty.timelimit  ) + 0.3; }
				if( category == 'restart'    ) { form.penalty.restart    = parseFloat( form.penalty.restart    ) + 0.6; }
				if( category == 'misconduct' ) { form.penalty.misconduct = parseInt(   form.penalty.misconduct ) + 1;   }
			}
		};

		this.clear = {
			penalties: function() {
				form.penalty = { bounds: 0.0, restart: 0.0, timelimit: 0.0, misconduct: 0 };
			}
		};

		this.decision = {
			awarded : () => { 
				if( defined( form?.decision?.disqualify )) { return { name: 'disqualify', code: 'DSQ' }; }
				if( defined( form?.decision?.withdraw ))   { return { name: 'withdraw',   code: 'WDR' }; }
				return false;
			},
			is : {
				withdraw   : () => defined( form?.decision?.withdraw ) ? form.decision.withdraw : false,
				disqualify : () => defined( form?.decision?.withdraw ) ? form.decision.disqualify : false
			}
		};

		this.is = {
			complete : () => form?.complete,
			scored : () => { 
				if( [ 'major', 'minor', 'power', 'rhythm', 'ki' ].some( key => isNaN( parseFloat( form?.[ key ])))) { return false; }

				let sum          = ( object, keys ) => array.map( key => parseFloat( object[ key ])).reduce(( acc, cur ) => acc + cur, 0.0 );
				let accuracy     = sum( form, [ 'major', 'minor' ]);
				let presentation = sum( form, [ 'power', 'rhythm', 'ki' ]);
				return (accuracy >= 0.0 || presentation > 0.0);
			}
		};
	}

	accuracy() {
		return this.form?.adjusted?.accuracy ? this.form.adjusted.accuracy : 0;
	}

	adjusted() { return this.form?.adjusted; }

	judge( j ) {
		let form = this.form;
		let judgeScore = form.judge[ j ];
		return {
			score : {
				accuracy : function() {
					let deductions = parseFloat( judgeScore.major ) + parseFloat( judgeScore.minor );
					let accuracy   = deductions > 4.0 ? 0.0 : 4.0 - deductions;
					return parseFloat( accuracy ).toFixed( 1 );
				},
				presentation : function() {
					let presentation = parseFloat( judgeScore.power ) + parseFloat( judgeScore.rhythm ) + parseFloat( judgeScore.ki );
					return parseFloat( presentation ).toFixed( 1 );
				},
				data : function() { return judgeScore; },
				ignore : {
					accuracy : () => [ 'minacc', 'maxacc' ].some( drop => judgeScore?.[ drop ]),
					presentation : () => [ 'minpre', 'maxpre' ].some( drop => judgeScore?.[ drop ]),
				},
				is: {
					complete : function() { return judgeScore?.complete; },
					min : {
						acc: () => judgeScore?.minacc,
						pre: () => judgeScore?.minpre
					},
					max : {
						acc: () => judgeScore?.maxacc,
						pre: () => judgeScore?.maxpre
					}
				}
			}
		};
	}

	penalty() {
		let form = this.form;
		if( ! defined( form?.penalty )) { return { data: () => null, from: key => 0, total: () => 0 }; }
		return {
			data : function() { return form.penalty; },
			from : function( key ) {
				if( ! key in form.penalty           ) { return 0; }
				if( ! defined( form.penalty[ key ] )) { return 0; }
				return parseFloat( form.penalty[ key ]); 
			},
			total : function() {
				let total = 0.0;
				Object.keys( form.penalty ).forEach( function( category ) { 
					if( category == 'misconduct' ) { return; } // Gamjeoms do not deduct from points
					let value = defined( form.penalty[ category ] ) ? parseFloat( form.penalty[ category ]) : 0.0;
					total += value;
				});
				return total;
			}
		};
	}

	presentation() {
		return this.form?.adjusted?.presentation ? this.form.adjusted.presentation : 0;
	}
};
