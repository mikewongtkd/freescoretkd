#! /usr/bin/env node
var judge = require( './judge' );

var WebSocket = require( '../lib/ws' );
var ws = new WebSocket( 'ws://localhost:3088/worldclass/test/1' );

ws.prototype.score = function( judge, player ) {
	var request  = { data : { type : 'division', action : 'score', judge : judge.id, score : judge.score( player ) }};
	request.json = JSON.stringify( request.data );
	this.send( request.json );
}

ws.on( 'open', function() {
	var request  = { data : { type : 'division', action : 'read', judge : 1 }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );

	for( var i = 0; i < 5; i++ ) {
		judge.id = i;
		ws.score( judge, 'state' );
	}
});

ws.on( 'message', function( data ) {
	console.log( JSON.parse( data ));
});
