<div class="pt-page pt-page-1">
	<div class="container">
		<div class="page-header">Schedule Divisions For Each Day</div>
		<div>
			<div class="panel panel-primary">
				<h4 class="panel-heading">Settings</h4>
				<div class="panel-body">
					<p>Drag-and-drop individual divisions to the desired day, or to <i>Unscheduled Divisions</i>. You can also click to select one or more divisions and then click on a <i>Move</i> button to move those divisions to the desired day.</p>
					<div class="row">
						<div class="col-xs-4">
							<label for="start-date">Starting date of competition:</label>
							<div class="input-group date" style="width: 200px;"><input type="text" id="start-date" name="start-date" class="form-control datepicker" /><span class="input-group-addon"><span class="glyphicon glyphicon-th calendar-icon"></span></span></div>
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
		<div class="day-settings">
			<a class="btn btn-xs btn-info disabled">Move to Day</a>
		</div>
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

	$( '.competition-day' ).each(( i, list ) => {
		var start = new Date( schedule.start );
		var id    = $( list ).attr( 'id' );
		if( id == 'unscheduled' ) { return; }
		var j     = parseInt( id.replace( /day-/, '' ));

		var dow   = $.format.date( start.setDate( start.getDate() + (j - 1 )), 'ddd' );
		var name  = defined( schedule.start ) ? `Day ${i} [${dow}] Divisions` : `Day ${j}`;
		$( list ).find( '.panel-title' ).html( name );
	});
});

show.day = ( id, name, start ) => {
	var day    = template.day.clone();
	var target = name; 
	target     = target.replace( /\s*Divisions$/, '' );
	target     = target.replace( /\s*\[\w+\]\s*/, '' );

	day.attr({ id : id });
	day.find( '.panel-title' ).html( name );
	day.find( '.day-settings .btn' ).html( `Move to ${target}` ).attr({ 'data-target' : `${id} ul` });
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
				others.parents( '.panel' ).find( '.day-settings' ).children( 'a').removeClass( 'disabled' );
			} else {
				others.parents( '.panel' ).find( '.day-settings' ).children( 'a').addClass( 'disabled' );
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
	var days = $( '#num-days' ).val();
	var last = days - 1;
	schedule.days = schedule.days.splice( 0, days );
	while( schedule.days.length < days ) { schedule.days.push({ divisions: [], start: '9:00 AM' }); }

	var unscheduled = show.day( 'unscheduled', 'Unscheduled Divisions' );
	$( '#divisions' ).append( unscheduled );
	for( var i = 0; i < days; i++ ) {
		var j     = i + 1;
		var id    = `day-${j}`;
		var start = new Date( schedule.start );
		var dow   = $.format.date( start.setDate( start.getDate() + i ), 'ddd' );
		var name  = defined( schedule.start ) ? `Day ${j} [${dow}] Divisions` : `Day ${j} Divisions`;
		var day   = show.day( id, name, schedule.days[ i ].start );
		$( '#days' ).append( day );
	}

	// ===== SHOW THE SCHEDULE, IF ONE EXISTS
	if( schedule.days.length > 0 ) {
		unscheduled.divisions = schedule.divisions.slice(); // Copy the current divisions
		schedule.days.forEach(( day, i ) => {
			var list = $( `#day-${i + 1} ul` );
			// day.divisions are a list of divids
			day.divisions.sort().forEach(( divid, j ) => {
				var d = unscheduled.divisions.findIndex(( el ) => { return el.name == divid; });
				if( d >= 0 ) {
					// The division is scheduled, remove it from the unscheduled list
					var division = (unscheduled.divisions.splice( d, 1 ))[0]; 
					list.append( html.a.clone().addClass( 'list-group-item' ).attr({ draggable: 'true', 'data-divid': division.name }).html( `${division.name.toUpperCase()}&nbsp;${division.description}<span class="badge">${division.athletes}</span>` ));
				} else {
					alertify.error( `Previously scheduled division ${divid.toUpperCase()} not found; will remove ${divid.toUpperCase()} from the schedule` );
				}
			});
		});
		unscheduled.divisions.sort( by.divid ).forEach(( division ) => {
			unscheduled.find( 'ul' ).append( html.a.clone().addClass( 'list-group-item' ).attr({ draggable: 'true', 'data-divid': division.name }).html( `${division.name.toUpperCase()}&nbsp;${division.description}<span class="badge">${division.athletes}</span>` ));
		});

	// ===== BUILD A BASIC SCHEDULE TO START WITH
	} else {
		var list = undefined;
		$( 'ul' ).empty();
		if( days == 1 ) { list = $( '#day-1 ul' ); }      // There's only one day, schedule all divisions for that day
		else            { list = $( '#unscheduled ul' );} // Multiple days; need to make decisions
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
			others.parents( '.panel' ).find( '.day-settings' ).children( 'a' ).removeClass( 'disabled' );
		} else {
			others.parents( '.panel' ).find( '.day-settings' ).children( 'a' ).addClass( 'disabled' );
		}
		list.siblings( '.day-settings' ).children( 'a' ).addClass( 'disabled' );
	});

	// ===== MOVE TO BUTTON BEHAVIOR
	$( '.day-settings a' ).off( 'click' ).click(( ev ) => {
		var target = $( ev.target );
		var list   = $( '#' + target.attr( 'data-target' ));
		var items  = $( 'a.list-group-item.active' );
		items.detach();
		list.append( items );
		items.removeClass( 'active' );
		$( '.day-settings a' ).addClass( 'disabled' );
		$( '.day-search' ).siblings( '.btn' ).click();
	});
}

