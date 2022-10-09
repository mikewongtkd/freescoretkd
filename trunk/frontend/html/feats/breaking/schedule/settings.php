<div class="pt-page pt-page-1 page-checkin">
	<div class="page-header">
		<div class="page-header-content">Schedule Settings</div>
	</div>
	<div>
		<div class="panel panel-primary">
			<h4 class="panel-heading">Settings</h4>
			<div class="panel-body">
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
			<button class="btn btn-success pull-right" id="accept-settings"> Next </button>
			<button class="btn btn-danger pull-right" id="cancel-settings" style="margin-right: 40px;"> Cancel </button>
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

</div>
<script>

template.day = $( '.competition-day' );
template.day.detach();

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

handle.ring.read = ( update ) => {
}

</script>
