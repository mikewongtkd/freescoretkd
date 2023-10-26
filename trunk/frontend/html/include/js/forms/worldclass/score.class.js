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

	if( defined( score )) {
		_form = this.form = function( i ) {
			let form = score.forms[ i ];
			if( ! defined( form )) { return undefined; }
			return new Form( form );
		};
	}
};
