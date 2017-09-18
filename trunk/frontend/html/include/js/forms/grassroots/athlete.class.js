module.exports = Athlete;
function Athlete( athlete ) {
	this.athlete = athlete;

	this.name  = function() { return athlete.name; }
	this.score = function() { return new Score( athlete.scores ); };
	this.info  = function( key ) {
		if( ! defined( athlete.info )) { return undefined; }
		if( key in athlete.info ) { return athlete.info[ key ]; }
		return undefined;
	};

	this.display = {
		name : function() {
			var max_length = 16;
			if( athlete.name.length <= max_length ) { return athlete.name; }
			var names   = athlete.name.split( /\s+/ );
			if( names.length == 1 ) { return athlete.name.substr( 0, max_length ); }
			var first   = undefined;
			var last    = undefined;
			first   = $.grep( names, ( val, i ) => { return val != val.toUpperCase(); });
			last    = $.grep( names, ( val, i ) => { return val == val.toUpperCase(); });
			if( last.length == 0 ) { last = first; first = [ last.shift() ]; }

			first = first.join( ' ' );
			last  = last.join( ' ' );

			var initial = first.substr( 0, 1 );
			var abbrev  = [ initial, last ].join( ' ' );
			if( abbrev.length <= max_length ) { return abbrev; }
			return last.substr( 0, max_length );
		}
	};
};

