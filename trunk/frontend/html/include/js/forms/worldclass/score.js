var FreeScore;
if( typeof( FreeScore ) === 'undefined' ) { FreeScore = {}; }
if( typeof( FreeScore.WorldClass ) === 'undefined' ) { FreeScore.WorldClass = {}; }

FreeScore.WorldClass.JudgeScore = function( score ) {
	var defined       = typeof( score ) !== 'undefined';
	this.major        = defined ? Number.parseFloat( score.major )   : -1.0;
	this.minor        = defined ? Number.parseFloat( score.minor )   : -1.0;
	this.penalties    = defined ? this.major + this.minor            : -1.0;

	var  accuracy     = parseFloat((this.penalties > 4.0 ? 0.0 : 4.0 - this.penalties).toFixed( 1 ));
	this.accuracy     = defined ? accuracy                           : -1.0;

	this.rhythm       = defined ? Number.parseFloat( score.rhythm )  : -1.0;
	this.power        = defined ? Number.parseFloat( score.power )   : -1.0;
	this.ki           = defined ? Number.parseFloat( score.ki )      : -1.0;

	var  presentation = parseFloat((this.rhythm + this.power + this.ki).toFixed( 1 ));
	this.presentation = defined ? presentation                       : -1.0;

	this.total        = parseFloat((accuracy + presentation).toFixed( 1 ));
}

FreeScore.WorldClass.Score = function( scores, judges ) {
	this.complete     = true;
	this.mean         = 0.0;
	this.form         = [];
	this.total        = { accuracy : [], presentation : [], score : [] };

	// ===== FOR EACH FORM IN A GIVEN ROUND
	// Usually 1 form Preliminary round, 1-2 forms Semi-Finals round, 2 forms Finals round.
	for( var i = 0; i < scores.length; i++ ) {
		var form = this.form[ i ] = { 
			judge : [], 
			min   : { accuracy : 0,   presentation : 0 },
			max   : { accuracy : 0,   presentation : 0 },
			total : { accuracy : 0.0, presentation : 0.0, score : 0.0 },
		};

		// ===== FOR EACH JUDGE SCORE PER FORM
		for( var j = 0; j < judges; j++ ) {
			var score = this.form[ i ].judge[ j ] = new FreeScore.WorldClass.JudgeScore( scores[ i ][ j ] );

			// ===== SKIP INCOMPLETE SCORES
			if( score.penalties < 0 || score.presentation < 0 ) { form.complete = false; continue; }

			// ===== CALCULATE HIGHS AND LOWS FOR A GIVEN FORM
			form.min.accuracy     = form.judge[ form.min.accuracy     ].accuracy     > score.accuracy     ? j : form.min.accuracy;
			form.min.presentation = form.judge[ form.min.presentation ].presentation > score.presentation ? j : form.min.presentation;
			form.max.accuracy     = form.judge[ form.max.accuracy     ].accuracy     < score.accuracy     ? j : form.max.accuracy;
			form.max.presentation = form.judge[ form.max.presentation ].presentation < score.presentation ? j : form.max.presentation;

			// ===== CALCULATE TOTALS
			form.total.accuracy     += score.accuracy;
			form.total.presentation += score.presentation;
			form.total.score        += (score.accuracy + score.presentation);
			form.total.count++;
		}

		// ===== CHECK IF ALL JUDGES HAVE SCORED
		if( form.judge.length == form.total.count ) { form.complete = true; }

		// ===== CALCULATE SCORE MEAN
		if       ( judges > 0 && judges <= 4 ) {
			form.mean = form.total.score / form.total.count;

		} else if( judges >= 5 ) {
			var dropped = form.judge[ form.min.accuracy ].accuracy + form.judge[ form.min.presentation ].presentation + form.judge[ form.max.accuracy ].accuracy + form.judge[ form.max.presentation ].presentation;
			var total   = form.total.score - dropped;
			form.mean   = total / form.total.count;

		} else {
			form.mean = 0.0;
		}
		this.complete = this.complete && form.complete;
		this.mean += form.mean;
	}
	this.complete = this.complete && (scores.length > 0); // At least one form must have been judged
}

FreeScore.WorldClass.Score.prototype.compare = function( that ) {
	var tie = 0; // Scores that have a difference of 0 are tied
	var compare = {
		mean_score   : 0.0,
		presentation : 0.0,
		total_score  : 0.0,
	};
	for( var i = 0; i < this.form.length; i++ ) {
		var a = this.form[ i ];
		var b = that.form[ i ];
		compare.mean_score   += (a.mean               - b.mean);
		compare.presentation += (a.total.presentation - b.total.presentation);
		compare.total_score  += (a.total.score        - b.total.score);
	}

	// ===== HIGHER MEAN SCORE IS BETTER
	if( compare.mean_score != tie ) { 
		return compare.mean_score; 
	}

	// ===== MEAN SCORES TIED? LOOK AT TOTAL PRESENTATION SCORES
	if( compare.presentation != tie ) { 
		this.tiebreaker = "Presentation score: " + this.total.presentation.toFixed( 1 );
		that.tiebreaker = "Presentation score: " + that.total.presentation.toFixed( 1 );
		return compare.presentation;
	}

	// ===== TOTAL PRESENTATION SCORES TIED? BRING BACK THE HIGHS AND LOWS
	if( compare.total_score != tie ) {
		this.tiebreaker = "Presentation tied. Total score: " + this.total.score.toFixed( 1 );
		that.tiebreaker = "Presentation tied. Total score: " + that.total.score.toFixed( 1 );
		return compare.total_score;
	}

	// ===== OTHERWISE REPEAT THE POOMSAE AND VOTE OR RE-SCORE
	// todo
}
