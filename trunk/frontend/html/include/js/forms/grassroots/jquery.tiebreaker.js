$.widget( "freescore.tiebreaker", {
	options: { autoShow: true, swap: 0 },
	_create: function() {
		var o       = this.options;
		var e       = this.options.elements = {};
		var w       = this.element;
		var html    = e.html  = { div : $( "<div />" ), img : $( "<img />" ) };
		var vote    = e.vote  = html.div.clone() .addClass( "vote" );
		var left    = e.left  = html.div.clone() .addClass( "left" );
		var right   = e.right = html.div.clone() .addClass( "right" );

		var lhand   = e.lhand = html.img.clone() .prop( "src", "/freescore/images/icons/votes/left.png" );
		var rhand   = e.rhand = html.img.clone() .prop( "src", "/freescore/images/icons/votes/right.png" );

		if( o.swap ) {
			left  .addClass( "red"  ) .prop( "vote", "red"  );
			right .addClass( "blue" ) .prop( "vote", "blue" );

		} else {
			left  .addClass( "blue" ) .prop( "vote", "blue" );
			right .addClass( "red"  ) .prop( "vote", "red"  );
		}

		left.append( lhand, "Chung" );
		right.append( rhand, "Hong" );

		left.css( "opacity", 1.00 );
		right.css( "opacity", 1.00 );

		vote.append( "Vote", left, right );
		w .addClass( "tiebreaker" );
		w.append( vote );

		var callback = function( vote, other ) {
			return function() {
				vote.fadeTo( 250, 1.00 );
				other.fadeTo( 250, 0.25 );
				o.vote = vote.prop( "vote" );
			};
		};

		left.click( callback( left, right ));
		right.click( callback( right, left ));
	},
	_init: function( ) {
		var e     = this.options.elements;
		var o     = this.options;
	}
});
