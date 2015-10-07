$.widget( "freescore.formSelector", {
	options: { autoShow: true, num: 0, handle : { ok : function() {}, cancel : function() {} } },
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
		var forms = FreeScore.rulesUSAT.recognizedPoomsae( o.format, o.age, o.rank );
		forms.unshift( 'None' );

		// ============================================================
		var getForms = function() {
		// ============================================================
			var map        = { 'Preliminaries' : 'prelim', 'Semi-Finals' : 'semfin', 'Finals 1st form' : 'finals', 'Finals 2nd form' : 'finals' };
			var reverseMap = { 'prelim' : 'Preliminary Round Form', 'semfin' : 'Semi-Final Round Form', 'finals' : 'Final Round Forms' };
			o.selected     = { order : [ 'prelim', 'semfin', 'finals' ], prelim : [], semfin : [], finals : [] };
			for( var i in all ) {
				var round     = all[ i ];
				var roundName = round.find( "legend" ).html();
				var forms     = round.find( "input" );
				var selected  = forms.filter( ":checked" ).val();

				var roundCode = map[ roundName ];
				if( selected != 'None' ) { o.selected[ roundCode ].push( selected ) };
			}
			var concise = [];
			var descriptive = [];
			for( var i in o.selected.order ) {
				var round = o.selected.order[ i ];
				if( o.selected[ round ].length > 0 ) { 
					concise.push( round + ':' + o.selected[ round ].join( "," )); 
					descriptive.push( "<span class=\"round text\">" + reverseMap[ round ] + '</span>' + o.selected[ round ].map( function( item ) { return "<span class=\"form\">" + item + "</span>"; } ).join( "&nbsp;" ));
				}
			}
			o.selected.text        = concise.join( ";" );
			o.selected.description = descriptive.join( "&nbsp;" );
			var headerFormsTitle = o.header.e.forms.find( "h3 a" );
			var description = o.selected.description ? o.selected.description : "Please Select Forms";
			headerFormsTitle.html( description );
		};

		// ============================================================
		// BEHAVIOR
		// ============================================================
		var reset    = function() {
			for( var i in all ) {
				var round = all[ i ];
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
				for( var i in all ) {
					var round     = all[ i ];
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
				randomPicks = randomPicks.sort( numeric );

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

		var prelim = e.prelim = addButtonGroup( "Preliminaries",   forms, handle.select );
		var semfin = e.semfin = addButtonGroup( "Semi-Finals",     forms, handle.select );
		var final1 = e.final1 = addButtonGroup( "Finals 1st form", forms, handle.select );
		var final2 = e.final2 = addButtonGroup( "Finals 2nd form", forms, handle.select );
		var all    = [];

		if( o.athletes > 16 ) { all.push( prelim ); }
		if( o.athletes > 8  ) { all.push( semfin ); }
		all.push( final1 );
		all.push( final2 );

		// ===== SELECT "None" BUTTON BY DEFAULT
		all.map( function( item ) { 
			var name = item.find( "legend" ).html().toLowerCase().replace( / /g, '-' );
			item.find( '#' + name + '-0' ).prop( "checked", true ) 
		});

		// ===== CONVERT TO A FIELDCONTAIN (LABEL AND BUTTONS ON ONE LINE)
		var formSelect = e.formSelect = all.map( function( item ) { var div = html.div.clone() .addClass( "ui-field-contain" ) .append( item ); return div; })
		var actions    = e.actions    = html.div.clone() .attr( "data-role", "control-group" ) .attr( "data-type", "horizontal" ) .attr( "data-mini", true ) .css( "margin-left", "20%" );
		var ok         = e.ok         = html.a.clone()   .addClass( "ui-btn ui-btn-inline ui-corner-all" ) .css({ 'background': '#090', 'width': '100px', 'color': 'white', 'text-shadow': '0 1px 0 #030' }) .html( "OK" )     .click( o.handle.ok );
		var cancel     = e.cancel     = html.a.clone()   .addClass( "ui-btn ui-btn-inline ui-corner-all" ) .css({ 'background': '#900', 'width': '100px', 'color': 'white', 'text-shadow': '0 1px 0 #300' }) .html( "Cancel" ) .click( o.handle.cancel );
		var complete   = e.complete   = html.div.clone() .css( "text-align", "right" ) .append( cancel, ok );

		actions.append(
			html.a.clone() .attr( "data-role", "button" ) .attr( "data-icon", "star" )   .css( "width", "120px" ) .html( "Random" ) .click( handle.random )
		);

		actions.controlgroup().controlgroup( "refresh" );

		widget.append( formSelect, actions, complete );

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

				if( round.match( 'prelim' )) { select( e.prelim, form[ 0 ] ); } else 
				if( round.match( 'semfin' )) { select( e.semfin, form[ 0 ] ); } else 
				if( round.match( 'finals' )) { select( e.final1, form[ 0 ] ); select( e.final2, form[ 1 ] ); }
				getForms();
			}
		}
	}
});
