$.widget( "freescore.divisionDescriptor", {
	options: { autoShow: true  },
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

		widget.empty();

		// ============================================================
		// BEHAVIOR
		// ============================================================
		var getDescription = o.getDescription = function() {
			var map = { 
				'12-14' : 'Cadets', '15-17' : 'Juniors', '18-29' : 'Under 30', '30-39' : 'Under 40', 
				'40-49' : 'Under 50', '50-59' : 'Under 60', '60-64' : 'Under 65', '65+' : 'Over 65'
			};

			// ===== GET CURRENTLY SELECTED VALUES
			o.gender = defined( o.gender ) ? o.gender : e.division.gender .buttonGroup.find( ':checked' ).val();
			o.age    = defined( o.age )    ? o.age    : e.division.age    .buttonGroup.find( ':checked' ).val();
			o.rank   = defined( o.rank )   ? o.rank   : e.division.rank   .buttonGroup.find( ':checked' ).val();
			o.format = defined( o.format ) ? o.format : e.division.format .buttonGroup.find( ':checked' ).val();

			// ===== ASSIGN 
			var descriptors = [];
			if( defined( o.gender )) { descriptors.push( o.gender ); }
			if( defined( o.rank   )) { if( o.rank   != 'Black Belt' ) { descriptors.push( o.rank ); }}
			if( o.age in map )       { descriptors.push( map[ o.age ] ); } else if( defined( o.age )) { descriptors.push( o.age ); }
			if( defined( o.format )) { if( o.format != 'Individual' ) { descriptors.push( o.format ); }}

			var description = { gender : o.gender, age : o.age, rank : o.rank, text : descriptors.join( " " ) };
			o.description = description;

			if( defined( description.gender ) && defined( description.age ) && defined( description.rank ) && defined( description.text )) {
				var ev = $.Event( FreeScore.event.division.description, description );
				console.log( "Triggering", ev );
				widget.trigger( ev );
			}
		};

		var handle = o.handle = {
			age    : function( ev ) { o.age    = ev.value; o.getDescription(); ev.stopPropagation(); },
			gender : function( ev ) { o.gender = ev.value; o.getDescription(); ev.stopPropagation(); },
			rank   : function( ev ) { o.rank   = ev.value; o.getDescription(); ev.stopPropagation(); },
			format : function( ev ) {
				var val = ev.value;
				if( val == 'Individual' ) { o.format = undefined; } else { o.format = val; }

				// ===== UPDATE AGE GROUP BASED ON EVENT
				o.age = undefined;
				e.division.age.panel.empty();
				var buttonGroup = e.division.age.buttonGroup = addButtonGroup( "Age", FreeScore.rulesUSAT.ageGroups( val ) );
				e.division.age.panel.append( buttonGroup ).trigger( 'create' );
				buttonGroup.controlgroup().controlgroup( "refresh" );

				// ===== HANDLE AGE DESCRIPTION
				var ages = get_values( e.division.age.panel );
				for( var i = 0; i < ages.length; i++ ) {
					var age = ages[ i ];
					if( o.text.match( age )) { select( e.division.age.buttonGroup, age, o.handle.age ); }
				}
				for( var age in reverseMap ) {
					if( o.text.match( age )) { select( e.division.age.buttonGroup, reverseMap[ age ], o.handle.age ); }
				}

				// ===== HANDLE GENDER DESCRIPTION
				var genders = get_values( e.division.gender.panel );
				for( var i = 0; i < genders.length; i++ ) {
					var gender = genders[ i ];
					if( o.text.match( gender )) { select( e.division.gender.buttonGroup, gender, o.handle.gender ); }
				}

				// ===== UPDATE GENDERS BASED ON EVENT
				if( val == 'Pair' ) {
					e.division.gender.buttonGroup.find( ":checked" ).prop( "checked", false );
					// e.division.gender.buttonGroup.find( ":radio" ).each( function() { $( this ).attr({ disabled : true }).checkboxradio().checkboxradio( 'refresh' ); });
					o.gender = undefined;
				} else {
					// e.division.gender.buttonGroup.find( ":radio" ).each( function() { $( this ).removeAttr( 'disabled' ).checkboxradio().checkboxradio( 'refresh' ); });
				}
				e.division.gender.panel.trigger( 'create' );
				e.division.gender.buttonGroup.controlgroup().controlgroup( "refresh" );

				o.getDescription();
				ev.stopPropagation();
			}
		};

		var division = e.division = {
			format: { panel: html.div.clone() .addClass( "ui-field-contain" ), buttonGroup: addButtonGroup( "Event",  FreeScore.rulesUSAT.poomsaeEvents()) },
			gender: { panel: html.div.clone() .addClass( "ui-field-contain" ), buttonGroup: addButtonGroup( "Gender", FreeScore.rulesUSAT.genders()) },
			age:    { panel: html.div.clone() .addClass( "ui-field-contain" ), buttonGroup: addButtonGroup( "Age",    FreeScore.rulesUSAT.ageGroups()) },
			rank:   { panel: html.div.clone() .addClass( "ui-field-contain" ), buttonGroup: addButtonGroup( "Rank",   FreeScore.rulesUSAT.ranks()) }
		};

		division.format .panel .append( division.format .buttonGroup );
		division.gender .panel .append( division.gender .buttonGroup );
		division.age    .panel .append( division.age    .buttonGroup );
		division.rank   .panel .append( division.rank   .buttonGroup );

		setTimeout( function() {
			division.format .panel .on( "buttonGroupEvent",  handle.format );
			division.gender .panel .on( "buttonGroupGender", handle.gender );
			division.age    .panel .on( "buttonGroupAge",    handle.age );
			division.rank   .panel .on( "buttonGroupRank",   handle.rank );
		}, 100 );

		e.division.format.panel.find( "input:radio#event-0" ).attr( "checked", true ); // Select Individual Poomsae by default

		widget.append( e.division.format.panel, e.division.gender.panel, e.division.rank.panel, e.division.age.panel );
		
		var select = function( buttonGroup, value, callback ) {
			var unselect    = buttonGroup.find( ":checked" );
			var selected    = buttonGroup.find( ":radio[value='" + value + "']" );
			unselect.prop( "checked", false );
			selected.prop( "checked", true );
			buttonGroup.controlgroup().controlgroup( "refresh" );
			var id          = selected.attr( 'id' );
			callback( $.Event( 'initialize', { id : id, value : value } ));
		};

		var get_values = function( field ) {
			var values  = [];
			var buttons = field.find( ":radio" );
			for( var i = 0; i < buttons.length; i++ ) {
				values.push( $( buttons[ i ] ).prop( "value" ));
			}
			return values;
		}
		
		// ============================================================
		// SELECT BUTTONS BASED ON DIVISION DATA
		// ============================================================
		if( defined( o.text )) {
			var reverseMap = { 
				'Cadets' : '12-14', 'Juniors' : '15-17',  'Under 30' : '18-29', 'Under 40' : '30-39', 
				'Under 50' : '40-49', 'Under 60' : '50-59', 'Under 65' : '60-64', 'Over 65' : '65+'
			};
	
			// ===== HANDLE EVENT DESCRIPTION
			if( o.text.match( /Team/ )) { select( e.division.format.buttonGroup, 'Team',       o.handle.format ); } else
			if( o.text.match( /Pair/ )) { select( e.division.format.buttonGroup, 'Pair',       o.handle.format ); } else
			                            { select( e.division.format.buttonGroup, 'Individual', o.handle.format ); }

			// ===== HANDLE GENDER DESCRIPTION
			var genders = get_values( e.division.gender.panel );
			for( var i = 0; i < genders.length; i++ ) {
				var gender = genders[ i ];
				if( o.text.match( gender )) { select( e.division.gender.buttonGroup, gender, o.handle.gender ); }
			}

			// ===== HANDLE RANK DESCRIPTION
			var ranks = get_values( e.division.rank.panel );
			select( e.division.rank.buttonGroup, 'Black Belt', o.handle.rank );
			for( var i = 0; i < ranks.length; i++ ) {
				var rank = ranks[ i ];
				if( o.text.match( rank )) { select( e.division.rank.buttonGroup, rank, o.handle.rank ); }
			}

			// ===== HANDLE AGE DESCRIPTION
			var ages = get_values( e.division.age.panel );
			for( var i = 0; i < ages.length; i++ ) {
				var age = ages[ i ];
				if( o.text.match( age )) { select( e.division.age.buttonGroup, age, o.handle.age ); }
			}
			for( var age in reverseMap ) {
				if( o.text.match( age )) { select( e.division.age.buttonGroup, reverseMap[ age ], o.handle.age ); }
			}
		}
		o.getDescription();
		widget.find( 'fieldset' ).controlgroup().controlgroup( 'refresh' );
	}
});
