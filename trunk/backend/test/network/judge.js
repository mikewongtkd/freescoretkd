Array.prototype.lowest  = function( k ) { var sorted = this.sort(); return sorted.slice( 0, k ); }
Array.prototype.highest = function( k ) { var sorted = this.sort(); return sorted.slice( -k ); }
Array.prototype.sum     = function() { return this.reduce( function( s, t ) { return s + t; } ); }

const util         = require( 'util' );
const EventEmitter = require( 'events' );
const WebSocket    = require( 'ws' );
GLOBAL.FreeScore   = { 	round : { order : [ 'prelim', 'semfin', 'finals', 'ro8a', 'ro8b', 'ro8c', 'ro8d', 'ro4a', 'ro4b', 'r02' ], name  : { 'prelim' : 'Preliminary', 'semfin' : 'Semi-Finals', 'finals' : 'Finals', 'ro8a' : '1st Finals', 'ro8b' : '1st Finals', 'ro8c': '1st Finals', 'ro8d' : '1st Finals', 'ro4a' : '2nd Finals', 'ro4b' : '2nd Finals', 'r02' : '3rd Finals' }, }};
GLOBAL.defined     = function( x ) { return ((typeof( x ) !== 'undefined') && (x !== null)); }
GLOBAL.ordinal     = function ( x ) { var d = x % 10; if ( x > 10 && x < 14 ) { return x + 'th'; } else if ( d == 1 ) { return x + 'st'; } else if ( d == 2 ) { return x + 'nd'; } else if ( d == 3 ) { return x + 'rd'; } else { return x + 'th'; } } 
GLOBAL.Score       = require( 'score.class' );
GLOBAL.Athlete     = require( 'athlete.class' );
GLOBAL.Division    = require( 'division.class' );

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

// ============================================================
function Judge( n ) {
// ============================================================
	EventEmitter.call( this );
	this.id       = n;
	this.name     = n == 0 ? 'Referee' : 'Judge ' + n;
	this.queue    = [];
	this.previous = {};
	this.register();

};

// ============================================================
Judge.prototype.register = function() {
// ============================================================
	var ws = this.socket = new WebSocket( 'ws://localhost:3088/worldclass/test/1' );
	ws.on( 'open', () => { 
		console.log( this.name + ' has registered their tablet device.' );

		// ===== REQUEST DIVISION INFORMATION
		var request  = { data : { type : 'division', action : 'read', cookie: { judge : this.id }}};
		request.json = JSON.stringify( request.data );
		this.socket.send( request.json );
	});

	ws.on( 'message', ( response ) => {
		var update = JSON.parse( response );
		// console.log( 'Receiving message: ' + util.inspect( update ));
		if( update.error ) { console.log( 'Error message: ' + update.error ); } 
		// else               { console.log( 'Receiving message ' + update.type + ' ' + update.action + '.' )};
		if( update.type == 'division' && update.action == 'update' ) {
			var division  = new Division( update.division );
			var athlete   = division.current.athlete();
			var i         = division.current.athleteId();
			var round     = division.current.roundId();
			var form      = division.current.formId();
			var pending   = division.pending();
			var current   = { division: division.name(), athlete: i, round: round, form: form }
			var unknown   = (! current.division) && (! current.athlete) && (! current.round) && (! current.form);
			var same      = current.division == this.previous.division && current.athlete == this.previous.athlete && current.round == this.previous.round && current.form == this.previous.form;

			if( same ) { return; }
			var timeToThink = (Math.round( Math.random() * 5) * 100) + 300;
			setTimeout( () => {
				var score = this.score( 'world' );
				console.log( this.name + ' scoring ' +  division.current.round.name() + ' ' + division.current.form.description() + ' for ' + athlete.name() + ' (' + score.accuracy + '/' + score.presentation + ')' );
			}, timeToThink );
			this.previous = current;
		}
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
				major  : (roll( '10d4'  ) .lowest( 4 ) .sum() - 4) * 3 / 10,
				minor  : (roll(  '8d6'  ) .lowest( 6 ) .sum() - 3) / 10,
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

	var request  = { data : { type : 'division', action : 'score', cookie: { judge : this.id }, score : score }};
	request.json = JSON.stringify( request.data );
	this.socket.send( request.json );
	score.accuracy     = 4.0 - (score.major + score.minor);
	score.accuracy     = score.accuracy < 0 ? 0 : score.accuracy;
	score.presentation = score.rhythm + score.power + score.ki;
	score.accuracy     = score.accuracy.toFixed( 1 );
	score.presentation = score.presentation.toFixed( 1 );
	return score;
}
