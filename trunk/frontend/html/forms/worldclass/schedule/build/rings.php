<script>
	var settings = { day: [], current: { day: 0 }, divisions : {}, rounds: [] };
	var scale    = { blocks : { per: { hour: 15, table: 3 /* see show.daySchedule() */ }, width: undefined }, minutes: 4, height: 8 };
</script>
<div class="pt-page pt-page-1">
	<div class="container">
		<div class="page-header"> Sport Poomsae Schedule Builder <div id="days" class="pull-right"></div></div>
		<div class="action-bar row">
			<div class="instructions col-xs-8">
				Drag-and-drop <b>blocks</b> to rearrange the schedule. Breaks have <code>+</code> and <code>-</code> buttons to increase and decrease breaks. Decreasing a break to 0 minutes removes the break.
			</div>
			<div class="actions col-xs-4">
				<button class="btn btn-default btn-primary" id="rebuild"><span class="fa fa-refresh"></span> Rebuild Schedule</button>
				<button class="btn btn-default btn-primary" id="add-break"><span class="fa fa-coffee"></span> Add Break</button>
				<button class="btn btn-default btn-primary" id="save-check"><span class="fa fa-file"></span> Save </button>
			</div>
		</div>
		<div>
			<h2 id="schedule-title">Sport Poomsae Schedule</h2>
			<div id="schedule">
			</div>
		</div>
	</div>
</div>

<script>

var find   = { ring : ( day, id ) => { return day.rings.find(( ring ) => { return ring.id == id; }); }};
var format = { id: ( time ) => { return $.format.date( time, 'HHmm' );}, time: ( time ) => { return $.format.date( time, 'h:mm a' ); }};
var time   = {
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

<?php include( 'plan.js' ); ?>
<?php include( 'validate.js' ); ?>
<?php include( 'drag-and-drop.js' ); ?>

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
		var cell     = $( `#${id}` );

		cell.remove();
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

	if( Number.isInteger(n/5)) { scale.blocks.per.table = 5; } else
	if( Number.isInteger(n/4)) { scale.blocks.per.table = 4; } else
	if( Number.isInteger(n/3)) { scale.blocks.per.table = 3; } else // Default is 3
	if( Number.isInteger(n/2)) { scale.blocks.per.table = 2; }

	var width = scale.blocks.per.table;
	var h     = Math.ceil( n/width );
	for( var y = 0; y < h; y++ ) {
		// ===== TABLE
		var table    = html.table.clone().addClass( 'schedule' );
		var header   = html.tr.clone();
		var timeline = html.td.clone().addClass( 'timeline schedule-heading' ).html( html.h4.clone().html( 'Time' ));
		[ 'current', 'start', 'stop', 'duration' ].forEach(( key ) => { time[ key ] = undefined; });

		header.append( timeline );

		for( var x = 0; x < width; x++ ) {
			var i = (y * width) + x;
			if( i < n ) {
				var ring    = day.rings[ i ];
				var ringcol = html.td.clone().addClass( `ring schedule-heading col-${scale.blocks.per.table}-width` ).append( html.div.clone().addClass( 'ring-plan' ).attr({ draggable: true, 'data-ringid' : ring.id }).append( html.h4.clone().html( ring.name )));
				header.append( ringcol );
				time.start = defined( ring.start ) ? time.earliest( time.start, ring.start ) : day.start;
				time.stop  = defined( ring.stop  ) ? time.latest(   time.stop,  ring.stop  ) : day.stop;
			} else {
				var placeholder = html.td.clone().addClass( `ring schedule-heading col-${scale.blocks.per.table}-width` ).html( '&nbsp;' );
				header.append( placeholder );
			}
		}
		table.append( header );

		// ===== SCHEDULE (FOR SEVERAL RINGS)
		if( ! time.start ) { time.start = day.start; }
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
			for( var x = 0; x < width; x++ ) {
				var j = (y * width) + (x + 1);
				if( j <= n ) {
					var id   = format.id( time.current );
					var ring = html.td.clone().addClass( `ring ring-${j}` ).attr({ id : `ring-${j}-${id}`, 'data-ringid' : `ring-${j}` });
					tr.append( ring );
				} else {
					var placeholder = html.td.clone().addClass( `ring` );
					tr.append( placeholder );
				}
			}

			time.current.setMinutes( time.current.getMinutes() + scale.minutes );
			table.append( tr );
		}

		$( '.pt-page-1 #schedule' ).append( table );
		var rings = table.find( '.ring.schedule-heading' );
		rings.css({ width: Math.floor((table.width() - 120)/rings.length) });

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
	var results = plan.validate();
	show.errors( results );
};

