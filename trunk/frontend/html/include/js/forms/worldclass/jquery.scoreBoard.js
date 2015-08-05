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
		var round        = e.round        = html.div.clone() .addClass( "round" );
		var score        = e.score        = html.div.clone() .addClass( "score" );
		var forms        = e.forms        = html.div.clone() .addClass( "forms" );
		var accuracy     = e.accuracy     = html.div.clone() .addClass( "accuracy" );
		var presentation = e.presentation = html.div.clone() .addClass( "presentation" );
		var total        = e.total        = html.div.clone() .addClass( "total" );
		var penalty      = e.penalty      = { bounds : html.div.clone() .addClass( "bounds" ), timelimit : html.div.clone() .addClass( "timelimit" ) };

		penalty.bounds    .append( html.div.clone() .addClass( "icon" ), '-0.3' );
		penalty.timelimit .append( html.div.clone() .addClass( "icon" ), '-0.3' );
		penalty.bounds.hide();
		penalty.timelimit.hide();

		totalScore.append( athlete, score, round, forms, penalty.bounds, penalty.timelimit );
		score.append( accuracy, presentation, total );

		for( var i = 0; i < 7; i++ ) {
			var j = i + 1;
			var judge = html.div.clone() .prop( "id", "judge" + j );
			if     ( k == 3 ) { judge.addClass( "judges3" ); }
			else if( k == 5 ) { judge.addClass( "judges5" ); }
			else if( k == 7 ) { judge.addClass( "judges7" ); }
			judge.judgeScore( { num: j, max: k } ); // Instantiate a new Judge Score widget for each judge
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
		var widget  = this.element;
		var current = o.current;
		var ordinal = [ '1st', '2nd', '3rd', '4th' ];
		if( ! defined( current )) { return; }

		// ============================================================
		var show_form_score = function( div ) {
		// ============================================================
			div.empty();
			var grand_mean = 0.0;
			var count      = 0;

			// ===== SHOW ROUND FORMS
			for( var i = 0; i <= current.form; i++ ) {
				var name  = current.forms[ i ].name;
				var score = current.athlete.scores[ current.round ][ i ];
				var mean  = score.adjusted_mean;
				if( ! defined( mean )) { continue; }
				var total = (mean.accuracy + mean.presentation).toFixed( 2 );
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

			var form    = current.athlete.scores[ current.round ][ current.form ];
			var mean    = form.adjusted_mean;
			var penalty = form.penalty;
			if( defined( mean )) { 
				var penalties = 0;
				if( defined( penalty )) {
				   penalties = penalty.timelimit + penalty.bounds;
				   if( penalty.timelimit > 0 ) { e.penalty.timelimit .show(); } else { e.penalty.timelimit .hide(); }
				   if( penalty.bounds    > 0 ) { e.penalty.bounds    .show(); } else { e.penalty.bounds    .hide(); }
				}
				accuracy      = mean.accuracy;
				presentation  = mean.presentation;
				score         = mean.accuracy + mean.presentation - penalties;

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

		var round_names = { 'prelim' : 'Preliminary', 'semfin' : 'Semi-Final', 'finals' : 'Final' };
		var round_description = e.html.ul.clone() .totemticker({ row_height: '32px', interval : 2000 });;

		round_description.append( e.html.li.clone() .html( current.description ));
		round_description.append( e.html.li.clone() .html( current.name.toUpperCase() + ' <b>' + round_names[ current.round ] + ' Round</b>'));
		if( current.forms.length > 1 ) { round_description.append( e.html.li.clone() .html( ordinal[ current.form ] + ' Form <b>' + current.forms[ current.form ].name + '</b>' )); } 
		else                           { round_description.append( e.html.li.clone() .html( '<b>' + current.forms[ current.form ].name + '</b>' )); }

		if( ! defined( current.athlete        )) { return; }
		if( ! defined( current.athlete.scores )) { return; }
		var judge_scores = current.athlete.scores[ current.round ][ current.form ].judge;

		// ===== UPDATE THE JUDGES SCORES
		for( var i = 0; i < k; i++ ) {
			e.judges[ i ].judgeScore( { score : judge_scores[ i ], max : k } );
		}

		/*
		if( parseInt( current.athlete.index ) % 2 ) { // MW This is broken for multiple rounds
			e.athlete .removeClass( "chung" ); 
			e.athlete .addClass( "hong" ); 
		} else { 
			e.athlete .removeClass( "hong" ); 
			e.athlete .addClass( "chung" ); 
		}
		*/
			
		// ===== CHANGE OF PLAYER
		if( ! defined( o.previous ) || (
			current.athlete.name != o.previous.athlete.name ||
			current.round != o.previous.round ||
			current.form != o.previous.form
		)) {
			e.athlete .empty() .fadeOut( 500, function() { e.athlete .html( current.athlete.name ) .fadeIn(); });
			e.round   .empty() .fadeOut( 500, function() { e.round   .append( round_description )  .fadeIn(); });
			e.forms   .empty() .fadeOut( 500, function() { show_form_score( e.forms )              .fadeIn(); });
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
