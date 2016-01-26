$.widget( "freescore.method", {
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
		widget.append( addButtonGroup( 'Method of Competition', [ 'Cutoff', 'Combination' ] ));
	}
});
