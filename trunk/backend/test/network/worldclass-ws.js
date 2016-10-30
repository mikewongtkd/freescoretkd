#! /usr/bin/env node
var Judge = require( './judge' );

var judges = [];
var n      = 1;

for( var i = 0; i < n; i++ ) { judges[ i ] = new Judge( i ); }
for( var i = 0; i < n; i++ ) { judges[ i ].score( 'state' ); }
