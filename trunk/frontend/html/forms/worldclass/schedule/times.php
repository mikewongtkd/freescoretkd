<div class="pt-page pt-page-2">
	<div class="container">
		<div class="page-header">Ring Availability and Time</div>
		<div>
			<div class="panel panel-primary">
				<h4 class="panel-heading">Settings</h4>
				<div class="panel-body">
					<div class="row">
						<div class="col-xs-4">
							<label for="rings-start">Rings shall start at</label><br>
							<input type="checkbox" data-toggle="toggle" id="rings-start" name="rings-start" data-on="Different Times" data-onstyle="success" data-off="the Same Time" data-offstyle="primary" />
						</div>
						<div class="col-xs-4">
						</div>
						<div class="col-xs-4">
						</div>
					</div>
				</div>
			</div>
			<div id="times">
			</div>
			<div>
				<button class="btn btn-success pull-right" id="accept-times"> Accept </button>
				<button class="btn btn-danger pull-right" id="cancel-times" style="margin-right: 40px;"> Cancel </button>
			</div>
		</div>
	</div>
</div>
<div class="panel panel-primary ring-times">
	<h4 class="panel-heading">Ring Settings</h4>
	<div class="panel-body">
		<table class="ring-settings">
		</table>
	</div>
</div>
<div class="timepicker-widget">
	<div class="input-group input-group-sm bootstrap-timepicker timepicker">
		<input type="text" class="form-control" value="9:00 AM">
		<span class="input-group-addon"><span class="glyphicon glyphicon-time"></span></span>
	</div>
</div>
<script>
template.times = $( '.ring-times' );
template.times.detach();
template.timepicker = $( '.timepicker-widget' );
template.timepicker.detach();

// ===== INITIALIZE DATE PICKER AND ENABLE ICON TO BRING UP CALENDAR WIDGET
var init = {
	times : ( day_i ) => {
		var rings = tournament.rings;
		var times = template.times.clone();
		var j     = day_i + 1;

		times.find( 'h4' ).html( `Day ${j}` );

		var table  = times.find( 'table.ring-settings' );
		var header = html.tr.clone();
		var blank  = html.th.clone().html( '&nbsp;' );
		header.append( blank );

		if( $( '#rings-start' ).prop( 'checked' )) {
			header.append( html.th.clone().html( 'Availability' ));
			header.append( html.th.clone().html( 'Start' ));
			header.append( html.th.clone().html( 'Stop' ));
			table.append( header );

			rings.forEach(( k ) => {
				var name      = `Ring ${k}`;
				var id        = `ring-${k}`;
				var tr        = html.tr.clone();
				var th        = html.th.clone().html( name );
				var active    = schedule.day[ day_i ].rings.find(( ring ) => { return ring.id == id; }) ? 'btn-success' : 'btn-primary';
				var available = html.td.clone().append( html.button.clone().addClass( `btn ${active} btn-sm ring-availability single-ring` ).attr({ 'data-day': j, 'data-ringid': id, 'data-ringname': name }).html( 'Available' ));
				var start     = html.td.clone().append( init.timepicker( `start day-${j}-${id}-start`, { day: j, ring: id }, '9:00 AM' ));
				var stop      = html.td.clone().append( init.timepicker( `stop  day-${j}-${id}-stop`,  { day: j, ring: id }, '6:00 PM' ));
				tr.append( th, available, start, stop );
				table.append( tr );
			});

		} else {
			header.append( html.th.clone().html( 'Availability' ));
			header.append( html.th.clone().html( 'Start' ));
			header.append( html.th.clone().html( 'Stop' ));
			table.append( header );

			var tr  = html.tr.clone();
			var start = html.th.clone().html( 'Rings' );
			tr.append( start );
			var available = html.div.clone().addClass( 'rings-available btn-group' );
			rings.forEach(( k ) => {
				var name   = `Ring ${k}`;
				var id     = `ring-${k}`;
				var active = schedule.day[ day_i ].rings.find(( ring ) => { return ring.id == id; }) ? 'btn-success' : 'btn-primary';
				var button = html.button.clone().addClass( `btn ${active} btn-sm ring-availability` ).attr( 'id', `day-${j}-${id}-available` ).attr({ 'data-day': j, 'data-ringid': id, 'data-ringname': name }).html( name.replace( /Ring\s+/, '' ) );
				available.append( button );
			});
			tr.append( available );
			tr.append( html.td.clone().append( init.timepicker( `start day-${j}-start`, { day: j }, '9:00 AM' )));
			tr.append( html.td.clone().append( init.timepicker( `stop  day-${j}-stop`,  { day: j }, '6:00 PM' )));
			table.append( tr );
		}

		return times;
	},
	timepicker : ( classes, ringday, time ) => {
		time = defined( time ) ? time : '9:00 AM';
		var timepicker = template.timepicker.clone();
		timepicker.timepicker({ defaultTime: time });
		var input = timepicker.find( 'input' );
		input.addClass( classes ).attr({ 'data-day' : ringday.day }).val( time );
		if( 'ring' in ringday ) { input.attr({ 'data-ring' : ringday.ring }); }
		timepicker.timepicker().off( 'changeTime.timepicker' ).on( 'changeTime.timepicker', ( ev ) => {
			var target = $( ev.target ).find( 'input' );
			target.val( ev.time.value );
		});
		return timepicker;
	}
};

