// Depends on jquery.judgeScore.js

$.widget( "freescore.scoreKeeper", {
	options: { autoShow: true, numJudges: 3 },
	_create: function() {
		var html = { div : $( "<div />" ) };

		var judgeScores = html.div.clone() .addClass( "judgeScores" );
		var judges      = new Array();
		var judgeEditor = html.div.clone();
		var totalScore  = html.div.clone() .addClass( "totalScores" );
		var athlete     = html.div.clone() .addClass( "athlete chung" );
		var score       = html.div.clone() .addClass( "score" );
		totalScore.append( score );
		totalScore.append( athlete );

		athlete.html( "M. Wong" );

		var k = this.options.numJudges;
		for( var i = 0; i < k; i++ ) {
			var j = i + 1;
			var judge = html.div.clone() .prop( "id", "judge" + j );
			if(      k == 3   ) { judge.addClass( "judges3" ); }
			else if( k == 5   ) { judge.addClass( "judges5" ); }
			if     ( i == 0   ) { judge.addClass( "left" ); }
			else if( i == k-1 ) { judge.addClass( "right" ); }
			else                { judge.addClass( "middle" ); }
			judge.judgeScore( { num: j } ); // Instantiate a new Judge Score widget for each judge
			judgeScores.append( judge );
		}
		
		this.element .addClass( "scoreKeeper" );
		this.element .append( judgeScores );
		this.element .append( totalScore );

		var refresh = function() {
			var scores = new Array();
			var min    = undefined;
			var max    = undefined;
			for( var i = 0; i < k; i++ ) {
				var j = i + 1;
				scores[ i ] = parseFloat( $( '#judgeScore' + j ).html());
				if( isNaN( scores[ i ] )) { scores[ i ] = 0.0; }
			}

			if( k == 5 ) {
				for( var i = 0; i < k; i++ ) {
					var j = i + 1;
					if( min === undefined || scores[ min ] > scores[ i ] ) { min = i; }
					if( max === undefined || scores[ max ] < scores[ i ] ) { max = i; }
					$( '#judge' + j ).removeClass( "ignore" );
				}
			}

			var sum = 0.0;
			for( var i = 0; i < k; i++ ) {
				var j = i + 1;
				if( i == min ) { $( '#judge' + j ).addClass( "ignore" ); continue; }
				if( i == max ) { $( '#judge' + j ).addClass( "ignore" ); continue; }
				sum += scores[ i ];
			}

			sum = Math.round( sum * 10 )/10;

			score.html( sum.toFixed( 1 ));
		}

		window.setInterval( refresh, 2000 );
	}
});
