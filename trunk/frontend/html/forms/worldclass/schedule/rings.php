<script>
	var settings = { day: [], current: { day: 0 }, divisions : {}, rounds: [] };
	var scale    = { blocks : { per: { hour: 15, table: 3 /* see show.daySchedule() */ }}, minutes: 4, height: 8 };
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
var setTime = function( timestamp ) {
	var time = new Date();
	var hhmm = timestamp.split( /:/ ).map( x => parseInt( x ));
	hhmm[0] += timestamp.match( /PM/ ) && hhmm[0] != 12 ? 12 : 0;
	time.setHours( hhmm.shift());
	time.setMinutes( hhmm.shift());
	return time;
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
		var target    = $( ev.target ); if( ! target.hasClass( 'schedule' )) { target = target.parents( '.schedule' ); }
		var block     = dnd.block;

		// block.detach();

		// var request = { data : { type : 'schedule', schedule: schedule, action : 'write' }};
		// request.json = JSON.stringify( request.data );
		// ws.send( request.json );

		dnd.block  = undefined;
		dnd.source = undefined;
		return false;
	}
}};

show.block = ( ringid, blockid ) => {
	var blockdata = schedule.blocks[ blockid ];
	var block     = init.block( blockid );
	var time      = setTime( blockdata.start );
	var duration  = block.attr( 'rowspan' ) - 1;
	var start     = $.format.date( setTime( blockdata.start ), 'HHmm' );
	var id        = `${ringid}-${start}`;
	var target    = $( `#${id}` );

	target.replaceWith( block );
	block.attr({ id : id });

	for( var i = 0; i < duration; i++ ) {
		time.setMinutes( time.getMinutes() + scale.minutes );

		var start    = $.format.date( time, 'HHmm' );
		var id       = `${ringid}-${start}`;
		var target   = $( `#${id}` );

		target.remove();
	}
}

show.blocks = ( day ) => {
	day.rings.forEach(( ring ) => { 
		ring.plan.forEach(( blockid ) => {
			show.block( ring.name, blockid ) 
		});
	});
};

show.daySchedule = () => {
	$( '.pt-page-1 #schedule' ).empty();
	var n = tournament.rings.length;

	if( Number.isInteger(n/3)) { scale.blocks.per.table = 3; } else
	if( Number.isInteger(n/2)) { scale.blocks.per.table = 2; }

	var width = scale.blocks.per.table;
	var w     = n >= width ? width : n;
	var h     = Math.ceil( n/width );
	for( var y = 0; y < h; y++ ) {
		// ===== TABLE
		var table = html.table.clone().addClass( 'schedule' );
		var day   = schedule.day[ settings.current.day ];

		// ===== HEADERS
		var header   = html.tr.clone();
		var timeline = html.td.clone().addClass( 'timeline schedule-heading' ).html( html.h4.clone().html( 'Time' ));

		header.append( timeline );

		for( var x = 0; x < w; x++ ) {
			var j    = (y * width) + (x + 1);
			if( j <= n ) {
				var ring = html.td.clone().addClass( 'ring schedule-heading' ).html( html.h4.clone().html( `Ring ${j}` ));
				header.append( ring );
			} else {
				var placeholder = html.td.clone().addClass( 'ring schedule-heading' ).html( '&nbsp;' );
				header.append( placeholder );
			}
		}
		table.append( header );

		// ===== SCHEDULE (FOR SEVERAL RINGS)
		var time = setTime( day.start );
		for( var i = 0; i < (day.duration * scale.blocks.per.hour); i++ ) {
			var tr  = html.tr.clone();

			// ===== TIMELINE
			var timeline = html.td.clone().addClass( 'timeline' );
			if( i == 0 || parseInt( time.getMinutes()) < 4 ) { 
				var tick = $.format.date( time, 'h:mm a' );
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
					var id      = $.format.date( time, 'HHmm' );
					var ring = html.td.clone().addClass( 'ring' ).attr({ id : `ring-${j}-${id}` });
					tr.append( ring );
				} else {
					var placeholder = html.td.clone().addClass( 'ring' ).html( '&nbsp;' );
					tr.append( placeholder );
				}
			}

			time.setMinutes( time.getMinutes() + scale.minutes );
			table.append( tr );
		}

		$( '.pt-page-1 #schedule' ).append( table );
	}
	$( '.schedule' )
		.on( 'dragstart', dnd.handle.drag.start )
		.on( 'dragenter', dnd.handle.drag.enter )
		.on( 'dragover',  dnd.handle.drag.over )
		.on( 'dragleave', dnd.handle.drag.leave )
		.on( 'drop',      dnd.handle.drop )
		.on( 'dragend',   dnd.handle.drag.end );

	var day = schedule.day[ settings.current.day ];
	show.blocks( day );
};

var init = {
	timeline: ( update ) => {
		if( defined( update.schedule )) {
			update.schedule.day.forEach(( day, i ) => {
				if( ! defined( day.start ))    { schedule.day[ i ].start    = '9:00 AM'; } // Default start at 9 AM
				if( ! defined( day.duration )) { schedule.day[ i ].duration = 10;        } // Default work for 10 hours
			});
		}
	},
	block: ( blockid ) => {
		var block   = schedule.blocks[ blockid ];
		var rmap    = { finals: 'Finals', semfin: 'Semi-Finals', prelim: 'Prelim.' };
		var rowspan = Math.floor( block.duration / scale.minutes );
		var gender  = 'coed';
		var start   = $.format.date( setTime( block.start ), 'HHmm' );
		var stop    = $.format.date( setTime( block.stop ),  'HHmm' );
		var flight  = block.flight ? `Flight ${block.flight.toUpperCase()}` : '';

		if( block.description.match( /pair/i ))   { gender = 'coed'; } else 
		if( block.description.match( /female/i )) { gender = 'female'; } else 
		if( block.description.match( /male/i ))   { gender = 'male'; }

		var td = html.td.clone().addClass( 'ring' ).attr({ rowspan: rowspan });

		var label = html.div.clone()
			.addClass( 'block-label' )
			.html( `${block.division.toUpperCase()} ${block.description}<br>${rmap[ block.round ]} ${flight} (${block.athletes})` );

		var div = html.div.clone()
			.addClass( `block ${gender}` )
			.attr({ 'draggable' : 'true', 'data-blockid' : block.id, 'data-start': start, 'data-stop': stop})
			.append( label );

		td.append( div );

		return td;
	},
	divisions: ( update ) => {
		if( ! defined( update.divisions )) { return; }

		$( '.pt-page-1 #days' ).empty();
		for( var i = 0; i < update.schedule.days; i++ ) {
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

		// ===== INITIALIZE LOOKUP TABLE
		update.divisions.forEach(( division, i ) => { 
			var name                   = division.name;
			settings.divisions[ name ] = division; 
		});

		// ===== BUILD DAY SCHEDULE
	}
};

handler.read[ 'schedule' ] = ( update ) => {
	schedule = update.schedule;
	init.divisions( update );
	init.timeline( update );
	show.daySchedule();

};
</script>
