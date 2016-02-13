$.widget( "freescore.judgeCount", {
	options: { autoShow: true  },
	_create: function() {
		var o    = this.options;
		var w    = this.element;
		var e    = this.options.elements = {};
		var html = e.html = FreeScore.html;

		var handle      = e.handle = {
			select : function( ev ) {
				var val = parseInt( $( ev.target ).val());
				o.num = val;
			}
		};

		var buttonGroup = e.buttonGroup = addButtonGroup( 'Judges', [ '3 Judges', '5 Judges', '7 Judges' ] );
		buttonGroup.on( "buttonGroupJudges", handle.select );
		w.html( buttonGroup );

	},
	_init: function( ) {
		var o    = this.options;
		var w    = this.element;
		var e    = this.options.elements;
		var html = e.html;

		// ===== INITIALIZE JUDGES FROM DIVISION JUDGES SETTING
		if( defined( o.num )) {
			var select = e.buttonGroup.find( ":radio[value='" + o.num + " Judges']" );
			select.prop( "checked", true );
			w.trigger( 'create' );
		}
	}
});
