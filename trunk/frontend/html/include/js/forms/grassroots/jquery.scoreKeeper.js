$.widget( "freescore.scoreKeeper", {
	options: { autoShow: true, numJudges: 3 },
	_init: function() {
		var html = { div : $( "<div />" ) };

		var view        = html.div.clone();
		var judgeScores = html.div.clone();
		var judges      = new Array();
		var judgeEditor = html.div.clone();
		var totalScore  = html.div.clone();

		for( var i = 0; i < this.options.numJudges; i++ ) {
			var judge = html.div.clone();
			judge.judgeScore( i ); // Instantiate a new Judge Score widget for each judge
			this.options.numJudges = judges.push( judge );
		}

		var updateJudges = function() {
			judgeScores.empty();
			for( var i = 0; i < judges.length; i++ ) {
				judgeScores.append( judges[ i ] );
			}
			judgeEditor.judgeEditor();
			judgeScores.append( judgeEditor ); // Instantiate
			var totalScore  = html.div.clone();
		};

		var updateScore = function() {
		};
		
		this.element .append( view );
		view.append( judgeScores );
		view.append( totalScore );
	}
});
