module.exports = Score;

function Score( score ) {
	this.score = score;

	this.is = {
		complete : function() { if( ! defined( score )) { return false; } return score.complete; }
	};

	this.forms = {
		count : function() { return score.forms.length; },
		list  : function() { return score.forms; }
	};

	this.notes = function() { return score.notes; };
	this.total = function() { return score.total; };
	this.adjusted = {
		presentation : function() { return score.adjusted.presentation; },
		total        : function() { return score.adjusted.total; }
	};

	this.summary = function() {
		var summary = [];
		var total   = 0.0;
		var state   = { decision: false, scored: false };
		var n       = score.forms.length;
		score.forms.forEach(( form, i ) => { 
			j = i + 1; 
			// ===== SHOW DECISION IF THERE IS A DECISION
			if( defined( form.decision )) {
				state.decision = true;
				var decisions = [ { name: 'disqualify', code: 'DQ'}, { name: 'withdraw', code: 'WD' } ];
				var decision  = decisions.reduce(( selected, decision ) => { if( ! selected && form.decision[ decision.name ] ) { return decision.code; } else { return selected }}, undefined );
				if( defined( decision )) {
					summary.push( '<span class="form' + j + 'of' + n + ' decision">' + decision + '</span>' );
				}

			// ===== SHOW SCORE IF THERE IS A COMPLETED SCORE
			} else if( defined( form.adjusted )) {
				state.scored = true;
				total += parseFloat( form.adjusted.total );
				summary.push( '<span class="form' + j + 'of' + n + ' total score">' + parseFloat( form.adjusted.total ).toFixed( 2 ) + '</span>' ); 
			}
		});
		if( state.scored && ! state.decision && n > 1 ) {
			summary.push( '<span class="sum total score">' + total.toFixed( 2 ) + '</span>' ); 
		}
		return summary.join( "&nbsp;" );
	};

	// ===== SCORE NOT GIVEN YET
	// Do nothing
	if( ! defined( score )) {

	// ===== SINGLE JUDGE DATA
	// Each judge device receives only the data from that judge, to insure
	// independence and promote fairness
	} else if( score.forms[ 0 ].judge.length == 1 ) {
		_form = this.form = function( i ) {
			var form       = score.forms[ i ];
			var judgeScore = form.judge[ 0 ];

			return {
				accuracy : function() {
					var deductions = parseFloat( judgeScore.major ) + parseFloat( judgeScore.minor );
					var accuracy   = deductions > 4.0 ? 0.0 : 4.0 - deductions;
					return parseFloat( accuracy.toFixed( 1 ));
				},
				presentation : function() {
					var presentation = parseFloat( judgeScore.power ) + parseFloat( judgeScore.rhythm ) + parseFloat( judgeScore.ki );
					return parseFloat( presentation.toFixed( 1 ));
				},
				is: {
					complete : function() { return form.complete; },
					scored : function() { 
						var deductions   = parseFloat( judgeScore.major ) + parseFloat( judgeScore.minor );
						var presentation = parseFloat( judgeScore.power ) + parseFloat( judgeScore.rhythm ) + parseFloat( judgeScore.ki );
						return (deductions > 0.0 || presentation > 0.0);
					}
				}
			};
		};

		this.average = function() {
			if( score.forms.length == 0 ) { return 0.0; }
			var average = 0.0;
			for( var i = 0; i < score.forms.length; i++ ) {
				var form = _form( i );
				average += form.accuracy() + form.presentation();
			}
			average /= parseFloat( score.forms.length );
			return parseFloat( average.toFixed( 2 ));
		}

	// ===== FULL DIVISION DATA
	// All other devices receive full division data
	} else {
		_form = this.form = function( i ) {
			var form = score.forms[ i ];
			if( ! defined( form )) { return undefined; }
			return { 
				adjusted : function() { return form.adjusted; },
				award : {
					penalty: function( category ) {
						// Initialize penalties
						if( ! defined( form.penalty )) { form.penalty = { bounds: 0.0, restart: 0.0, timelimit: 0.0, misconduct: 0 }; }
						[ 'bounds', 'timelimit', 'restart', 'misconduct' ].forEach(( category, i ) => { form.penalty[ category ] = defined( form.penalty[ category ]) ? form.penalty[ category ] : 0; });

						// Award the penalty
						if( category == 'bounds'     ) { form.penalty.bounds     = parseFloat( form.penalty.bounds     ) + 0.3; }
						if( category == 'timelimit'  ) { form.penalty.timelimit  = parseFloat( form.penalty.timelimit  ) + 0.3; }
						if( category == 'restart'    ) { form.penalty.restart    = parseFloat( form.penalty.restart    ) + 0.6; }
						if( category == 'misconduct' ) { form.penalty.misconduct = parseInt(   form.penalty.misconduct ) + 1;   }
					}
				},
				clear: {
					penalties: function() {
						form.penalty = { bounds: 0.0, restart: 0.0, timelimit: 0.0, misconduct: 0 };
					}
				},
				decision : {
					is : {
						withdraw   : function() { if( defined( form.decision )) { return form.decision.withdraw;   } else { return false; } },
						disqualify : function() { if( defined( form.decision )) { return form.decision.disqualify; } else { return false; } },
					}
				},
				is : {
					complete : function() { return form.complete; }
				},
				judge : function( j ) {
					var judgeScore = form.judge[ j ];
					return {
						score : {
							accuracy : function() {
								var deductions = parseFloat( judgeScore.major ) + parseFloat( judgeScore.minor );
								var accuracy   = deductions > 4.0 ? 0.0 : 4.0 - deductions;
								return parseFloat( accuracy.toFixed( 1 ));
							},
							presentation : function() {
								var presentation = parseFloat( judgeScore.power ) + parseFloat( judgeScore.rhythm ) + parseFloat( judgeScore.ki );
								return parseFloat( presentation.toFixed( 1 ));
							},
							data : function() { return judgeScore; },
							is: {
								complete : function() { return judgeScore.complete; },
							}
						}
					};
				},
				penalty : function() {
					if( ! defined( form.penalty )) { return undefined; }
					return {
						data : function() { return form.penalty; },
						from : function( key ) {
							if( ! key in form.penalty           ) { return 0; }
							if( ! defined( form.penalty[ key ] )) { return 0; }
							return parseFloat( form.penalty[ key ]); 
						},
						total : function() {
							var total = 0.0;
							Object.keys( form.penalty ).forEach( function( category ) { 
								if( category == 'misconduct' ) { return; } // Gamjeoms do not deduct from points
								var value = defined( form.penalty[ category ] ) ? parseFloat( form.penalty[ category ]) : 0.0;
								total += value;
							});
							return total;
						}
					};
				}
			};
		};
	}
};
