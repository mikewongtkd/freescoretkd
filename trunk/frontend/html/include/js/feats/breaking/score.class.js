module.exports = Score;

function Score( scores ) {
	this.scores = scores;

	this.forJudge = function( i ) {
		var score = scores[ i ];
		if( isNaN( score ) || score <= 0 ) { return ''; }
		return parseFloat( score ).toFixed( 1 );
	}

	this.is = {
		complete : function() { 
			for( var i = 0; i < scores.length; i++ ) { if( isNaN( scores[ i ] ) || scores[ i ] <= 0 ) { return 0; } }
			return 1;
		}
	};

	this.total = function() {
		var sum = 0.0;
		for( var i = 0; i < scores.length; i++ ) { 
			if( isNaN( scores[ i ] ) || scores[ i ] <= 0 ) { return '-'; } 
			sum += parseFloat( scores[ i ] );
		}
		return sum.toFixed( 1 );
	}
};
