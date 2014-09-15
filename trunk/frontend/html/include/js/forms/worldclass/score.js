var FreeScore;
if( typeof( FreeScore ) === 'undefined' ) { FreeScore = {}; }

FreeScore.JudgeScore = function( score ) {
	this.major        = Number.parseFloat( score.major );
	this.minor        = Number.parseFloat( score.minor );
	this.penalties    = this.major + this.minor;
	this.accuracy     = this.penalties > 4.0 ? 0.0 : 4.0 - this.penalties;
	this.rhythm       = Number.parseFloat( score.rhythm );
	this.power        = Number.parseFloat( score.power );
	this.ki           = Number.parseFloat( score.ki );
	this.presentation = this.rhythm + this.power + this.ki;
}

FreeScore.Score = function( scores ) {
	this.min   = { accuracy : 0, presentation : 0 };
	this.max   = { accuracy : 0, presentation : 0 };
	this.total = { accuracy : 0.0, presentation : 0.0, score : 0.0, count : 0 };
	this.judge = [];
	for( var i = 0; i < scores.length; i++ ) {
		var score = new FreeScore.JudgeScore( scores[ i ] );
		this.judge[ i ] = score;

		// ===== SKIP INCOMPLETE SCORES
		if( score.penalties < 0 || score.presentation < 0 ) { this.complete = false; continue; }

		// ===== CALCULATE HIGHS AND LOWS
		this.min.accuracy     = this.judge[ this.min.accuracy     ].accuracy     > score.accuracy     ? i : this.min.accuracy;
		this.min.presentation = this.judge[ this.min.presentation ].presentation > score.presentation ? i : this.min.presentation;
		this.max.accuracy     = this.judge[ this.max.accuracy     ].accuracy     < score.accuracy     ? i : this.max.accuracy;
		this.max.presentation = this.judge[ this.max.presentation ].presentation < score.presentation ? i : this.max.presentation;

		// ===== CALCULATE TOTALS
		this.total.accuracy     += score.accuracy;
		this.total.presentation += score.presentation;
		this.total.score        += (score.accuracy + score.presentation);
		this.total.count++;
	}

	// ===== CHECK IF ALL JUDGES HAVE SCORED
	if( this.judge.length == this.total.count ) { this.complete = true; }

	// ===== CALCULATE SCORE MEAN
	if       ( this.judge.length > 0 && this.judge.length <= 4 ) {
		this.mean = this.total.score / this.total.count;

	} else if( this.judge.length >= 5 ) {
		var dropped = this.judge[ this.min.accuracy ].accuracy + this.judge[ this.min.presentation ].presentation + this.judge[ this.max.accuracy ].accuracy + this.judge[ this.max.presentation ].presentation;
		var total   = this.total.score - dropped;
		this.mean   = total / this.total.count;

	} else {
		this.mean = 0.0;
	}
}

FreeScore.Score.prototype.compare = function( that ) {
	var condition = {
		better_score : that.mean - this.mean,
		tiebreaker_1 : that.total.presentation - this.total.presentation,
		tiebreaker_2 : that.total.score - this.total.score,
	};

	// ===== HIGHER MEAN SCORE IS BETTER
	if( condition.better_score != 0 ) { return condition.better_score; }

	// ===== MEAN SCORES TIED? LOOK AT TOTAL PRESENTATION SCORES
	if( condition.tiebreaker_1 != 0 ) { 
		this.tiebreaker = "Presentation score: " + this.total.presentation.toFixed( 1 );
		that.tiebreaker = "Presentation score: " + that.total.presentation.toFixed( 1 );
		return condition.tiebreaker_1; 
	}

	// ===== TOTAL PRESENTATION SCORES TIED? BRING BACK THE HIGHS AND LOWS
	if( condition.tiebreaker_2 != 0 ) {
		this.tiebreaker = "Presentation tied. Total score: " + this.total.score.toFixed( 1 );
		that.tiebreaker = "Presentation tied. Total score: " + that.total.score.toFixed( 1 );
		return condition.tiebreaker_2; 
	}

	// ===== OTHERWISE REPEAT THE POOMSAE AND VOTE OR RE-SCORE
	// todo
}
