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
		var e         = this.options.elements;
		var o         = this.options;
		var html      = e.html;
		var widget    = this.element;
		var pending   = { list: html.ol.clone(), athletes: [] };
		var placement = { athletes: [] };

		if( ! defined( o.division )) { return; }
		var athletes  = o.division.athletes;
		var round     = o.division.round;

		placement.athletes = o.division.placement[ round ].map( function( i ) { return athletes[ i ]; } );
		pending.athletes   = o.division.pending[ round ].map( function( i ) { return athletes[ i ]; } );

		// ===== HIDE 'CURRENT STANDINGS' PANEL IF THERE ARE NO COMPLETED ATHLETES
		if( placement.athletes.length == 0 ) {
			e.placement.hide();
			e.placement.removeClass( "one-column", "two-column", "left-column" );

		} else if( pending.athletes.length == 0 ) {
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
			if( ! defined( form ))                     { return ''; }
			if( ! defined( form.adjusted_mean ))       { return ''; }
			if( ! defined( form.adjusted_mean.total )) { return ''; }
			div.html( form.adjusted_mean.total.toFixed( 2 ));

			return div;
		};

		var update_placements = function( callback ) {
			var entry      = html.div.clone() .addClass( "athlete" ) .addClass( "header" );
			var name       = html.div.clone() .addClass( "name" ) .html( 'Name' );
			var form1      = html.div.clone() .addClass( "form1" ) .html( 'Form&nbsp;1' );
			var form2      = html.div.clone() .addClass( "form2" ) .html( 'Form&nbsp;2' );
			var score      = html.div.clone() .addClass( "score" ) .html( 'Average' );

			entry.append( name, form1, form2, score, medal );
			e.placement.append( entry );

			for( var i = 0; i < k; i++ ) {
				var athlete    = placement.athletes[ i ];
				var forms      = athlete.scores[ o.division.round ];
				var athlete    = placement.athletes[ i ];
				var notes      = defined( athlete.notes ) ? athlete.notes : '';
				var total      = (forms.map( function( form ) { return defined( form.adjusted_mean ) ? form.adjusted_mean.total : 0.0; } ).reduce( function( previous, current ) { return previous + current; } ) / forms.length).toFixed( 2 );
				var entry      = html.div.clone() .addClass( "athlete" );
				var name       = html.div.clone() .addClass( "name" ) .html( athlete.name );
				var form1      = form_mean_score( forms[ 0 ], 'form1' );
				var form2      = form_mean_score( forms[ 1 ], 'form2' );
				var score      = html.div.clone() .addClass( "score" ) .html( total + "<span class=\"notes\">&nbsp;" + notes + "</span>" );
				var medal      = html.div.clone() .addClass( "medal" ) ;

				if( defined( callback )) { callback( i, name, medal ); }

				entry.append( name, form1, form2, score, medal );
				e.placement.append( entry );
			}
		};
		var round_name = { 'prelim' : 'Preliminary Round', 'semfin' : 'Semi-Final Round', 'finals' : 'Final Round' };
		e.placement.empty();
		e.placement.append( "<h2>" + round_name[ o.division.round ] + " Standings</h2>" );
		var half = Math.round( o.division.athletes.length / 2 );
		var k    = placement.athletes.length;
		if( o.division.round == 'finals' ) { 
			k = k > 4 ? 4 : k; 

			var callback = function( i, name, medal ) {
				var j          = i + 1;
				name  .addClass( "rank" + j );
				medal .append( html.img.clone() .attr( "src", "/freescore/images/medals/rank" + j + ".png" ) .attr( "align", "right" ));
			}

			update_placements( callback );

		} else {
			if     ( o.division.round == 'prelim' ) { k = k > half ? half : k; }
			else if( o.division.round == 'semfin' ) { k = k > 8 ? 8 : k; }
			update_placements();
		}
		
		// ===== HIDE 'NEXT UP' PANEL IF THERE ARE NO REMAINING ATHLETES
		if( pending.athletes.length == 0 ) { 
			e.pending.hide();
			e.pending.removeClass( "one-column", "two-column", "right-column" );

		} else if( placement.athletes.length == 0 ) {
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
		e.pending.append( pending.list );
		for( var i = 0; i < pending.athletes.length; i++ ) {
			var athlete = pending.athletes[ i ];
			var item    = html.li.clone();
			item.append( "<b>" + athlete.name + "</b>" );
			pending.list.append( item );
		}
		widget.fadeIn( 500 );
	},
});
