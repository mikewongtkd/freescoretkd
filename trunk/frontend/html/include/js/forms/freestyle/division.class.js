
module.exports = Division;
function Division( division ) {
	this.division = division;

	// ===== DIVISION HEADER
	this.name        = function() { return division.name;        }
	this.description = function() { return division.description; }
	this.summary     = function() { return division.name.toUpperCase().replace( ".", " " ) + (defined( division.description ) ? ' ' + division.description : ''); }
	this.judges      = function() { return parseInt( division.judges ); }
	this.forms       = function() { return division.forms;       }
	this.ring        = function() { return division.ring;        }

	// ===== DIVISION ATHLETE DATA
	this.data        = function() { return division; };
	this.athletes    = function() { return division.athletes.map( function( athlete ) { return new Athlete( athlete ); }); };

	this.as = {
		json : function() { return JSON.stringify( division ); },
	};

	var _current = this.current = {
		athlete : function() {
			var i = parseInt( division.current ); if( isNaN( i )) { i = 0; }
			return new Athlete( division.athletes[ i ] );
		},
		athletes :  function() { return division.athletes; },
		athleteId : function() { return division.current; },
	};

	this.pending = function( round ) { 
		round = defined( round ) ? round : division.round;
		return division.pending[ round ].map( function( i ) { return new Athlete( division.athletes[ i ] ); } );
	};

	this.placement = function( round ) {
		round = defined( round ) ? round : division.round;
		return division.placement[ round ].map( function( i ) { return new Athlete( division.athletes[ i ] ); } );
	}
	var _state = this.state = {
		is : {
			score   : function() { return division.state == 'score'; },
			display : function() { return division.state == 'display'; },
		}
	};
};

