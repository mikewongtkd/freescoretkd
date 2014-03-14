// Depends on jquery.judgeScore.js

$.widget( "freescore.scoreKeeper", {
	options: { autoShow: true, numJudges: 3 },
	_create: function() {
		var html = { div : $( "<div />" ) };
		var e = this.options.elements = {};

		var judgeScores = e.judgeScores = html.div.clone() .addClass( "judgeScores" );
		var judges      = e.judges      = new Array();
		var totalScore  = e.totalScore  = html.div.clone() .addClass( "totalScores" );
		var athlete     = e.athlete     = html.div.clone() .addClass( "athlete" );
		var score       = e.score       = html.div.clone() .addClass( "score" );
		totalScore.append( score );
		totalScore.append( athlete );

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
			judges[ i ] = judge;
			judgeScores.append( judge );
		}
		
		this.element .addClass( "scoreKeeper" );
		this.element .append( judgeScores );
		this.element .append( totalScore );
		var widget = this.element;

		var url = {
			tournament : $.url().param( 'tournament' ),
			division   : $.url().param( 'division' ),
			athlete    : $.url().param( 'athlete' )
		}

		var refresh = function() {
			if( url.tournament === undefined || url.division === undefined ) {alert( "Need tournament and division" ); }
			$.getJSON(
				'http://localhost/cgi-bin/freescore/forms/grassroots/' + url.tournament + '/' + url.division + '/' + url.athlete,
				function( current ) {
					athlete .html( current.athlete.name );
					for( var i = 0; i < k; i++ ) {
						var s = current.athlete.scores[ i ];
						judges[ i ].judgeScore( { score : s } );
					}
					widget .addClass( "leave-up-bounce" );
				}
			);

			if( url.athlete % 2 ) { athlete.addClass( "chung" ); } 
			else                  { athlete.addClass( "hong" ); }

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

			if( sum > 0.0 ) { score.html( sum.toFixed( 1 )); }
		}
		refresh();
		window.setInterval( refresh, 1000 );
	}
});