show.errors = ( results ) => {
	results.errors.forEach(( error ) => {
		var a     = schedule.blocks[ error.block ];
		var b     = schedule.blocks[ error.cause.by ];
		var rname = { prelim : 'Prelim.', semfin : 'Semi-Finals', finals : 'Finals' };
		alertify.error( `Block ${a.division.toUpperCase()}${a.flight.toUpperCase()} ${rname[a.round]} has a ${error.cause.reason} conflict with ${b.division.toUpperCase()}${b.flight.toUpperCase()} ${rname[b.round]}` );

		var blocks = $( `.block[data-blockid="${error.block}"], .block[data-blockid="${error.cause.by}"]` );
		blocks.addClass( 'error' );
	});
}

show.warnings = ( results ) => {
	if( ! defined( results.warnings )) { return; }
	results.warnings.forEach(( warning ) => {
		var block = schedule.blocks[ warning.block ];
		alertify.message( `${block.division.toUpperCase()} is ${warning.cause.reason}` );
	});
};

show.title = () => {
	if( defined( schedule.start )) {
		var d = new Date( schedule.start );
		d.setDate( d.getDate() + settings.current.day);
		$( '#schedule-title' ).html( `Sport Poomsae Schedule for ${$.format.date( d, 'ddd, MMM d yyyy' )}` );
	} else {
		$( '#schedule-title' ).html( `Sport Poomsae Schedule for Day ${settings.current.day + 1}` );
	}
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
		var block     = schedule.blocks[ blockid ];
		var rmap      = { finals: 'Finals', semfin: 'Semi-Finals', prelim: 'Prelim.' };
		var rowspan   = Math.floor( block.duration / scale.minutes );
		var gender    = 'coed';
		var start     = format.id( time.set( block.start ));
		var stop      = format.id( time.set( block.stop ));
		var flight    = block.flight ? `Flight ${block.flight.toUpperCase()}` : '';
		var is        = { 'break' : block.id.match( /^break/i )};
		var freestyle = block.id.match( /freestyle/i ) ? 'freestyle' : '';
		var subevent  = 'individual';
		var age       = 'over30';

		if( is.break )                           { gender = 'none';   } else 
		if( block.id.match( /female/i ))         { gender = 'female'; } else 
		if( block.description.match( /women/i )) { gender = 'female'; } else
		if( block.id.match( /male/i ))           { gender = 'male';   } else
		if( block.description.match( /men/i ))   { gender = 'male';   } 

		if( is.break )                       { subevent = 'break';      } else 
		if( block.id.match( /individual/i )) { subevent = 'individual'; } else 
		if( block.id.match( /pair/i ))       { subevent = 'pair';       } else 
		if( block.id.match( /team/i ))       { subevent = 'team';       }

		if( is.break ) { age = ''; } else { age = block.id.split( /\|/ )[ 1 ].split( /\-/ ).pop(); }

		var td = html.td.clone().addClass( 'ring' ).attr({ rowspan: rowspan });

		var actions  = is.break ? `<div class="break-actions" data-breakid="${blockid}"><button class="btn btn-xs break-rename"><span class="fa fa-pencil"></span></button><button class="btn btn-xs break-edit break-more"><span class="fa fa-plus"></span></button><button class="btn btn-xs break-edit break-less"><span class="fa fa-minus"></span></button></div>` : '';
		var text     = is.break ? `${block.description}<br style="mso-data-placement:same-cell">${block.duration} minutes` : `${block.description}${rowspan>2?'<br style="mso-data-placement:same-cell;">':' '}${rmap[ block.round ]} ${flight} (${block.athletes})`;
		var division = html.div.clone().addClass( 'block-division' ).html( is.break ? '' : block.division.toUpperCase());
		var label    = html.div.clone()
			.addClass( 'block-label' )
			.html( text );

		var div = html.div.clone()
			.addClass( `block ${freestyle} ${gender} ${subevent} ${age}` )
			.attr({ 'draggable' : 'true', 'data-blockid' : block.id, 'data-start': start, 'data-stop': stop})
			.append( label, division, actions );

		td.append( div );

		// Behavior
		$( '.break-rename' ).off( 'click' ).click(( ev ) => {
			var target = $( ev.target ).parents( '.break-actions' );
			var id     = target.attr( 'data-breakid' );
			var block  = schedule.blocks[ id ];
			var ring   = block.ring.capitalize().replace( /\-/, ' ' );
			alertify.prompt( 
				`Rename <b>${block.description}</b> for ${ring}`, 
				'Enter the new description below', 
				block.description,
				( evt, value ) => { 
					block.description = value;
					target.siblings( '.block-label' ).html( `${block.description}<br style="mso-data-placement:same-cell">${block.duration} minutes` );
				},
				() => {}
			)
		});

		$( '.break-edit' ).off( 'click' ).click(( ev ) => {
			var target = $( ev.target ); target = target.hasClass( 'btn' ) ? target : target.parent( '.btn' );
			var grow   = target.hasClass( 'break-more' );
			var id     = target.parent( '.break-actions' ).attr( 'data-breakid' );
			var block  = schedule.blocks[ id ];
			var day    = schedule.days[ settings.current.day ];
			var rname  = block.ring.capitalize().replace( /\-/, ' ' );

			block.duration += grow ? 20 : -20;
			if( block.duration == 0 ) {
				plan.remove( id );
				delete schedule.blocks[ id ];
				alertify.message( `Removing break for ${rname}` );
			} else {
				alertify.message( `${grow ? 'Increasing' : 'Decreasing'} break for ${rname} to ${block.duration} minutes` );
				plan.reschedule( block.ring, day );
			}
			show.daySchedule();
		});

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

				// Set print title
				if( defined( schedule.start )) {
					var d = new Date( schedule.start );
					d.setDate( d.getDate() + settings.current.day);
					$( '#schedule-title' ).html( `Sport Poomsae Schedule for ${$.format.date( d, 'ddd, MMM d yyyy' )}` );
				} else {
					$( '#schedule-title' ).html( `Sport Poomsae Schedule for Day ${settings.current.day + 1}` );
				}

				show.daySchedule();
				$( '.day-select' ).addClass( 'btn-primary' ).removeClass( 'btn-success' );
				target.addClass( 'btn-success' ).removeClass( 'btn-primary' );
			});
			if( i == settings.current.day ) { day.removeClass( 'btn-primary' ).addClass( 'btn-success' ); }
			$( '.pt-page-1 #days' ).append( day );
		}
	}
};

