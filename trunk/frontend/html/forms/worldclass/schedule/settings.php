<div class="pt-page pt-page-1">
	<div class="container">
		<div class="page-header"> Sport Poomsae Scheduler</div>
		<div>
			<div class="panel panel-primary">
				<h4 class="panel-heading" style="margin-top: 0">Settings</h4>
				<div class="panel-body">
					<p>Drag-and-drop individual divisions to the desired day, or to <i>Unscheduled Divisions</i>. You can also click to select one or more divisions and then click on a <i>Move</i> button to move those divisions to the desired day.</p>
					<div class="row">
						<div class="col-xs-4">
							<label for="start-date">Starting date of competition:</label>
							<div class="input-group date"><input type="text" id="start-date" name="start-date" class="form-control datepicker" /><span class="input-group-addon"><span class="glyphicon glyphicon-th calendar-icon"></span></span></div>
						</div>
						<div class="col-xs-4">
							<label for="num-days">Number of days of competition:</label><br>
							<input type="number" id="num-days" name="num-days" value=1 min=1 max=20 style="width: 40px;" />
						</div>
						<div class="col-xs-4">
							<label for="teams-grouped">Registration for Pairs and Teams</label><br>
							<input type="checkbox" data-toggle="toggle" id="teams-grouped" name="teams-grouped" data-on="In Groups" data-onstyle="success" data-off="As Individuals" data-offstyle="primary" />
						</div>
					</div>
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

// ===== INITIALIZE DATE PICKER AND ENABLE ICON TO BRING UP CALENDAR WIDGET
$( '.datepicker' ).datepicker();
$( '.date' ).find( '.input-group-addon' ).off( 'click' ).click(( ev ) => {
	var target = $( ev.target );
	if( ! target.hasClass( 'input-group-addon' )) { target = target.parents( '.input-group-addon' ); }
	target.parent( '.date' ).find( '.datepicker' ).focus();
});
$( '.datepicker' ).off( 'changeDate' ).on( 'changeDate', ( ev ) => {
	var target = $( ev.target );
	schedule.start = $.format.date( target.datepicker( 'getDate' ), 'MM/dd/yyyy' );

	var start = new Date( schedule.start );
	$( '.competition-day' ).each(( i, list ) => {
		var id = $( list ).attr( 'id' );
		if( id == 'unscheduled' ) { return; }
		var j     = parseInt( id.replace( /day-/, '' ));

		var dow   = $.format.date( start.setDate( start.getDate() + (j - 1 )), 'ddd' );
		var name  = defined( schedule.start ) ? `Day ${i} [${dow}] Divisions` : `Day ${j}`;
		$( list ).find( '.panel-title' ).html( name );
	});
});

show.day = ( id, name ) => {
	var day    = template.day.clone();
	var target = name; 
	target     = target.replace( /\s*Divisions$/, '' );
	target     = target.replace( /\s*\[\w+\]\s*/, '' );
	day.attr({ id : id });
	day.find( '.panel-title' ).html( name );
	day.find( '.panel-heading .btn' ).html( `Move to ${target}` ).attr({ 'data-target' : `${id} ul` });
	var list   = day.find( '.list-group.day' ).attr({ id: `${id}-schedule` });
	var search = day.find( 'input.day-search' ).attr({ placeholder : `Search ${target} Divisions`, id: `${id}-search` });
	day.find( 'form' ).keypress(( ev ) => { if( ev.which == '13' ) { ev.preventDefault(); }}); // Disable Enter key
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

var by = { divid: ( a, b ) => { return a.name < b.name ? -1 : (a.name == b.name ? 0 : 1); }};

show.days = () => {
	$( '#divisions' ).empty();
	$( '#days' ).empty();

	var unscheduled = show.day( 'unscheduled', 'Unscheduled Divisions' );
	$( '#divisions' ).append( unscheduled );
	for( var i = 0; i < schedule.days; i++ ) {
		var j   = i + 1;
		var id    = `day-${j}`;
		var start = new Date( schedule.start );
		var dow   = $.format.date( start.setDate( start.getDate() + i ), 'ddd' );
		var name  = defined( schedule.start ) ? `Day ${j} [${dow}] Divisions` : `Day ${j} Divisions`;
		var day   = show.day( id, name );
		$( '#days' ).append( day );
	}

	// ===== SHOW THE SCHEDULE, IF ONE EXISTS
	if( schedule.day.length > 0 ) {
		unscheduled.divisions = divisions.slice(); // Copy the current divisions
		schedule.day.forEach(( day, i ) => {
			var list = $( `#day-${i + 1} ul` );
			// day.divisions are a list of divids
			day.divisions.sort().forEach(( divid, j ) => {
				var d = unscheduled.divisions.findIndex(( el ) => { return el.name == divid; });
				if( d >= 0 ) {
					// The division is scheduled, remove it from the unscheduled list
					var division = (unscheduled.divisions.splice( d, 1 ))[0]; 
					list.append( html.a.clone().addClass( 'list-group-item' ).attr({ draggable: 'true', 'data-divid': division.name }).html( `${division.name.toUpperCase()}&nbsp;${division.description}<span class="badge">${division.athletes.length}</span>` ));
				} else {
					alertify.error( `Division ${divid.toUpperCase()} not found; will not schedule ${divid.toUpperCase()}` );
				}
			});
		});
		unscheduled.divisions.sort( by.divid ).forEach(( division ) => {
			unscheduled.find( 'ul' ).append( html.a.clone().addClass( 'list-group-item' ).attr({ draggable: 'true', 'data-divid': division.name }).html( `${division.name.toUpperCase()}&nbsp;${division.description}<span class="badge">${division.athletes.length}</span>` ));
		});

	// ===== BUILD A BASIC SCHEDULE TO START WITH
	} else {
		var list = undefined;
		$( 'ul' ).empty();
		if( schedule.days == 1 ) { list = $( '#day-1 ul' ); }      // There's only one day, schedule all divisions for that day
		else                     { list = $( '#unscheduled ul' );} // Multiple days; need to make decisions
		schedule.divisions.sort( by.divid ).forEach(( division, i ) => {
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
		var scheduled = $( lists[ i ] ).children().map(( i, item ) => { var divid = $( item ).attr( 'data-divid' ); return divid; }).toArray();
		if( defined( schedule.day[ i ] )) {
			schedule.day[ i ].divisions = scheduled;
		} else {
			schedule.day[ i ] = { divisions: scheduled };
		}
	}
	schedule.teams = $( '#teams-grouped' ).prop( 'checked' ) ? 'groups' : 'individuals';
	sound.next.play();

	if( ws.readyState != ws.OPEN ) { alertify.error( 'Socket closed; malformed JSON is likely the cause' ); return; }
	var request = { data : { type : 'schedule', schedule: schedule, action : 'write' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
	console.log( request.json );
});

$( '#cancel-settings' ).off( 'click' ).click(( ev ) => {
	sound.prev.play();
	setTimeout( () => { window.location = '../../../index.php'; }, 1000 );
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
};

handler.write.schedule = ( update ) => {
	alertify.confirm( 'Daily Schedule Saved', 'Daily schedule for divisions saved', () => { sound.send.play(); setTimeout( () => { window.location = 'build.php'; }, 1000 ); }, () => {}).setting({ reverseButtons : true });
	$( '.ajs-header' ).css({ color: '#fff', 'background-color': '#337ab7', 'border-color': '337ab7', 'font-weight': 'bold' });
};
</script>

