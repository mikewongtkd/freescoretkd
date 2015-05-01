$.widget( "freescore.divisionDescriptor", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements = {};
		var html   = e.html = FreeScore.html;

		// ============================================================
		// BEHAVIOR
		// ============================================================
		var getDescription = function() {
			var map = { 
				'12-14' : 'Cadets', '15-17' : 'Juniors', '18-29' : 'Seniors', '30-39' : 'Executives', 
				'40-49' : '1st Masters', '50-59' : '2nd Masters', '60+' : '3rd Masters' 
			};
			var groups = [];
			if( defined( o.rank )) {
				if( o.age in map ) { 
					groups.push( o.gender );
					groups.push( o.rank );
					groups.push( map[ o.age ] );
					if( defined( o.format )) { groups.push( o.format ); }

				} else {
					groups.push( o.age );
					groups.push( o.gender );
					groups.push( o.rank + ' Belts' );
					if( defined( o.format )) { groups.push( o.format ); }
				}
			} else {
				if( o.age in map ) { 
					groups.push( o.gender );
					groups.push( map[ o.age ] );
					if( defined( o.format )) { groups.push( o.format ); }
				} else {
					groups.push( o.age );
					groups.push( o.gender );
					groups.push( 'Black Belts' );
					if( defined( o.format )) { groups.push( o.format ); }
				}
			}

			return { gender : o.gender, age : o.age, rank : o.rank, text : groups.join( " " ) };
		};
		var handle = {
			age : function( ev ) {
				var val = $( ev.target ).val();
				o.age = val;
				o.description = getDescription();
				console.log( o.description.text );
			},
			gender : function( ev ) {
				var val = $( ev.target ).val();
				o.gender = val;
			},
			rank : function( ev ) {
				var val = $( ev.target ).val();
				if( val == 'Black Belt' ) { o.rank = undefined; } else { o.rank = val; }
			},
			format : function( ev ) {
				var val = $( ev.target ).val();
				age.empty();
				var buttonGroup = addButtonGroup( "Age", FreeScore.rulesUSAT.ageGroups( val ), handle.age );
				age.append( buttonGroup ).trigger( 'create' );
				buttonGroup.controlgroup( "refresh" );
				if( val == 'Individual' ) { o.format = undefined; } else { o.format = val; }
			}
		};

		var format = e.format = html.div.clone() .attr( "data-role", "fieldcontain" ) .append( addButtonGroup( "Event",  FreeScore.rulesUSAT.poomsaeEvents(), handle.format ));
		var gender = e.gender = html.div.clone() .attr( "data-role", "fieldcontain" ) .append( addButtonGroup( "Gender", [ "Female", "Male" ], handle.gender ));
		var age    = e.age    = html.div.clone() .attr( "data-role", "fieldcontain" ) .append( addButtonGroup( "Age",  FreeScore.rulesUSAT.ageGroups( "Individual" ), handle.age ));
		var rank   = e.rank   = html.div.clone() .attr( "data-role", "fieldcontain" ) .append( addButtonGroup( "Rank", [ "Yellow", "Green", "Blue", "Red", "Black Belt" ], handle.rank ));

		format.children().children( "input:radio#event-0" ).attr( "checked", true );

		widget.append( format, gender, rank, age );
	},
	_init: function( ) {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements;
	}
});
