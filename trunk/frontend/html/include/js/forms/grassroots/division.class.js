
module.exports = Division;
function Division( division ) {
	this.division = division;

	// ===== DIVISION HEADER
	this.name        = function() { return division.name;        }
	this.description = function() { return division.description; }
	this.summary     = function() { return division.name.toUpperCase().replace( ".", " " ) + ' ' + division.description; }
	this.judges      = function() { return parseInt( division.judges ); }
	this.forms       = function() { return division.forms;       }
	this.ring        = function() { return division.ring;        }
	this.ringName    = function() { return division.ring < 10 ? 'ring0' + division.ring : 'ring' + division.ring; }

	// ===== DIVISION ATHLETE DATA
	this.data        = function() { return division; };
	this.athletes    = function() { return division.athletes.map( function( athlete ) { return new Athlete( athlete ); }); };

	this.as = {
		json : function() { return JSON.stringify( division ); },
	};

	var _current = this.current = {
		athlete : function() {
			var i = parseInt( division.current );
			return new Athlete( division.athletes[ i ] );
		},
		athletes : function( round ) {
			var athletes = [];
			round = defined( round ) ? round : division.round;
			if( ! defined( division.order[ round ] )) { return athletes; }

			for( var i = 0; i < division.order[ round ].length; i++ ) {
				var j = division.order[ round ][ i ];
				athletes.push( new Athlete( division.athletes[ j ] ));
			}

			return athletes;
		},
		athleteId : function() { return division.current; },
		order : function( i ) {
			var round = division.round;
			var order = division.order;
			if( defined( i )) { return order[ round ][ i ]; }
			else              { return order[ round ]; }
		},
		round : {
			display : { name : function() { return FreeScore.round.name[ division.round ]; }},
			name : function() { return FreeScore.round.name[ division.round ].replace( /s$/, '' ) + " Round"; },
		},
		roundId : function() { return division.round; },
		rounds :  function() { return $.grep( FreeScore.round.order, function( round ) { return round in division.order; }); },
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

