<script>
	var settings = { day: [], current: { day: 0 }, divisions : {}, rounds: [] };
	var scale    = { blocks : { per: { hour: 15, table: 4 /* see show.daySchedule() */ }, width: undefined }, minutes: 4, height: 8 };
</script>
<div class="pt-page pt-page-1">
	<div class="container">
		<div class="page-header"> Sport Poomsae Schedule Builder <div id="days" class="pull-right"></div></div>
		<div>
			<div id="schedule">
			</div>
		</div>
	</div>
</div>

<script>
var format = { id: ( time ) => { return $.format.date( time, 'HHmm' );}, time: ( time ) => { return $.format.date( time, 'h:mm a' ); }};
var time = {
	set: ( timestamp ) => {
		if( ! timestamp.match( /:/ )) {
			timestamp = timestamp.split( '' );
			timestamp.splice( 2, 0, ':' );
			timestamp = timestamp.join( '' );
		}
		var t    = new Date();
		var hhmm = timestamp.split( /:/ ).map( x => parseInt( x ));
		hhmm[0] += timestamp.match( /PM/ ) && hhmm[0] != 12 ? 12 : 0;
		t.setHours( hhmm.shift());
		t.setMinutes( hhmm.shift());
		return t;
	},
	earliest: ( a, b ) => {
		if( ! defined( a )) { return b; }
		var i = time.set( a );
		var j = time.set( b );
		return i > j ? b : a;
	},
	latest: ( a, b ) => {
		if( ! defined( a )) { return b; }
		var i = time.set( a );
		var j = time.set( b );
		return i > j ? a : b;
	},
	current:  undefined,
	start:    undefined,
	stop:     undefined,
	duration: undefined
};

var plan = {
	reschedule : ( ring, day ) => {
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
			start.setMinutes( start.getMinutes() + scale.minutes );
		});
	},
	remove : ( blockid ) => {
		var blockdata = schedule.blocks[ blockid ];
		var day       = schedule.days[ settings.current.day ];
		var ringid    = blockdata.ring;
		var ring      = day.rings.find(( ring ) => { return ring.id == ringid; });
		var i         = ring.plan.findIndex(( id ) => { return id == blockid; });
		if( i < 0 ) { return; }

		delete blockdata.ring;

		ring.plan.splice( i, 1 );
		plan.reschedule( ring, day );
	},
	insert : ( ringid, blockid, targetid ) => {
		var block     = { id: blockid, data: schedule.blocks[ blockid ] };
		var day       = schedule.days[ settings.current.day ];
		var ring      = { id: ringid, data: day.rings.find(( ring ) => { return ring.id == ringid; }) };
		var target    = { id: targetid };

		block.data.ring = ringid;

		if( target.id ) {
			var i = ring.data.plan.findIndex(( id ) => { return id == target.id; });
			ring.data.plan.splice( i, 0, blockid );
		} else {
			ring.data.plan.push( blockid );
		}
		plan.reschedule( ring.data, day );
	}
};

var dnd = { block: undefined, source: undefined, handle : {
	drag : {
		start : function( ev ) {
			dnd.block  = $( ev.target );
			dnd.source = $( this );
		},
		enter : function( ev ) {
			this.classList.add( 'dropTarget' );
		},
		leave : function( ev ) {
			this.classList.remove( 'dropTarget' );
		},
		over : function( ev ) { 
			if( ev.preventDefault ) { ev.preventDefault(); } 
			return false;
		},
		end : function( ev ) {
			$( '.schedule' ).removeClass( 'dropTarget' );
		},
	},
	drop : function( ev ) {
		if( ev.stopPropogation ) { ev.stopPropogation(); }
		var target    = { ui: $( ev.target )}; 
		var block     = { ui: dnd.block };
		block.id      = block.ui.attr( 'data-blockid' );
		block.data    = schedule.blocks[ block.id ];

		var is = { block : target.ui.hasClass( 'block' ), label: target.ui.hasClass( 'block-label' ), ring : target.ui.hasClass( 'ring' )};
		if( is.label ) { 
			target.ui = target.ui.parent( '.block' );
			is.label  = false;
			is.block  = true;
			is.ring   = false;
		}

		if( is.block || is.ring ) {
			if( is.block ) {
				target.id   = target.ui.attr( 'data-blockid' );
				target.data = schedule.blocks[ target.id ];
				if( block.id == target.id ) { return; }
				plan.insert( target.data.ring, block.id, target.id );
				plan.remove( block.id );

			} else if( is.ring ) {
				target.id = target.ui.attr( 'id' );
				var ring  = { id: target.ui.prop( 'class' ).split( /\s+/ ).find( x => x.match( /^ring-\d+/ )) };
				var rows  = $( `td.${ring.id}` ).map(( i, item ) => { return $( item ).attr( 'id' ); } ).toArray();
				var i     = rows.findIndex( row => { return row == target.id });
				var next  = rows[ i + 1 ];

				target.ui    = $( `#${next}` ).find( '.block' );

				plan.remove( block.id );
				if( target.ui.length ) {
					target.id = target.ui.attr( 'data-blockid' );
					plan.insert( ring.id, block.id, target.id );

				} else {
					plan.insert( ring.id, block.id );
				}
			}
		}

		var request = { data : { type : 'schedule', schedule: schedule, action : 'write' }};
		request.json = JSON.stringify( request.data );
		ws.send( request.json );

		dnd.block  = undefined;
		dnd.source = undefined;

		show.daySchedule();

		return false;
	}
}};

