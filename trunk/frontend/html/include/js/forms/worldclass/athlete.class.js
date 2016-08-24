function Athlete( athlete ) {
	this.athlete = athlete;

	this.name  = function() { return athlete.name; }
	this.score = function( round ) { return new Score( athlete.scores[ round ] ); };
};

