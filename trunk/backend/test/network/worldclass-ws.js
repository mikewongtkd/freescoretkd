#! /usr/bin/env node
var Judge    = require( './judge' );

var judges = [];
var n      = 1;

// ===== INITIALIZE JUDGES
for( var i = 0; i < n; i++ ) { judges[ i ] = new Judge( i ); }
