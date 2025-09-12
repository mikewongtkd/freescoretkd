<?php 
	include( __DIR__ . './../../../session.php' );
	include( __DIR__ . '/../../../include/php/config.php' ); 

	$ring = isset( $_GET[ 'ring' ]) ? $_GET[ 'ring' ] : $_COOKIE[ 'ring' ];
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
		<style>
table .place { width: 5%; text-align: center; }
table .matchnum { width: 5%; text-align: center; vertical-align: middle !important; border: 1px solid #ddd;
table .name { width: 35%; }
table .usatid { width: 30%; }
table .score { width: 10%; }
table .tb1 { width: 10%; }
table .tb2 { width: 10%; }
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
			var pairteam   = /^p[pt]/;

			network.send = data => {
					let request  = { data };
					request.json = JSON.stringify( request.data );
					ws.send( request.json );
			};

			var display = {
				results : {
					table : division => {
						let summary = `<h3>${division.name.toUpperCase()}: ${division.description}</h3>`;
						let tables  = [];
						let n       = division.athletes.length;
						let rounds  = division.rounds.map( code => { return { code, name: FreeScore.round.name[ code ]}; });
						
						rounds.filter( round => ! round.code.match( /^ro/ )).forEach( round => {
							let table = $( '<table class="table table-striped" />' );
							let thead = $( '<thead />' );
							let tbody = $( '<tbody />' );
							if( division.name.match( pairteam )) {
								thead.append( '<tr><th class="place">Place</th><th class="name">Names</th><th class="usatid">USAT IDs</th><th class="score">Score</th><th class="tb1">TB1</th><th class="tb2">TB2</th></tr>' );
							} else {
								thead.append( '<tr><th class="place">Place</th><th class="name">Name</th><th class="usatid">USAT ID</th><th class="score">Score</th><th class="tb1">TB1</th><th class="tb2">TB2</th></tr>' );
							}
							table.append( thead, tbody );
							tables.push( `<h3>${round.name}</h3>`, table );

							let placements = round.code in division.placement ? division.placement[ round.code ] : [];
							let athletes   = placements.map( i => division.athletes[ i ]);

							athletes.forEach(( athlete, i ) => {
								let j        = i > 0 ? i - 1 : null;
								let k        = i < athletes.length ? i + 1 : null;
								let prev     = j === null ? null : athletes[ j ];
								let next     = k === null ? null : athletes[ k ];
								let num      = `${i + 1}.`;
								let name     = athlete.name;
								let usatid   = athlete?.info?.usatid ? athlete.info.usatid.replace( /,/g, ', ' ) : '';
								let scores   = round.code in athlete.scores ? athlete.scores[ round.code ] : { adjusted : { presentation : null, total : null }, original : null };
								let tb1      = scores?.tb?.[ 0 ] ? scores.tb[ 0 ].toFixed( 2 ) : '';
								let tb2      = scores?.tb?.[ 1 ] ? scores.tb[ 1 ].toFixed( 2 ) : '';
								let decision = scores?.adjusted?.decision;
								let score    = '';
								if( decision ) { score = decision; num = '&ndash;';} 
								else           { score = parseFloat( scores.adjusted.total ).toFixed( 2 ); }
								tbody.append( `<tr><td>${num}</td><td class="name">${name}</td><td class="usatid">${usatid}</td><td class="score">${score}</td><td class="tb1">${tb1}</td><td class="tb1">${tb2}</td></tr>` );
							});
						});

						// ============================================================
						// SINGLE ELIMINATION
						// ============================================================
						if( rounds.find( round => round.code.match( /^ro/ ))) {
							if( division.order?.ro2 ) {
								let table = $( '<table class="table table-striped" />' );
								let thead = $( '<thead />' );
								let tbody = $( '<tbody />' );
								let s     = division.name.match( pairteam ) ? 's' : '';
								thead.append( `<tr><th class="place">Place</th><th class="name">Name${s}</th><th class="usatid">USAT ID${s}</th><th class="score">Matches Won</th><th>Top Round</th></tr>` );
								table.append( thead, tbody );
								tables.push( `<h4>Single Elimination Summary</h4><p>Tallying wins over the Quarter-Finals (Ro8), Semi-Finals (Ro4), and Finals (Ro2) Rounds</p>`, table );

								let placements = defined( division?.placement ) && ('ro2' in division.placement) ? division.placement[ 'ro2' ] : [];
								let maxwins    = placements.length;
								let trmap      = { 1: 'Finals', 2: 'Finals', 3: 'Semi-Finals', 5: 'Quarter-Finals', 9: 'Round of 16', 17: 'Round of 32', 33: 'Round of 64', 65: 'Round of 128', 129: 'Round of 256' };

								placements.forEach(( athletes, i ) => {
									let place = placements.filter(( p, j ) => ( j < i )).reduce(( acc, cur ) => acc + cur.length, 0 ) + 1;
									athletes.forEach( j => {
										let athlete  = division.athletes[ j ];
										let name     = athlete.name;
										let usatid   = athlete?.info?.usatid ? athlete.info.usatid.replace( /,/g, ', ' ) : '';
										let wins     = maxwins - (i + 1);
										let topround = trmap[ place ];
										tbody.append( `<tr><td>${ordinal( place )}</td><td class="name">${name}</td><td class="usatid">${usatid}</td><td class="score">${wins}</td><td>${topround}</td></tr>` );
									})
								});
							}

							let start = 0;
							rounds.filter( round => round.code.match( /^ro/ )).forEach( round => {
								if( ! division.order?.[ round.code ]) { return; }
							
								let table = $( '<table class="table" />' );
								let thead = $( '<thead />' );
								let tbody = $( '<tbody />' );
								if( division.name.match( pairteam )) {
									thead.append( '<tr><th class="place">Match</th><th class="name">Names</th><th class="usatid">USAT IDs</th><th class="score">Score</th><th class="tb1">TB1</th><th class="tb2">TB2</th></tr>' );
								} else {
									thead.append( '<tr><th class="place">Match</th><th class="name">Name</th><th class="usatid">USAT ID</th><th class="score">Score</th><th class="tb1">TB1</th><th class="tb2">TB2</th></tr>' );
								}
								table.append( thead, tbody );
								let forms = division.forms[ round.code ];

								if( forms[ 0 ].match( /draw/i )) {
									forms = ''; // The forms can go with each match
								} else {
									forms = `<p><b>Form${forms.length == 1 ? '' : 's'}:</b> ${forms.join( ', ' )}</p>`;
								}
								tables.push( `<h4>${round.name}</h4>`, forms, table );

								let matches = division.matches[ round.code ];
								let draws   = division?.draws;
								if( ! defined( matches )) { return; }

								matches.forEach(( match, i ) => {
									let num = match.number + start;
									if( defined( draws ) && draws?.[ round.code ]?.[ match.number ]) {
										forms = draws[ round.code ][ match.number ];
										forms = `<div class="forms">${forms.join( '<br>' )}</div>`;
									} else {
										forms = '';
									}
									[ match.chung, match.hong ].forEach(( j, k ) => {
										let matchnum = k == 0 ? `<td rowspan=2 class="matchnum">${num}${forms}</td>` : '';

										if( ! defined( j )) {
											tbody.append( `<tr>${matchnum}<td class="name"><i>BYE</i></td><td class="usatid">&ndash;</td><td class="score">&ndash;</td><td class="tb1">&nbsp;</td><td class="tb1">&nbsp;</td></tr>` );
											return;
										}

										let athlete  = division.athletes[ j ];
										let name     = athlete.name;
										let usatid   = athlete?.info?.usatid ? athlete.info.usatid.replace( /,/g, ', ' ) : '';
										let scores   = round.code in athlete.scores ? athlete.scores[ round.code ] : { adjusted : { presentation : null, total : null }, original : null };
										let tb1      = scores?.tb?.[ 0 ] ? scores.tb[ 0 ].toFixed( 2 ) : '';
										let tb2      = scores?.tb?.[ 1 ] ? scores.tb[ 1 ].toFixed( 2 ) : '';
										let decision = scores?.adjusted?.decision;
										if( decision ) { score = decision; } 
										else           { score = parseFloat( scores.adjusted.total ).toFixed( 2 ); }
										if( ! defined( match.winner )) {
											tbody.append( `<tr>${matchnum}<td class="name">${name}</td><td class="usatid">${usatid}</td><td class="score">&ndash;</td><td class="tb1">${tb1}</td><td class="tb1">${tb2}</td></tr>` );
										} else if( j == match.winner ) {
											tbody.append( `<tr>${matchnum}<td class="name"><b>${name}</b></td><td class="usatid">${usatid}</td><td class="score"><b>${score}</b></td><td class="tb1"><b>${tb1}</b></td><td class="tb1"><b>${tb2}</b></td></tr>` );
										} else {
											tbody.append( `<tr>${matchnum}<td class="name"><s>${name}</s></td><td class="usatid">${usatid}</td><td class="score"><s>${score}</s></td><td class="tb1"><s>${tb1}</s></td><td class="tb1"><s>${tb2}</s></td></tr>` );
										}
									})
									tbody.append( `<tr><td></td><td class="name"></td><td class="usatid"></td><td class="score"></td><td class="tb1"></td><td class="tb1"></td></tr>` );
								});
								start += matches.length;
							});
						}

						$( '#report-tabular' ).append( summary, tables );

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
