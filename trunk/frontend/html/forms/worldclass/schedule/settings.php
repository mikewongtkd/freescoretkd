<div class="pt-page pt-page-1">
	<div class="container">
		<div class="page-header"> Sport Poomsae Scheduler</div>
		<div>
			<div class="panel panel-primary">
				<h4 class="panel-heading" style="margin-top: 0">Settings</h4>
				<div class="panel-body">
					<label for="num-days">Number of days of competition:</label>&nbsp;<input type="number" id="num-days" name="num-days" value=1 min=1 max=20 style="width: 40px;">
				</div>
			</div>
			<div class="row">
				<div class="col-xs-4" id="divisions">
					<div class="panel panel-primary">
						<h4 class="panel-heading" style="margin: 0;">Unscheduled Divisions</h4>
						<ul class="list-group list-group-sortable-connected" id="unscheduled-divisions">
						</ul>
					</div>
				</div>
				<div class="col-xs-8" id="days">
				</div>
			</div>
			<div>
				<button class="btn btn-success pull-right" id="accept-settings"> Accept </button>
				<button class="btn btn-danger pull-right" id="cancel-settings" style="margin-right: 40px;"> Cancel </button>
			</div>
		</div>
	</div>
</div>
<script>

show.days = () => {
	$( '#days' ).empty();
	for( var i = 0; i < schedule.days; i++ ) {
		var day = html.div.clone().addClass( 'panel panel-primary' ).attr({ id: `day-${ i + 1 }` });
		day.append( html.h4.clone().addClass( 'panel-heading' ).html( `Day ${ i + 1 }` ).css({ 'margin' : 0 }));
		day.append( html.ul.clone().addClass( 'list-group list-group-sortable-connected schedule' ).attr({ id: `day-${ i + 1 }-schedule` }));
		$( '#days' ).append( day );
	}

	if( schedule.day.length > 0 ) {
	} else {
		var list = undefined;
		if( schedule.days == 1 ) { list = $( '#day-1 ul' );              alertify.notify( 'To unschedule a division, drag-and-drop the division from Day 1 to Unscheduled Divisions.', 20 ); } 
		else                     { list = $( '#unscheduled-divisions' ); alertify.notify( 'To schedule a division, drag-and-drop the divisions below to the desired day.', 20 ); }
	}

	schedule.divisions.forEach(( division, i ) => {
		list.append( html.li.clone().addClass( 'list-group-item' ).attr({ draggable: 'true', 'data-index': i }).html( division.description ));
	});
	$( '.list-group-sortable-connected' ).sortable({ placeholderClass: 'list-group-item', connectWith: '.connected' });
}

// ===== PAGE BEHAVIOR
$( '#num-days' ).change(( ev ) => {
	schedule.days = $( '#num-days' ).val();
	show.days();
});

$( '#accept-settings' ).off( 'click' ).click(( ev ) => {
	var lists = $( '.list-group-sortable-connected.schedule' );
	for( var i = 0; i < lists.length; i++ ) {
		var day = $( lists[ i ] ).children().map(( i, item ) => { var j = $( item ).attr( 'data-index' ); var division = schedule.divisions[ j ]; return division.name; }).toArray();
		schedule.day[ i ] = day;
	}

	var request = { data : { type : 'schedule', schedule: schedule, action : 'write' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );

	page.transition( 2 );
});

$( '#cancel-settings' ).off( 'click' ).click(( ev ) => {
	window.location = '../../../index.php';
});

// ===== ON MESSAGE BEHAVIOR
handler.read.push(( update ) => {
	if( defined( update )) { schedule.divisions = update.divisions; if( defined( update.schedule )) { schedule.days = update.schedule.days; }}
	show.days();
});
</script>

