$.widget( "freescore.leaderboard", {
	options: { autoShow: true, twoThirds: true },
	_create: function() {
		var o         = this.options;
		var e         = this.options.elements = {};
		var html      = o.html      = { div : $("<div />"), img : $( "<img />" ), a : $( "<a />" ), span : $( "<span />" ), ol : $("<ol />"), li : $("<li />") };
		var division  = e.division  = html.div.clone() .addClass( "division" );
		var pending   = e.pending   = html.div.clone() .addClass( "pending" );
		var standings = e.standings = html.div.clone() .addClass( "standings" );

		division .append( pending, standings );

		this.element .addClass( "leaderboard" );
		this.element .append( division );
	},
	_init: function( ) {
		var e         = this.options.elements;
		var o         = this.options;
		var html      = o.html;
		var widget    = this.element;
		var athletes  = this.options.division.athletes;
		var pending   = { list: html.ol.clone(), athletes: new Array() };
		var standings = { athletes: new Array() };

		// ============================================================
		var calculateScores = function( scores ) {
		// ============================================================
			var inf   = Infinity;
			var min   = { accuracy: inf, presentation: inf };
			var max   = { accuracy: 0.0, presentation: 0.0 };
			var total = { score:    0.0, presentation: 0.0 }; // As of now, there is no need to record the total accuracy

			for( var j = 0; j < scores.length; j++ ) {
				var score = scores[ j ];
				if( typeof( score ) === 'undefined' ) { return { mean: -1.0, min: undefined, max: undefined }; }
				var major        = Number.parseFloat( score.major );
				var minor        = Number.parseFloat( score.minor );
				var accuracy     = major + minor > 4.0 ? 0.0 : 4.0 - (major + minor);
				var rhythm       = Number.parseFloat( score.rhythm );
				var power        = Number.parseFloat( score.power );
				var ki           = Number.parseFloat( score.ki );
				var presentation = rhythm + power + ki;

				// ===== RECORD THE LOWEST AND HIGHEST
				min.accuracy     = min.accuracy     > accuracy     ? accuracy     : min.accuracy;
				min.presentation = min.presentation > presentation ? presentation : min.presentation;
				max.accuracy     = max.accuracy     < accuracy     ? accuracy     : max.accuracy;
				max.presentation = max.presentation < presentation ? presentation : max.presentation;

				total.score        += (accuracy + presentation);
				total.presentation += presentation;
			}
			var mean = 0.0;
			if     ( scores.length > 0 && scores.length <= 4 ) { 
				mean = total.score / scores.length; 
				min.accuracy     = 0.0;
				min.presentation = 0.0;
				max.accuracy     = 0.0;
				max.presentation = 0.0;

			} else if( scores.length >= 5 ) { 
				mean = (total.score - (min.accuracy + min.presentation + max.accuracy + max.presentation)) / (scores.length - 2); 
			}
			return { mean: mean.toFixed( 2 ), total: total.score, presentation: total.presentation, min: min, max: max, tiebreaker: "" };
		}
		// ------------------------------------------------------------

		for( var i = 0; i < athletes.length; i++ ) {
			var athlete  = athletes[ i ];
			athlete.score = calculateScores( athlete.scores );

			if   ( athlete.score.mean > 0.0 ) { standings .athletes .push( athlete ); }
			else                              { pending   .athletes .push( athlete ); }
		}

		// ===== HIDE 'CURRENT STANDINGS' PANEL IF THERE ARE NO COMPLETED ATHLETES
		if( standings.athletes.length == 0 ) {
			e.standings.hide();
			e.standings.removeClass( "one-column", "two-column", "left-column" );

		} else if( pending.athletes.length == 0 ) {
			e.standings.show();
			e.standings.addClass( "one-column" );
			e.standings.removeClass( "two-column", "left-column" );

		} else {
			e.standings.show();
			e.standings.addClass( "two-column left-column" );
			e.standings.removeClass( "one-column" );
		}

		// ===== UPDATE THE 'CURRENT STANDINGS' PANEL
		standings.athletes.sort( function( a, b ) { 
			var criteria = { 
				first:  parseFloat( b.score.mean )         - parseFloat( a.score.mean ),         // Mean scores, with highest and lowest accuracy and presentation dropped
				second: parseFloat( b.score.presentation ) - parseFloat( a.score.presentation ), // Total presentation scores
				third:  parseFloat( b.score.total )        - parseFloat( b.score.total )
			};
			if( criteria.first  != 0 ) { return criteria.first;  }
			if( criteria.second != 0 ) { 
				a.score.tiebreaker = "Presentation score: " + a.score.presentation.toFixed( 1 ); 
				b.score.tiebreaker = "Presentation score: " + b.score.presentation.toFixed( 1 ); 
				return criteria.second; 
			}
			a.score.tiebreaker = "Presentation tied. Total score: " + a.score.total.toFixed( 1 );
			b.score.tiebreaker = "Presentation tied. Total score: " + b.score.total.toFixed( 1 );
			return criteria.third;
		});
		e.standings.empty();
		e.standings.append( "<h2>Current Standings</h2>" );
		var k     = standings.athletes.length < 4 ? standings.athletes.length : 4;
		var notes = html.div.clone() .addClass( "notes" ) .hide();
		for( var i = 0; i < k; i++ ) {
			var item = html.li.clone();
			var athlete    = standings.athletes[ i ];
			var place      = html.div.clone() .addClass( "athlete" );
			var j          = i + 1;
			var entry      = html.div.clone()  .addClass( "athlete" ) .css( "top", i * 48 );
			var name       = html.div.clone()  .addClass( "name" ) .addClass( "rank" + j ) .html( athlete.name );
			var score      = html.div.clone()  .addClass( "score" ) .html( athlete.score.mean );
			var tiebreaker = html.span.clone() .addClass( "tiebreaker" ) .html( "*" );
			var medal      = html.div.clone()  .addClass( "medal" ) .append( html.img.clone() .attr( "src", "/freescore/images/medals/rank" + j + ".png" ) .attr( "align", "right" ));

			if( athlete.score.tiebreaker ) { 
				score.append( tiebreaker ); 
				notes.append( athlete.score.tiebreaker + " for " + athlete.name + "<br />" );
				notes.show();
			}
			entry.append( name, score, medal );
			e.standings.append( entry );
		}
		notes.css( "top", 460 - notes.height() );
		e.standings.append( notes );
		
		// ===== HIDE 'NEXT UP' PANEL IF THERE ARE NO REMAINING ATHLETES
		if( pending.athletes.length == 0 ) { 
			e.pending.hide();
			e.pending.removeClass( "one-column", "two-column", "left-column" );

		} else if( standings.athletes.length == 0 ) {
			e.pending.show();
			e.pending.addClass( "one-column" );
			e.pending.removeClass( "two-column", "left-column" );

		} else {
			e.pending.show();
			e.pending.addClass( "two-column right-column" );
			e.pending.removeClass( "one-column" );
		}

		// ===== UPDATE THE 'NEXT UP' PANEL
		e.pending.empty();
		e.pending.append( "<h2>Next Up</h2>" );
		e.pending.append( pending.list );
		for( var i = 0; i < pending.athletes.length; i++ ) {
			var athlete = pending.athletes[ i ];
			var item    = html.li.clone();
			item.append( "<b>" + athlete.name + "</b>" );
			pending.list.append( item );
		}
		widget.fadeIn( 500 );
	},
	fadeout: function() {
		this.element.fadeOut( 500 );
	}
});
