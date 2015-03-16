$.widget( "freescore.deductions", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements = {};
		var html   = e.html = FreeScore.html;

		o.value    = (! defined( o.value )) ? 0.1 : o.value;
		o.count    = 0;

		if( o.value != 0.1 && o.value != 0.3 ) { throw new Error( "FreeScore jQuery Deductions widget has an invalid value of " + o.value + " instead of 0.1 or 0.3" ); }

		var controller = o.controller;
		var label      = e.label  = html.div.clone() .addClass( "label" ) .html( o.value == 0.1 ? "Minor Deductions" : "Major Deductions" );
		var view       = e.view   = html.div.clone() .addClass( "view" ) .html( o.count );
		var remove     = e.remove = html.div.clone();
		var add        = e.add    = html.div.clone();

		if( o.value == 0.1 ) {
			remove .addClass( "button-small remove-minor" ) .html( "Remove" );
			add    .addClass( "button-large add-minor" )    .html( "Add Minor" );
		} else {
			remove .addClass( "button-small remove-major" ) .html( "Remove" );
			add    .addClass( "button-large add-major" )    .html( "Add Major" );
		}

		widget.append( label, remove, view, add );
		widget.addClass( "deductions" );

		// ============================================================
		// BEHAVIOR
		// ============================================================
		remove.on( 'tap', function() {
			e.remove.fadeTo( 75, 0.75, function() { e.remove.fadeTo( 75, 1.0 ); } );
			if( o.count == 0 ) { return; }
			else {
				o.count--;
				e.view.html( o.count );
				if( o.count == 0 ) {
					if( o.value == 0.1 ) { e.remove.removeClass( 'remove-minor' ) .addClass( 'disabled' ); }
					else                 { e.remove.removeClass( 'remove-major' ) .addClass( 'disabled' ); }
				}
				$( controller.element ).trigger({ type : "updateRequest", score : controller.options });
				return;
			}
		});
		add.on( 'tap', function() {
			e.add.fadeTo( 75, 0.75, function() { e.add.fadeTo( 75, 1.0 ); } );
			o.count++;
			e.view.html( o.count );
			if( o.value == 0.1 ) { e.remove.removeClass( 'disabled' ) .addClass( 'remove-minor' ); }
			else                 { e.remove.removeClass( 'disabled' ) .addClass( 'remove-major' ); }
			$( controller.element ).trigger({ type : "updateRequest", score : controller.options });
			return;
		});
	},
	_init: function( ) {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements;
		e.view.html( o.count );
	}
});
