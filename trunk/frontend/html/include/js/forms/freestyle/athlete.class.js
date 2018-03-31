module.exports = Athlete;
function Athlete( athlete ) {
	this.athlete = athlete;

	if( ! defined( athlete.penalty )) { athlete.penalty = { bounds : 0.0, restart: 0.0, misconduct: 0 }; }

	this.name     = () => { return athlete.name; };
	this.id       = () => { return athlete.id; };
	this.adjusted = ( round ) => { return athlete.adjusted[ round ]; };
	this.scores   = ( round ) => { return athlete.scores[ round ]; };
	this.info     = ( key ) => {
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
		total:        ( round ) => { return athlete.adjusted[ round ].total; },
		technical:    ( round ) => { return athlete.adjusted[ round ].technical; },
		presentation: ( round ) => { return athlete.adjusted[ round ].presentation; },
		deductions:   ( round ) => { return athlete.adjusted[ round ].deductions; },
		complete:     ( round ) => { return athlete.complete[ round ]; },
	};

};

