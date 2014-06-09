$.widget( "freescore.flippable", {
	options: { autoShow: true },
	_create : function() {
		var o      = this.options;
		var e      = this.options.elements = {};
		var html   = e.html = { div : $('<div />') };
		var widget = this.element;

		var card   = e.card  = html.div.clone() .addClass( "card" );
		var front  = e.front = o.front .addClass( "front" );
		var back   = e.back  = o.back  .addClass( "back" );

		card.append( front, back );
		widget.append( card );

		widget.addClass( "flippable" );
		widget.click( function() { card.toggleClass( 'flipped' ); });
	},
	_init : function() {
		var o      = this.options;
		var e      = this.options.elements;
		
		e.front = o.front;
		e.back  = o.back;
	}
});

