// Depends on jquery.judgeScore.js

$.widget( "freescore.scoreboard", {
	options: { autoShow: true, judges: 3 },
	_create: function() {
		var o = this.options;
		var e = this.options.elements = {};
		var k = o.judges;

		var html         = e.html = FreeScore.html;
		var judgeScores  = e.judgeScores  = html.div.clone() .addClass( "judgeScores" );
		var judges       = e.judges       = new Array();
		var totalScore   = e.totalScore   = html.div.clone() .addClass( "totalScores" );
		var athlete      = e.athlete      = html.div.clone() .addClass( "athlete" );
		var flag         = e.flag         = html.div.clone() .addClass( "flag" );
		var round        = e.round        = html.div.clone() .addClass( "round" );
		var score        = e.score        = html.div.clone() .addClass( "score" );
		var forms        = e.forms        = html.div.clone() .addClass( "forms" );
		var accuracy     = e.accuracy     = html.div.clone() .addClass( "accuracy" );
		var presentation = e.presentation = html.div.clone() .addClass( "presentation" );
		var total        = e.total        = html.div.clone() .addClass( "total" );
		var penalty      = e.penalty      = { 
			icon :       html.span.clone() .addClass( "icon" ),
			value :      html.span.clone() .addClass( "value" ),
			bounds :     html.div.clone()  .addClass( "bounds penalty" ), 
			restart:     html.div.clone()  .addClass( "restart penalty" ), 
			timelimit:   html.div.clone()  .addClass( "timelimit penalty" ), 
			misconduct : html.div.clone()  .addClass( "misconduct penalty" ),
			display : function( icon ) { return html.span.clone() .addClass( "glyphicon glyphicon-" + icon ); },
		};

		penalty.bounds     .append( penalty.icon.clone() .html( penalty.display( 'share'   )), penalty.value.clone() .html( '-0.3' )) .hide();
		penalty.restart    .append( penalty.icon.clone() .html( penalty.display( 'retweet' )), penalty.value.clone() .html( '-0.6' )) .hide();
		penalty.timelimit  .append( penalty.icon.clone() .html( penalty.display( 'time'    )), penalty.value.clone() .html( '-0.3' )) .hide();
		penalty.misconduct .append( penalty.icon.clone() .html( penalty.display( 'comment' )), penalty.value.clone() .html( '&nbsp;1' )) .hide();

		totalScore.append( athlete, flag, score, round, forms, penalty.bounds, penalty.restart, penalty.timelimit, penalty.misconduct );
		score.append( accuracy, presentation, total );

		for( var i = 0; i < 7; i++ ) {
			var j = i + 1;
			var judge = html.div.clone() .prop( "id", "judge" + j );
			if     ( k == 3 ) { judge.addClass( "judges3" ); }
			else if( k == 5 ) { judge.addClass( "judges5" ); }
			else if( k == 7 ) { judge.addClass( "judges7" ); }
			judge.judgeScore( { num: j, judges: k } ); // Instantiate a new Judge Score widget for each judge
			judges[ i ] = judge;
			judgeScores.append( judge );
		}
		
		this.element .addClass( "scoreboard" );
		this.element .append( judgeScores, totalScore );
	},

	_init: function() {
		var e       = this.options.elements;
		var o       = this.options;
		var k       = o.judges;
		var html    = e.html;
		var widget  = this.element;
		var current = o.current;
		if( ! defined( current )) { return; }

		// ============================================================
		var show_form_score = function( div ) {
		// ============================================================
			div.empty();
			let mean     = 0.0;
			let n        = 0;
			let decision = false;

			// ===== SHOW ROUND FORMS
			for( var i = 0; i <= current.form; i++ ) {
				var name  = current.forms[ i ];
				var score = current.athlete.score( current.round ).form( i );
				var adjusted = score.adjusted();
				if( ! defined( adjusted )) { continue; }
				var penalty = score.penalty();
				var total = (parseFloat( adjusted.accuracy ) + parseFloat( adjusted.presentation ) - penalty.total()).toFixed( 2 );
				total = isNaN( total ) ? '' : total;
				mean += parseFloat( total );
				n++;
				var form = {
					display : e.html.div.clone() .addClass( `form form${i+1}` ),
					name    : e.html.div.clone() .addClass( "name" ),
					score   : e.html.div.clone() .addClass( "score" ),
				};
				if( score.decision.is.disqualify()) { total = 'DSQ'; decision = 'DSQ'; } else
				if( score.decision.is.withdraw())   { total = 'WDR'; decision = 'WDR'; }

				form.name.html( name );
				form.score.html( total );
				form.display.append( form.name, form.score );
				div.append( form.display );
			}

			// ===== SHOW MEAN FOR ALL FORMS
			var form = {
				display : e.html.div.clone() .addClass( "form mean" ),
				name    : e.html.div.clone() .addClass( "name" ),
				score   : e.html.div.clone() .addClass( "score" )
			};
			if( ! isNaN( mean ) && n != 0 ) {
				mean = (mean / n).toFixed( 3 );
				if( decision ) { mean = decision; }
				form.name.html( "Average" );
				form.score.html( mean );
				form.display.append( form.name, form.score );
				div.append( form.display );
			}

			return div;
		};

		// ============================================================
		var show_score = function() {
		// ============================================================
			let accuracy      = 0;
			let presentation  = 0;
			let score         = 0;

			let form     = current.athlete.score( current.round ).form( current.form );
			let adjusted = form.adjusted();
			let penalty  = form.penalty();

			if( defined( penalty )) {
				e.penalty.bounds     .find( 'span.value' ).html( '-' + penalty.from( 'bounds' ) );
				e.penalty.misconduct .find( 'span.value' ).html( '&nbsp;' + penalty.from( 'misconduct' ) );
				if( penalty.from( 'bounds' )     > 0 ) { e.penalty.bounds     .show(); } else { e.penalty.bounds     .hide(); }
				if( penalty.from( 'restart' )    > 0 ) { e.penalty.restart    .show(); } else { e.penalty.restart    .hide(); }
				if( penalty.from( 'timelimit' )  > 0 ) { e.penalty.timelimit  .show(); } else { e.penalty.timelimit  .hide(); }
				if( penalty.from( 'misconduct' ) > 0 ) { e.penalty.misconduct .show(); } else { e.penalty.misconduct .hide(); }
			} else {
				[ 'bounds', 'restart', 'timelimit', 'misconduct' ].forEach((p) => { e.penalty[ p ].hide(); });
			}

			if( defined( adjusted )) { 
				accuracy      = parseFloat( adjusted.accuracy );
				presentation  = parseFloat( adjusted.presentation );
				score         = parseFloat( accuracy + presentation - penalty.total());

				// Adjusted presentation and total are previously calculated for tiebreaking purposes; accuracy is not
				if( isNaN( accuracy )) { 
					accuracy     = '';
					presentation = '';
					score        = '';
				} else {
					accuracy     = accuracy.toFixed( 2 );
					presentation = presentation.toFixed( 2 );
					score        = score.toFixed( 2 );
				}

				if( form.decision.is.disqualify() ) { score = 'DSQ'; } else
				if( form.decision.is.withdraw() )   { score = 'WDR'; }

				e.accuracy     .html( accuracy );
				e.presentation .html( presentation );
				e.total        .html( score );

				e.score.fadeIn( 500 );

			} else {
				e.score.fadeOut( 500, function() { 
					e.accuracy     .html( '' );
					e.presentation .html( '' );
					e.total        .html( '' );
				});
			}
			show_form_score( e.forms );
		};


		// ===== ROUND DESCRIPTION TICKER
		var round = { ticker : e.html.ul.clone().totemticker({ row_height: '40px' }), name : current.roundName };
		var form  = { ordinal : ordinal( parseInt( current.form ) + 1 ) + ' Form', name : current.forms[ current.form ] };

		round.ticker.append( e.html.li.clone() .html( current.name.toUpperCase() + ' ' + current.description ));
		if( current.forms.length > 1 ) { round.ticker.append( e.html.li.clone() .html( round.name + ' ' + form.ordinal + '<b> ' + form.name + '</b>' )); } 
		else                           { round.ticker.append( e.html.li.clone() .html( round.name + ' Round <b>' + form.name + '</b>' )); }

		if( ! defined( current.athlete        )) { return; }
		var form = current.athlete.score( current.round ).form( current.form );

		// ===== UPDATE THE JUDGE SCORES
		for( var i = 0; i < k; i++ ) {
			var judge = form.judge( i );
			e.judges[ i ].judgeScore( { score : judge.score.data(), judges : k, complete : form.is.complete() } );
		}

		if( o.odd ) { e.athlete .removeClass( "chung" ); e.athlete .addClass( "hong" );  } 
		else        { e.athlete .removeClass( "hong" );  e.athlete .addClass( "chung" ); }

		// ===== CHANGE OF PLAYER
		if( ! defined( o.previous ) || (
			current.athlete.name() != o.previous.athlete.name() ||
			current.round          != o.previous.round ||
			current.form           != o.previous.form
		)) {
			var flag = defined( current.athlete.info( 'flag' ) ) ? '<img src="../../images/flags/' + current.athlete.info( 'flag' ) + '.png" width="80px" />' : '';
			var name = html.span.clone() .append( current.athlete.display.name() );
			if( flag ) { e.athlete.css({ left: '10%', width: '90%' }); } // Make room for the flag
			e.athlete .fadeOut( 300, function() { e.athlete .empty() .html( name )           .fadeIn(); });
			e.flag    .fadeOut( 300, function() { e.flag    .empty() .html( flag )           .fadeIn(); });
			e.round   .fadeOut( 300, function() { e.round   .empty() .append( round.ticker ) .fadeIn(); });
			e.forms   .fadeOut( 300, function() { show_form_score( e.forms )                 .fadeIn(); });

			// e.athlete .fitText(); // Scale athlete name for best visibility and size
		}

		// ===== CHANGE OF SCORE
		show_score();

		widget .fadeIn( 500 );
		o.previous = current;
	},
	fadeout: function() {
		this.element.fadeOut( 500 );
	}
});
