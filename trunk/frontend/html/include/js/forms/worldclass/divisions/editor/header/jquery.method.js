$.widget( "freescore.method", {
	options: { autoShow: true  },
	_create: function() {
		var o    = this.options;
		var w    = this.element;
		var e    = this.options.elements = {};
		var html = e.html = FreeScore.html;

		var methods     = [ 'Cutoff', 'Modified', 'Combination' ];
		var description = o.description = { 
			'Cutoff'      : 'WTF cutoff method with preliminary, semi-final, and final rounds. Divisions with 21 or more athletes will start in the preliminary round and the top half will advance to the semi-final round. The top 8 athletes will advance to the finals.' ,
			'Modified'    : 'Modified WTF cutoff method with preliminary, semi-final, three final rounds. Same as cutoff, except for the final rounds; top 8 will advance to 1st final round, top 4 will advance to 2nd final round, and top 2 will advance to 3rd and last final round.' ,
			'Combination' : 'Combination WTF cutoff for preliminary and semi-final rounds, and single-elimination method for final round. Same as cutoff, except for the final rounds will have the top 8, who will go head-to-head via bracketed single elimination.' ,
		};

		var handle = e.handle = {
			select : function( ev ) {
				var val = $( ev.target ).val();
				o.method = val;
				e.description.html( description[ val ] );
			}
		};

		if( ! defined( e.buttonGroup )) { 
			w.empty();
			e.buttonGroup = addButtonGroup( 'Method of Competition', methods, handle.select ); 
			e.description = html.div.clone() .css({ height: '80px', border: '1px solid #ccc', padding: '10px', 'vertical-align' : 'middle', 'color' : '#666' }); 
			w.append( e.buttonGroup, e.description );
		}

	},
	_init: function( ) {
		var o    = this.options;
		var w    = this.element;
		var e    = this.options.elements;
		var html = e.html;

		// ===== INITIALIZE METHOD FROM DIVISION METHOD SETTING
		if( defined( o.method )) {
			var method = o.method.capitalize()
			var select = e.buttonGroup.find( ":radio[value='" + method + "']" );
			e.description.html( o.description[ method ] );
			select.prop( "checked", true );
			w.trigger( 'create' );
		}
	}
});
