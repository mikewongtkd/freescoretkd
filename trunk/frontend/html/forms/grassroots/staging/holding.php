<div class="pt-page pt-page-1 page-checkin">
	<div class="page-header">
		<div class="page-header-content">Athlete Check-in and Holding <div class="pull-right clock"></div> <div id="checkin-actions" class="btn-group pull-right"><a id="show-staging" class="btn btn-xs btn-primary"><span class="fas fa-walking"></span> Go to Staging</a><a id="show-display" class="btn btn-xs btn-primary"><span class="fas fa-desktop"></span> Show Display</a><a id="announcer" class="btn btn-xs btn-success"> Announcer Disabled</a></div></div>
	</div>
	<h2>Divisions Being Called to Holding</h2>
	<table class="divisions-view">
	</table>
	<h2>Athletes Being Called to Holding</h2>
	<table class="athletes-view">
	</table>
</div>
<script>
var registration = undefined;
var clock        = undefined;

$(() => {
	if( clock ) { clearInterval( clock ); }
	clock = setInterval(() => { 
		request = { data : { type : 'schedule', action : 'read' }};
		request.json = JSON.stringify( request.data );
		server.grassroots.send( request.json );
	}, 30000 ); // Refresh every 30 seconds
});

$( '#show-staging' ).off( 'click' ).click(( ev ) => { page.transition( 2 ); });

var divView = $(`<?php include( 'div-view.php' )?>`);
var handle  = { schedule : {}, ring: {} };

