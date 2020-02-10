
module.exports = Division;
function Division( division ) {
	this.division = division;

	// ===== DIVISION HEADER
	this.name        = function() { return division.name;        }
	this.description = function() { return division.description; }
	this.summary     = function() { console.log( division.flight ); return division.name.toUpperCase().replace( ".", " " ) + ' ' + division.description + (this.is.flight() ? ' (Flight ' + division.flight.id.toUpperCase() + ')':''); }
	this.judges      = function( n ) { if( defined( n )) { division.judges = n; } return parseInt( division.judges ); }
	this.flight      = function() { if( 'flight' in division ) { return division.flight; } else { return null; }}
	this.forms       = function() { return division.forms;       }
	this.ring        = function() { return division.ring;        }
	this.history     = function() { return division.history;     }

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
		athleteId : function() { return parseInt( division.current ); },
		form : {
			description : function() {
				var round       = division.round;
				var form        = division.form;
				var forms       = division.forms[ round ];
				var name        = division.forms[ round ][ form ];
				var description = forms.length > 1 ? ordinal( parseInt( form ) + 1 ) + ' form ' + name : name;
				return description;
			},
			is : {
				firstForm : function() { return division.form == 0; },
				lastForm  : function() { return division.form == (division.forms[ division.round ].length - 1); }
			},
			name : function() {
				return division.forms[ division.round ][ division.form ];
			},
		},
		formId    : function() { return parseInt( division.form ); },
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
		roundId : function() { return division.round; }
	};

	var _next = this.next = {
		athleteId: function() {
			var round = division.round
			var order = division.order[ round ];
			var i     = division.current;
			var j     = order.findIndex( function( athleteId ) { return athleteId == i; });
			return order[ j + 1 ];
		},
		round: function() {
			var round = division.round;
			var next  = { 'prelim' : 'semfin', 'semfin' : 'finals', 'finals' : undefined };
			return next[ round ];
		}
	};

	// ============================================================
	var _form = this.form = {
	// ============================================================

		count: function( round ) {
			round = defined( round ) ? round : division.round;
			var forms = division.forms[ round ];
			if( defined( forms )) { return forms.length; }
			else { return 0; }
		},
		list : function( round ) {
			round = defined( round ) ? round : division.round;
			var forms = division.forms[ round ];
			return forms;
		}
	};

	this.pending = function( round ) { 
		round = defined( round ) ? round : division.round;
		return division.pending[ round ].map( function( i ) { return new Athlete( division.athletes[ i ] ); } );
	};

	this.placement = function( round ) {
		round = defined( round ) ? round : division.round;
		return division.placement[ round ].map( function( i ) { return new Athlete( division.athletes[ i ] ); } );
	}

	var _prev = this.prev = {
		round: function() {
			var round = division.round;
			var next  = { 'prelim' : undefined, 'semfin' : 'prelim', 'finals' : 'semfin' };
			return next[ round ];
		}
	};

	// ============================================================
	var _is = this.is = {
	// ============================================================
		complete : () => {
			if( this.is.flight() && (division.flight.state == 'complete' || division.flight.state == 'merged')) { return true; }

			var rounds     = this.rounds();
			var complete   = true;
			rounds.forEach(( round ) => {
				var athletes   = this.current.athletes( round );
				var arePending = function( athlete ) { var score = athlete.score( round ); return ! score.is.complete(); };
				complete = complete && ! athletes.some( arePending );
			});

			return complete;
		},
		flight : () => {
			return 'flight' in division && defined( division.flight );
		}
	};

	// ============================================================
	var _round = this.round = {
	// ============================================================

		count : function() { return Object.keys( division.forms ).length; },
		is : {
			complete : function( round ) {
				var athletes = _current.athletes();
				var round    = defined( round ) ? round : division.round;
				var complete = true;
				for( var i = 0; i < athletes.length; i++ ) {
					var athlete = athletes[ i ];
					var score   = athlete.score( round );
					complete &= score.is.complete();
				}
				return complete;
			},
			prelim   : function() { return division.round == 'prelim'; },
			semfin   : function() { return division.round == 'semfin'; },
			finals   : function() { return division.round == 'finals'; },
			first    : function() { var sorted = $.grep( FreeScore.round.order, function( round ) { return round in division.order; } ); return division.round == sorted[ 0 ]; }
		},
		list : function() { return Object.keys( division.forms ); },
		matches : function( round ) { return division.round == round; },
		name : function() { return FreeScore.round.name[ division.round ]; },
	};

	this.rounds = function() { return $.grep( FreeScore.round.order, function( round ) { return round in division.order; }); };

	var _state = this.state = {
		is : {
			score   : function() { return division.state == 'score'; },
			display : function() { return division.state == 'display'; },
		}
	};


};

