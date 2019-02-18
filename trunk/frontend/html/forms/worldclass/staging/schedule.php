<div class="pt-page pt-page-1">
	<div class="container">
		<div class="page-header"> Schedule </div>
		<div>
			<div class="panel panel-primary">
				<h4 class="panel-heading" style="margin-top: 0">Settings</h4>
				<div class="panel-body">
					<p>Drag-and-drop individual divisions to the desired day, or to <i>Unscheduled Divisions</i>. You can also click to select one or more divisions and then click on a <i>Move</i> button to move those divisions to the desired day.</p>
					<label for="num-days">Number of days of competition:</label>&nbsp;<input type="number" id="num-days" name="num-days" value=1 min=1 max=20 style="width: 40px;">&nbsp;
					<label for="teams-grouped">Registration for Pairs and Teams</label>&nbsp;<input type="checkbox" data-toggle="toggle" id="teams-grouped" name="teams-grouped" data-on="In Groups" data-onstyle="success" data-off="As Individuals" data-offstyle="primary">
				</div>
			</div>
			<div class="row">
				<div class="col-xs-4" id="divisions">
					<div class="panel panel-primary">
						<h4 class="panel-heading" style="margin: 0;">Unscheduled Divisions<a class="btn btn-xs btn-info pull-right disabled">Unschedule</a></h4>
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
		day.append( html.h4.clone().addClass( 'panel-heading' ).html( `Day ${ i + 1 }<a class="btn btn-xs btn-info pull-right disabled">Move to Day ${ i + 1 }</a>` ).css({ 'margin' : 0 }));
		day.append( html.ul.clone().addClass( 'list-group list-group-sortable-connected day' ).attr({ id: `day-${ i + 1 }-schedule` }));
		$( '#days' ).append( day );
	}

	if( schedule.day.length > 0 ) {
		schedule.day.forEach(( day, i ) => {
			var list = $( `#day-${i + 1} ul` );
			day.divisions.forEach(( divid, j ) => {
				var division = schedule.divisions.find(( el ) => { return el.name == divid; });
				list.append( html.a.clone().addClass( 'list-group-item' ).attr({ draggable: 'true', 'data-divid': division.name }).html( `${division.name.toUpperCase()}&nbsp;${division.description}<span class="badge">${division.athletes.length}</span>` ));
			});
		});
	} else {
		var list = undefined;
		$( 'ul' ).empty();
		if( schedule.days == 1 ) { list = $( '#day-1 ul' ); }             // There's only one day, schedule all divisions for that day
		else                     { list = $( '#unscheduled-divisions' );} // Multiple days; need to make decisions
		schedule.divisions.forEach(( division, i ) => {
			list.append( html.a.clone().addClass( 'list-group-item' ).attr({ draggable: 'true', 'data-divid': division.name }).html( `${division.name.toUpperCase()}&nbsp;${division.description}<span class="badge">${division.athletes.length}</span>` ));
		});
	}

	$( '.list-group-sortable-connected' ).sortable({ placeholderClass: 'list-group-item', connectWith: '.connected' });

	$( 'a.list-group-item' ).off( 'click' ).click(( ev ) => {
		var target = $( ev.target );
		target.toggleClass( 'active' );
		var list   = target.parent();
		var others = $( '.list-group' ).not( list );
		others.children().removeClass( 'active' );
		if( $( 'a.list-group-item.active' ).length > 0 ) {
			others.siblings( '.panel-heading' ).children( 'a' ).removeClass( 'disabled' );
		} else {
			others.siblings( '.panel-heading' ).children( 'a' ).addClass( 'disabled' );
		}
		list.siblings( '.panel-heading' ).children( 'a' ).addClass( 'disabled' );
	});

	$( '.panel-heading a' ).off( 'click' ).click(( ev ) => {
		var target = $( ev.target );
		var list   = target.parent().parent().children( 'ul.list-group' );
		var items  = $( 'a.list-group-item.active' );
		items.detach();
		list.append( items );
		items.removeClass( 'active' );
		$( '.panel-heading a' ).addClass( 'disabled' );
	});
}

// ===== PAGE BEHAVIOR
$( '#num-days' ).change(( ev ) => {
	schedule.days = $( '#num-days' ).val();
	show.days();
});

$( '#accept-settings' ).off( 'click' ).click(( ev ) => {
	var lists = $( '.list-group-sortable-connected.day' );
	for( var i = 0; i < lists.length; i++ ) {
		var divisions = $( lists[ i ] ).children().map(( i, item ) => { var divid = $( item ).attr( 'data-divid' ); return divid; }).toArray();
		if( defined( schedule.day[ i ] )) {
			schedule.day[ i ].divisions = divisions;
		} else {
			schedule.day[ i ] = { divisions: divisions };
		}
	}
	schedule.teams = $( '#teams-grouped' ).prop( 'checked' ) ? 'groups' : 'individuals';

	var request = { data : { type : 'schedule', schedule: schedule, action : 'write' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );

	page.transition( 2 );
});

$( '#cancel-settings' ).off( 'click' ).click(( ev ) => {
	window.location = '../../../index.php';
});

// ===== ON MESSAGE BEHAVIOR
handler.read[ 'settings' ] = ( update ) => {
	if( defined( update )) { 
		schedule.divisions = update.divisions; 
		if( defined( update.schedule )) { 
			[ 'days', 'day', 'teams' ].forEach(( key ) => { schedule[ key ] = update.schedule[ key ]; });
			$( '#num-days' ).val( schedule.days );
			if( schedule.teams == 'groups' ) { $( '#teams-grouped' ).prop({ 'checked': 'checked' }); }
		}
	}
	show.days();
};
</script>

