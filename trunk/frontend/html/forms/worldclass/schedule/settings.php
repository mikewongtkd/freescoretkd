<script>
	var settings = { days : 1, day: [] };
</script>
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
	for( var i = 0; i < settings.days; i++ ) {
		var day = html.div.clone().addClass( 'panel panel-primary' ).attr({ id: `day-${ i + 1 }` });
		day.append( html.h4.clone().addClass( 'panel-heading' ).html( `Day ${ i + 1 }` ).css({ 'margin' : 0 }));
		day.append( html.ul.clone().addClass( 'list-group list-group-sortable-connected schedule' ).attr({ id: `day-${ i + 1 }-schedule` }));
		$( '#days' ).append( day );
	}

	var list = undefined;
	if( settings.days == 1 ) {
		alertify.notify( 'To unschedule a division, drag-and-drop the division from Day 1 to Unscheduled Divisions.', 20 );
	} else {
		alertify.notify( 'To schedule a division, drag-and-drop the divisions below to the desired day.', 20 );
	}
	var list = (settings.days == 1) ? $( '#day-1 ul' ) : $( '#unscheduled-divisions' );
	settings.divisions.forEach(( division, i ) => {
		list.append( html.li.clone().addClass( 'list-group-item' ).attr({ draggable: 'true', 'data-index': i }).html( division.description ));
	});
	$( '.list-group-sortable-connected' ).sortable({ placeholderClass: 'list-group-item', connectWith: '.connected' });
}

// ===== PAGE BEHAVIOR
$( '#num-days' ).change(( ev ) => {
	settings.days = $( '#num-days' ).val();
	show.days();
});

$( '#accept-settings' ).off( 'click' ).click(( ev ) => {
	var lists = $( '.list-group-sortable-connected.schedule' );
	for( var i = 0; i < lists.length; i++ ) {
		var schedule = $( lists[ i ] ).children().map(( i, item ) => { var j = $( item ).attr( 'data-index' ); return settings.divisions[ j ] }).toArray();
		settings.day[ i ] = schedule;
	}
	page.transition( 2 );
});

$( '#cancel-settings' ).off( 'click' ).click(( ev ) => {
	window.location = '../../../index.php';
});

// ===== ON MESSAGE BEHAVIOR
handler.read = ( update ) => {
	if( defined( update )) { settings.divisions = update.divisions; }
	show.days();
};
</script>

