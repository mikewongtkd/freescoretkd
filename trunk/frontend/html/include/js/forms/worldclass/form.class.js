class Form {
	constructor( form ) {
		this.form = form;
		this.award = {
			penalty: function( category ) {
				// Initialize penalties
				if( ! defined( form ) || ! defined( form.penalty )) { form.penalty = { bounds: 0.0, restart: 0.0, timelimit: 0.0, misconduct: 0 }; }
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
			is : {
				withdraw   : function() { if( defined( form.decision )) { return form.decision.withdraw;   } else { return false; } },
				disqualify : function() { if( defined( form.decision )) { return form.decision.disqualify; } else { return false; } },
			}
		};

		this.is = {
			complete : function() { return form.complete; },
			scored : function() { 
				let deductions   = parseFloat( form.major ) + parseFloat( form.minor );
				let presentation = parseFloat( form.power ) + parseFloat( form.rhythm ) + parseFloat( form.ki );
				return (deductions >= 0.0 || presentation > 0.0);
			}
		};
	}

	accuracy() {
		return this.form?.adjusted?.accuracy ? this.form.adjusted.accuracy : 0;
	}

	adjusted() { return this.form.adjusted; }

	average() {
		if( score.forms.length == 0 ) { return 0.0; }
		let average = 0.0;
		for( let i = 0; i < score.forms.length; i++ ) {
			let form = _form( i );
			average += form.accuracy() + form.presentation();
		}
		average = parseFloat( average.toFixed( 1 ));
		average /= parseFloat( score.forms.length );
		return parseFloat( average.toFixed( 2 ));
	}

	judge( j ) {
		let form = this.form;
		let judgeScore = form.judge[ j ];
		return {
			score : {
				accuracy : function() {
					let deductions = parseFloat( judgeScore.major ) + parseFloat( judgeScore.minor );
					let accuracy   = deductions > 4.0 ? 0.0 : 4.0 - deductions;
					return parseFloat( accuracy.toFixed( 1 ));
				},
				presentation : function() {
					let presentation = parseFloat( judgeScore.power ) + parseFloat( judgeScore.rhythm ) + parseFloat( judgeScore.ki );
					return parseFloat( presentation.toFixed( 1 ));
				},
				data : function() { return judgeScore; },
				is: {
					complete : function() { return judgeScore.complete; },
				}
			}
		};
	}

	penalty() {
		let form = this.form;
		if( ! defined( form ) || ! defined( this.form.penalty )) { return { data : () => null, from : key => 0, total : () => 0 }; }
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
