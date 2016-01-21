$.widget( "freescore.tournament", {
	options: { autoShow: true },
	_create: function() {
		var o            = this.options;
		var w            = this.element;
		var e            = this.options.elements = {};

		var html         = e.html     = FreeScore.html;
		var tournament   = o.tournament;


	},
	_init: function( ) {
		var o    = this.options;
		var w    = this.element;
		var e    = this.options.elements;
		var html = e.html;

		w.empty();

		var rings = {
			geometry : {
				panel   : html.div    .clone() .addClass( "ui-field-contain ring-layout" ),
				label   : html.label  .clone() .attr({ for : 'select-ring-layout' }) .html( 'Ring count and layout' ),
				select  : html.select .clone() .attr({ name : 'select-ring-layout', id : 'select-ring-layout' }),
				options : [
					{ value : '{count:1,width:1,height:1}', text : '1 (1x1)' },
					{ value : '{count:2,width:2,height:1}', text : '2 (2x1)' },
					{ value : '{count:3,width:3,height:1}', text : '3 (3x1)' },
					{ value : '{count:4,width:4,height:1}', text : '4 (4x1)' },
					{ value : '{count:4,width:2,height:2}', text : '4 (2x2)' },
					{ value : '{count:5,width:3,height:2}', text : '5 (3x2)' },
					{ value : '{count:6,width:3,height:2}', text : '6 (3x2)' },
					{ value : '{count:7,width:4,height:2}', text : '7 (4x2)' },
					{ value : '{count:8,width:4,height:2}', text : '8 (4x2)' },
					{ value : '{count:8,width:3,height:3}', text : '8 (3x3)' },
					{ value : '{count:9,width:5,height:2}', text : '9 (5x2)' },
					{ value : '{count:9,width:3,height:3}', text : '9 (3x3)' },
					{ value : '{count:10,width:5,height:2}', text : '10 (5x2)' },
					{ value : '{count:11,width:6,height:2}', text : '11 (6x2)' },
					{ value : '{count:11,width:4,height:3}', text : '11 (4x3)' },
					{ value : '{count:12,width:6,height:2}', text : '12 (6x2)' },
					{ value : '{count:12,width:4,height:3}', text : '12 (4x3)' },
				]
			},
		};

		for( var i = 0; i < rings.geometry.options.length; i++ ) {
			var data   = rings.geometry.options[ i ];
			var option = html.option.clone() .val( data.value ) .html( data.text );
			rings.geometry.select.append( option );
		}

		rings.geometry.panel.append( rings.geometry.label, rings.geometry.select );
		w.append( rings.geometry.panel );
	}
});
