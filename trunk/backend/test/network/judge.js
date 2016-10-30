Array.prototype.lowest  = function( k ) { var sorted = this.sort(); return sorted.slice( 0, k ); }
Array.prototype.highest = function( k ) { var sorted = this.sort(); return sorted.slice( -k ); }
Array.prototype.sum     = function() { return this.reduce( function( s, t ) { return s + t; } ); }

const EventEmitter = require( 'events' );
const WebSocket    = require( 'ws' );

// ============================================================
var roll = function( dice ) {
// ============================================================
	var toRoll = dice.split( /d/ );
	var num   = toRoll.shift();
	var sides = toRoll.shift();
	var rolls = [];
	for( var i = 0; i < num; i++ ) { rolls.push( parseInt( Math.random() * sides ) + 1 ); }
	return rolls;
}

module.exports = Judge;

// class Judge extends EventEmitter {}

// ============================================================
function Judge( n ) {
// ============================================================
	this.id     = n;
	this.name   = n == 0 ? 'Referee' : 'Judge ' + n;
	this.queue  = [];
	this.register();

	var request  = { data : { type : 'division', action : 'read', cookies: { judge : this.id }}};
	this.queue.push( request );
};

// ============================================================
Judge.prototype.register = function() {
// ============================================================
	var ws = this.socket = new WebSocket( 'ws://localhost:3088/worldclass/test/1' );
	ws.on( 'open', () => { 
		console.log( this.name + ' has registered their tablet device. ' );

		while( this.queue.length > 0 ) {
			var request = this.queue.shift();
			request.json = JSON.stringify( request.data );
			this.socket.send( request.json );
		}
	});

	ws.on( 'message', ( response ) => {
		var message = JSON.parse( response );
		console.log( this.name + ' receiving ' + message.type + ' ' + message.action );
	});

	ws.on( 'close', () => {
		console.log( this.name + ' is leaving.' );
	});
}

// ============================================================
Judge.prototype.score = function( quality ) {
// ============================================================
	var score = {
		local : function() {
			return {
				major  : (roll( '12d4'  ).lowest( 4 ).sum() - 2) * 3 / 10,
				minor  : (roll(  '8d8'  ).lowest( 6 ).sum() - 2) / 10,
				rhythm : (roll(  '8d6'  ).lowest( 3 ).sum() + 0) / 10,
				power  : (roll(  '8d6'  ).lowest( 3 ).sum() + 0) / 10,
				ki     : (roll(  '8d6'  ).lowest( 3 ).sum() + 0) / 10,
			};
		},
		state : function() {
			return {
				major  : (roll( '10d4'  ) .lowest( 4 ) .sum() - 3) * 3 / 10,
				minor  : (roll(  '8d6'  ) .lowest( 6 ) .sum() - 2) / 10,
				rhythm : (roll(  '6d4'  ) .lowest( 2 ) .sum() + 6) / 10,
				power  : (roll(  '6d4'  ) .lowest( 2 ) .sum() + 6) / 10,
				ki     : (roll(  '6d4'  ) .lowest( 2 ) .sum() + 6) / 10,
			};
		},
		national : function () {
			return {
				major  : (roll(  '8d4'  ) .lowest( 3 ) .sum() - 3) * 3 / 10,
				minor  : (roll(  '8d6'  ) .lowest( 6 ) .sum() - 6) / 10,
				rhythm : (roll(  '6d4'  ) .lowest( 2 ) .sum() + 8) / 10,
				power  : (roll(  '6d4'  ) .lowest( 2 ) .sum() + 8) / 10,
				ki     : (roll(  '6d4'  ) .lowest( 2 ) .sum() + 8) / 10,
			};
		},
		world : function() {
			return {
				major  : (roll( '12d4'  ) .lowest( 2 )  .sum() - 2) * 3 / 10,
				minor  : (roll(  '8d4'  ) .lowest( 6 )  .sum() - 6) / 10,
				rhythm : (roll(  '6d4'  ) .highest( 2 ) .sum() + 8) / 10,
				power  : (roll(  '6d4'  ) .highest( 2 ) .sum() + 8) / 10,
				ki     : (roll(  '6d4'  ) .highest( 2 ) .sum() + 8) / 10,
			};

		}
	}[ quality ]();

	var request  = { data : { type : 'division', action : 'score', cookies: { judge : this.id }, score : score }};
	this.queue.push( request );
}
