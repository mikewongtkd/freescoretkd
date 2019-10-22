
module.exports = Division;
function Division( division ) {
	this.division = division;

	// ===== DIVISION HEADER
	this.name        = function() { return division.name;        }
	this.description = function() { return division.description; }
	this.summary     = function() { return division.name.toUpperCase().replace( ".", " " ) + ' ' + (defined( division.description ) ? division.description : ''); }
	this.judges      = function() { return parseInt( division.judges ); }
	this.forms       = function() { return division.forms;       }
	this.ring        = function() { return division.ring;        }
	this.ringName    = function() { return division.ring < 10 ? 'ring0' + division.ring : 'ring' + division.ring; }
	this.brackets    = function() { return division.brackets;    }

	// ===== DIVISION ATHLETE DATA
	this.data        = function() { return division; };
	this.athletes    = function() { return division.athletes.map( function( athlete ) { return new Athlete( athlete ); }); };

	this.as = {
		json : function() { return JSON.stringify( division ); },
	};

	var _brackets = function() {
		var i = division.current;
		var j = 0;
		var brackets = division.brackets[ j ];
		while( i >= brackets.length ) {
			i -= brackets.length;
			j++;
			brackets = division.brackets[ j ];
		}
		return { list : brackets, current : brackets[ i ], round : j, blueAthlete : (2 * i), redAthlete : (2 * i) + 1 };
	}

	var _current = this.current = {
		athlete : function() {
			var i = parseInt( division.current );
			return new Athlete( division.athletes[ i ] );
		},
		athletes : function() {
			// For single elimination, show all athletes in the current round
			if( defined( division.mode ) && division.mode == 'single-elimination' ) {
				var athletes = [];
				var brackets = _brackets();
				for( var i = 0; i < brackets.list.length; i++ ) {
					var bracket = brackets.list[ i ];
					var blue    = new Athlete( division.athletes[ bracket.blue.athlete ]);
					var red     = new Athlete( division.athletes[ bracket.red.athlete ]);
					athletes.push( blue );
					athletes.push( red );
				}
				return athletes;

			// Show all athletes.
			} else {
				return division.athletes.map( function( athlete ) { return new Athlete( athlete ); });
			}

		},
		athleteId : function() { return division.current; },
		blueAthlete : function() {
			var brackets = _brackets();
			return brackets.blueAthlete;
		},
		bracket: function() {
			var brackets = _brackets();
			return brackets.current;
		},
		order : function( i ) {
			var order = division.order;
			if( defined( i )) { return order[ i ]; }
			else              { return order; }
		},
		redAthlete : function() {
			var brackets = _brackets();
			return brackets.redAthlete;
		}
	};

	var _is = this.is = {
		single : { elimination: function() { return defined( division.mode ) && division.mode == 'single-elimination'; }},
		tied : function() { return defined( division.tied ); }
	};

	var _state = this.state = {
		is : {
			score   : function() { return division.state == 'score'; },
			display : function() { return division.state == 'display'; },
		}
	};

	var _tied = this.tied = {
		athletes: function() {
			var athletes = division.tied[ 0 ];
			return athletes.tied.map( function( i ) { return division.athletes[ i ]; });
		}
	};
};

