module.exports = Athlete;
function Athlete( athlete ) {
	this.athlete = athlete;

	this.name  = function() { return athlete.name; }
	this.id    = function() { return athlete.id; }
	this.score = function( round ) { return new Score( athlete.scores[ round ] ); };
	this.info  = function( key = null ) {
		if( ! defined( athlete.info )) { return undefined; }
		if( ! defined( key )) { return athlete.info; }
		if( key in athlete.info ) { return athlete.info[ key ]; }
		return undefined;
	};

	this.display = {
		name : function( max_length = 32 ) {
			if( athlete.name.length <= max_length ) { return athlete.name; }
			var names = athlete.name.split( /\s+/ );
			if( names.length == 1 ) { return athlete.name.substr( 0, max_length ); }
			var first = undefined;
			var last  = undefined;
			first = $.grep( names, ( val, i ) => { return val != val.toUpperCase(); });
			last  = $.grep( names, ( val, i ) => { return val == val.toUpperCase(); });
			if( last.length == 0 ) { last = first; first = [ last.shift() ]; }
			var initials = first.map((x) => { return x.substr( 0, 1 ); }).join( '' );

			first = first.join( ' ' );
			last  = last.join( ' ' );

			var abbrev  = [ initials, last ].join( ' ' );
			if( abbrev.length <= max_length ) { return abbrev; }
			return last.substr( 0, max_length );
		}
	};

	this.penalize = {
		bounds:     ( round, i ) => { 
			var score = new Score( athlete.scores[ round ] );
			score.form( i ).award.penalty( 'bounds' );
		},
		restart:    ( round, i ) => { 
			var score = new Score( athlete.scores[ round ] );
			score.form( i ).award.penalty( 'restart' );
		},
		timelimit: ( round, i ) => { 
			var score = new Score( athlete.scores[ round ] );
			score.form( i ).award.penalty( 'timelimit' );
		},
		misconduct: ( round, i ) => { 
			var score = new Score( athlete.scores[ round ] );
			score.form( i ).award.penalty( 'misconduct' );
		},
		clear:      ( round, i ) => { 
			var score = new Score( athlete.scores[ round ] );
			score.form( i ).clear.penalties();
		}
	};
	this.penalties = ( round, i ) => { 
		var score   = new Score( athlete.scores[ round ] );
		var penalty = score.form( i ).penalty();
		if( defined( penalty )) { return penalty.data(); }
		return undefined;
	}
};

