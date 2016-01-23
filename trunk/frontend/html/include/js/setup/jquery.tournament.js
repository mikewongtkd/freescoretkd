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

		var ring = {
			count : {
				panel   : html.div    .clone() .addClass( "ui-field-contain ring-count" ),
				label   : html.label  .clone() .attr({ for : 'select-ring-count' }) .html( 'Ring count' ),
				select  : html.select .clone() .attr({ name : 'select-ring-count', id : 'select-ring-count' }),
				options : [
					{ value : '{count:01,width:1,height:1}', text :  '1' },
					{ value : '{count:02,width:2,height:1}', text :  '2' },
					{ value : '{count:03,width:3,height:1}', text :  '3' },
					{ value : '{count:04,width:2,height:2}', text :  '4' },
					{ value : '{count:05,width:3,height:2}', text :  '5' },
					{ value : '{count:06,width:3,height:2}', text :  '6' },
					{ value : '{count:07,width:4,height:2}', text :  '7' },
					{ value : '{count:08,width:4,height:2}', text :  '8' },
					{ value : '{count:09,width:5,height:2}', text :  '9' },
					{ value : '{count:10,width:5,height:2}', text : '10' },
				]
			},
			start : {
				panel   : html.div    .clone() .addClass( "ui-field-contain ring-start" ),
				label   : html.label  .clone() .attr({ for : 'select-ring-start' }) .html( 'Start with ring' ),
				select  : html.select .clone() .attr({ name : 'select-ring-start', id : 'select-ring-start' }),
				options : [
					{ value :  1, text :  '1' },
					{ value :  2, text :  '2' },
					{ value :  3, text :  '3' },
					{ value :  4, text :  '4' },
					{ value :  5, text :  '5' },
					{ value :  6, text :  '6' },
					{ value :  7, text :  '7' },
					{ value :  8, text :  '8' },
					{ value :  9, text :  '9' },
					{ value : 10, text : '10' },
					{ value : 11, text : '11' },
					{ value : 12, text : '12' },
					{ value : 13, text : '13' },
					{ value : 14, text : '14' },
					{ value : 15, text : '15' },
					{ value : 16, text : '16' },
					{ value : 17, text : '17' },
					{ value : 18, text : '18' },
					{ value : 19, text : '19' },
					{ value : 20, text : '20' },
				]
			},
		};

		// ===== RING COUNT
		for( var i = 0; i < ring.count.options.length; i++ ) {
			var data   = ring.count.options[ i ];
			var option = html.option.clone() .val( data.value ) .html( data.text );
			ring.count.select.append( option );
		}

		// ===== RING START
		for( var i = 0; i < ring.start.options.length; i++ ) {
			var data   = ring.start.options[ i ];
			var option = html.option.clone() .val( data.value ) .html( data.text );
			ring.start.select.append( option );
		}

		ring.count.panel.append( ring.count.label, ring.count.select );
		ring.start.panel.append( ring.start.label, ring.start.select );
		w.append( ring.count.panel, ring.start.panel );
	}
});
