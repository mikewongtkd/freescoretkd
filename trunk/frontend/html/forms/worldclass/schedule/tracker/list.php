<div class="pt-page pt-page-1">
	<div class="container">
		<div class="page-header">
			<div><img class="header-logo" src="../../../images/icons/freestyle/basic-movements.png"> World Class Sport Poomsae Divisions</div>
		</div>
			<table id="block-list">
				<thead>
					<tr><th>ID</th><th>Description</th><th>Athletes</th><th>Start</th><th>Ring</th><th>Status</th></tr>
				</thead>
				<tbody>
				</tbody>
			</table>
		</div>
	</div>
</div>
<script>

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
	if( ! defined( update.schedule )) { return ; }

	schedule   = update.schedule;
	var i      = getDay();
	var by     = { day: filter.by.day( i ), time: sort.by.time( schedule ), recent: filter.by.recent() };
	var blocks = Object.values( schedule.blocks ).filter( by.day ).filter( by.recent );

	blocks = blocks.sort( by.time );

	$( '#block-list tbody' ).empty();
	let rmap = { prelim : 'Prelim.', semfin : 'Semi-Finals', finals : 'Finals' };

	blocks.forEach(( block ) => {
		let rname = rmap[ block.round ];
		let row = `<tr><td>${block.division.toUpperCase()}</td><td><span class="description">${block.description}</span> <span class="round">${rname}</span></td><td>${block.athletes}</td><td>${block.start}</td><td>${block.ring.replace( /\-/, ' ' ).capitalize()}</td><td>On Time</td></tr>`;
		$( '#block-list tbody' ).append( row );
	});
};

</script>

