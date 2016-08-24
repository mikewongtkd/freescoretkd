
function Division( division ) {
	this.division = division;

	// ===== DIVISION HEADER
	this.name        = function() { return division.name;        }
	this.description = function() { return division.description; }
	this.summary     = function() { return division.name.toUpperCase().replace( ".", " " ) + ' ' + division.description; }
	this.judges      = function() { return division.judges; }

	// ===== DIVISION ATHLETE DATA
	this.data        = function() { return division; };
	this.athletes    = function() { return division.athletes; };

	this.as = {
		json : function() { return JSON.stringify( division ); },
	};

	var _current = this.current = {
		athlete : function() {
			var i = parseInt( division.current );
			return division.athletes[ i ];
		},
		athletes : function() {
			var athletes = [];
			var round    = division.round;
			if( ! defined( division.order[ round ] )) { return athletes; }

			for( var i = 0; i < division.order[ round ].length; i++ ) {
				var j = division.order[ round ][ i ];
				athletes.push( division.athletes[ j ] );
			}

			return athletes;
		},
		athleteId : function() { return division.current; },
		form : {
			description : function() {
				var ordinal     = [ '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th' ];
				var round       = division.round;
				var form        = division.form;
				var forms       = division.forms[ round ];
				var name        = division.forms[ round ][ form ];
				var description = forms.length > 1 ? ordinal[ form ] + ' form ' + name : name;
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
		order : function() {
			var round = division.round;
			var order = division.order;
			return order[ round ];
		},
		roundId   : function() { return division.round; },
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

	this.pending = {
		count : function() { return division.pending[ division.round ].length; },
		list  : function() { return division.pending[ division.round ]; }
	};

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
					var athlete = new Athlete( athletes[ i ] );
					var score   = athlete.score( round );
					complete &= score.is.complete();
				}
				return complete;
			},
			prelim   : function() { return division.round == 'prelim'; },
			semfin   : function() { return division.round == 'semfin'; },
			finals   : function() { return division.round == 'finals'; }
		},
		name : function() { return FreeScore.round.name[ division.round ]; }
	};

	var _state = this.state = {
		is : {
			score   : function() { return division.state == 'score'; },
			display : function() { return division.state == 'display'; },
		}
	};


};

