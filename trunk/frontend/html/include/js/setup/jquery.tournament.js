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

		o.ring   = {};

		w.empty();

		var page = e.page = {
			header  : html.div.clone() .attr({ 'data-role' : 'header', 'data-theme' : 'b' }),
			content : html.div.clone() .attr({ 'data-role' : 'content' }),
			footer  : html.div.clone() .attr({ 'data-role' : 'footer', 'data-theme' : 'b' }),
		};

		var ring = e.ring = {
			layout : [
				{ count:  1, width: 1, height: 1},
				{ count:  2, width: 2, height: 1},
				{ count:  3, width: 3, height: 1},
				{ count:  4, width: 2, height: 2},
				{ count:  5, width: 3, height: 2},
				{ count:  6, width: 3, height: 2},
				{ count:  7, width: 4, height: 2},
				{ count:  8, width: 4, height: 2},
				{ count:  9, width: 5, height: 2},
				{ count: 10, width: 5, height: 2},
			],
			count : {
				panel   : html.div    .clone() .addClass( "ui-field-contain ring-count" ),
				label   : html.label  .clone() .attr({ for : 'select-ring-count' }) .html( 'Number of rings' ),
				select  : html.select .clone() .attr({ name : 'select-ring-count', id : 'select-ring-count' }),
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
			formation : {
				panel   : html.div    .clone() .addClass( "ui-field-contain ring-formation" ),
				label   : html.label  .clone() .attr({ for : 'select-ring-formation' }) .html( 'Ring formation' ),
				select  : html.select .clone() .attr({ name : 'select-ring-formation', id : 'select-ring-formation' }),
				options : [
					{ value : 'rows', text : 'Rings are arranged by rows' },
					{ value : 'loop', text : 'Rings are numbered going clockwise' },
				]
			},

			enable : {
				panel    : html.div      .clone() .attr({ 'data-role' : 'fieldcontain' }),
				fieldset : html.fieldset .clone() .addClass( "ring-enable" ) .attr({ 'data-role' : 'controlgroup', 'data-type' : 'horizontal' }),
				label    : html.legend   .clone() .html( 'Disable rings' ),
			}
		};

		var button = e.button = {
			panel  : html.div.clone() .addClass( "buttons" ),
			ok     : html.a.clone() .addClass( "ok" )     .attr({ 'data-role' : 'button', 'data-inline' : true }) .html( "Accept" ),
			cancel : html.a.clone() .addClass( "cancel" ) .attr({ 'data-role' : 'button', 'data-inline' : true }) .html( "Cancel" ),
		};

		button.cancel .click( function() { document.location = ".."; } );
		button.ok     .click( function() { console.log( o.ring ); } );

		button.panel.append( button.cancel, button.ok );

		// ============================================================
		var updateFormation = function() {
		// ============================================================
			var formation = e.ring.formation.select.val();
			o.ring.formation = formation;
		}

		// ============================================================
		var updateLayout = function() {
		// ============================================================
			var n      = parseInt( e.ring.count.select.val()) - 1;
			var layout = undefined;
			if( n >= 0 && n < 10 ) { 
				layout = e.ring.layout[ n ];
				o.ring.width  = layout.width;
				o.ring.height = layout.height;
			}
		}

		// ============================================================
		var updateEnable = function() {
		// ============================================================
			var k        = parseInt( e.ring.start.select.val());
			var disabled = $( ':checkbox' );
			var enabled  = [];
			for( var i = 0; i < disabled.length; i++ ) {
				var ring = disabled[ i ];
				if( ! ring.checked ) {
					enabled.push( i + k );
				}
			}

			o.ring.enable = enabled;
		}

		// ============================================================
		var displayEnable = function() {
		// ============================================================
			var k    = parseInt( e.ring.start.select.val());
			var n    = parseInt( e.ring.count.select.val());
			var html = e.html;

			o.ring.start = k;
			o.ring.count = n;

			e.ring.enable.fieldset.controlgroup();
			e.ring.enable.fieldset.controlgroup( "container" ).empty();
			for( var i = k; i < k + n; i++ ) {
				var option = {
					input : html.checkbox .clone() .attr({ name : 'enable-' + i, id : 'enable-' + i, value : i }),
					label : html.label    .clone() .attr({ for : 'enable-' + i }) .html( i )
				};
				option.input.change( updateEnable );
				e.ring.enable.fieldset.controlgroup( "container" ).append( option.label, option.input );
			}
			e.ring.enable.fieldset.enhanceWithin().controlgroup( 'refresh' );
		};

		// ===== RING COUNT
		for( var i = 0; i < ring.count.options.length; i++ ) {
			var data   = ring.count.options[ i ];
			var option = html.option.clone() .val( data.value ) .html( data.text );
			if( o.tournament.rings.count == data.text ) { option.attr({ selected : true }); }
			ring.count.select.append( option );
			ring.count.select.change( function() { updateLayout(); displayEnable() } );
		}

		// ===== RING START
		for( var i = 0; i < ring.start.options.length; i++ ) {
			var data   = ring.start.options[ i ];
			var option = html.option.clone() .val( data.value ) .html( data.text );
			if( o.tournament.rings.start == data.text ) { option.attr({ selected : true }); }
			ring.start.select.append( option );
			ring.start.select.change( displayEnable );
		}

		// ===== RING FORMATION
		for( var i = 0; i < ring.formation.options.length; i++ ) {
			var data   = ring.formation.options[ i ];
			var option = html.option.clone() .val( data.value ) .html( data.text );
			if( o.tournament.rings.formation == data.text ) { option.attr({ selected : true }); }
			ring.formation.select.append( option );
			ring.start.select.change( updateFormation );
		}

		ring.count.panel.append( ring.count.label, ring.count.select );
		ring.start.panel.append( ring.start.label, ring.start.select );
		ring.formation.panel.append( ring.formation.label, ring.formation.select );
		ring.enable.fieldset.append( ring.enable.label );
		ring.enable.panel.append( ring.enable.fieldset );

		page.header.html( '<h1>FreeScore Tournament Setup</h1>' );

		$( function() { updateFormation(); updateLayout(); displayEnable(); updateEnable(); } );

		page.content.append( ring.count.panel, ring.start.panel, ring.formation.panel, ring.enable.panel, button.panel  );
		w.append( page.header, page.content, page.footer );
		w.addClass( "tournament" );
	}
});
