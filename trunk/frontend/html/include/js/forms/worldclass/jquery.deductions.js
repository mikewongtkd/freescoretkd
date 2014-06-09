$.widget( "freescore.deductions", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements = {};
		var html   = e.html = { div : $( "<div />" ) };

		o.value    = (typeof o.value === 'undefined') ? 0.1 : o.value;
		o.count    = 0;

		if( o.value != 0.1 && o.value != 0.3 ) { throw new Error( "FreeScore jQuery Deductions widget has an invalid value of " + o.value + " instead of 0.1 or 0.3" ); }

		var judge  = o.controller.num;
		var score  = o.controller;
		var update = o.controller.updateScore;
		var label  = e.label  = html.div.clone() .addClass( "label" ) .html( o.value == 0.1 ? "Minor Deductions" : "Major Deductions" );
		var view   = e.view   = html.div.clone() .addClass( "view" ) .html( o.count );
		var remove = e.remove = html.div.clone() .html( "Remove" );
		var add    = e.add    = html.div.clone() .html( "Add" );

		if( o.value == 0.1 ) {
			remove .addClass( "button-small remove-minor" );
			add    .addClass( "button-large add-minor" );
		} else {
			remove .addClass( "button-small remove-major" );
			add    .addClass( "button-large add-major" );
		}

		widget.append( label, remove, view, add );
		widget.addClass( "deductions" );

		// ============================================================
		// BEHAVIOR
		// ============================================================
		remove.click( function() {
			e.remove.fadeTo( 75, 0.75, function() { e.remove.fadeTo( 75, 1.0 ); } );
			if( o.count == 0 ) { return; }
			else {
				o.count--;
				e.view.html( o.count );
				if( o.count == 0 ) {
					if( o.value == 0.1 ) { e.remove.removeClass( 'remove-minor' ) .addClass( 'disabled' ); }
					else                 { e.remove.removeClass( 'remove-major' ) .addClass( 'disabled' ); }
				}
				update( judge, score );
				return;
			}
		});
		add.click( function() {
			e.add.fadeTo( 75, 0.75, function() { e.add.fadeTo( 75, 1.0 ); } );
			o.count++;
			e.view.html( o.count );
			if( o.value == 0.1 ) { e.remove.removeClass( 'disabled' ) .addClass( 'remove-minor' ); }
			else                 { e.remove.removeClass( 'disabled' ) .addClass( 'remove-major' ); }
			update( judge, score );
			return;
		});

	},
	_init: function( ) {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements;
	}
});
