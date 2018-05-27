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

		if( ! defined( o.division )) { return; }
		var pending   = o.division.pending();
		var placement = o.division.placement();
		var order     = o.division.current.order();

		// ===== HIDE 'CURRENT STANDINGS' PANEL IF THERE ARE NO COMPLETED ATHLETES
		if( placement.length == 0 ) {
			e.placement.hide();

		} else if( pending.length == 0 ) {
			e.placement.addClass( "full-height" );
			e.placement.removeClass( "top-row" );
			e.placement.show();

		} else {
			e.placement.addClass( "top-row" );
			e.placement.removeClass( "full-height" );
			e.placement.show();
		}

		// ===== UPDATE THE 'CURRENT PLACEMENT' PANEL
		var form_mean_score = function( form, label ) {
			var div = html.div.clone() .addClass( label );
			if( ! defined( form ) || ! form.is.complete() ) { return ''; }
			if( form.decision.is.withdraw()   ) { div.html( 'WD' ); return div; }
			if( form.decision.is.disqualify() ) { div.html( 'DQ' ); return div; }
			div.html( form.adjusted().total.toFixed( 2 ));

			return div;
		};

		var update_placements = function( k, callback ) {

			// ===== ADD HEADER
			var divforms = o.division.form.list();
			var form = [ {}, html.span.clone() .html( divforms[ 0 ].replace( /\s/, '' )) ];
			if( divforms.length == 2 ) { form.push( html.span.clone() .html( divforms[ 1 ].replace( /\s/, '' ))); } else { form.push( html.span.clone() ); }
			var header = {
				panel : html.div.clone() .addClass( "athlete header" ),
				name  : html.div.clone() .addClass( "name" ) .html( 'Name' ),
			    form1 : html.div.clone() .addClass( "form1" ) .html( form[ 1 ] ),
			    form2 : html.div.clone() .addClass( "form2" ) .html( form[ 2 ] ),
				score : html.div.clone() .addClass( "score" ) .html( 'Total' ),
			};

			header.panel.append( header.name, header.form1, header.form2, header.score, header.medal );
			e.placement.append( header.panel );

			// ===== ADD ATHLETES
			var round = o.division.current.roundId();
			for( var i = 0; i < k; i++ ) {
				var athlete  = placement[ i ];
				var score    = athlete.score( round );
				var notes    = defined( score.notes() ) ? score.notes() : '';
				var number   = i+1;
				var name     = athlete.display.name();
				var namespan = html.span.clone() .html( name );
				var total    = parseFloat( score.adjusted.total()).toFixed( 2 );

				var entry = {
					panel : html.div.clone() .addClass( "athlete results" ),
					number: html.div.clone() .addClass( "number" ) .append( number ),
					name  : html.div.clone() .addClass( "name" ) .append( namespan ),
					form1 : form_mean_score( score.form( 0 ), 'form1' ),
					form2 : form_mean_score( score.form( 1 ), 'form2' ),
					score : html.div.clone() .addClass( "score" ) .html( total + "<span class=\"notes\">" + notes + "</span>" ),
					medal : html.div.clone() .addClass( "medal" ),
				};

				if( defined( callback )) { callback( i, entry.name, entry.medal ); }

				entry.panel.append( entry.number, entry.name, entry.form1, entry.form2, entry.score, entry.medal );
				e.placement.append( entry.panel );
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
				medal .append( html.img.clone() .attr( "src", "../../images/medals/rank" + j + ".png" ) .attr( "align", "right" ));
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

		// ===== SHOW LIST OF ALL PLAYERS IF STARTING
		} else if( placement.length == 0 ) {
			e.pending.addClass( "full-height" );
			e.pending.removeClass( "bottom-row" );
			e.pending.show();

			e.pending.empty();
			e.pending.append( "<h2>Athlete Order</h2>" );
			for( var i = 0; i < pending.length; i++ ) {
				var athlete = pending[ i ];
				var j       = i + 1;
				e.pending.append( '<div class="athlete"><span class="number">' + j + '</span><span class="name">' + athlete.name() + '</span></div>' );
			}
			widget.fadeIn( 500 );

			// ===== SCROLL UP AND DOWN ENDLESSLY
			var duration  = pending.length * 1000;
			e.pending.stop( true );
			e.pending.off( 'scroll-up' ).on( 'scroll-up', ( ev ) => {
				$( e.pending ).animate({ scrollTop: 0 }, duration, 'swing', () => { e.pending.trigger( 'scroll-down' ); });
			});
			e.pending.off( 'scroll-down' ).on( 'scroll-down', ( ev ) => {
				var bottom = $( e.pending ).height();
				$( e.pending ).animate({ scrollTop: bottom }, duration, 'swing', () => { e.pending.trigger( 'scroll-up' ); });
			});
			e.pending.trigger( 'scroll-down' );

		// ===== SHOW ATHLETE NEXT UP
		} else {
			e.pending.addClass( "bottom-row" );
			e.pending.removeClass( "full-height" );
			e.pending.empty().off( 'scroll-up' ).off( 'scroll-down' );
			e.pending.stop( true );
			e.pending.show();

			// ===== UPDATE THE 'NEXT UP' SINGLE ATHLETE PANEL
			var athlete = pending[ 0 ];
			if( defined( athlete )) {
				var i = athlete.id();
				var j = 1 + order.findIndex(( o ) => { return o == i; });
					
				e.pending.append( "<h2>Next Up</h2>" );
				e.pending.append( '<div class="athlete"><span class="number">' + j + '</span><span class="name">' + athlete.name() + '</span></div>' );
				if( pending.length > 1 ) { e.pending.append( '<div>' + (pending.length - 1) + ' athletes in queue</div>' ); }
			}
			widget.fadeIn( 500 );
		}
	},
});