show.block = ( ringid, blockid ) => {
	var blockdata = schedule.blocks[ blockid ];
	var block     = init.block( blockid );
	var t         = time.set( blockdata.start );
	var duration  = block.attr( 'rowspan' ) - 1;
	var start     = format.id( t );
	var id        = `${ringid}-${start}`;
	var target    = $( `#${id}` );

	target.replaceWith( block );
	block.addClass( ringid ).attr({ id : id });

	for( var i = 0; i < duration; i++ ) {
		t.setMinutes( t.getMinutes() + scale.minutes );

		var rowspan  = format.id( t );
		var id       = `${ringid}-${rowspan}`;
		var target   = $( `#${id}` );

		target.remove();
	}
}

show.plan = ( day ) => {
	day.rings.forEach(( ring ) => { 
		ring.plan.forEach(( blockid ) => {
			show.block( ring.id, blockid ) 
		});
	});
};

show.daySchedule = () => {
	$( '.pt-page-1 #schedule' ).empty();
	var day   = schedule.days[ settings.current.day ];
	var n     = day.rings.length;

	if( Number.isInteger(n/4)) { scale.blocks.per.table = 4; } else
	if( Number.isInteger(n/3)) { scale.blocks.per.table = 3; } else
	if( Number.isInteger(n/2)) { scale.blocks.per.table = 2; }

	var width = scale.blocks.per.table;
	var w     = n >= width ? width : n;
	var h     = Math.ceil( n/width );
	for( var y = 0; y < h; y++ ) {
		// ===== TABLE
		var table    = html.table.clone().addClass( 'schedule' );
		var header   = html.tr.clone();
		var timeline = html.td.clone().addClass( 'timeline schedule-heading' ).html( html.h4.clone().html( 'Time' ));
		[ 'current', 'start', 'stop', 'duration' ].forEach(( key ) => { time[ key ] = undefined; });

		header.append( timeline );

		for( var x = 0; x < w; x++ ) {
			var i = (y * width) + x;
			if( i < n ) {
				var ring    = day.rings[ i ];
				var ringcol = html.td.clone().addClass( 'ring schedule-heading' ).html( html.h4.clone().html( ring.name ));
				header.append( ringcol );
				time.start = defined( ring.start ) ? time.earliest( time.start, ring.start ) : day.start;
				time.stop  = defined( ring.stop  ) ? time.latest(   time.stop,  ring.stop  ) : day.stop;
			} else {
				var placeholder = html.td.clone().addClass( 'ring schedule-heading' ).html( '&nbsp;' );
				header.append( placeholder );
			}
		}
		table.append( header );

		// ===== SCHEDULE (FOR SEVERAL RINGS)
		time.current  = time.set( time.start );
		time.duration = defined( time.stop ) ? (time.set( time.stop ).getHours() - time.set( time.start ).getHours()) : 10;
		for( var i = 0; i < (time.duration * scale.blocks.per.hour); i++ ) {
			var tr  = html.tr.clone();

			// ===== TIMELINE
			var timeline = html.td.clone().addClass( 'timeline' );
			if( i == 0 || parseInt( time.current.getMinutes()) < 4 ) { 
				var tick = format.time( time.current );
				timeline.attr({ rowspan: 3 });
				timeline.html( tick );
				tr.append( timeline );
			}
			if( i % scale.blocks.per.hour >= 3 ) {
				tr.append( timeline );
			}

			// ===== RINGS
			for( var x = 0; x < w; x++ ) {
				var j = (y * width) + (x + 1);
				if( j <= n ) {
					var id      = format.id( time.current );
					var ring = html.td.clone().addClass( `ring ring-${j}` ).attr({ id : `ring-${j}-${id}` });
					tr.append( ring );
				} else {
					var placeholder = html.td.clone().addClass( `ring` ).html( '&nbsp;' );
					tr.append( placeholder );
				}
			}

			time.current.setMinutes( time.current.getMinutes() + scale.minutes );
			table.append( tr );
		}

		$( '.pt-page-1 #schedule' ).append( table );
		var width = table.width();
		var rings = table.find( '.ring.schedule-heading' );
		rings.css({ width: Math.floor((width - 120)/rings.length) });

	}
	$( '.schedule' )
		.on( 'dragstart', dnd.handle.drag.start )
		.on( 'dragenter', dnd.handle.drag.enter )
		.on( 'dragover',  dnd.handle.drag.over )
		.on( 'dragleave', dnd.handle.drag.leave )
		.on( 'drop',      dnd.handle.drop )
		.on( 'dragend',   dnd.handle.drag.end );

	var day = schedule.days[ settings.current.day ];
	show.plan( day );
};

