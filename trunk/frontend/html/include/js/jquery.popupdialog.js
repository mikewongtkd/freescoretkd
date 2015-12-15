$.widget( "freescore.popupdialog", {
	options: { autoShow: true, message : ':', title : 'Title', subtitle :'Subtitle', message : 'Message', buttons : [] },
	_create: function() {
		var o    = this.options;
		var w    = this.element;
		var e    = this.options.elements = {};
		var html = o.html     = FreeScore.html;
	},
	_init: function( ) {
		var o    = this.options;
		var w    = this.element;
		var e    = this.options.elements;
		var html = o.html;

		var dialog = {
			title    : w.find( 'h1' ),
			subtitle : w.find( 'h3' ),
			message  : $( '#popupDialogMessage' ),
			buttons  : $( '#popupDialogButtons' )
		};

		dialog.title    .html( o.title );
		dialog.subtitle .html( o.subtitle );
		dialog.message  .html( o.message );

		if( o.buttons.length > 0 ) { dialog.buttons.empty(); }
		for( var i = 0; i < o.buttons.length; i++ ) {
			var button = {
				data  : o.buttons[ i ],
				panel : html.a.clone() .addClass( "ui-btn" ) .addClass( "ui-btn-inline" ),
			};
			if( defined( button.data.icon  )) { button.panel.addClass( "ui-icon-" + button.data.icon ); }
			if( defined( button.data.text  )) { button.panel.html( button.data.text ); }
			if( defined( button.data.style )) { button.panel.addClass( button.data.style ); } else { button.panel.addClass( 'default' ); }
			if( defined( button.data.click )) { button.panel.click( button.data.click ); }
			button.panel.button();
			dialog.buttons.append( button.panel );
		}

		w.css({ 'background' : '#fff;', 'width' : '800px' });
		w.popup();
	}
});
