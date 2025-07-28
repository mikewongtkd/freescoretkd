
module.exports = Division;
function Division( division ) {
	const display = {
		round : {
			name : {
				ro256  : 'Round of 256',
				ro128  : 'Round of 128',
				ro64   : 'Round of 64',
				ro32   : 'Round of 32',
				ro16   : 'Round of 16',
				prelim : 'Preliminary Round',
				semfin : 'Semi-Finals Round',
				finals : 'Finals Round',
				ro8    : 'Quarter-Finals Round (Ro8)',
				ro4    : 'Semi-Finals Round (Ro4)',
				ro2    : 'Finals Round (Ro2)'
			},
			matches : {
				ro256  : 128,
				ro128  : 64,
				ro64   : 32,
				ro32   : 16,
				ro16   : 8,
				ro8    : 4,
				ro4    : 2,
				ro2    : 1
			}
		}
	};

	this.division = division;

	// ===== DIVISION HEADER
	this.name        = function() { return division.name;    }
	this.description = function() { return division.description; }
	this.summary     = function() { return division.name.toUpperCase().replace( ".", " " ) + ' ' + division.description; }
	this.judges      = function( n ) { if( defined( n )) { division.judges = n; } return parseInt( division.judges ); }
	this.flight      = function() { if( 'flight' in division ) { return division.flight; } else { return null; }}
	this.forms       = function() { return division.forms;   }
	this.ring        = function() { return division.ring;    }
	this.history     = function() { return division.history; }

	// ===== DIVISION ATHLETE DATA
	this.data        = function() { return division; };
	this.athletes    = function() { return division.athletes.map( function( athlete ) { return new Athlete( athlete ); }); };
	this.athlete     = i => { 
		i = defined( i ) ? i : division.current;
		let athlete = new Athlete( division.athletes[ i ]);
		return athlete;
	}

	this.as = {
		json : function() { return JSON.stringify( division ); },
	};

	let _bracket = this.bracket = {
		matches : ( round = null ) => {
			let matches = this.matches( round );
			if( matches.length != 0 ) { return matches; }
			if( ! round in display.round.matches ) { return []; }
			let n = display.round.matches[ round ];
			matches = [];
			for( let i = 0; i < n; i++ ) {
				matches.push({chung: null, hong: null, number: i + 1, order: [ null, null ]})
			}
			return matches;
		}
	};

	this.calculate = {
		match: {
			winners: () => {
				if( ! defined( division.matches )) { return; }
				Object.entries( division.matches ).forEach(([ round, matches ]) => {
					matches.forEach( match => {
						if( defined( match.winner )) { return; } // Server already posted results, skip
						let n = match.order.filter( aid => defined( aid )).length;
						if( n == 1 ) {
							let winner = [ 'chung', 'hong' ].find( contestant => {
								if( ! defined( match[ contestant ])) { return; }
								let aid   = match[ contestant ];
								let score = this.athlete( aid ).score( round );
								if( score.decision.awarded()) { return; }
								return true;
							});

							let score = this.athlete( match[ winner ]).score( round );
							if( score.is.complete() && ! score.decision.awarded()) { match.winner = match[ winner ]; }

						} else if( n == 2 ) {
							let chung = {
								id:    match.chung,
								score: this.athlete( match.chung ).score( round )
							};

							let hong = {
								id:    match.hong,
								score: this.athlete( match.hong ).score( round )
							}

							if(( ! chung.score.is.complete()) || (! hong.score.is.complete())) { return; }

							// Disqualification or Withdrawal
							if     ( chung.score.decision.awarded()   && ! hong.score.decision.awarded())       { match.winner = hong.id;  }
							else if( hong.score.decision.awarded()    && ! chung.score.decision.awarded())      { match.winner = chung.id;  }
	
							// Win criteria
							else if( chung.score.adjusted.total()        > hong.score.adjusted.total())         { match.winner = chung.id; }
							else if( hong.score.adjusted.total()         > chung.score.adjusted.total())        { match.winner = hong.id;  }

							// TB1
							else if( chung.score.adjusted.presentation() > hong.score.adjusted.presentation())  { match.winner = chung.id; }
							else if( hong.score.adjusted.presentation()  > chung.score.adjusted.presentation()) { match.winner = hong.id;  }

							// TB2
							else if( chung.score.total()                 > hong.score.total())                  { match.winner = chung.id; }
							else if( hong.score.total()                  > chung.score.total())                 { match.winner = hong.id;  }
						}
					});
				});
			}
		}
	};

	let _current = this.current = {
		athlete : function() {
			let i = parseInt( division.current );
			return new Athlete( division.athletes[ i ] );
		},
		athletes : function( round ) {
			let athletes = [];
			round = defined( round ) ? round : division.round;
			if( ! defined( division.order[ round ] )) { return athletes; }

			for( let i = 0; i < division.order[ round ].length; i++ ) {
				let j = division.order[ round ][ i ];
				athletes.push( new Athlete( division.athletes[ j ] ));
			}

			return athletes;
		},
		athleteId : function() { return parseInt( division.current ); },
		chung : () => {
			let match = this.current.match();
			let chung = defined( match.chung ) && defined( division.athletes?.[ match.chung ]) ? new Athlete( division.athletes[ match.chung ] ) : undefined;
			return chung;
		},
		form : {
			description : function() {
				let round       = division.round;
				let form        = division.form;
				let forms       = division.forms[ round ];
				let name        = division.forms[ round ][ form ];
				let description = forms.length > 1 ? ordinal( parseInt( form ) + 1 ) + ' form ' + name : name;
				return description;
			},
			is : {
				firstForm : function() { return division.form == 0; },
				lastForm  : function() { return division.form == (division.forms[ division.round ].length - 1); }
			},
			list : () => {
				return this.form.list( division.round );
			},
			name : function() {
				return division.forms[ division.round ][ division.form ];
			},
		},
		formId    : function() { return parseInt( division.form ); },
		hong : () => {
			let match = this.current.match();
			let hong  = defined( match.hong ) && defined( division.athletes?.[ match.hong ]) ? new Athlete( division.athletes[ match.hong ] ) : undefined;
			return hong;
		},
		match: () => {
			let round   = division.round;
			let current = parseInt( division.current );
			let matches = this.matches( round );
			let match   = matches.find( match => match?.order?.map( x => parseInt( x ))?.includes( current ));

			return match;
		},
		matchNumber: () => {
			let match = this.current.match();
			let start = this.current.matchStart();
			if( ! defined( match )) { return; }
			return parseInt( match.number ) + parseInt( start );
		},
		matchStart: () => {
			let prev  = this.prev.rounds().filter( round => round.match( /^ro/i ));
			let start = prev.map( round => this.matches( round ).length ).reduce(( acc, cur ) => acc + cur, 0 );
			return start;
		},
		method: () => {
			let round  = division.round;
			let method = division?.method;
			if( ! defined( method )) { return 'cutoff'; }
			if( typeof method === 'string' ) { return method; }
			if( typeof method === 'object' ) {
				if( round in method ) { return method[ round ]; }
				return 'cutoff';
			}
			return 'cutoff';
		},
		order : function( i ) {
			let round = division.round;
			let order = division.order;
			if( defined( i )) { return order[ round ][ i ]; }
			else              { return order[ round ]; }
		},
		round : {
			display : { name : () => { return display.round.name?.[ division.round ] + (this.is.flight() ? ' (Group ' + division.flight.id.toUpperCase() + ')':''); }},
			name : function() { return display.round.name?.[ division.round ]; },
		},
		roundId : function() { return division.round; },
		state: () => division.state
	};

	let _next = this.next = {
		athleteId: function() {
			let round = division.round
			let order = division.order[ round ];
			let i     = division.current;
			let j     = order.findIndex( function( athleteId ) { return athleteId == i; });
			return order[ j + 1 ];
		},
		round: function() {
			let round = division.round;
			let next  = { 'prelim' : 'semfin', 'semfin' : 'finals', 'finals' : undefined };
			return next[ round ];
		}
	};

	// ============================================================
	let _form = this.form = {
	// ============================================================

		count: function( round ) {
			round = defined( round ) ? round : division.round;
			let forms = division.forms[ round ];
			if( defined( forms )) { return forms.length; }
			else { return 0; }
		},
		draw : ( round = null ) => {
			round = defined( round ) ? round : division.round;
			let match = this.current.match();
			let n     = division.forms[ round ].length;
			let draws = division.draws?.[ round ]?.[ match.number ];

			draws = defined( draws ) ? draws : [];
			n = n - draws.length;
			[ ... Array( n ).keys() ].forEach( i => draws.push( null ));
			return draws;
		},
		list : ( round = null ) => {
			round = defined( round ) ? round : division.round;

			if( [ 'se', 'sbs' ].includes( this.current.method())) {
				let match = this.current.match();
				let mnum  = match.number;
				let forms = division?.forms?.[ round ];

				if( ! defined( forms )) { console.log( `Error, no forms defined for ${round}` ); return; }

				if( forms.some( form => form.match( /^draw/i ))) {
					if( division?.draws?.[ round ]) {
						let n = forms.length;
						// Draws have been made
						if( division.draws[ round ]?.[ mnum ]) { 
							let draws = division.draws[ round ][ mnum ];
							n -= draws.length;
							[ ... Array( n ).keys() ].forEach( i => draws.push( null ));
							return draws;
						}

						// Draws have not been made
						let draws = [];
						for( let i = 0; i < forms.length; i++ ) { draws.push( null ); }
						return draws;
					}
				}
			}
			return division.forms[ round ];
		},
    pool : ( round = null ) => {
			round = defined( round ) ? round : division.round;
			if( ! [ 'se', 'sbs' ].includes( this.current.method())) { return null; }
			return division.forms[ round ];
    }
	};

	this.matches = ( round = null ) => {
		round = round === null ? division.round : round;
		if( ! defined( division?.matches?.[ round ])) { return []; }
		return division.matches[ round ];
	};

	this.pending = function( round = null ) { 
		round = defined( round ) ? round : division.round;
		return division.pending[ round ].map( function( i ) { return new Athlete( division.athletes[ i ] ); } );
	};

	this.placement = function( round = null ) {
		round = defined( round ) ? round : division.round;
		return division?.placement?.[ round ]?.map( i => { 
			if( Number.isInteger( i )) {
				return new Athlete( division.athletes[ i ] ); 

			} else if( Array.isArray( i )) {
				return i.map( j => new Athlete( division.athletes[ j ]));
			}
		});
	}

	let _prev = this.prev = {
		round: function() {
			let round = division.round;
			let next  = { 'prelim' : undefined, 'semfin' : 'prelim', 'finals' : 'semfin' };
			return next[ round ];
		},

		rounds: () => {
			let current  = division.round;
			let previous = [];
			let rounds   = this.rounds();
			let skip     = false;
			rounds.forEach( round => {
				if( round == current ) { skip = true; }
				if( skip ) { return; }
				previous.push( round );
			});

			return previous;
		}
	};

	// ============================================================
	let _is = this.is = {
	// ============================================================
		complete : () => {
			if( this.is.flight() && (division.flight.state == 'complete' || division.flight.state == 'merged')) { return true; }

			let rounds     = this.rounds();
			let complete   = true;
			rounds.forEach(( round ) => {
				let athletes   = this.current.athletes( round );
				let arePending = function( athlete ) { let score = athlete.score( round ); return ! score.is.complete(); };
				complete = complete && ! athletes.some( arePending );
			});

			return complete;
		},
		flight : () => {
			return 'flight' in division && defined( division.flight );
		}
	};

	// ============================================================
	let _round = this.round = {
	// ============================================================

		count : function() { return Object.keys( division.forms ).length; },
		id : () => { return division.round; },
		is : {
			complete : function( round ) {
				round = defined( round ) ? round : division.round;

				let athletes = _current.athletes();
				let complete = true;
				for( let i = 0; i < athletes.length; i++ ) {
					let athlete = athletes[ i ];
					let score   = athlete.score( round );
					complete &= score.is.complete();
				}
				return complete;
			},
			prelim   : function() { return division.round == 'prelim'; },
			ro256    : function() { return division.round == 'ro256'; },
			ro128    : function() { return division.round == 'ro128'; },
			ro64     : function() { return division.round == 'ro64'; },
			ro32     : function() { return division.round == 'ro32'; },
			semfin   : function() { return division.round == 'semfin'; },
			ro16     : function() { return division.round == 'ro16'; },
			finals   : function() { return division.round == 'finals'; },
			ro8      : function() { return division.round == 'ro8'; },
			ro4      : function() { return division.round == 'ro4'; },
			ro2      : function() { return division.round == 'ro2'; },
			first    : function() { let rounds = this.rounds(); return division.round == rounds[ 0 ]; },
			last     : function() { let rounds = this.rounds(); return division.round == rounds[ rounds.length - 1 ]; }
		},
		list : function() { return Object.keys( division.forms ); },
		name : function() { return FreeScore.round.name[ division.round ]; },
		order : round => { return division.order?.[ round ]; }
	};

	this.rounds = () => FreeScore.round.order.filter( round => defined( division?.order?.[ round ]) || division?.rounds?.includes( round ));

	let _state = this.state = {
		is : {
			bracket:     () => { return division.state == 'bracket'; },
			display:     () => { return division.state == 'display'; },
			leaderboard: () => { return division.state == 'leaderboard'; },
			match:       () => { return division.state == 'match'; },
			results:     () => { return division.state == 'results'; },
			score:       () => { return division.state == 'score'; },
		}
	};


};

