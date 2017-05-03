module.exports = Score;

function Score( score ) {
	this.score = score;

	this.is = {
		complete : function() { return score.complete; }
	};
};
