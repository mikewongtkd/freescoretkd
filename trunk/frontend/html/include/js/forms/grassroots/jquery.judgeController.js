$.widget( "freescore.judgeController", {
	options: { autoShow: true, num: 1 },
	_create: function() {
		var options = this.options;
		var e       = this.options.elements = {};
		var html    = { div : $( "<div />" ), form : $( "<form />" ), select : $( "<select />" ), option : $( "<option />" ) };
		var login   = e.login = html.div.clone() .prop( 'id', 'login' );
		
		login.prop( 'title', 'Login' );
		login.html( 'Please choose a role' );
		login.dialog( { 
			autoOpen: true, resizeable: false, modal: true, width: '400px', 
			buttons: {
				'Judge 1'    : function() { $( this ).dialog( { num : 0 } ); $( this ).dialog( "close" ); },
				'Center Ref' : function() { $( this ).dialog( { num : 1 } ); $( this ).dialog( "close" ); },
				'Judge 3'    : function() { $( this ).dialog( { num : 2 } ); $( this ).dialog( "close" ); },
			}
		} );

		this.element.addClass( 'judgeController' );
		var form  = e.form  = html.form.clone();
		var score = e.score = html.select.clone();
		for( var i = 75; i < 100; i++ ) {
			var j = i / 10.0;
			var option = html.option.clone() .prop( 'value', i ) .append( j.toFixed( 1 ) );
			if( i == 85 ) { option.prop( 'selected', 'true' ); }
			score.append( option );
		}
		form.append( score );
		this.element.append( form );
	},
	_init: function( ) {
		var o       = this.options;
		var e       = this.options.elements;
		var widget  = this.element;

		var refresh = function() {
		$.getJSON(
			'http://' + o.server + '/cgi-bin/freescore/forms/grassroots/' + o.tournament,
			function( division ) { });
		};
	}
});
