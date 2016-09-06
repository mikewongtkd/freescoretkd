$.widget( "freescore.leaderboard", {
	options: { autoShow: true, twoThirds: true },
	_create: function() {
		var o         = this.options;
		var e         = this.options.elements = {};
		var html      = e.html      = FreeScore.html;
		var division  = e.division  = html.div.clone() .addClass( "division" );
		var pending   = e.pending   = html.div.clone() .addClass( "pending" );
		var placement = e.placement = html.div.clone() .addClass( "placement" );

		division .append( pending, placement );

		this.element .addClass( "leaderboard" );
		this.element .append( division );
	},
	_init: function( ) {
		var e      = this.options.elements;
		var o      = this.options;
		var html   = e.html;
		var widget = this.element;
		var list   = html.ol.clone();

		if( ! defined( o.division )) { return; }
		var pending   = o.division.pending();
		var placement = o.division.placement();

		// ===== HIDE 'CURRENT STANDINGS' PANEL IF THERE ARE NO COMPLETED ATHLETES
		if( placement.length == 0 ) {
			e.placement.hide();
			e.placement.removeClass( "one-column", "two-column", "left-column" );

		} else if( pending.length == 0 ) {
			e.placement.show();
			e.placement.addClass( "one-column" );
			e.placement.removeClass( "two-column", "left-column" );

		} else {
			e.placement.show();
			e.placement.addClass( "two-column left-column" );
			e.placement.removeClass( "one-column" );
		}

		// ===== UPDATE THE 'CURRENT PLACEMENT' PANEL
		var form_mean_score = function( form, label ) {
			var div = html.div.clone() .addClass( label );
			if( ! defined( form ) || ! form.is.complete() ) { return ''; }
			div.html( form.adjusted().total.toFixed( 2 ));

			return div;
		};

		var update_placements = function( k, callback ) {

			// ===== ADD HEADER
			var divforms = o.division.form.list();
			var form = [ {}, html.span.clone() .html( divforms[ 0 ].replace( /\s/, '' )) ];
			if( divforms.length == 2 ) { form.push( html.span.clone() .html( divforms[ 1 ].replace( /\s/, '' ))); } else { form.push( html.span.clone() ); }
			var header = {
				panel : html.div.clone() .addClass( "athlete" ) .addClass( "header" ),
				name  : html.div.clone() .addClass( "name" ) .html( 'Name' ),
			    form1 : html.div.clone() .addClass( "form1" ) .html( form[ 1 ] ),
			    form2 : html.div.clone() .addClass( "form2" ) .html( form[ 2 ] ),
				score : html.div.clone() .addClass( "score" ) .html( 'Average' ),
			};

			header.panel.append( header.name, header.form1, header.form2, header.score, header.medal );
			e.placement.append( header.panel );

			// ===== ADD ATHLETES
			var round = o.division.current.roundId();
			for( var i = 0; i < k; i++ ) {
				var athlete    = placement[ i ];
				var score      = athlete.score( round );
				var notes      = defined( score.notes() ) ? score.notes() : '';
				var name       = e.placement.hasClass( 'one-column' ) ? athlete.name() : athlete.display.name();
				var namespan = html.span.clone() .html( name );

				var entry = {
					panel : html.div.clone() .addClass( "athlete" ),
					name  : html.div.clone() .addClass( "name" ) .append( namespan ),
					form1 : form_mean_score( score.form( 0 ), 'form1' ),
					form2 : form_mean_score( score.form( 1 ), 'form2' ),
					score : html.div.clone() .addClass( "score" ) .html( score.adjusted.total().toFixed( 2 ) + "<span class=\"notes\">&nbsp;" + notes + "</span>" ),
					medal : html.div.clone() .addClass( "medal" ),
				};

				if( defined( callback )) { callback( i, entry.name, entry.medal ); }

				entry.panel.append( entry.name, entry.form1, entry.form2, entry.score, entry.medal );
				e.placement.append( entry.panel );
				entry.name .fitText( 0.55, { maxFontSize: '32pt' });
			}
		};
		e.placement.empty();
		e.placement.append( "<h2>" + o.division.current.round.name() + " Standings</h2>" );
		var k    = placement.length;
		if( o.division.round.is.finals() ) { 
			k = k > 4 ? 4 : k; 

			var show_medals = function( i, name, medal ) {
				var j          = i + 1;
				name  .addClass( "rank" + j );
				medal .append( html.img.clone() .attr( "src", "/freescore/images/medals/rank" + j + ".png" ) .attr( "align", "right" ));
			}

			update_placements( k, show_medals );

		} else {
			var half = Math.round( o.division.athletes().length / 2 );
			if     ( o.division.round.is.prelim() ) { k = k > half ? half : k; }
			else if( o.division.round.is.semfin() ) { k = k > 8 ? 8 : k; }
			update_placements( k );
		}
		
		// ===== HIDE 'NEXT UP' PANEL IF THERE ARE NO REMAINING ATHLETES
		if( pending.length == 0 ) { 
			e.pending.hide();
			e.pending.removeClass( "one-column", "two-column", "right-column" );

		} else if( placement.length == 0 ) {
			e.pending.show();
			e.pending.addClass( "one-column left-column" );
			e.pending.removeClass( "two-column", "right-column" );

		} else {
			e.pending.show();
			e.pending.addClass( "two-column right-column" );
			e.pending.removeClass( "one-column" );
		}

		// ===== UPDATE THE 'NEXT UP' PANEL
		e.pending.empty();
		e.pending.append( "<h2>Next Up</h2>" );
		e.pending.append( list );
		for( var i = 0; i < pending.length; i++ ) {
			var athlete = pending[ i ];
			var item    = html.li.clone();
			item.append( "<b>" + athlete.name() + "</b>" );
			list.append( item );
		}
		widget.fadeIn( 500 );
	},
});
