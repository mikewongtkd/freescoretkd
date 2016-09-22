
Array.prototype.lowest  = function( k ) { var sorted = this.sort(); return sorted.slice( 0, k ); }
Array.prototype.highest = function( k ) { var sorted = this.sort(); return sorted.slice( -k ); }
Array.prototype.sum     = function() { return this.reduce( function( s, t ) { return s + t; } ); }
var roll = function( dice ) {
	var toRoll = dice.split( /d/ );
	var num   = toRoll.shift();
	var sides = toRoll.shift();
	var rolls = [];
	for( var i = 0; i < num; i++ ) { rolls.push( parseInt( Math.random() * sides ) + 1 ); }
	return rolls;
}

var best = function() {
	return {
				major  : 0.3 * (roll( '12d4'  ).lowest( 2 ).sum() - 2),
				minor  : 0.1 * (roll(  '8d8'  ).lowest( 6 ).sum() - 2),
				rhythm : 0.1 * (roll(  '6d4'  ).lowest( 4 ).sum() + 0),
				power  : 0.1 * (roll(  '6d4'  ).lowest( 4 ).sum() + 0),
				ki     : 0.1 * (roll(  '6d4'  ).lowest( 4 ).sum() + 0),

	};
};


console.log( best() );
