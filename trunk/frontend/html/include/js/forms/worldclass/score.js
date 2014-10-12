var FreeScore;
if( typeof( FreeScore ) === 'undefined' ) { FreeScore = {}; }
if( typeof( FreeScore.WorldClass ) === 'undefined' ) { FreeScore.WorldClass = {}; }

FreeScore.WorldClass.JudgeScore = function( score ) {
	var defined       = typeof( score ) !== 'undefined';
	if( ! defined ) {
		this.round        = 'Unknown';
		this.major        = -1.0;
		this.minor        = -1.0;
		this.rhythm       = -1.0;
		this.power        = -1.0;
		this.ki           = -1.0;
		this.accuracy     = -1.0;
		this.penalties    = -1.0;
		this.presentation = -1.0;
		this.total        = -1.0;

	} else {
		this.major        = parseFloat( score.major );
		this.minor        = parseFloat( score.minor );
		this.penalties    = this.major + this.minor;

		var  accuracy;
		if( this.penalties <= 4.0 ) { accuracy = parseFloat((4.0 - this.penalties).toFixed( 1 )); }
		else                        { accuracy = 0.0; }
		this.accuracy     = accuracy;

		this.rhythm       = parseFloat( score.rhythm );
		this.power        = parseFloat( score.power );
		this.ki           = parseFloat( score.ki );

		var  presentation = parseFloat((this.rhythm + this.power + this.ki).toFixed( 1 ));
		this.presentation = presentation;

		this.total        = accuracy >= 0 && presentation >= 0 ? parseFloat((accuracy + presentation).toFixed( 1 )) : -1.0;
	}
}

FreeScore.WorldClass.JudgeScore.prototype.valid = function() {
	return (this.accuracy >=0 && this.presentation >= 0);
}

FreeScore.WorldClass.Score = function( scores ) {
	this.complete     = true;
	this.form         = [];
	this.mean         = { accuracy : 0.0, presentation : 0.0, total : 0.0 };
	this.scores       = [];

	round     = typeof( round )     === 'undefined' ? 'Finals' : round;

	for( var i = 0; i < scores.length; i++ ) {
		var score = new FreeScore.WorldClass.JudgeScore( scores[ i ] );
		this.scores.push( score );
		if( score.valid()) { this.mean.accuracy     += score.accuracy;                      }
		if( score.valid()) { this.mean.presentation += score.presentation;                  }
		if( score.valid()) { this.mean.total        += score.accuracy + score.presentation; }
	}
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
