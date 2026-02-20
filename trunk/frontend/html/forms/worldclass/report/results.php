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
h3 { page-break-after: avoid; }
h4 { page-break-before: avoid; page-break-after: avoid; }
p { page-break-before: avoid; page-break-after: avoid; }
table { page-break-inside: avoid; }
table .place { width: 5%; text-align: center; }
table .matchnum { width: 5%; text-align: center; vertical-align: middle !important; border: 1px solid #ddd; }
table .name { width: 35%; }
table .usatid { width: 30%; }
table .score { width: 10%; }
table .tb1 { width: 10%; }
table .tb2 { width: 10%; }
table .cell4 { font-size: 9pt; width: 25%;   }
table .cell3 { font-size: 9pt; width: 33.3%; }
table .cell2 { font-size: 9pt; width: 50%;   }
.tree-match-num {
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
			var pairteam   = /^p[pt]/;

			network.send = data => {
					let request  = { data };
					request.json = JSON.stringify( request.data );
					ws.send( request.json );
			};

			var display = {
				bracket : {
					athlete: ( division, name, table, col, row ) => {
						let id = `#${division.name()}-${col}-${row}`;
						table.find( id ).html( name ).css( 'padding-left', '2em' );
					},
					athletes: ( division, match, table, col, row ) => {
						console.log( division.name(), 'MATCH', match, col, row ); // MW
						let offset = 2 ** col;
						if( match.chung === null && match.hong === null ) {

						} else if( match.chung === null ) {
							let hong  = division.athlete( match.hong );
							let name  = match?.winner === undefined ? hong.name() : match.winner == match.hong ? `<b>${hong.name()}</b>` : `<s>${hong.name()}</s>`;
							display.bracket.athlete( division, '</i>BYE</i>', table, col, row - offset);
							display.bracket.athlete( division, name, table, col, row + offset);

						} else if( match.hong === null ) {
							let chung = division.athlete( match.chung );
							let name  = match?.winner === undefined ? chung.name() : match.winner == match.chung ? `<b>${chung.name()}</b>` : `<s>${chung.name()}</s>`;
							display.bracket.athlete( division, name, table, col, row - offset);
							display.bracket.athlete( division, '</i>BYE</i>', table, col, row + offset);

						} else {
							let chung = division.athlete( match.chung );
							let hong  = division.athlete( match.hong );
							chung = match?.winner === undefined ? chung.name() : match.winner == match.chung ? `<b>${chung.name()}</b>` : `<s>${chung.name()}</s>`;
							hong  = match?.winner === undefined ? hong.name()  : match.winner == match.hong  ? `<b>${hong.name()}</b>`  : `<s>${hong.name()}</s>`;
							display.bracket.athlete( division, chung, table, col, row - offset);
							display.bracket.athlete( division, hong,  table, col, row + offset);
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
							ro8 : [[ 0, 1 ], [ 0, 9 ], [ 0, 13 ], [ 0, 5 ], [ 1, 3 ], [ 1, 11 ], [ 2, 7 ]],
							ro4 : [[ 0, 1 ], [ 0, 5 ], [ 1, 3 ]],
							ro2 : [[ 0, 1 ]]
						};
						let start   = division.rounds.find( round => round.match( /^ro/i ));
						let matches = division.rounds.reduce(( matches, round ) => matches.concat( div.bracket.matches( round )), []);
						for( let mnum = 1; mnum <= matches.length; mnum++ ) {
							let match    = mnum <= matches.length ? matches[ mnum - 1 ] : null;
							let [ i, j ] = mcoords[ start ][ mnum - 1 ];
							let id       = `#${division.name}-${i}-${j}`;
							table.find( id ).html( `<div class="tree-match-num">Match ${mnum}</div>` ).css({ 'position' : 'relative' });
							if( match ) {
								display.bracket.athletes( div, match, table, i, j);
								if( mnum == matches.length && defined( match.winner )) {
									let [ i, j ] = mcoords[ start ][ mnum - 1 ];
									let athlete  = div.athlete( match.winner );
									display.bracket.athlete( div, `<b>${athlete.name()}</b>`, table, i + 1, j );
								}
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
							let header = $( '<h4 style="margin-top: 2em;">Bracket</h4>' );
							let table  = $( '<table width="100%" />' );
							let thead  = $( '<thead />' );
							let tbody  = $( '<tbody />' );
							let first  = rounds.find( round => round.code.match( /^ro/ ) && division.order?.[ round.code ]);
							let size   = parseInt( first?.code?.replace( /^ro/, '' ));
							let depth  = Math.ceil( Math.log( size ) / Math.log( 2 ));
							let rows   = (size * 2) - 1;
							let cols   = depth + 1;
							let tr     = $( '<tr />' );

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

							display.bracket.tree( division, table, cols, rows );

							tables.push( header, table );

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
