class Score {
	constructor( score = { adjusted: { accuracy: 0, presentation: 0, total: 0 }, complete: false, forms: [], total: 0 } ) {
		this.score = score;

		this.is = {
			complete : () => { return score?.complete ? score.complete : false; }
		};

		this.decision = {
			awarded: () => {
			// Returns the form for which a decision has been awarded. If no decisions were awarded, then score.decision.awarded() returns undefined
				return score.forms.map( form => new Form( form )).find( form => form.decision.awarded());
			}
		};

		this.forms = {
			count : () => score?.forms?.length,
			list  : () => score?.forms
		};

		this.notes = () => score?.notes;
		this.total = () => score?.total;
		this.adjusted = {
			presentation : () => score?.adjusted?.presentation,
			total        : () => score?.adjusted?.total
		};

		this.summary = () => {
			let summary  = [];
			let total    = 0.0;
			let is       = { decided: false, scored: false };
			let n        = score.forms.length;
			let decision = false;
			score.forms.forEach(( form, i ) => { 
				let f = new Form( form );
				let j = i + 1; 

				// ===== SHOW DECISION IF THERE IS A DECISION
				if( decision ) { return; } // A decision has previously been detected; no need to append subsequent scores or decisions
				decision = f.decision.awarded();
				if( decision ) {
					is.decided = true;
					if( i > 0 ) {
						summary.push( `<span class="form${j}of${n} decision">${decision.code}</span>` );
					}

				// ===== SHOW SCORE IF THERE IS A COMPLETED SCORE
				} else if( defined( form?.adjusted )) {
					let subtotal = isNaN( parseFloat( form.adjusted?.total )) ? 0 : parseFloat( form.adjusted.total );
					is.scored = subtotal == 0 ? false : true;
					total += subtotal;
					summary.push( `<span class="form${j}of${n} total score">${subtotal == 0 ? '&ndash;' : subtotal.toFixed( 2 )}</span>` ); 
				}
			});

			if( is.scored && ! is.decided && n > 1 ) {
				summary.push( `<span class="sum total score">${total.toFixed( 2 )}</span>` ); 

			} else if( is.decided ) {
				summary.push( `<span class="sum total score">${decision.code}</span>` ); 
			}
			return summary.join( "&nbsp;" );
		};

		this.form = i => {
			let form = score?.forms?.[ i ];
			if( ! defined( form )) { return undefined; }
			return new Form( form );
		};
	}
};
module.exports = Score;
