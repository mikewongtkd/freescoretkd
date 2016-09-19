
function Division( division ) {
	this.division = division;

	// ===== DIVISION HEADER
	this.name        = function() { return division.name;        }
	this.description = function() { return division.description; }
	this.summary     = function() { return division.name.toUpperCase().replace( ".", " " ) + ' ' + division.description; }
	this.judges      = function() { return division.judges; }

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
		form : {
			description : function() {
				var round       = division.round;
				var form        = division.form;
				var forms       = division.forms[ round ];
				var name        = division.forms[ round ][ form ];
				var description = forms.length > 1 ? ordinal( form + 1 ) + ' form ' + name : name;
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
		formId    : function() { return division.form; },
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

	// ============================================================
	var _round = this.round = {
	// ============================================================

		count : function() { return Object.keys( division.forms ).length; },
		is : {
			complete : function() {
				var athletes = _current.athletes();
				var round    = division.round;
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

	var _state = this.state = {
		is : {
			score   : function() { return division.state == 'score'; },
			display : function() { return division.state == 'display'; },
		}
	};


};

