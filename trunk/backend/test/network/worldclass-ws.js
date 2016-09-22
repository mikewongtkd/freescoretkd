var WebSocket = require( '../lib/ws' );
var ws = new WebSocket( 'ws://localhost:3088/worldclass/test/1' );

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

var score = function( quality ) {
	return {
		ok : function() {
			return {
				major  : 0.3 * (roll( '12d4'  ).lowest( 4 ).sum() - 2),
				minor  : 0.1 * (roll(  '8d8'  ).lowest( 6 ).sum() - 2),
				rhythm : 0.1 * (roll(  '8d6'  ).lowest( 4 ).sum() + 0),
				power  : 0.1 * (roll(  '8d6'  ).lowest( 4 ).sum() + 0),
				ki     : 0.1 * (roll(  '8d6'  ).lowest( 4 ).sum() + 0),
			};
		},
		good : function() {
			return {
				major  : 0.3 * (roll(  '6d4'  ).lowest( 4 ).sum() - 1),
				minor  : 0.1 * (roll( '10d8'  ).lowest( 6 ).sum() - 6),
				rhythm : 0.1 * (roll(  '6d4'  ).lowest( 2 ).sum() + 6),
				power  : 0.1 * (roll(  '6d4'  ).lowest( 2 ).sum() + 6),
				ki     : 0.1 * (roll(  '6d4'  ).lowest( 2 ).sum() + 6),
			};
		},
		better : function () {
			return {
				major  : 0.3 * (roll(  '8d4'  ).lowest( 3 ).sum() - 3),
				minor  : 0.1 * (roll(  '8d6'  ).lowest( 6 ).sum() - 6),
				rhythm : 0.1 * (roll(  '4d6'  ).lowest( 4 ).sum() + 8),
				power  : 0.1 * (roll(  '4d6'  ).lowest( 4 ).sum() + 8),
				ki     : 0.1 * (roll(  '4d6'  ).lowest( 4 ).sum() + 8),
			};
		},
		best : function() {
			return {
				major  : 0.3 * (roll( '12d4'  ).lowest( 2 ).sum() - 2),
				minor  : 0.1 * (roll(  '8d8'  ).lowest( 6 ).sum() - 2),
				rhythm : 0.1 * (roll(  '6d4'  ).lowest( 4 ).sum() + 0),
				power  : 0.1 * (roll(  '6d4'  ).lowest( 4 ).sum() + 0),
				ki     : 0.1 * (roll(  '6d4'  ).lowest( 4 ).sum() + 0),
			};
		}
	}[ quality ]();
}

ws.prototype.score = function( judge, score ) {
	var request  = { data : { type : 'division', action : 'score', judge : judge, score : score }};
	request.json = JSON.stringify( request.data );
	this.send( request.json );
}

ws.on( 'open', function() {
	var request  = { data : { type : 'division', action : 'read', judge : 1 }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
});

ws.on( 'message', function( data ) {
	console.log( JSON.parse( data ));
	ws.close();
});


