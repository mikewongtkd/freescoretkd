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
		var lflag        = e.lflag        = html.div.clone() .addClass( "left flag" );
		var rflag        = e.rflag        = html.div.clone() .addClass( "right flag" );
		var round        = e.round        = html.div.clone() .addClass( "round" );
		var score        = e.score        = html.div.clone() .addClass( "score" );
		var forms        = e.forms        = html.div.clone() .addClass( "forms" );
		var accuracy     = e.accuracy     = html.div.clone() .addClass( "accuracy" );
		var presentation = e.presentation = html.div.clone() .addClass( "presentation" );
		var total        = e.total        = html.div.clone() .addClass( "total" );
		var penalty      = e.penalty      = { bounds : html.div.clone() .addClass( "bounds" ), timelimit : html.div.clone() .addClass( "timelimit" ) };

		penalty.bounds    .append( html.div.clone() .addClass( "icon" ), '<span>-0.3</span>' );
		penalty.timelimit .append( html.div.clone() .addClass( "icon" ), '<span>-0.3</span>' );
		penalty.bounds.hide();
		penalty.timelimit.hide();

		totalScore.append( athlete, lflag, rflag, score, round, forms, penalty.bounds, penalty.timelimit );
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
			var grand_mean = 0.0;
			var count      = 0;

			// ===== SHOW ROUND FORMS
			for( var i = 0; i <= current.form; i++ ) {
				var name  = current.forms[ i ];
				var score = current.athlete.score( current.round ).form( i );
				var mean  = score.adjusted();
				if( ! defined( mean )) { continue; }
				var penalties = 0;
				var penalty = score.penalty();
				if( defined( penalty ) && defined( penalty.timelimit ) && defined( penalty.bounds )) { penalties = parseFloat( penalty.timelimit ) + parseFloat( penalty.bounds ); }
				var total = (mean.accuracy + mean.presentation - penalties).toFixed( 2 );
				total = total == 'NaN' ? '' : total;
				grand_mean += parseFloat( total );
				count++;
				var form = {
					display : e.html.div.clone() .addClass( "form" ),
					name    : e.html.div.clone() .addClass( "name" ),
					score   : e.html.div.clone() .addClass( "score" )
				};
				form.name.html( name );
				form.score.html( total );
				form.display.append( form.name, form.score );
				form.display.css( "left", (i * 220) + 20 );
				div.append( form.display );
			}

			// ===== SHOW MEAN FOR ALL FORMS
			var form = {
				display : e.html.div.clone() .addClass( "form" ),
				name    : e.html.div.clone() .addClass( "name" ),
				score   : e.html.div.clone() .addClass( "score" )
			};
			if( ! isNaN( grand_mean ) && count != 0 ) {
				grand_mean = (grand_mean / count).toFixed( 2 );
				form.name.html( "Average" );
				form.score.html( grand_mean );
				form.display.append( form.name, form.score );
				form.display.css( "left", 460 );
				div.append( form.display );
			}

			return div;
		};

		// ============================================================
		var show_score = function() {
		// ============================================================
			var accuracy      = 0;
			var presentation  = 0;
			var score         = 0;

			var form    = current.athlete.score( current.round ).form( current.form );
			var mean    = form.adjusted();
			var penalty = form.penalty();

			if( defined( penalty )) {
				e.penalty.bounds    .find( 'span' ).text( '-' + penalty.from( 'bounds' ) );
				if( penalty.from( 'timelimit' ) > 0 ) { e.penalty.timelimit .show(); } else { e.penalty.timelimit .hide(); }
				if( penalty.from( 'bounds' )    > 0 ) { e.penalty.bounds    .show(); } else { e.penalty.bounds    .hide(); }
			} else {
				e.penalty.timelimit .hide();
				e.penalty.bounds    .hide();
			}

			if( defined( mean )) { 
				accuracy      = mean.accuracy;
				presentation  = mean.presentation;
				score         = mean.accuracy + mean.presentation - penalty.total();

				accuracy      = accuracy     >= 0 ? accuracy     .toFixed( 2 ) : '';
				presentation  = presentation >= 0 ? presentation .toFixed( 2 ) : '';
				score         = score        >= 0 ? score        .toFixed( 2 ) : '';

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
		var round = { ticker : e.html.ul.clone() .totemticker({ row_height: '32px', interval : 2000 } ), name : current.roundName };
		var form  = { ordinal : ordinal( parseInt( current.form ) + 1 ) + ' Form', name : current.forms[ current.form ] };

		round.ticker.append( e.html.li.clone() .html( current.description ));
		round.ticker.append( e.html.li.clone() .html( current.name.toUpperCase() + ' <b>' + round.name + '</b>'));
		if( current.forms.length > 1 ) { round.ticker.append( e.html.li.clone() .html( form.ordinal + '<b> ' + form.name + '</b>' )); } 
		else                           { round.ticker.append( e.html.li.clone() .html( '<b>' + form.name + '</b>' )); }

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
			current.athlete.name() != o.previous.athlete.name ||
			current.round          != o.previous.round ||
			current.form           != o.previous.form
		)) {
			var flag = defined( current.athlete.info( 'flag' ) ) ? '<img src="/freescore/images/flags/' + current.athlete.info( 'flag' ) + '.png" width="80px" />' : '';
			var name = html.span.clone() .append( current.athlete.display.name() );
			e.athlete .empty() .fadeOut( 500, function() { e.athlete .html( name )           .fadeIn(); });
			e.lflag   .empty() .fadeOut( 500, function() { e.lflag   .html( flag )           .fadeIn(); });
			e.rflag   .empty() .fadeOut( 500, function() { e.rflag   .html( flag )           .fadeIn(); });
			e.round   .empty() .fadeOut( 500, function() { e.round   .append( round.ticker ) .fadeIn(); });
			e.forms   .empty() .fadeOut( 500, function() { show_form_score( e.forms )        .fadeIn(); });

			e.athlete .fitText( 0.55 ); // Scale athlete name for best visibility and size
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
