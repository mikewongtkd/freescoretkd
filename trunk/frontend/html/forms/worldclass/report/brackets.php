<?php 
	include( __DIR__ . './../../../session.php' );
	include( __DIR__ . '/../../../include/php/config.php' ); 

	$divid = isset( $_GET[ 'divid' ]) ? $_GET[ 'divid' ] : null;
	$ring  = isset( $_GET[ 'ring' ])  ? $_GET[ 'ring' ]  : $_COOKIE[ 'ring' ];
	if( ! isset( $ring )) { $ring = 'staging'; }
?>
<html>
	<head>
		<link href="../../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/themes/default.min.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../../include/alertify/alertify.min.js"></script>
		<script src="../../../include/js/freescore.js"></script>
		<script src="../../../include/js/forms/worldclass/form.class.js"></script>
		<script src="../../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../../include/js/forms/worldclass/division.class.js"></script>
		<style>

.division { page-break-before: avoid; page-break-inside: avoid; page-break-after: always; }
table { page-break-inside: avoid; }
table .order { width: 5%; text-align: center; padding: 4px; }
table .name { width: 60%; padding: 4px; }
table .usatid { width: 35%; padding: 4px; }
table .cell4 { font-size: 9pt; width: 25%;   }
table .cell3 { font-size: 9pt; width: 33.3%; }
table .cell2 { font-size: 9pt; width: 50%;   }
.matchnum {
	font-size: 6pt; 
	position: absolute; 
	top: 50%; 
	right: 0.5em; 
	transform: translateX( 60% ) translateY( -5% ); 
	border: 1px solid #999; 
	background-color: white !important; 
	padding: 2px 4px 2px 4px; 
	border-radius: 8px; 
}
.forms { font-size: 7pt; }
		</style>
	</head>
	<body>
		<div id="report-tabular" class="container"></div>
		<script type="text/javascript">
			var tournament = <?= $tournament ?>;
			var ring       = { num : 1 };
			var ws         = new WebSocket( `<?= $config->websocket( 'worldclass', $ring ) ?>` );
			var network    = { reconnect: 0 };
			var divisions  = [];
			var pairteam   = /(?:pair|team)/i;

			network.send = data => {
					let request  = { data };
					request.json = JSON.stringify( request.data );
					ws.send( request.json );
			};

			var display = {
				bracket : {
					athlete: ( division, aid, table, col, row ) => {
						let id = `#${division.name()}-${col}-${row}`;
						if( defined( aid )) {
							let athlete = division.athlete( aid );
							table.find( id ).html( athlete.name() );

						} else {
							table.find( id ).html( '<i>BYE</i>' );

						}
					},
					line: ( division, table, line, col, row ) => {
						let color  = '1px solid #999';
						let id     = `#${division.name}-${col}-${row}`;
						table.find( id ).css( `border-${line}`, color );
					},
					tree: ( division, table, cols, rows ) => {
						let depth = (cols - 1);
						let n     = 2 ** depth;
						let div   = new Division( division );

						// ===== DRAW THE LINES
						for( let j = 0; j < rows; j++ ) {
							for( let i = 0; i < cols - 1; i++ ) {

								// Bottom lines
								let mod    = 2 ** (i + 1);
								let offset = (2 ** i) - 1;
								let draw   = j % mod == offset;

								if( draw ) { display.bracket.line( division, table, 'bottom', i, j ); }

								// Vertical lines
								mod = 2 ** (i + 2);
								let min = 2 ** i;
								let max = min * 3;
								draw = j % mod >= min && j % mod < max;

								if( draw ) { display.bracket.line( division, table, 'left', i + 1, j ); }
							}
							let mod    = 2 ** (cols - 1);
							let offset = mod - 1;

							// First place line
							if( j % mod == offset ) { display.bracket.line( division, table, 'bottom', (cols - 1), j ); }
						}

						// ===== DRAW THE MATCHES
						let mcoords = {
							ro8 : [[ 0, 1 ], [ 0, 9 ], [ 0, 5 ], [ 0, 13 ], [ 1, 3 ], [ 1, 11 ], [ 2, 7 ]],
							ro4 : [[ 0, 1 ], [ 0, 5 ], [ 1, 3 ]],
							ro2 : [[ 0, 1 ]]
						};
						let start   = `ro${n}`;
						let mcoord  = mcoords[ start ];
						let matches = div.bracket.matches( start );
						for( let mnum = 1; mnum < n; mnum++ ) {
							let [ i, j ] = mcoord[ mnum - 1 ];
							let id       = `#${division.name}-${i}-${j}`;
							table.find( id ).html( `<div class="matchnum">Match ${mnum}</div>` ).css({ 'position' : 'relative' });
							let match  = mnum <= matches.length ? matches[ mnum - 1 ] : null;
							if( match ) {
								display.bracket.athlete( div, match.chung, table, i, j - 1 );
								display.bracket.athlete( div, match.hong,  table, i, j + 1 );
							}
						}
					}
				},
				results : {
					table : division => {
						if( <?= $divid === null ? 'false' : "division.name != '{$divid}'" ?> ) { return; }
						if( <?= $ring  == 'staging' ? 'false' : "division.ring != {$ring}" ?> ) { return; }
						let summary = `<h3>${division.name.toUpperCase()}: ${division.description}</h3>`;
						let tables  = [];
						let n       = division.athletes.length;
						let rounds  = division.rounds.map( code => { return { code, name: FreeScore.round.name[ code ]}; });
						
						// ============================================================
						// SINGLE ELIMINATION BRACKET TREE
						// ============================================================
						if( rounds.find( round => round.code.match( /^ro/ ))) {
							let start = 0;
							let table = $( '<table width="100%" style="margin-top: 2em; margin-bottom: 2em;" />' );
							let thead = $( '<thead />' );
							let tbody = $( '<tbody />' );
							let first = rounds.find( round => round.code.match( /^ro/ ) && division.order?.[ round.code ]);
							let size  = parseInt( first?.code?.replace( /^ro/, '' ));
							let depth = Math.ceil( Math.log( size ) / Math.log( 2 ));
							let rows  = (size * 2) - 1;
							let cols  = depth + 1;
							let tr    = $( '<tr />' );

							for( let i = 0; i < cols; i++ ) {
								if( i < cols - 1 ) {
									let round = rounds[ i ];
									let id    = `${division.name}-${round.code}`;
									let th    = $( `<th class="cell${cols}" id="${id}" style="padding-bottom: 2em;">${round.name}</th>` );
									tr.append( th );
								} else {
									let id = `${division.name}-1st-place`;
									let th = $( `<th class="cell${cols}" id="${id}" style="padding-bottom: 2em;">First Place</th>` );
									tr.append( th );
								}
							}
							thead.append( tr );

							for( let j = 0; j < rows; j++ ) {
								let tr = $( '<tr />' );
								for( let i = 0; i < cols; i++ ) {
									let id = `${division.name}-${i}-${j}`;
									let td = $( `<td class="cell${cols}" id="${id}">&nbsp;</td>` );
									tr.append( td );
								}
								tbody.append( tr );
							}

							table.append( thead, tbody );

							let draw = {
							};
							let line = '1px solid #999';
							display.bracket.tree( division, table, cols, rows );

							tables.push( table );
						}

						// ============================================================
						// DIVISION LIST
						// ============================================================
						rounds.forEach( round => {
							if( ! division.order?.[ round.code ]) { return; }

							let table = $( '<table width="100%" />' );
							let thead = $( '<thead />' );
							let tbody = $( '<tbody />' );
							if( division.description.match( pairteam )) {
								thead.append( '<tr><th class="order"><th class="name">Names</th><th class="usatid">USAT IDs</th></tr>' );
							} else {
								thead.append( '<tr><th class="order"><th class="name">Name</th><th class="usatid">USAT ID</th></tr>' );
							}
							table.append( thead, tbody );

							let athletes = division.order?.[ round.code ].map( aid => division.athletes[ aid ]);

							athletes.forEach(( athlete, i ) => {
								let j        = i > 0 ? i - 1 : null;
								let k        = i < athletes.length ? i + 1 : null;
								let prev     = j === null ? null : athletes[ j ];
								let next     = k === null ? null : athletes[ k ];
								let num      = `${i + 1}.`;
								let name     = athlete.name;
								let usatid   = athlete?.info?.usatid ? athlete.info.usatid : '';
								tbody.append( `<tr><td>${num}</td><td class="name">${name}</td><td class="usatid">${usatid}</td></tr>` );
							});
							tables.push( table );
						});

						// Placement table
						let table = $( '<table class="table" style="position: relative; left: 66.6%; right: 0; width: 33.3%"/>' );
						let thead = $( '<thead />' );
						let tbody = $( '<tbody />' );
						let group = division.athletes.reduce(( group, athlete ) => group && athlete.name.match( /^Winner of/i ), true );

						thead.append( '<tr><th class="order">Place</th><th>Name</th></tr>' );
						tbody.append( '<tr><td class="order">1st</td><td>&nbsp;</td></tr>' );
						tbody.append( '<tr><td class="order">2nd</td><td>&nbsp;</td></tr>' );
						if( n > 2 || group ) { tbody.append( '<tr><td class="order">3rd</td><td>&nbsp;</td></tr>' ); }
						if( n > 3 || group ) { tbody.append( '<tr><td class="order">3rd</td><td>&nbsp;</td></tr>' ); }
						tbody.append( '<tr><td class="order">&nbsp;</td><td>&nbsp;</td></tr>' );

						table.append( thead, tbody );
						tables.push( table );

						let container = $( '<div class="division" />' );
						container.append( summary, tables );

						$( '#report-tabular' ).append( container );
					}
				}
			};

			var handle = {
				tournament : {
					read : update => {
						let divisions = update.divisions.sort(( a, b ) => a.name.localeCompare( b.name ));
						$( '#report-tabular' ).empty();
						divisions.forEach( division => { display.results.table( division ); });
					}
				}
			};

			ws.onerror = network.error = () => {
				setTimeout( function() { location.reload(); }, 15000 ); // Attempt to reconnect every 15 seconds
			};

			ws.onopen = network.connect = () => {
				network.send({ type : 'tournament', action : 'read' });
			};

			ws.onmessage = network.message = response => {
				let update  = JSON.parse( response.data );
				let request = update.request;
				console.log( update );

        if( update.action == 'ping' ) { return; }
				let type = request.type;
				if( ! (type in handle)) { alertify.error( `No handler for ${type} object` ); console.log( update ); return; }
				let action = request.action;
				if( ! (action in handle[ type ])) { alertify.error( `No handler for ${action} action` ); console.log( update ); return; }

				handle[ type ][ action ]( update );
			};

			// ===== TRY TO RECONNECT IF WEBSOCKET CLOSES
			ws.onclose = network.close = () => {
				if( network.reconnect < 10 ) { // Give 10 attempts to reconnect
					// Try to reconnect in 3 seconds
					setTimeout(() => {
						if( network.reconnect == 0 ) { alertify.error( 'Network error. Trying to reconnect.' ); }
						network.reconnect++;
						ws = new WebSocket( `<?= $config->websocket( 'worldclass' ) ?>/${tournament.db}/${ring.num}/computer+operator` ); 
						
						ws.onerror   = network.error;
						ws.onmessage = network.message;
						ws.onclose   = network.close;
					}, 3000 );
				}
			};

		</script>
	</body>
</html>
