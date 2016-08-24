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
			var form = score.forms[ i ];

			return {
				accuracy : function() {
					var judgeScore = form.judge[ 0 ];
					var deductions = parseFloat( judgeScore.major ) + parseFloat( judgeScore.minor );
					var accuracy   = deductions > 4.0 ? 0.0 : 4.0 - deductions;
					return parseFloat( accuracy.toFixed( 1 ));
				},
				presentation : function() {
					var judgeScore   = form.judge[ 0 ];
					var presentation = parseFloat( judgeScore.power ) + parseFloat( judgeScore.rhythm ) + parseFloat( judgeScore.ki );
					return parseFloat( presentation.toFixed( 1 ));
				},
				is: {
					complete : function() { return form.complete; },
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
	}
};