// ===== PAGE BEHAVIOR
$( '#num-days' ).change(( ev ) => {
	show.days();
	show.rings();
});

$( '#accept-settings' ).off( 'click' ).click(( ev ) => {
	sound.next.play();
	page.transition();
});

$( '#cancel-settings' ).off( 'click' ).click(( ev ) => {
	sound.prev.play();
	setTimeout( () => { window.location = '../../../index.php'; }, 1000 );
});

// ============================================================
var simplify = ( divisions ) => {
// ============================================================
	var simplified = [];
	var group      = {};

	// Collect flights into division groups
	divisions.forEach(( division ) => {
		var div = {};
		[ 'name', 'description', 'flight', 'forms', 'round' ].forEach(( field ) => { if( ! defined( division[ field ] )) { return; } div[ field ] = division[ field ]; });
		Object.keys( div.forms ).forEach(( round ) => { div.forms[ round ] = div.forms[ round ].length; });
		if( defined( div.flight )) { div.name = div.name.replace( /[A-Za-z]$/, '' ); }
		div.athletes = division.athletes.length;
		if( defined( group[ div.name ])) { group[ div.name ].push( div ); } else { group[ div.name ] = [ div ]; }
	});

	// Consolidate division groups into divisions
	Object.keys( group ).forEach(( divid ) => {
		var divisions = group[ divid ];
		var division  = divisions[ 0 ];
		if( divisions.length == 1 ) { simplified.push( division ); return; }
		if( ! defined( division.flight )) { alertify.error( `Non-flight duplicate of ${divid}` ); return; }
		var flights   = [];
		var sum       = 0;
		divisions.forEach(( d ) => {
			var flight = d.flight;
			flights.push({ id: flight.id, athletes: d.athletes });
			sum += d.athletes;
		});
		division.flight   = flights;
		division.athletes = sum;

		simplified.push( division );
	});

	return simplified;
}

// ===== ON MESSAGE BEHAVIOR
handler.read.schedule = ( update ) => {
	if( defined( update )) { 
		schedule.divisions = simplify( update.divisions );

		if( defined( update.schedule )) { 
			Object.keys( update.schedule ).filter( key => key != 'divisions' ).forEach(( key ) => { schedule[ key ] = update.schedule[ key ]; });
			var days = schedule.days.length;
			$( '#num-days' ).val( days );
			$( '#start-date' ).datepicker( 'setDate', new Date( schedule.start ));
			if( schedule.teams == 'groups' ) { $( '#teams-grouped' ).prop({ 'checked': 'checked' }); }
			if( schedule.asynchronous ) { $( '#asynchronous' ).bootstrapToggle( 'on' ); };
			schedule.days.forEach(( day, i ) => {
				var j     = i + 1;
				var start = `.day-${j}-start`;
				var stop  = `.day-${j}-stop`;
				$( start ).val( day.start );
				$( stop ).val( day.stop );

				if( schedule.asynchronous ) {
					var inactive = day.rings.map( x => x.id );
					day.rings.forEach(( ring, k ) => {
						if( ! defined( ring.start )) { return; }
						var l = k + 1;
						var start = `.day-${j}-ring-${l}-start`;
						var stop  = `.day-${j}-ring-${l}-stop`;
						$( start ).val( ring.start );
						$( stop ).val( ring.stop );
					});
				}
			});
		}
	}
	show.days();
	show.rings();
};

</script>

