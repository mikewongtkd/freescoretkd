$.widget( "freescore.operatorController", {
	options: { autoShow: true  },
	_create: function() {
		var widget  = this.element;
		var o       = this.options;
		var e       = this.options.elements = {};
		var html    = e.html = FreeScore.html;

		widget.addClass( 'operator-controller' );
	},
	_init: function( ) {
	}
});