var init = {
	timeline: ( schedule ) => {
		if( ! defined( schedule )) { return; }
		schedule.days.forEach(( day, i ) => {
			if( ! defined( day.start ))    { schedule.days[ i ].start    = '9:00 AM'; } // Default start at 9 AM
			if( ! defined( day.duration )) { schedule.days[ i ].duration = 10;        } // Default work for 10 hours
		});
	},
	block: ( blockid ) => {
		var block   = schedule.blocks[ blockid ];
		var rmap    = { finals: 'Finals', semfin: 'Semi-Finals', prelim: 'Prelim.' };
		var rowspan = Math.floor( block.duration / scale.minutes );
		var gender  = 'coed';
		var start   = format.id( time.set( block.start ));
		var stop    = format.id( time.set( block.stop ));
		var flight  = block.flight ? `Flight ${block.flight.toUpperCase()}` : '';

		if( block.description.match( /pair/i ))   { gender = 'coed';   } else 
		if( block.description.match( /female/i )) { gender = 'female'; } else 
		if( block.description.match( /male/i ))   { gender = 'male';   }

		var td = html.td.clone().addClass( 'ring' ).attr({ rowspan: rowspan });

		var label = html.div.clone()
			.addClass( 'block-label' )
			.html( `${block.division.toUpperCase()} ${block.description}${rowspan>2?'<br style="mso-data-placement:same-cell;">':' '}${rmap[ block.round ]} ${flight} (${block.athletes})` );

		var div = html.div.clone()
			.addClass( `block ${gender}` )
			.attr({ 'draggable' : 'true', 'data-blockid' : block.id, 'data-start': start, 'data-stop': stop})
			.append( label );

		td.append( div );

		return td;
	},
	days: ( schedule ) => {
		if( ! defined( schedule )) { return; }

		$( '.pt-page-1 #days' ).empty();

		// ===== SHOW BUTTONS FOR DAY SELECTION
		var days = schedule.days.length;
		for( var i = 0; i < days; i++ ) {
			var day = html.button.clone().addClass( 'btn btn-xs btn-primary day-select' ).attr({ 'data-day': i }).css({ margin: '4px' }).html( `Day ${i + 1}` );
			day.off( 'click' ).click(( ev ) => {
				var target = $( ev.target );
				settings.current.day = parseInt( target.attr( 'data-day' ));
				show.daySchedule();
				$( '.day-select' ).addClass( 'btn-primary' ).removeClass( 'btn-success' );
				target.addClass( 'btn-success' ).removeClass( 'btn-primary' );
			});
			if( i == settings.current.day ) { day.removeClass( 'btn-primary' ).addClass( 'btn-success' ); }
			$( '.pt-page-1 #days' ).append( day );
		}
	}
};

handler.check.schedule = ( update ) => {
	var request;
	wait.check.close();

	schedule = update.schedule;

	if( update.results == 'ok' ) {
		alertify.success( 'Schedule has no errors' );
		init.days( schedule );
		init.timeline( schedule );
		show.daySchedule();

		update.warnings.forEach(( warning ) => {
			var block = schedule.blocks[ warning.block ];
			alertify.message( `${block.division.toUpperCase()} is ${warning.cause.reason}` );
		});

	} else if( update.errors.length > 0 ) {
		var error  = update.errors[ 0 ];

		// Build a plan if there is no plan or no rings
		if( error.cause.reason == 'no plan' || error.cause.reason == 'no rings') {
			wait.build = alertify.waitDialog( 'Building Schedule' );
			request = { data : { type : 'schedule', action : 'build' }};
			request.json = JSON.stringify( request.data );
			ws.send( request.json );

		// Decorate the blocks with errors
		} else {
			init.days( schedule );
			init.timeline( schedule );
			show.daySchedule();

			update.errors.forEach(( error ) => {
				var a = schedule.blocks[ error.block ];
				var b = schedule.blocks[ error.cause.by ];
				alertify.error( `Block ${a.division.toUpperCase()} has a ${error.cause.reason} conflict with ${b.division.toUpperCase()}` );

				var block = $( `.block[data-blockid="${error.block}"]` );
				block.addClass( 'error' );
			});
		}
	}
};

handler.build.schedule = ( update ) => {
	wait.build.close();

	if( update.results == 'ok' ) {
		alertify.success( 'Schedule has no errors' );

	} else {
		update.errors.forEach(( error ) => {
			alertify.error( `Cannot place block ${error.id} ${error.cause.reason}` );
		});
	}
	schedule = update.schedule;
	init.days( schedule );
	init.timeline( schedule );
	show.daySchedule();

};

handler.write.schedule = ( update ) => {
	wait.check = alertify.waitDialog( 'Checking Schedule for Correctness' );
	request = { data : { type : 'schedule', action : 'check' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );

}

</script>