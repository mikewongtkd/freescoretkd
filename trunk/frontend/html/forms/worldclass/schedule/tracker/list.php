<div class="pt-page pt-page-1">
	<div class="container">
		<div class="page-header">
			<div>Divisions</div>
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

// ===== ON MESSAGE BEHAVIOR
handler.read.schedule = ( update ) => {
	if( ! defined( update )) { return; }
	if( ! defined( update.schedule )) { return ; }

	schedule   = update.schedule;
	var i      = getDay();
	var blocks = Object.values( schedule.blocks ).filter(( block ) => { return block.day == i; });

	blocks = blocks.sort(( a, b ) => { 
		let at = new Date( `${schedule.start} ${a.start}` );
		let bt = new Date( `${schedule.start} ${b.start}` );
		return at > bt ? 1 : at < bt ? -1 : 0;
	});

	$( '#block-list tbody' ).empty();
	let rmap = { prelim : 'Prelim.', semfin : 'Semi-Finals', finals : 'Finals' };

	blocks.forEach(( block ) => {
		let rname = rmap[ block.round ];
		let row = `<tr><td>${block.division.toUpperCase()}</td><td><span class="description">${block.description}</span> <span class="round">${rname}</span></td><td>${block.athletes}</td><td>${block.start}</td><td>${block.ring.replace( /\-/, ' ' ).capitalize()}</td><td>On Time</td></tr>`;
		$( '#block-list tbody' ).append( row );
	});
};

</script>

