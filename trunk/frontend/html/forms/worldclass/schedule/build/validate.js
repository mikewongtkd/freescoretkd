var validate = {
	block : ( block ) => {
		var results = { ok : true, errors : [], warnings : [] };
		if( ! defined( block.require )) { return results; } // Breaks have no requirements
		if( defined( block.require.nonconcurrent )) { block.require.nonconcurrent.forEach( ( otherid ) => { validate.nonconcurrency( block, otherid, results ); }); }
		if( defined( block.require.precondition ))  { block.require.precondition.forEach(  ( otherid ) => { validate.precondition( block, otherid, results ); }); }
		return results;
	},
	nonconcurrency : ( block, otherid, results ) => {
		var other = schedule.blocks[ otherid ];
		if( block.day != other.day ) { return; } // Different days, certainly nonconcurrent
		var today = $.format.date( new Date(), 'M/d/yyyy' );
		var a = {
			start: new Date( `${today} ${block.start}` ),
			stop : new Date( `${today} ${block.stop}` ),
		};
		var b = {
			start: new Date( `${today} ${other.start}` ),
			stop : new Date( `${today} ${other.stop}` ),
		};
		var a_while_b = a.start >= b.start && a.start < b.stop;
		var b_while_a = b.start >= a.start && b.start < a.stop;

		if( a_while_b || b_while_a ) {
			results.ok = false;
			results.errors.push({ block : block.id, cause : { by : other.id, reason : 'concurrency' }});
		}
	},
	precondition : ( block, otherid, results ) => {
		var other = schedule.blocks[ otherid ];
		if( block.day > other.day ) { return; } // Precondition satisfied on a previous day
		var today = $.format.date( new Date(), 'M/d/yyyy' );
		var a     = new Date( `${today} ${block.start}` );
		var b     = new Date( `${today} ${other.stop}` );

		if( b > a ) {
			results.ok = false;
			results.errors.push({ block : block.id, cause : { by : other.id, reason : 'precondition' }});
		}
	},
	ring : ( ring ) => {
		var results = { ok : true, errors : [], warnings : [] };
		ring.plan.forEach(( blockid ) => {
			var block        = schedule.blocks[ blockid ];
			var r            = validate.block( block );
			results.ok       = results.ok && r.ok;
			results.errors   = results.errors.concat( r.errors );
			results.warnings = results.warnings.concat( r.warnings );
		});
		return results;
	},
	day : ( day ) => {
		var results = { ok : true, errors : [], warnings : [] };
		day.rings.forEach(( ring ) => {
			var r            = validate.ring( ring );
			results.ok       = results.ok && r.ok;
			results.errors   = results.errors.concat( r.errors );
			results.warnings = results.warnings.concat( r.warnings );
		});
		return results;
	}
};
