$.widget( "freescore.ajaxbutton", {
	options: { autoShow: true },
	_create: function() {
		var o        = this.options;
		var e        = this.options.elements = {};
		var html     = o.html     = FreeScore.html;
		var button   = e.button   = html.div.clone() .addClass( "button" ) .addClass( o.type ) .html( o.label );
		var progress = e.progress = html.span.clone() .addClass( "candycane" );
		var sound    = e.sound    = {};

		sound.ok    = new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg" ]});
		sound.error = new Howl({ urls: [ "../../sounds/quack.mp3",    "../../sounds/quack.ogg" ]});

		progress.hide();
		this.element .append( button );

		o.port        = defined( o.port ) ? o.port : '/cgi-bin/freescore/';
		o.clickUpdate = function() {
			return function() {
				var url = 'http://' + o.server + o.port + o.tournament + '/' + o.ring + '/' + o.command;
				$.ajax( {
					type:        'GET',
					crossDomain: true,
					url:         url,
					data:        {},
					success:     function( response ) { 
						if( defined( response.error )) {
							sound.error.play();
							progress.hide();
							console.log( response );
						} else {
							sound.ok.play(); 
							console.log( url );
							console.log( response );
							progress.fadeOut( 350 );
							if( defined( o.callback )) { o.callback( response ); }
						}
					},
					error:       function( response ) { sound.error.play(); progress.fadeOut( 100 ); },
					xhr:         function() {
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

		/* // MW delete this code if it proves unused
		function refresh( update ) {
			console.log( "Refreshing ajax button" );
			var division = JSON.parse( update.data );
			b.click( o.clickUpdate() );
		}
		*/
	},
	disable: function() {
		var o = this.options;
		var b = this.element;
		o.disable = true;
		b.css({ opacity: 0.35 });
		b.unbind( "click" );
		b.click( function() { console.log( "Button disabled." ); });
	},
	enable: function() {
		var o = this.options;
		var b = this.element;
		o.disable = false;
		b.css({ opacity: 1 });
		b.unbind( "click" );
		b.click( o.clickUpdate() );
	}
});
