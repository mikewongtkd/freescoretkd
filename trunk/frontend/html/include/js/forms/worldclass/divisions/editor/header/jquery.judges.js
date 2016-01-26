$.widget( "freescore.judgeCount", {
	options: { autoShow: true  },
	_create: function() {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements = {};
		var html   = e.html = FreeScore.html;

	},
	_init: function( ) {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements;
		var html   = e.html;

		widget.empty();
		widget.append( addButtonGroup( 'Number of Judges', [ '3 Judges', '5 Judges', '7 Judges' ] ));
	}
});