// ===== TOGGLE BEHAVIOR
$( '#rings-start' ).off( 'change' ).on( 'change', ( ev ) => {
	console.log( $( '#rings-start' ).prop( 'checked' ));
	show.rings();
});

// ===== SHOW RINGS
show.rings = () => {
	$( '#times' ).empty();
	schedule.day.forEach(( day, i ) => {
		if( ! defined( day.rings )) { day.rings = tournament.rings.map(( i ) => { return { id: `ring-${i}`, name: `Ring ${i}`, plan:[], start: '9:00 AM' }; }); }
		var day_panel = init.times( i );
		$( '#times' ).append( day_panel );
	});

	// ===== AVAILABILITY BEHAVIOR
	$( '.ring-availability' ).off( 'click' ).click(( ev ) => {
		var target = $( ev.target );
		var ringid = target.attr( 'data-ringid' );
		var name   = target.attr( 'data-ringname' );
		var day    = target.attr( 'data-day' );
		var active = target.hasClass( 'btn-success' );

		if( active ) { target.removeClass( 'btn-success' ).addClass( 'btn-primary' ); alertify.message( `${name} is unavailable for day ${day}` ); } 
		else         { target.removeClass( 'btn-primary' ).addClass( 'btn-success' ); alertify.message( `${name} is available for day ${day}` ); }

		if( target.hasClass( 'single-ring' )) {
			if( active ) { target.html( 'Unavailable' ); } 
			else         { target.html( 'Available' ); }
		}
	});
};

// ===== PAGE BEHAVIOR
$( '#accept-times' ).off( 'click' ).click(( ev ) => {
	var days = $( '.list-group-sortable-connected.day' ).toArray().filter( day => { return ! $( day ).attr( 'id' ).match( /unscheduled/i ); });
	days.forEach(( day, i ) => {
		var j         = i + 1;
		var scheduled = $( days[ i ] ).children().map(( i, item ) => { var divid = $( item ).attr( 'data-divid' ); return divid; }).toArray();
		var time      = $( '.timepicker input' );
		if( defined( schedule.day[ i ] )) {
			schedule.day[ i ].start     = $( time[ i ]).val();
			schedule.day[ i ].divisions = scheduled;
		} else {
			schedule.day[ i ] = { start: '9:00 AM', divisions: scheduled };
		}
		var rings = schedule.day[ i ].rings;
		tournament.rings.forEach(( k ) => {
			var id     = `#day-${j}-ring-${k}-available`;
			var active = $( id ).hasClass( 'btn-success' );
			var l      = rings.findIndex(( ring ) => { return ring.id == `ring-${k}`; });
			if( active && l < 0 ) {
				rings.push({ id: `ring-${k}`, name: `Ring ${k}`, plan: []});

			} else if((! active) && l >= 0) {
				rings.splice( l, 1 );
			}
		});
	});
	schedule.teams = $( '#teams-grouped' ).prop( 'checked' ) ? 'groups' : 'individuals';
	sound.next.play();

	console.log( schedule );
	return;
	if( ws.readyState != ws.OPEN ) { alertify.error( 'Socket closed; malformed JSON is likely the cause' ); return; }
	var request = { data : { type : 'schedule', schedule: schedule, action : 'write' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
	console.log( request.json );
});

$( '#cancel-times' ).off( 'click' ).click(( ev ) => {
	sound.prev.play();
	page.transition();
});

// ===== ON MESSAGE BEHAVIOR
handler.read.schedule = ( update ) => {
	if( defined( update )) { 
		divisions = update.divisions;
		schedule.divisions = divisions.map(( division ) => {
			var simplified = {};
			[ 'name', 'description' ].forEach(( field ) => { simplified[ field ] = division[ field ]; });
			simplified.athletes = division.athletes.length;
			return simplified;
		});

		if( defined( update.schedule )) { 
			[ 'days', 'day', 'start', 'teams' ].forEach(( key ) => { schedule[ key ] = update.schedule[ key ]; });
			$( '#num-days' ).val( schedule.days );
			$( '#start-date' ).datepicker( 'setDate', new Date( schedule.start ));
			if( schedule.teams == 'groups' ) { $( '#teams-grouped' ).prop({ 'checked': 'checked' }); }
		}
	}
	show.days();
	show.rings();
};

handler.write.schedule = ( update ) => {
	alertify.confirm( 'Daily Schedule Saved', 'Daily schedule for divisions saved', () => { sound.send.play(); setTimeout( () => { window.location = 'build.php'; }, 1000 ); }, () => {}).setting({ reverseButtons : true });
	$( '.ajs-header' ).css({ color: '#fff', 'background-color': '#337ab7', 'border-color': '337ab7', 'font-weight': 'bold' });
};
</script>

