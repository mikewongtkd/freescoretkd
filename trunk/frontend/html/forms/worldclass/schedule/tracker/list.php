<div class="pt-page pt-page-1">
	<div class="page-header">
		<div><img class="header-logo" src="../../../images/icons/freestyle/basic-movements.png"> World Class Sport Poomsae Divisions</div>
		<div class="screen-name">Ring and Start Time</div>
	</div>
	<div class="block-information">
		<table id="block-list">
			<thead>
				<tr><th>Div. ID</th><th>Round</th><th>Description</th><th>Ring</th><th>Start</th><th>Athletes</th><th>Status</th></tr>
			</thead>
			<tbody>
			</tbody>
		</table>
	</div>
</div>
<script>

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
		day: () => { return ( block ) => { return block.day == settings.day; };},
		now: () => { 
			return ( block ) => {
				let now    = new Date();
				now.setHours( 9 ); now.setMinutes( 4 ); // MW DEBUG
				let early  = (new Date( now )).setHours( now.getHours() -1 );
				let late   = (new Date( now )).setMinutes( now.getMinutes() +30 );
				let start  = new Date( `${format.date( now )} ${block.start}` );
				let before = start >= early;
				let after  = start < late;

				return before && after;
			}
		},
		recent: () => { 
			return ( block ) => {
				// let now    = new Date();
				let now    = new Date( `${schedule.start} 9:04 AM` );
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

var format = { date: ( date ) => { return $.format.date( date, 'M/d/yyyy' ); }, time: ( time ) => { return $.format.date( time, ' M/d/yyyy h:mm a' ); }};

show.list = ( blocks ) => {
	$( '#block-list tbody' ).empty();
	let rmap = { prelim : 'Prelim.', semfin : 'Semi-Finals', finals : 'Finals' };

	blocks.forEach(( block ) => {
		let states   = {}; // Early (est. time), On Time, Delayed (est. time), In Progress, Finished
		let rname    = rmap[ block.round ];
		let divid    = block.division + block.flight;
		let division = divisions[ divid ];
		let round    = block.round
		let stat     = undefined;

		if( defined( division )) {
			if( division.round.is.complete( round )) {
				stat = 'Finished';
			} else {
				stat = 'On Time'; // Do time calculation
			}
		} else {
			stat = 'On Time'; // Do time calculation
		}

		let desc  = `<span class="description">${block.description}</span>` + (block.flight ? ` <span class="flight">Flight ${block.flight.toUpperCase()}</span>` : '');
		let ring  = block.ring.replace( /\-/, ' ' ).capitalize();
		let start = block.start.toLowerCase().replace( /([ap]m)/, '<span class="ampm">$1</span>' );
		let row   = `<tr><td>${divid.toUpperCase()}</td><td><span class="round">${rname}</span></td><td>${desc}</td><td>${ring}</td><td>${start}</td><td>${block.athletes}</td><td>${stat}</td></tr>`;
		$( '#block-list tbody' ).append( row );
	});
};
</script>

