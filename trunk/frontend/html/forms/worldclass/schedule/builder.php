<script>
	var settings = { day : 0, divisions : {}, rounds: {} };
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
	for( var y = 0; y < h; y++ ) {
		// ===== ROW AND TIMELINE
		var row      = html.div.clone().addClass( 'row' );
		var timeline = html.div.clone().addClass( 'time col-xs-2' );
		var time     = schedule.time[ settings.day ];
		for( var hr = 0; hr < time.duration; hr++ ) {
			var ampm = 'AM';
			var hour = hr + time.start; if( hour >= 12 ) { if( hour > 12 ) { hour -= 12; } ampm = 'PM'; };
			var tick = html.div.clone().addClass( 'hour' ).html( `${ hour }:00 ${ ampm }` ).css({ top: (hr * 120) + 60 + 'px' });
			timeline.append( tick );
		}
		row.append( timeline );

		// ===== RINGS
		for( var x = 0; x < w; x++ ) {
			var i = (y * 6) + (x + 1);
			if( i > n ) { continue; }
			var ring = html.div.clone().addClass( `ring panel panel-primary col-xs-${width}` ).attr({ id : `ring${i}` }).css({ padding: 0 });
			ring.append( html.h4.clone().addClass( 'panel-heading' ).html( `Ring ${i}` )).css({ 'margin' : 0 });
			ring.append( html.ul.clone().addClass( 'list-group list-group-sortable-connected' ));
			row.append( ring );
		}
		$( '#schedule' ).append( row );
	}
};

var rule = {
	mutex : {
	}
};

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
	rounds: ( division ) => {
		
	},
	divisions: ( update ) => {
		if( ! defined( update.divisions )) { return; }

		update.divisions.forEach(( division, i ) => { 
			var name = division.name;
			settings.divisions[ name ] = division; 
			settings.rounds[ name ]    = init.rounds( division );
		});
	}
};

handler.write[ 'builder' ] = ( update ) => {
	init.rounds( update );
	init.timeline( update );
	show.daySchedule();

};
</script>
