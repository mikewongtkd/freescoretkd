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

	this.penalty = { bounds: 0.0, restart: 0.0, misconduct: 0 };
	this.penalize = {
		bounds:     () => { this.penalty.bounds     += 0.3; },
		restart:    () => { this.penalty.restart    += 0.6; },
		misconduct: () => { this.penalty.misconduct += 1;   },
		clear:      () => { this.penalty = { bounds: 0.0, restart: 0.0, misconduct: 0 }}

	};
	this.penalties = () => { return this.penalty; }
};

