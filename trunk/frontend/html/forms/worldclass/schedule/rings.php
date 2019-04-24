<script>
	var settings = { day: [], current: { day: 0 }, divisions : {}, rounds: [] };
	var scale    = { blocks : { per: { hour: 15, table: 3 }}, minutes: 4, height: 8 };
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
var dnd = { item: undefined, source: undefined, handle : {
	drag : {
		start : function( ev ) {
			dnd.item   = $( ev.target );
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
		var item      = dnd.item;

		item.detach();

		// ===== UPDATE THE SCHEDULE
		var day = schedule.day[ settings.current.day ];
		$( '.ring' ).each(( i, ring ) => {
			ringid = $( ring ).attr( 'id' );
			if( ! defined( day.plan )) { day.plan = {}; }
			var plan = day.plan[ ringid ] = [];
			$( `#${ringid} .schedule` ).children( '.round' ).each(( j, round ) => {
				var item = JSON.parse( $( round ).attr( 'data-round' ));
				plan.push( item );
			});
		});

		// var request = { data : { type : 'schedule', schedule: schedule, action : 'write' }};
		// request.json = JSON.stringify( request.data );
		// ws.send( request.json );

		dnd.item   = undefined;
		dnd.source = undefined;
		return false;
	}
}};

var blockid = ( ringid, time ) => {
	var hour     = time.hour < 10 ? '0' + time.hour : time.hour;
	var minutes  = time.minutes < 10 ? '0' + time.minutes : time.minutes;
	var id       = `${ringid}-${hour}${minutes}`;
	return id;
}

show.block = ( ringid, round, time ) => {
	var block    = init.block( round );
	var duration = block.attr( 'rowspan' );

	var id       = blockid( ringid, time );
	var target   = $( `#${id}` );

	target.replaceWith( block );
	block.attr({ id : id });

	for( var i = 0; i < duration; i++ ) {
		time.minutes += scale.minutes;
		if( time.minutes >= 60 ) { time.hour++; time.minutes -= 60; }

		var id       = blockid( ringid, time );
		var target   = $( `#${id}` );

		target.remove();
	}

	// Padding
	time.minutes += scale.minutes;
	if( time.minutes >= 60 ) { time.hour++; time.minutes -= 60; }
}

show.blocks = ( day ) => {
	var time = { hour: day.start, minutes: 0 };
	if( defined( day.plan )) { // MW GET SERVICE TO ALWAYS GENERATE A PLAN, AND THEN REMOVE THIS RESTRICTION
		Object.keys( day.plan ).forEach(( ringid ) => {
			day.plan[ ringid ].forEach(( round ) => { show.block( ringid, round, time ) });
		});
	} else {
		var ringid = 'ring-1';
		settings.rounds[ settings.current.day ].forEach(( round ) => { show.block( ringid, round, time ); });
	}

};

show.daySchedule = () => {
	$( '.pt-page-1 #schedule' ).empty();
	var width = scale.blocks.per.table;
	var n     = tournament.rings.length;
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
			var ring = html.td.clone().addClass( 'ring schedule-heading' ).html( html.h4.clone().html( `Ring ${j}` ));
			header.append( ring );
		}
		table.append( header );

		// ===== SCHEDULE (FOR SEVERAL RINGS)
		for( var i = 0; i < (day.duration * scale.blocks.per.hour); i++ ) {
			var tr  = html.tr.clone();
			var hr  = Math.floor( i / scale.blocks.per.hour );
			var min = (i % scale.blocks.per.hour) * scale.minutes;

			// ===== TIMELINE
			var timeline = html.td.clone().addClass( 'timeline' );
			if( i % scale.blocks.per.hour == 0 ) { 
				var ampm     = hr + day.start >= 12 ? 'PM' : 'AM'; // Hopefully there is never a time where the schedule goes past midnight intentionally
				var hour     = hr + day.start > 12 ? hr + day.start - 12 : hr + day.start;
				timeline.attr({ rowspan: 3 });
				timeline.html( `${hour}:00 ${ampm}` );
				tr.append( timeline );
			}
			if( i % scale.blocks.per.hour >= 3 ) {
				tr.append( timeline );
			}

			// ===== RINGS
			for( var x = 0; x < w; x++ ) {
				var j = (y * 3) + (x + 1);
				if( j > n ) { continue; }
				var hour    = (hr + day.start) < 10 ? '0' + (hr + day.start) : (hr + day.start);
				var minutes = min < 10 ? '0' + min : min;
				var ring = html.td.clone().addClass( 'ring' ).attr({ id : `ring-${j}-${hour}${minutes}` });
				tr.append( ring );
			}

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

var rule = {
	mutex : {
		'Individual Youths':           [ 'Pair Youths', 'Male Team Youths' ],
		'Team Youths':                 [ 'Pair Youths', 'Male Individual Youths' ],
		'Pair Youths':                 [ 'Male Individual Youths', 'Female Individual Youths', 'Male Team Youths', 'Female Team Youths' ],
		'Individual Cadets':           [ 'Pair Cadets', 'Male Team Cadets' ],
		'Team Cadets':                 [ 'Pair Cadets', 'Male Individual Cadets' ],
		'Pair Cadets':                 [ 'Male Individual Cadets', 'Female Individual Cadets', 'Male Team Cadets', 'Female Team Cadets' ],
		'Individual Juniors':          [ 'Pair Juniors', 'Male Team Juniors' ],
		'Team Juniors':                [ 'Pair Juniors', 'Male Individual Juniors' ],
		'Pair Juniors':                [ 'Male Individual Juniors', 'Female Individual Juniors', 'Male Team Juniors', 'Female Team Juniors' ],
		'Individual Under 30':         [ 'Pair Under 30', 'Male Team Under 30' ],
		'Team Under 30':               [ 'Pair Under 30', 'Male Individual Under 30' ],
		'Pair Under 30':               [ 'Male Individual Under 30', 'Female Individual Under 30', 'Male Team Under 30', 'Female Team Under 30' ],
		'Male Individual Under 40':    [ 'Pair Over 30', 'Male Team Over 30' ],
		'Female Individual Under 40':  [ 'Pair Over 30', 'Female Team Over 30' ],
		'Male Team Over 30':           [ 'Pair Over 30', 'Male Individual Under 40', 'Male Individual Under 50', 'Male Individual Under 60', 'Male Individual Under 65', 'Male Individual Over 65' ],
		'Female Team Over 30':         [ 'Pair Over 30', 'Female Individual Under 40', 'Female Individual Under 50', 'Female Individual Under 60', 'Female Individual Under 65', 'Female Individual Over 65' ],
		'Pair Over 30':                [ 'Male Individual Under 40', 'Female Individual Under 40', 'Male Individual Under 50', 'Female Individual Under 50', 'Male Individual Under 60', 'Female Individual Under 60', 'Male Individual Under 65', 'Female Individual Under 65', 'Male Individual Over 65', 'Female Individual Over 65', 'Male Team Over 30', 'Female Team Over 30' ],
		'Male Individual Under 50':    [ 'Pair Over 30', 'Male Team Over 30' ],
		'Female Individual Under 50':  [ 'Pair Over 30', 'Female Team Over 30' ],
		'Male Individual Under 60':    [ 'Pair Over 30', 'Male Team Over 30' ],
		'Female Individual Under 60':  [ 'Pair Over 30', 'Female Team Over 30' ],
		'Male Individual Under 65':    [ 'Pair Over 30', 'Male Team Over 30' ],
		'Female Individual Under 65':  [ 'Pair Over 30', 'Female Team Over 30' ],
		'Male Individual Over 65':     [ 'Pair Over 30', 'Male Team Over 30' ],
		'Female Individual Over 65':   [ 'Pair Over 30', 'Female Team Over 30' ],
	}
};

var init = {
	timeline: ( update ) => {
		if( defined( update.schedule )) {
			update.schedule.day.forEach(( day, i ) => {
				if( ! defined( day.start ))    { schedule.day[ i ].start    = 9;  } // Default start at 9 AM
				if( ! defined( day.duration )) { schedule.day[ i ].duration = 10; } // Default work for 10 hours
			});
		}
	},
	block: ( round ) => {
		var rmap    = { finals: 'Finals', semfin: 'Semi-Finals', prelim: 'Prelim.' };
		var rowspan = (round.round.match( /finals/i ) ? (2 * round.athletes) : (round.athletes));
		var gender  = 'coed';
		if( round.description.match( /pair/i ))   { gender = 'coed'; } else 
		if( round.description.match( /female/i )) { gender = 'female'; } else 
		if( round.description.match( /male/i ))   { gender = 'male'; }

		// Make a copy without circular references (prev, next)
		var data = {};
		[ 'athletes', 'description', 'division', 'round' ].forEach(( key ) => { data[ key ] = round[ key ]; });
		data = JSON.stringify( data );

		var td = html.td.clone().addClass( 'ring' ).attr({ rowspan: rowspan });

		var div = html.div.clone()
			.addClass( `round ${gender}` )
			.attr({ 'draggable' : 'true', 'data-round' : data, 'data-divid': round.division })
			.css({ 'line-height' : `${rowspan * scale.height}px` })
			.html( `${round.description} ${rmap[ round.round ]} (${round.athletes})` );

		td.append( div );

		return td;
	},
	rounds: ( division ) => {
		var rounds = [];
		var name   = division.name;
		var desc   = division.description;
		var n      = division.athletes.length;

		// If the pairs and teams registered as individuals, divide
		if( schedule.teams.match( /individual/i )) {
			if     ( desc.match( /pair/i )) { n = Math.ceil( n/2 ); }
			else if( desc.match( /team/i )) { n = Math.ceil( n/3 ); }
		}

		var k     = n > 8 ? 8 : n;
		rounds.push({ division : name, athletes: k, description: desc, round: 'finals' });
		if( n > 8 ) {
			var k      = Math.ceil( n/2 );
			var last   = rounds.length - 1;
			var finals = rounds[ last ];
			var semfin = { division: name, athletes: k, description: desc, round: 'semfin' };

			finals.prev = [ semfin ];
			semfin.next = finals;

			rounds.push( semfin );
		}
		if( n >= 20 ) {
			var last    = rounds.length - 1;
			var semfin  = rounds[ last ];
			var f       = 1; // flights
			var flights = [];

			if     ( n < 20 ) { f = 1; }
			else if( n < 40 ) { f = 2; }
			else if( n < 60 ) { f = 3; }
			else if( n > 60 ) { f = 4; }

			var m = n;
			semfin.prev = [];
			for( var i = f; i > 0; i-- ) {
				var letter = String.fromCharCode( 64 + i ); // A, B, C, D, etc.
				var k      = Math.ceil( m/i ); // Assign k athletes to this flight
				var flight = { division: name, athletes: k, description: desc, round: 'prelim', flight: letter, flights: [] };

				flights.push( flight );
				semfin.prev.push( flight );
				flight.next = semfin;

				rounds.push( flight );
				m -= k;
			}

			flights.forEach(( flight, i ) => { flight.flights = flight.flights.concat( flights ); });
		}

		return rounds;
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
		settings.rounds = [];
		update.schedule.day.forEach(( day, i ) => {
			day.divisions.forEach(( divid, j ) => { 
				if( ! defined( settings.rounds[ i ]) ) { settings.rounds[ i ] = []; }
				var division         = settings.divisions[ divid ];
				var rounds           = init.rounds( division );
				settings.rounds[ i ] = settings.rounds[ i ].concat( rounds );
			});
		});
	}
};

handler.read[ 'schedule' ] = ( update ) => {
	schedule = update.schedule;
	init.divisions( update );
	init.timeline( update );
	show.daySchedule();

};
</script>
