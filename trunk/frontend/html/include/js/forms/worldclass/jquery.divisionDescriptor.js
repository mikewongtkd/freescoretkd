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
				if( val == 'Individual' ) { o.format = undefined; } else { o.format = val; }
			}
		};

		var format = addButtonGroup( "Event", [ "Individual", "Pair", "Team" ], handle.format );
		var gender = addButtonGroup( "Gender", [ "Female", "Male" ], handle.gender );
		var age    = addButtonGroup( "Age", [ "4-5", "6-7", "8-9", "10-11", "12-14", "15-17", "18-29", "30-39", "40-49", "50-59", "60+" ], handle.age );
		var rank   = addButtonGroup( "Rank", [ "Novice", "Intermediate", "Advanced", "Black Belt" ], handle.rank );

		format.children( "input:radio#event-0" ).attr( "checked", true );

		widget.append( [ format, gender, rank, age ].map( function( item ) { var div = html.div.clone() .attr( "data-role", "fieldcontain" ) .append( item ); return div; }));
	},
	_init: function( ) {
		var widget = this.element;
		var o      = this.options;
		var e      = this.options.elements;
	}
});
