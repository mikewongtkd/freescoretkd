<div class="pt-page pt-page-1">
	<div class="container">
		<div class="page-header"> Sport Poomsae Scheduler</div>
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
<div class="panel panel-primary competition-day">
	<div class="panel-heading">
		<h4 class="panel-title">Day</h4>
		<a class="btn btn-xs btn-info pull-right disabled">Move to Day</a>
	</div>
	<div class="panel-body">
		<form role="form">
			<div class="form-group">
				<input class="form-control day-search" type="search" placeholder="Search Day" />
			</div>
			<ul class="list-group list-group-sortable-connected day">
			</ul>
		</form>
	</div>
</div>
<script>
var template = {};
template.day = $( '.competition-day' );
template.day.detach();

show.day = ( id, name ) => {
	var day = template.day.clone();
	day.attr({ id : id });
	day.find( '.panel-title' ).html( `${name} Divisions` );
	day.find( '.panel-heading .btn' ).html( `Move to ${name}` ).attr({ 'data-target' : `${id} ul` });
	var list   = day.find( '.list-group.day' ).attr({ id: `${id}-schedule` });
	var search = day.find( 'input.day-search' ).attr({ placeholder : `Search ${name}`, id: `${id}-search` });
	list.btsListFilter( search, { resetOnBlur: false, itemFilter: ( item, text ) => { 
		var contents = $( item ).text(); 
		var re = new RegExp( text, 'i' ); 
		if( contents.match( re )) { 
			if( text ) { $( item ).addClass( 'active' ); }  else { $( item ).removeClass( 'active' ); }
			var others = $( '.list-group' ).not( list );
			if( $( 'a.list-group-item.active' ).length > 0 ) {
				others.parents( '.panel' ).find( '.panel-heading' ).children( 'a').removeClass( 'disabled' );
			} else {
				others.parents( '.panel' ).find( '.panel-heading' ).children( 'a').addClass( 'disabled' );
			}
			return true; 
		}
	}});
	return day;
};

show.days = () => {
	$( '#divisions' ).empty();
	$( '#days' ).empty();

	var unscheduled = show.day( 'unscheduled', 'Unscheduled' );
	$( '#divisions' ).append( unscheduled );
	for( var i = 0; i < schedule.days; i++ ) {
		var j   = i + 1;
		var day = show.day( `day-${j}`, `Day ${j}` );
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
		if( schedule.days == 1 ) { list = $( '#day-1 ul' ); }      // There's only one day, schedule all divisions for that day
		else                     { list = $( '#unscheduled ul' );} // Multiple days; need to make decisions
		schedule.divisions.forEach(( division, i ) => {
			list.append( html.a.clone().addClass( 'list-group-item' ).attr({ draggable: 'true', 'data-divid': division.name }).html( `${division.name.toUpperCase()}&nbsp;${division.description}<span class="badge">${division.athletes.length}</span>` ));
		});
	}

	$( '.list-group-sortable-connected' ).sortable({ placeholderClass: 'list-group-item', connectWith: '.connected' });

	// ===== LIST GROUP ITEM SELECTION BEHAVIOR
	$( 'a.list-group-item' ).off( 'click' ).click(( ev ) => {
		var target = $( ev.target );
		target.toggleClass( 'active' );
		var list   = target.parent();
		var others = $( '.list-group' ).not( list );
		others.children().removeClass( 'active' );
		if( $( 'a.list-group-item.active' ).length > 0 ) {
			others.parents( '.panel' ).find( '.panel-heading' ).children( 'a' ).removeClass( 'disabled' );
		} else {
			others.parents( '.panel' ).find( '.panel-heading' ).children( 'a' ).addClass( 'disabled' );
		}
		list.siblings( '.panel-heading' ).children( 'a' ).addClass( 'disabled' );
	});

	// ===== MOVE TO BUTTON BEHAVIOR
	$( '.panel-heading a' ).off( 'click' ).click(( ev ) => {
		var target = $( ev.target );
		var list   = $( '#' + target.attr( 'data-target' ));
		var items  = $( 'a.list-group-item.active' );
		items.detach();
		list.append( items );
		items.removeClass( 'active' );
		$( '.panel-heading a' ).addClass( 'disabled' );
		$( '.day-search' ).siblings( '.btn' ).click();
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

