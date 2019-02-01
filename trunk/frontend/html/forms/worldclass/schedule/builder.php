<script>
	var settings = { day : 0, divisions : {} };
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
handler.write.push(( update ) => {
	if( defined( update.divisions )) {
		update.divisions.forEach(( division, i ) => { 
			settings.divisions[ division.name ] = division; 
			settings.rounds[ division.name ] = []; // Generate the rounds and mark dependencies and mutually exclusive rounds
		});
	}

	if( defined( update.schedule )) {
		if( defined( update.schedule.time )) {
			schedule.time = update.schedule.time;
		} else {
			schedule.time = [];
			schedule.day.forEach(() => { schedule.time.push({ start : 9, duration : 10 }); });
		}
	}
	var n = tournament.rings.length;
	var w = n >= 6 ? 6 : n;
	var h = Math.ceil( n/6 );
	var width = Math.floor( 10 / w );
	for( var y = 0; y < h; y++ ) {
		var row      = html.div.clone().addClass( 'row' );
		var timeline = html.div.clone().addClass( 'time col-xs-2' );
		var time     = schedule.time[ settings.day ];
		for( var h = 0; h < time.duration; h++ ) {
			var ampm = 'AM';
			var hour = h + time.start; if( hour >= 12 ) { if( hour > 12 ) { hour -= 12; } ampm = 'PM'; };
			var tick = html.div.clone().addClass( 'hour' ).html( `${ hour }:00 ${ ampm }` ).css({ top: (h * 120) + 60 + 'px' });
			timeline.append( tick );
		}
		row.append( timeline );
		for( var x = 0; x < w; x++ ) {
			var i = (y * 6) + (x + 1);
			var ring = html.div.clone().addClass( `ring panel panel-primary col-xs-${width}` ).attr({ id : `ring${i}` }).css({ padding: 0 });
			ring.append( html.h4.clone().addClass( 'panel-heading' ).html( `Ring ${i}` )).css({ 'margin' : 0 });
			ring.append( html.ul.clone().addClass( 'list-group list-group-sortable-connected' ));
			row.append( ring );
		}
		$( '#schedule' ).append( row );
	}
});
</script>