handle.schedule.read = ( update ) => {
	let registration  = new Registration( update.schedule );
	let today         = moment().format( 'MMM D, YYYY' );
	let events        = registration.events;
	// let now           = moment( `${today} 8:58 AM` );
	let now           = moment().subtract( 5, 'hours' );
	let holding       = [];
	let staged        = [];
	let announcements = [ 
		{ num: 1, start: now.clone().add( 30, 'minutes' ), stop: now.clone().add( 35, 'minutes' )}, 
		{ num: 2, start: now.clone().add( 15, 'minutes' ), stop: now.clone().add( 20, 'minutes' )}, 
		{ num: 3, start: now.clone().add( 5,  'minutes' ), stop: now.clone().add( 10, 'minutes' )}
	];

	$( '.clock' ).html( now.format( 'h:mm A' ));

	// ===== ANNOUNCER
	for( let announcement of announcements ) {
		events.forEach( ev => {
			let divisions = ev.divisions;
			divisions.forEach( div => {
				if( ! div.start.isSameOrAfter( announcement.start )) { return; }
				if( ! div.start.isBefore( announcement.stop ))       { return; }
				announcer.call( div, announcement.num ); 
			});
		});
	}

	// ===== CALL TO HOLDING
	events.forEach( ev => {
		let divisions = ev.divisions;
		divisions.forEach( div => {
			let deadline = div.start.diff( now, 'minutes' );
			if( deadline < 0   ) { return; }                     // Ignore divisions that too old
			if( div.staged )     { staged.push( div ); return; } // Ignore divisions that are already staged (sent to rings)
			if( deadline > 30 )  { return; }                     // Ignore divisions that are too far into the future

			if( deadline <= 5  ) { holding.push({ div: div, deadline: deadline, priority: 0 }); return; }
			if( deadline <= 15 ) { holding.push({ div: div, deadline: deadline, priority: 1 }); return; }
			if( deadline <= 30 ) { holding.push({ div: div, deadline: deadline, priority: 2 }); return; }
		});
	});

	// ===== DIVISIONS BEING CALLED TO HOLDING
	holding = holding.sort(( a, b ) => a.deadline - b.deadline );
	$( '.page-checkin .divisions-view' ).empty();
	let width  = 4;
	let height = Math.ceil( holding.length / width );
	let remove = ( athlete, division, from ) => {
		let button = html.button.clone().addClass( 'btn btn-xs btn-default' ).css({ 'line-height' : '10pt' });
		button.append( athlete.name, '&nbsp;<span class="fas fa-times" style="margin-left: 4px;"></span>' );
		if( from == 'ready' ) {
			button.off( 'click' ).click(( ev ) => {
				athlete.checkout( division );

				let schedule = JSON.stringify( registration ).replace( /"_/g, '"' );
				request = { data : { type : 'schedule', action : 'write', schedule: schedule }};
				request.json = JSON.stringify( request.data );
				server.grassroots.send( request.json );
			});

		} else if( from == 'pending' ) {
			button.off( 'click' ).click(( ev ) => {
				athlete.missing( division );

				let schedule = JSON.stringify( registration ).replace( /"_/g, '"' );
				request = { data : { type : 'schedule', action : 'write', schedule: schedule }};
				request.json = JSON.stringify( request.data );
				server.grassroots.send( request.json );
			});

		} else if( from == 'missing' ) {
			button.off( 'click' ).click(( ev ) => {
				athlete.checkout( division );

				let schedule = JSON.stringify( registration ).replace( /"_/g, '"' );
				request = { data : { type : 'schedule', action : 'write', schedule: schedule }};
				request.json = JSON.stringify( request.data );
				server.grassroots.send( request.json );
			});
		}
		return button;
	};

	for( let y = 0; y < height; y++ ) {
		let row = html.tr.clone();
		for( let x = 0; x < width; x++ ) {
			let i = y * 4 + x;
			if( i >= holding.length ) { continue; }
			let staging  = holding[ i ];
			let div      = staging.div;
			let ev       = div.event;
			let bgcolor  = [ 'danger', 'warning', 'success' ][ staging.priority ];
			let view     = divView.clone();
			let delta    = moment.duration( div.start.diff( now ));
			let athletes = div.athletes;
			let ready    = athletes.filter( a => a.hasCheckedIn( div )).sort(( a, b ) => a.lastName.localeCompare( b.lastName ));
			let pending  = athletes.filter( a => ! a.hasCheckedIn( div ) && a.isHere( div )).sort(( a, b ) => a.lastName.localeCompare( b.lastName ));
			let missing  = athletes.filter( a => ! a.isHere( div )).sort(( a, b ) => a.lastName.localeCompare( b.lastName ));
			view.find( '.division-view' )     .addClass( `bg-${bgcolor}` );
			view.find( '.division-summary' )  .html( `<span class="divid">${div.id.toUpperCase()}</span>&nbsp;&nbsp;<span class="description">${ev}</span>` );
			view.find( '.division-start' )    .html( `${div.start.format( 'h:mm A' )}<br><span class="remaining">${delta.humanize()}</span>` );
			if( ready.length   > 0 ) { let list = html.div.clone().addClass( 'athlete-list' ).append( ready   .map( a => remove( a, div, 'ready'   ))); view.find( '.athletes .ready' )   .append( '<b>Checked-in:</b><br>', list ); }
			if( pending.length > 0 ) { let list = html.div.clone().addClass( 'athlete-list' ).append( pending .map( a => remove( a, div, 'pending' ))); view.find( '.athletes .pending' ) .append( '<b>Waiting for:</b><br>', list ); }
			if( missing.length > 0 ) { let list = html.div.clone().addClass( 'athlete-list' ).append( missing .map( a => remove( a, div, 'missing' ))); view.find( '.athletes .missing' ) .append( '<b>No Show:</b><br>', list ); }
			view.find( '.athletes .event' ) .html( div.description );
			view.find( '.athletes .count' ) .html( pending.length );
			view.find( '.athletes .ring' )  .hide();
			view.find( '.division-actions .add-athlete' )
				.off( 'click' )
				.click(( ev ) => {
					alertify.prompt( `Add Athlete to ${div.summary}`, 'Type athlete\'s name below', 'Name', ( ev, val ) => {
						div.add( val );

						let schedule = JSON.stringify( registration ).replace( /"_/g, '"' );
						request = { data : { type : 'schedule', action : 'write', schedule: schedule }};
						request.json = JSON.stringify( request.data );
						server.grassroots.send( request.json );
					}, () => {} );
				});

			// ===== ALL ATHLETES ACCOUNTED FOR: READY TO SEND TO RINGS
			if( pending.length == 0 ) {
				view.find( '.athletes .checkin-status' )
					.html( `<span class="fas fa-walking"></span><span class="ring">Ring ${div.ring}</span>` )
					.removeClass( 'disabled' )
					.off( 'click' )
					.click(( ev ) => {
						div.sendToRing();
						
						let schedule = JSON.stringify( registration ).replace( /"_/g, '"' );
						request = { data : { type : 'schedule', action : 'stage', schedule: schedule, division: div.id, to: div.ring }}; // 'ring' keyword is fixed to staging
						console.log( request.data );
						request.json = JSON.stringify( request.data );
						server.grassroots.send( request.json );
					});

			} else {
				view.find( '.division-actions .edit-division' ).addClass( 'disabled' );
				view.find( '.athletes .checkin-status' ).addClass( 'disabled' );
			}
			row.append( view );

		}
		$( '.page-checkin .divisions-view' ).append( row );
	}
	
	// ===== ATHLETES BEING CALLED TO HOLDING
	// Collate the athletes and group their divisions for each athlete
	let athletes = {};
	holding.forEach( staging => {
		staging.div.athletes.forEach( athlete => {
			let id = athlete.id;
			if( athletes[ id ]) { athletes[ id ].divisions.push({ priority: staging.priority, id: staging.div.id }); } 
			else                { athletes[ id ] = { athlete: athlete, divisions: [ { priority: staging.priority, id: staging.div.id } ]}; }
		});
	});
	$( '.page-checkin .athletes-view' ).empty();
	let checkins = Object.values( athletes ).sort(( a, b ) => a.athlete.lastName.localeCompare( b.athlete.lastName || a.name.localeCompare( b.name )));
	let pending  = checkins.filter( checkin => ! checkin.divisions.every( division => checkin.athlete.hasCheckedIn( division )));

	height = Math.ceil( pending.length / width );

	let row = html.tr.clone();
	for( let x = 0; x < width; x++ ) {
		let col  = html.td.clone();
		let ul   = html.ul.clone().addClass( 'list-group' );
		let list = pending.splice( 0, height );

		list.forEach( checkin => {
			let li      = html.li.clone().addClass( 'list-group-item' );
			let bg      = html.div.clone().addClass( 'pull-right' );
			let athlete = checkin.athlete;

			checkin.divisions.forEach( division => {
				let bgcolor = [ 'danger', 'warning', 'success' ][ division.priority ];
				let button  = html.button.clone().addClass( `btn-xs btn-${bgcolor}` ).html( division.id.toUpperCase());
				button.off( 'click' ).click(() => {
					athlete.checkin( division );

					let schedule = JSON.stringify( registration ).replace( /"_/g, '"' );
					request = { data : { type : 'schedule', action : 'write', schedule: schedule }};
					request.json = JSON.stringify( request.data );
					server.grassroots.send( request.json );
				});
				if( ! athlete.hasCheckedIn( division )) { bg.append( button ); }
			});
			if( (bg.children()).length > 0 ) { 
				li.append( athlete.name, bg );
				ul.append( li );
			}
		});
		col.append( ul );
		row.append( col );
	}
	$( '.page-checkin .athletes-view' ).append( row );
}

handle.ring.update = ( update ) => {
	update.request.schedule = JSON.parse( update.request.schedule );
	handle.schedule.read( update.request );
}

</script>
