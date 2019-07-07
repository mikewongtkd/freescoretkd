<div class="pt-page pt-page-2">
	<div class="page-header">
		<div><img class="header-logo" src="../../../images/icons/freestyle/basic-movements.png"> World Class Sport Poomsae</div>
		<div class="screen-name">Division Athletes List</div>
	</div>
	<div class="holding-information">
		<div id="holding-list">
		</div>
	</div>
</div>
<div class="holding-item">
	<div class="panel panel-primary">
		<div class="panel-heading"><h4>Division</h4></div>
		<div class="panel-body">
			<div class="flighted"></div>
			<ol class="athletes">
			</ol>
		</div>
	</div>
</div>
<script>

template.holding = { item : $( '.holding-item' ).detach() };

show.athletes = ( blocks ) => {

	let by      = { now: filter.by.now() };
	let holding = blocks.filter( by.now );

	$( '#holding-list' ).empty();
	let max     = 3;
	let n       = holding.length;
	let x       = n > max ? max : n;
	let y       = n > max ? Math.ceil( n / max ) : 1;
	let width   = Math.floor( 12 / x );
	let height  = Math.floor( 100 / y );
	let row     = undefined;
	let i       = 0;
	let shown   = {};

	holding.forEach(( block ) => {
		if( i % max == 0 ) {
			row = html.div.clone().addClass( 'row' );
			$( '#holding-list' ).append( row );
		}

		let divid    = block.division + block.flight;
		let division = undefined;
		let flighted = true;
		
		if( divid in divisions ) { division = divisions[ divid ]; }
		else {
			divid = divid.replace( /[A-Za-z]$/, '' );
			if( divid in divisions ) { division = divisions[ divid ]; flighted = false; }
		}

		if( ! defined( division )) { return; }
		if( shown[ divid ]) { return; }

		let round    = block.round;
		let athletes = division.current.athletes( round );
		let display  = template.holding.item.clone().css({ height : `${height}%` });
		display.addClass( `col-xs-${width}` );
		display.find( '.panel-heading h4' ).html( division.summary());
		if( ! flighted ) { display.find( '.flighted' ).html( 'Not yet flighted' ); }

		athletes.forEach(( athlete ) => {
			display.find( '.athletes' ).append( `<li>${athlete.name()}</li>` );
		});

		row.append( display );
		shown[ divid ] = true;
		i++;
	});
}

// ===== ON MESSAGE BEHAVIOR
handler.read.schedule = ( update ) => {
	if( ! defined( update )) { return; }
	if( ! defined( update.divisions )) { return; }
	if( ! defined( update.schedule  )) { return ; }

	schedule   = update.schedule;
	divisions  = {};
	update.divisions.forEach(( div ) => { let divid = div.name; divisions[ divid ] = new Division( div ); });

	// Set Day
	let d = new Date();
	let s = new Date( schedule.start );
	settings.day = d.getDate() - s.getDate() + 1;
	settings.day = 2; // MW DEBUGGING

	let by     = { day: filter.by.day(), recent: filter.by.recent(), time: sort.by.time( schedule ) };
	let blocks = Object.values( schedule.blocks ).filter( by.day ).filter( by.recent ).sort( by.time );

	show.list( blocks );
	show.athletes( blocks );
};

</script>

