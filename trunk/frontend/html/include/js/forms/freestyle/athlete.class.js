module.exports = Athlete;
function Athlete( athlete ) {
	this.athlete = athlete;

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

	this.score = {
		total:        () => { return athlete.adjusted.subtotal; },
		technical:    () => { return athlete.adjusted.technical; },
		presentation: () => { return athlete.adjusted.presentation; },
		deductions:   () => { return athlete.adjusted.deductions; },
		consensus:    () => { return athlete.findings; },
	};

};

