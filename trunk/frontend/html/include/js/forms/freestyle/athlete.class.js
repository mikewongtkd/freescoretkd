module.exports = Athlete;
function Athlete( athlete ) {
	this.athlete = athlete;

	if( ! defined( athlete.penalty )) { athlete.penalty = {}; }

	this.name   = () => { return athlete.name; };
	this.scores = () => { return athlete.scores; };
	this.info   = ( key ) => {
		if( ! defined( athlete.info )) { return undefined; }
		if( key in athlete.info ) { return athlete.info[ key ]; }
		return undefined;
	};

	this.display = {
		name : () => {
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

	this.penalty = {
		bounds:       () => { athlete.penalty.bounds     += 0.3; return athlete.penalty.bounds; },
		restart:      () => { athlete.penalty.restart    += 0.6; return athlete.penalty.restart; },
		misconduct:   () => { athlete.penalty.misconduct += 1;   return athlete.penalty.misconduct; },
		clear:        () => { Object.keys( athlete.penalty ).forEach(( key ) => { athlete.penalty[ key ] = 0; }); },
	}

	this.penalties  = () => { return athlete.penalty; }

	this.score = {
		total:        () => { return athlete.adjusted.subtotal; },
		technical:    () => { return athlete.adjusted.technical; },
		presentation: () => { return athlete.adjusted.presentation; },
		deductions:   () => { return athlete.adjusted.deductions; },
		consensus:    () => { return athlete.consensus; },
		complete:     () => { return athlete.complete; },
	};

};

