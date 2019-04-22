<script>
	var settings = { day: [], current: { day: 0 }, divisions : {}, rounds: [] };
	var scale    = { top: 60, fourMinutes: 8, padding: 4 };
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
var insert = function( list, position, item ) {
};

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
		var offset    = target.offset();
		var position  = { x: ev.originalEvent.pageX - offset.left, y: ev.originalEvent.pageY - offset.top};
		var topOffset = undefined;

		item.detach();

		// ===== TIDY SOURCE
		topOffset = scale.top + scale.padding;
		$.each( dnd.source.children( '.round' ), ( i, round ) => {
			$( round ).css({ top: topOffset });
			var height = parseInt( $( round ).attr( 'data-height' ));
			topOffset += height + scale.padding;
		});

		// ===== TIDY TARGET
		topOffset = scale.top + scale.padding;
		var list = target.children( '.round' ).toArray();
		// Find location of target drop
		for( var i = 0; i <= list.length; i++ ) {
			var round = $( list[ i ] );
			var height = parseInt( $( round ).attr( 'data-height' ));
			var limit  = topOffset - height; 
			if( position.y < limit ) { list.splice( i, 0, item ); break; } else
			if( i == list.length )   { list.push( item );         break; }
			topOffset += height + scale.padding;
		}

		// Order target list
		topOffset = scale.top + scale.padding;
		list.forEach(( round, i ) => {
			target.append($( round ));
			$( round ).css({ top: topOffset });
			var height = parseInt( $( round ).attr( 'data-height' ));
			topOffset += height + scale.padding;
		});

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

		var request = { data : { type : 'schedule', schedule: schedule, action : 'write' }};
		request.json = JSON.stringify( request.data );
		ws.send( request.json );

		dnd.item   = undefined;
		dnd.source = undefined;
		return false;
	}
}};
show.daySchedule = () => {
	$( '.pt-page-1 #schedule' ).empty();
	var n = tournament.rings.length;
	var w = n >= 6 ? 6 : n;
	var h = Math.ceil( n/6 );
	var width = Math.floor( 10 / w );
	for( var y = 0; y < h; y++ ) {
		// ===== ROW AND TIMELINE
		var row      = html.div.clone().addClass( 'row' );
		var timeline = html.div.clone().addClass( 'time col-xs-2' );
		var day      = schedule.day[ settings.current.day ];
		for( var hr = 0; hr < day.duration; hr++ ) {
			var ampm = 'AM';
			var hour = hr + day.start; if( hour >= 12 ) { if( hour > 12 ) { hour -= 12; } ampm = 'PM'; };
			var tick = html.div.clone().addClass( 'hour' ).html( `${ hour }:00 ${ ampm }` ).css({ top: (hr * 15 * scale.fourMinutes) + scale.top + 'px' });
			timeline.append( tick );
		}
		timeline.off( 'click' ).click(( ev ) => {
		});
		row.append( timeline );

		// ===== RINGS
		for( var x = 0; x < w; x++ ) {
			var i = (y * 6) + (x + 1);
			if( i > n ) { continue; }
			var ring = html.div.clone().addClass( `ring panel panel-primary col-xs-${width}` ).attr({ id : `ring-${i}` }).css({ padding: 0 });
			ring.append( html.h4.clone().addClass( 'panel-heading' ).html( `Ring ${i}` )).css({ 'margin' : 0 });
			ring.append( html.div.clone().addClass( 'schedule' ));
			row.append( ring );
		}
		$( '.pt-page-1 #schedule' ).append( row );
	}
	$( '.schedule' )
		.on( 'dragstart', dnd.handle.drag.start )
		.on( 'dragenter', dnd.handle.drag.enter )
		.on( 'dragover',  dnd.handle.drag.over )
		.on( 'dragleave', dnd.handle.drag.leave )
		.on( 'drop',      dnd.handle.drop )
		.on( 'dragend',   dnd.handle.drag.end )

	var day = schedule.day[ settings.current.day ];
	if( defined( day.plan )) {
		topOffset = {};
		Object.keys( day.plan ).forEach(( ringid ) => {
			topOffset[ ringid ] = scale.top + scale.padding;
			day.plan[ ringid ].forEach(( round ) => {
				var item = init.round( round, topOffset[ ringid ] );
				var ring = $( `#${ringid} .schedule` );
				ring.append( item );
				topOffset[ ringid ] += parseInt( item.attr( 'data-height' )) + scale.padding;
			});
		});
	} else {
		var topOffset = scale.top + scale.padding;
		settings.rounds[ settings.current.day ].forEach(( round ) => {
			var item = init.round( round, topOffset );
			$( '.pt-page-1 #ring-1 .schedule' ).append( item );
			topOffset += parseInt( item.attr( 'data-height' )) + scale.padding;
		});
	}
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

var mutexes = {};

var init = {
	timeline: ( update ) => {
		if( defined( update.schedule )) {
			update.schedule.day.forEach(( day, i ) => {
				if( ! defined( day.start ))    { schedule.day[ i ].start    = 9;  } // Default start at 9 AM
				if( ! defined( day.duration )) { schedule.day[ i ].duration = 10; } // Default work for 10 hours
			});
		}
	},
	mutexes: ( divisions ) => {
		var lookup = {};
		divisions.forEach(( division, i ) => { 
			var desc = division.description;
			lookup[ desc ] = division;
		});
		
		divisions.forEach(( division, i ) => { 
			var name = division.name;
			var desc = division.description;

			if( desc in rule.mutex ) {
				var list = rule.mutex[ desc ];
				list = list.filter(( el ) => { return (el in lookup); }).map( x => lookup[ x ].name);
				
				if( list.length > 0 ) {
					mutexes[ name ] = list;
				}
			}
		});
	},
	round: ( round, topOffset ) => {
		var rmap   = { finals: 'Finals', semfin: 'Semi-Finals', prelim: 'Prelim.' };
		var height = (round.round.match( /finals/i ) ? (2 * scale.fourMinutes * round.athletes) : (scale.fourMinutes * round.athletes)) + 'px';
		var gender = 'coed';
		if( round.description.match( /pair/i ))   { gender = 'coed'; } else 
		if( round.description.match( /female/i )) { gender = 'female'; } else 
		if( round.description.match( /male/i ))   { gender = 'male'; }

		// Make a copy without circular references (prev, next)
		var data = {};
		[ 'athletes', 'description', 'division', 'mutexes', 'round' ].forEach(( key ) => { data[ key ] = round[ key ]; });
		data = JSON.stringify( data );

		var div = html.div.clone()
			.addClass( 'round ' + gender )
			.attr({ 'draggable' : 'true', 'data-round' : data, 'data-divid': round.division, 'data-height' : height })
			.css({ height: height, top: topOffset, 'line-height': height })
			.html( `${round.description} ${rmap[ round.round ]} (${round.athletes})` );

		return div;
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

		var mutex = (name in mutexes) ? mutexes[ name ] : [];
		var k     = n > 8 ? 8 : n;
		rounds.push({ division : name, athletes: k, description: desc, round: 'finals', mutexes: mutex });
		if( n > 8 ) {
			var k      = Math.ceil( n/2 );
			var last   = rounds.length - 1;
			var finals = rounds[ last ];
			var semfin = { division: name, athletes: k, description: desc, round: 'semfin', mutexes: mutex };

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
				var flight = { division: name, athletes: k, description: desc, round: 'prelim', mutexes: mutex, flight: letter, flights: [] };

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

		init.mutexes( update.divisions );

		var width = Math.ceil( 12/update.schedule.days );
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
