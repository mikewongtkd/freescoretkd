<script>
	var settings = { day : 0, divisions : {}, rounds: [] };
</script>
<div class="pt-page pt-page-2">
	<div class="container">
		<div class="page-header"> Sport Poomsae Schedule Builder </div>
		<div>
			<div id="schedule">
			</div>
		</div>
	</div>
</div>

<script>
show.daySchedule = () => {
	$( '#schedule' ).empty();
	var n = tournament.rings.length;
	var w = n >= 6 ? 6 : n;
	var h = Math.ceil( n/6 );
	var width = Math.floor( 10 / w );
	var rmap  = { finals: 'Finals', semfin: 'Semi-Finals', prelim: 'Prelim.' };
	for( var y = 0; y < h; y++ ) {
		// ===== ROW AND TIMELINE
		var row      = html.div.clone().addClass( 'row' );
		var timeline = html.div.clone().addClass( 'time col-xs-2' );
		var time     = schedule.time[ settings.day ];
		for( var hr = 0; hr < time.duration; hr++ ) {
			var ampm = 'AM';
			var hour = hr + time.start; if( hour >= 12 ) { if( hour > 12 ) { hour -= 12; } ampm = 'PM'; };
			var tick = html.div.clone().addClass( 'hour' ).html( `${ hour }:00 ${ ampm }` ).css({ top: (hr * 240) + 60 + 'px' });
			timeline.append( tick );
		}
		row.append( timeline );

		// ===== RINGS
		for( var x = 0; x < w; x++ ) {
			var i = (y * 6) + (x + 1);
			if( i > n ) { continue; }
			var ring = html.div.clone().addClass( `ring panel panel-primary col-xs-${width}` ).attr({ id : `ring-${i}` }).css({ padding: 0 });
			ring.append( html.h4.clone().addClass( 'panel-heading' ).html( `Ring ${i}` )).css({ 'margin' : 0 });
			ring.append( html.ul.clone().addClass( 'list-group list-group-sortable-connected' ));
			row.append( ring );
		}
		$( '#schedule' ).append( row );
	}

	settings.rounds.forEach(( round ) => {
		var li = html.li.clone()
			.addClass( 'list-group-item round' )
			.css({ height: (round.athletes * 16) + 'px' })
			.html( `${round.description}<br>${rmap[ round.round ]} (${round.athletes})<br>` );
		$( '#ring-1 ul' ).append( li );
	});
	$( '.list-group-sortable-connected' ).sortable({ placeholderClass: 'list-group-item', connectWith: '.connected' });
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
			if( defined( update.schedule.time )) {
				schedule.time = update.schedule.time;
			} else {
				schedule.time = [];
				schedule.day.forEach(() => { schedule.time.push({ start : 9, duration : 10 }); });
			}
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
	rounds: ( division ) => {
		var rounds = [];
		var name   = division.name;
		var desc   = division.description;
		var n      = division.athletes.length;

		// If the pairs and teams registered as individuals, divide
		if( schedule.teams.match( /individual/i )) {
			if     ( desc.match( /pair/i ))       { n = Math.ceil( n/2 ); }
			else if( desc.match( /team/i ))       { n = Math.ceil( n/3 ); }
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
		if( n > 20 ) {
			var last    = rounds.length - 1;
			var semfin  = rounds[ last ];
			var f       = 1; // flights
			var flights = [];

			if     ( n < 24 ) { f = 1; }
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

		update.divisions.forEach(( division, i ) => { 
			var name   = division.name;
			var rounds = init.rounds( division );

			settings.divisions[ name ] = division; 
			settings.rounds            = settings.rounds.concat( rounds );
		});
	}
};

handler.write[ 'builder' ] = ( update ) => {
	init.divisions( update );
	init.timeline( update );
	show.daySchedule();

};
</script>
