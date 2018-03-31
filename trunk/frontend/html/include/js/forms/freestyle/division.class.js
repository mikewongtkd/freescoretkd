
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
		athletes :   function() { var round = division.round; var order = division.order[ round ]; return order.map(( i ) => { return new Athlete( division.athletes[ i ] ); }) },
		athleteId :  function() { return division.current; },
		order :      function() { var round = division.round; return division.order[ round ]; },
		placements : function() { var round = division.round; return division.placements[ round ].map(( i ) => { return new Athlete( division.athletes[ i ] ); }); },
		progress :   function() { var round = division.round; var order = division.order; var i = order[ round ].findIndex(( x ) => { return x == division.current; }); return ordinal(i + 1) + ' of ' + order[ round ].length; },
		round:       function() { return FreeScore.round.name[ division.round ]; },
		roundId:     function() { return division.round; }
	};

	var _is = this.is = {
		complete: function() { return division.complete; }
	};

	var _state = this.state = {
		is : {
			score   : function() { return division.state == 'score'; },
			display : function() { return division.state == 'display'; },
		}
	};
};

