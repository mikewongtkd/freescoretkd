var plan = {
	reschedule : ( ringid, day ) => {
		var ring  = schedule.days[ settings.current.day ].rings.find(( ring ) => { return ring.id == ringid; });
		var start = time.set( defined( ring.start ) ? ring.start : day.start );
		ring.plan.forEach(( blockid ) => {
			var block   = schedule.blocks[ blockid ];
			var hr      = Math.floor( block.duration/60 );
			var min     = block.duration % 60;
			var stop    = new Date( start );

			stop.setHours( stop.getHours() + hr );
			stop.setMinutes( stop.getMinutes() + min );
			block.start = format.time( start );
			block.stop  = format.time( stop );
			block.ring  = ring.id;

			start = stop;
		});
	},
	remove : ( blockid ) => {
		var block     = { id: blockid, data: schedule.blocks[ blockid ] };
		var day       = schedule.days[ settings.current.day ];
		var ring      = { id: block.data.ring, data: find.ring( day, block.data.ring )};
		var i         = ring.data.plan.findIndex(( id ) => { return id == block.id; });
		if( i < 0 ) { alertify.error( `${block.id} not found in plan ${ring.data.plan.join( ', ' )}` ); }
		else { ring.data.plan.splice( i, 1 ); plan.reschedule( ring.id, day ); }
	},
	move : ( blockid, targetid, below ) => {
		var block     = { id: blockid, data: schedule.blocks[ blockid ] };
		var day       = schedule.days[ settings.current.day ];
		var target    = { id: targetid };

		// Remove from previous position
		(() => {
			var ring = { id: block.data.ring, data: find.ring( day, block.data.ring )};
			var i    = ring.data.plan.findIndex(( id ) => { return id == block.id; });
			if( i < 0 ) { alertify.error( `${block.id} not found in plan ${ring.data.plan.join( ', ' )}` ); }
			else { ring.data.plan.splice( i, 1 ); plan.reschedule( ring.id, day ); }
		})();

		// Insert into new position
		if( target.id.match( /^ring/ )) {
			var ring = { id: target.id, data: find.ring( day, target.id )};
			ring.data.plan.push( blockid );
			block.data.ring = target.id;
			plan.reschedule( ring.id, day );

		} else {
			target.data = schedule.blocks[ target.id ];

			var ring = { id: target.data.ring, data: find.ring( day, target.data.ring )};
			var i    = ring.data.plan.findIndex(( id ) => { return id == target.id; });
			if( i < 0 ) { alertify.error( `${target.id} not found in plan ${ring.data.plan.join( ', ' )}` ); return }

			if( below ) { i += 1 }
			block.data.ring = target.data.ring;
			ring.data.plan.splice( i, 0, blockid );
			plan.reschedule( ring.id, day );
		}
	},
	// Integrates plan.js with validate.js module
	validate : () => {
		var results = { ok : true, errors : [], warnings : [] };
		schedule.days.forEach(( day ) => {
			var r = validate.day( day );
			results.ok       = results.ok && r.ok;
			results.errors   = results.errors.concat( r.errors );
			results.warnings = results.warnings.concat( r.warnings );
		});
		return results;
	}
};

