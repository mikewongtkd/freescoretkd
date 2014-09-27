$.widget( "freescore.ajaxbutton", {
	options: { autoShow: true },
	_create: function() {
		var o        = this.options;
		var e        = this.options.elements = {};
		var html     = o.html     = { div : $( "<div />" ), span : $( "<span />" ) };
		var button   = e.button   = html.div.clone() .addClass( "button" ) .addClass( o.type ) .html( o.label );
		var progress = e.progress = html.span.clone() .addClass( "candycane" );
		progress.hide();
		this.element .append( button );

		o.clickUpdate = function() {
			return function() {
				var url = 'http://' + o.server + '/cgi-bin/freescore/' + o.app + '/' + o.tournament + '/' + o.ring + '/' + o.command;
				console.log( url );
				$.ajax( {
					type:    'GET',
					url:     url,
					data:    {},
					success: function( response ) { console.log( response ); progress.fadeOut( 350 ); },
					xhr:     function() {
						var xhr = new window.XMLHttpRequest();
						xhr.addEventListener( "progress", function( e ) {
							progress.fadeIn( 700, function() { progress.fadeOut( 1500 ) } );
							if( e.lengthComputable ) {
								var percent = (100 * (e.loaded / e.total)).toFixed( 0 ) + '%';
								progress.css( 'width', percent );
							}
						}, false );
						return xhr;
					}
				});
			}
		};

		this.element.click( o.clickUpdate() );
	},
	_init: function( ) {
		var o = this.options;
		var e = this.options.elements;
		var b = this.element;

		e.button.empty();
		e.button.append( e.progress, o.label );

		function refresh( update ) {
			var division = JSON.parse( update.data );
			b.click( o.clickUpdate() );
		}
	}
});