// ===== BEHAVIOR
$( '#rebuild' ).off( 'click' ).click(( ev ) => {
	alertify.confirm( 'Rebuild the schedule?', 'Current settings will be lost.', () => {
		wait.build = alertify.waitDialog( 'Building Schedule' );
		var request = { data : { type : 'schedule', schedule: schedule, action : 'build' }};
		request.json = JSON.stringify( request.data );
		ws.send( request.json );
	}, () => {});
});

$( '#add-break' ).off( 'click' ).click(( ev ) => {
	var id = 'break-' + (sha1.hex( btoa(new Date().getTime()))).substr( 0, 8 );
	schedule.blocks[ id ] = { id: id, description: 'Break', duration: 40 };
	var day  = schedule.days[ settings.current.day ];
	var ring = day.rings[ 0 ];
	ring.plan.push( id );
	plan.reschedule( ring.id, day );
	show.daySchedule();
});

$( '#save-check' ).off( 'click' ).click(( ev ) => {
	var request = { data : { type : 'schedule', schedule: schedule, action : 'write' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
});

// ===== HANDLERS
handler.read.schedule =  ( update ) => {
	schedule = update.schedule;
	show.title();
	init.days( schedule );
	init.timeline( schedule );
	show.daySchedule();
	show.warnings( update );
};

handler.check.schedule = ( update ) => {
	wait.check.close();

	schedule = update.schedule;

	show.title();

	// Show the schedule if there are no errors
	if( update.results == 'ok' ) {
		alertify.success( 'Schedule has no errors' );
		init.days( schedule );
		init.timeline( schedule );
		show.daySchedule();
		show.warnings( update );

	} else if( update.errors.length > 0 ) {
		var error  = update.errors[ 0 ];

		// Build a plan if there is no plan or no rings
		if( error.cause.reason == 'no plan' || error.cause.reason == 'no rings') {
			wait.build = alertify.waitDialog( 'Building Schedule' );
			var request = { data : { type : 'schedule', action : 'build' }};
			request.json = JSON.stringify( request.data );
			ws.send( request.json );

		// Otherwise show the schedule and decorate the blocks with errors
		} else {
			init.days( schedule );
			init.timeline( schedule );

			show.daySchedule();
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
	wait.check = alertify.waitDialog( 'Saving' );
	request = { data : { type : 'schedule', action : 'check' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );

}

</script>
