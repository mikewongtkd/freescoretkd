module.exports = Score;

function Score( score ) {
	this.score = score;

	this.is = {
		complete : function() { return score.complete; }
	};

	this.decision = {
		is : {
			withdrawn    : function() { return score.decision.withdrawn; },
			disqualified : function() { return score.decision.disqualified; },
		}
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

	// ===== SINGLE JUDGE DATA
	// Each judge device receives only the data from that judge, to insure
	// independence and promote fairness
	if( score.forms[ 0 ].judge.length == 1 ) {
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
						if( category == 'bounds'     ) { form.penalty.bounds     += 0.3; }
						if( category == 'restart'    ) { form.penalty.restart    += 0.3; }
						if( category == 'misconduct' ) { form.penalty.misconduct += 1;   }
					}
				},
				clear: {
					penalties: function() {
						form.penalty = { bounds: 0.0, restart: 0.0, misconduct: 0 };
					}
				}
				decision : {
					is : {
						withdrawn    : function() { if( defined( form.decision )) { return form.decision.withdrawn;    } else { return false; } },
						disqualified : function() { if( defined( form.decision )) { return form.decision.disqualified; } else { return false; } },
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
							if( key in form.penalty ) { return form.penalty[ key ]; }
							return undefined;
						},
						total : function() {
							var total = 0.0;
							Object.keys( form.penalty ).forEach( function( category ) { 
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
