<div class="pt-page pt-page-1">
	<div class="container">
		<div class="page-header">
			<div><img class="header-logo" src="../../../images/icons/freestyle/basic-movements.png"> World Class Sport Poomsae Divisions</div>
		</div>
		<div class="block-information">
			<table id="block-list">
				<thead>
					<tr><th>Div. ID</th><th>Round</th><th>Description</th><th>Start</th><th>Ring</th><th>Athletes</th><th>Status</th></tr>
				</thead>
				<tbody>
				</tbody>
			</table>
		</div>
		<div class="holding-information">
			<div id="holding-list">
			</div>
		</div>
	</div>
</div>
<div class="holding-item">
	<div class="panel panel-primary">
		<div class="panel-heading"><h4>Division</h4></div>
		<div class="panel-body">
			<ol class="athletes">
			</ol>
		</div>
	</div>
</div>
<script>

template.holding = { item : $( '.holding-item' ).detach() };

var getDay = ( schedule ) => {
	return 1;
}

var sort = {
	by: {
		time: ( schedule ) => { return ( a, b ) => {
			let at = new Date( `${schedule.start} ${a.start}` );
			let bt = new Date( `${schedule.start} ${b.start}` );
			let t  = at > bt ? 1 : at < bt ? -1 : 0;
			let n  = a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
			return t || n;
		}}
	}
};

var filter = {
	by: {
		day: ( day ) => { return ( block ) => { return block.day == day; };},
		now: () => { 
			return ( block ) => {
				let now    = new Date();
				let late   = (new Date()).setHours( now.getHours() +1 );
				let start  = new Date( `${$('#date').text()} ${block.start}` );
				let before = start >= now;
				let after  = start < late;

				return before && after;
			}
		},
		recent: () => { 
			return ( block ) => {
				let now    = new Date();
				let early  = (new Date()).setHours( now.getHours() -1 );
				let late   = (new Date()).setHours( now.getHours() +2 );
				let start  = new Date( `${$('#date').text()} ${block.start}` );
				let before = start > early;
				let after  = start < late;

				return before && after;
			}
		}
	}
};

// ===== ON MESSAGE BEHAVIOR
handler.read.schedule = ( update ) => {
	if( ! defined( update )) { return; }
	if( ! defined( update.divisions )) { return; }
	if( ! defined( update.schedule  )) { return ; }

	schedule   = update.schedule;
	divisions  = {};
	update.divisions.forEach(( div ) => { divisions[ div.name ] = new Division( div ); });
	var i      = getDay();
	var by     = { day: filter.by.day( i ), time: sort.by.time( schedule ), now: filter.by.now(), recent: filter.by.recent() };
	var blocks = Object.values( schedule.blocks ).filter( by.day ).filter( by.recent );

	blocks = blocks.sort( by.time );

	$( '#block-list tbody' ).empty();
	let rmap = { prelim : 'Prelim.', semfin : 'Semi-Finals', finals : 'Finals' };

	blocks.forEach(( block ) => {
		let states   = {}; // Early (est. time), On Time, Delayed (est. time), In Progress, Finished
		let rname    = rmap[ block.round ];
		let divid    = block.division;
		let division = divisions[ divid ];
		let round    = block.round
		let stat     = division.round.is.complete( round ) ? 'Finished' : 'On Time';
		let row = `<tr><td>${block.division.toUpperCase()}</td><td><span class="round">${rname}</span></td><td><span class="description">${block.description}</span></td><td>${block.start}</td><td>${block.ring.replace( /\-/, ' ' ).capitalize()}</td><td>${block.athletes}</td><td>${stat}</td></tr>`;
		$( '#block-list tbody' ).append( row );
	});

	let holding = blocks.filter( by.now );
	$( '#holding-list' ).empty();
	let x       = holding.length > 4 ? 4 : holding.length;
	let y       = holding.length > 4 ? Math.ceil( holding.length / 4 ) : 1;
	let width   = Math.floor( 12/x );
	let row     = undefined;

	holding.forEach(( block, i ) => {
		if( i % 4 == 0 ) {
			row = html.div.clone().addClass( 'row' );
			$( '#holding-list' ).append( row );
		}

		let divid    = block.division;
		let division = divisions[ divid ];
		let round    = block.round;
		let athletes = division.current.athletes( round );
		let display  = template.holding.item.clone();
		display.addClass( `col-xs-${width}` );
		display.find( '.panel-heading h4' ).html( division.summary());

		athletes.forEach(( athlete ) => {
			display.find( '.athletes' ).append( `<li>${athlete.display.name()}</li>` );
		});

		row.append( display );
	});
};

</script>

