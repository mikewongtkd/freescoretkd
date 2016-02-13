$.widget( "freescore.formSelector", {
	options: { autoShow: true },
	_create: function() {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements = {};
		var html   = e.html = FreeScore.html;

	},
	_init: function( ) {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements;
		var html   = e.html;

		// ============================================================
		// BEHAVIOR
		// ============================================================
		var forms = e.forms = {
			pool : FreeScore.rulesUSAT.recognizedPoomsae( o.format, o.age, o.rank )
		};
		forms.pool.unshift( 'None' );

		// ============================================================
		var getForms = function() {
		// ============================================================
			var map        = { 'Preliminaries' : 'prelim', 'Semi-Finals' : 'semfin', 'Finals 1st Form' : 'finals', 'Finals 2nd Form' : 'finals' };
			var reverseMap = { 'prelim' : 'Preliminary Round Form', 'semfin' : 'Semi-Final Round Form', 'finals' : 'Final Round Forms' };
			o.selected     = { order : [ 'prelim', 'semfin', 'finals' ], prelim : [], semfin : [], finals : [] };
			for( var i in e.forms.all ) {
				var round       = { buttonGroup : e.forms.all[ i ] };
				var forms       = round.buttonGroup.find( "input" );
				var selected    = forms.filter( ":checked" ).val();
				round.name      = round.buttonGroup.find( "legend" ).html();
				round.code      = map[ round.name ];
				if( selected   != 'None' && defined( selected )) { o.selected[ round.code ].push( selected ) };
			}
			var text = [];
			for( var i in o.selected.order ) {
				var round = { code : o.selected.order[ i ] };
				if( o.selected[ round.code ].length > 0 ) { 
					text.push( round.code + ':' + o.selected[ round.code ].join( "," )); 
				}
			}
			o.selected.text = text.join( ";" );

			var ev = $.Event( FreeScore.event.division.forms, { text : o.selected.text } );
			widget.trigger( ev );
		};

		// ============================================================
		// BEHAVIOR
		// ============================================================
		var reset    = function() {
			for( var i in e.forms.all ) {
				var round = e.forms.all[ i ];
				var forms = round.find( "input" );
				for( var j in forms ) {
					var button = $( forms[ j ] );
					button .prop( "checked", false );
				}
			}
		};

		var handle   = {
			select : function( ev ) {
				var val        = $( ev.target ).val();
				var selectedId = $( ev.target ).attr( "id" );
				for( var i in e.forms.all ) {
					var round     = e.forms.all[ i ];
					var forms     = round.find( "input" );
					var column    = $.grep( forms, function( item ) { return $( item ).val() == val } );
					var columnId  = $( column ).attr( "id" );
					var selected  = forms.filter( ":checked" ).val();

					if( columnId != selectedId && val != "None" ) {
						var none   = $( '#' + columnId.replace( /\d+$/, '0' ));
						var button = $( '#' + columnId );
						if( button .prop( "checked" )) {
							button .prop( "checked", false ) .checkboxradio( "refresh" );
							none   .prop( "checked", true )  .checkboxradio( "refresh" );
						}
					}
				}
				getForms();
			},
			random : function( ev ) {
				// ===== PICK A RANDOM FORM FOR EVERY ROUND
				var randomPicks = [];
				for( var i in all ) { 
					var round        = all[ i ];
					var forms        = round.find( "input" );
					var originalPick = true;
					picking: while( originalPick ) {
						var pick  = Math.ceil( Math.random() * (forms.length - 1));
						for( var i in randomPicks ) { if( randomPicks[ i ] == pick ) { continue picking; } }
						randomPicks.push( pick ); 
						originalPick = false;
					}
				}

				// ===== CHECK THE RADIO BOXES
				for( var i in all ) {
					var round     = all[ i ];
					var forms     = round.find( "input" );
					var pick      = randomPicks.shift();
					var button    = $( forms[ pick ]);
					forms.filter( ":checked" ) .prop( "checked", false ) .checkboxradio( "refresh" );
					button .prop( "checked", true  ) .checkboxradio( "refresh" );
				}
				getForms();
			},
		};

		forms.prelim = { buttonGroup : addButtonGroup( "Preliminaries",   forms.pool ), panel : html.div.clone() .addClass( "ui-field-contain" ) };
		forms.semfin = { buttonGroup : addButtonGroup( "Semi-Finals",     forms.pool ), panel : html.div.clone() .addClass( "ui-field-contain" ) };
		forms.final1 = { buttonGroup : addButtonGroup( "Finals 1st Form", forms.pool ), panel : html.div.clone() .addClass( "ui-field-contain" ) };
		forms.final2 = { buttonGroup : addButtonGroup( "Finals 2nd Form", forms.pool ), panel : html.div.clone() .addClass( "ui-field-contain" ) };

		forms.prelim.panel.append( forms.prelim.buttonGroup );
		forms.semfin.panel.append( forms.semfin.buttonGroup );
		forms.final1.panel.append( forms.final1.buttonGroup );
		forms.final2.panel.append( forms.final2.buttonGroup );

		forms.all = [];

		forms.all.push( forms.prelim.buttonGroup );
		forms.all.push( forms.semfin.buttonGroup );
		forms.all.push( forms.final1.buttonGroup );
		forms.all.push( forms.final2.buttonGroup );

		forms.prelim.buttonGroup.on( "buttonGroupPreliminaries", handle.select );
		forms.semfin.buttonGroup.on( "buttonGroupSemiFinals",    handle.select );
		forms.final1.buttonGroup.on( "buttonGroupFinals1stForm", handle.select );
		forms.final2.buttonGroup.on( "buttonGroupFinals2ndForm", handle.select );

		// ===== SELECT "None" BUTTON BY DEFAULT
		$.each( forms.all, function( i, item ) { 
			var name = item.find( "legend" ).html().toLowerCase().replace( /[\-_ ]/g, '' );
			item.find( '#' + name + '-0' ).prop( "checked", true ) 
		});

		// ===== CONVERT TO A FIELDCONTAIN (LABEL AND BUTTONS ON ONE LINE)
		var actions    = e.actions    = html.div.clone() .attr( "data-role", "control-group" ) .attr( "data-type", "horizontal" ) .attr( "data-mini", true ) .css( "margin-left", "20%" );

		actions.append(
			html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "star" )   .css( "width", "120px" ) .html( "Random" ) .click( handle.random )
		);

		widget.empty();
		widget.append( forms.all, actions );

		var select = function( field, value, callback ) {
			var buttonGroup = field.children();
			var unselect    = buttonGroup.find( ":checked" );
			var selected    = buttonGroup.find( ":radio[value='" + value + "']" );
			unselect.prop( "checked", false );
			selected.prop( "checked", true );
			field.trigger( 'create' );
			buttonGroup.controlgroup( "refresh" );
			callback( jQuery.Event( 'click', { target :selected } ));
		};

		// ===== INITIALIZE FORM SELECTOR FROM DIVISION FORMS SETTINGS
		if( defined( o.forms )) {
			var select = function( buttonGroup, value ) {
				var unselect    = buttonGroup.find( ":checked" );
				var selected    = buttonGroup.find( ":radio[value='" + value + "']" );
				unselect.prop( "checked", false );
				selected.prop( "checked", true );
				buttonGroup.parent().trigger( 'create' );
				buttonGroup.controlgroup();
				buttonGroup.controlgroup( "refresh" );
			};

			for( var round in o.forms ) {
				var forms = o.forms[ round ];
				var form  = forms.map( function( item ) { return item.name; } );

				if( round.match( 'prelim' )) { select( e.forms.prelim.buttonGroup, form[ 0 ] ); } else 
				if( round.match( 'semfin' )) { select( e.forms.semfin.buttonGroup, form[ 0 ] ); } else 
				if( round.match( 'finals' )) { select( e.forms.final1.buttonGroup, form[ 0 ] ); select( e.forms.final2.buttonGroup, form[ 1 ] ); }
				getForms();
			}
		}
	}
});
