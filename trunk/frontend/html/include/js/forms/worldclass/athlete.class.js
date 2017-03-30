module.exports = Athlete;
function Athlete( athlete ) {
	this.athlete = athlete;

	this.name  = function() { return athlete.name; }
	this.score = function( round ) { return new Score( athlete.scores[ round ] ); };
	this.info  = function( key ) {
		if( ! defined( athlete.info )) { return undefined; }
		if( key in athlete.info ) { return athlete.info[ key ]; }
		return undefined;
	};

	this.display = {
		name : function() {
			if( athlete.name.length <= 12 ) { return athlete.name; }
			var names   = athlete.name.split( /\s+/ );
			var first   = names.shift();
			var last    = names.join( ' ' );
			var initial = first.substr( 0, 1 );
			var abbrev  = initial + ' ' + last;
			if( abbrev.length <= 12 ) { return abbrev; }
			return last;
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

