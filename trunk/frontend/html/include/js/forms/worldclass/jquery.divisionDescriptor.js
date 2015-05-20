$.widget( "freescore.divisionDescriptor", {
	options: { autoShow: true, num: 0 },
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
			var groups = [];
			groups.push( o.gender );
			if( o.age in map )       { groups.push( map[ o.age ] ); } else { groups.push( o.age ); }
			if( defined( o.rank   )) { groups.push( o.rank + ' Belts' ); }
			if( defined( o.format )) { groups.push( o.format ); }

			var text        = groups.join( " " );
			var description = { gender : o.gender, age : o.age, rank : o.rank, text : text };
			o.description = description;
			var headerDescriptionTitle = o.header.e.description.find( "h3 a" );
			o.header.o.initialize.forms();
			headerDescriptionTitle.html( description.text );
			return description;
		};
		var handle = o.handle = {
			age : function( ev ) {
				var val = $( ev.target ).val();
				o.age = val;
				getDescription();
			},
			gender : function( ev ) {
				var val = $( ev.target ).val();
				o.gender = val;
				getDescription();
			},
			rank : function( ev ) {
				var val = $( ev.target ).val();
				if( val == 'Black Belt' ) { o.rank = undefined; } else { o.rank = val; }
				getDescription();
			},
			format : function( ev ) {
				e.gender.find( "input[type='radio']" ).checkboxradio().checkboxradio( 'enable' );
				var val = $( ev.target ).val();
				o.age = undefined;
				e.age.empty();
				var buttonGroup = addButtonGroup( "Age", FreeScore.rulesUSAT.ageGroups( val ), handle.age );
				e.age.append( buttonGroup ).trigger( 'create' );
				buttonGroup.controlgroup().controlgroup( "refresh" );
				if( val == 'Individual' ) { o.format = undefined; } else { o.format = val; }
				if( val == 'Pair' ) {
					e.gender.find( ":checked" ).prop( "checked", false );
					e.gender.find( "input[type='radio']" ).checkboxradio().checkboxradio( 'disable' );
					e.gender.children().controlgroup();
					o.gender = undefined;
				}
				getDescription();
			}
		};

		var format = e.format = html.div.clone() .addClass( "ui-field-contain" ) .append( addButtonGroup( "Event",  FreeScore.rulesUSAT.poomsaeEvents(), handle.format ));
		var gender = e.gender = html.div.clone() .addClass( "ui-field-contain" ) .append( addButtonGroup( "Gender", [ "Female", "Male" ], handle.gender ));
		var age    = e.age    = html.div.clone() .addClass( "ui-field-contain" ) .append( addButtonGroup( "Age",  FreeScore.rulesUSAT.ageGroups( "Individual" ), handle.age ));
		var rank   = e.rank   = html.div.clone() .addClass( "ui-field-contain" ) .append( addButtonGroup( "Rank", [ "Yellow", "Green", "Blue", "Red", "Black Belt" ], handle.rank ));

		format.find( "input:radio#event-0" ).attr( "checked", true ); // Select Individual Poomsae by default

		widget.append( format, gender, rank, age );
		o.text = o.header.o.text;
		
		var select = function( field, value, callback ) {
			var buttonGroup = field.children();
			var unselect    = buttonGroup.find( ":checked" );
			var selected    = buttonGroup.find( ":radio[value='" + value + "']" );
			unselect.prop( "checked", false );
			selected.prop( "checked", true );
			field.trigger( 'create' );
			buttonGroup.controlgroup().controlgroup( "refresh" );
			callback( jQuery.Event( 'click', { target :selected } ));
		};

		var get_values = function( field ) {
			var values  = [];
			var buttons = field.find( ":radio" );
			for( var i = 0; i < buttons.length; i++ ) {
				values.push( $( buttons[ i ] ).prop( "value" ));
			}
			return values;
		}
		
		if( defined( o.text )) {
			var reverseMap = { 
				'Cadets' : '12-14', 'Juniors' : '15-17',  'Under 30' : '18-29', 'Under 40' : '30-39', 
				'Under 50' : '40-49', 'Under 60' : '50-59', 'Under 65' : '60-64', 'Over 65' : '65+'
			};
	
			// ===== HANDLE EVENT DESCRIPTION
			if( o.text.match( /Team/ )) { select( e.format, 'Team',       o.handle.format ); } else
			if( o.text.match( /Pair/ )) { select( e.format, 'Pair',       o.handle.format ); } else
			                            { select( e.format, 'Individual', o.handle.format ); }

			// ===== HANDLE GENDER DESCRIPTION
			var genders = get_values( e.gender );
			for( var i = 0; i < genders.length; i++ ) {
				var gender = genders[ i ];
				if( o.text.match( gender )) { select( e.gender, gender, o.handle.gender ); }
			}

			// ===== HANDLE RANK DESCRIPTION
			var ranks = get_values( e.rank );
			select( e.rank, 'Black Belt', o.handle.rank );
			for( var i = 0; i < ranks.length; i++ ) {
				var rank = ranks[ i ];
				if( o.text.match( rank )) { select( e.rank, rank, o.handle.rank ); }
			}

			// ===== HANDLE AGE DESCRIPTION
			var ages = get_values( e.age );
			for( var i = 0; i < ages.length; i++ ) {
				var age = ages[ i ];
				if( o.text.match( age )) { select( e.age, age, o.handle.age ); }
			}
			for( var age in reverseMap ) {
				if( o.text.match( age )) { select( e.age, reverseMap[ age ], o.handle.age ); }
			}
		}
		o.getDescription();
	}
});
