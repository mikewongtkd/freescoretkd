<?php 
	include( __DIR__ . './../../../session.php' );
	include( __DIR__ . '/../../../include/php/config.php' ); 
  $ringnum = isset( $_GET[ 'ring' ]) ? intval( $_GET[ 'ring' ]) : null;
  $divid   = isset( $_GET[ 'divid' ]) ? $_GET[ 'divid' ] : null;
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
		<style>
.forms { font-size: 1.25em; float: right; }
table .place { width: 5%; text-align: center; }
table .name { width: 35%; }
table .usatid { width: 30%; }
table .score { width: 10%; }
table .tb1 { width: 10%; }
table .tb2 { width: 10%; }
		</style>
	</head>
	<body>
		<div id="report-tabular" class="container"></div>
		<script type="text/javascript">
			var tournament = <?= $tournament ?>;
			var ring       = { num : 1 };
			var ws         = new WebSocket( `<?= $config->websocket( 'worldclass' ) ?>/${tournament.db}/${ring.num}/computer+operator` );
			var network    = { reconnect: 0 };
			var divisions  = [];
      var selected   = { ring : <?= is_null( $ringnum ) ? 'null' : $ringnum ?>, divid : <?= is_null( $divid ) ? 'null' : "'$divid'" ?> };

			network.send = data => {
					let request  = { data };
					request.json = JSON.stringify( request.data );
					ws.send( request.json );
			};

			var display = {
				athlete : {
					decision : scores => {
						let code = { 'withdraw' : 'WDR', 'disqualify' : 'DSQ', '' : false };
						let decision = '';
						if( ! ( 'forms' in scores )) { return false; }
						scores.forms.forEach( form => {
							if( !( 'decision' in form )) { return false; }
							decision = Object.keys( form.decision )[ 0 ];
						});
						decision = code[ decision ];
						return decision;
					}
				},
				results : {
					table : division => {
            if( selected.ring && division.ring != selected.ring ) { return; }
            if( selected.divid && division.name != selected.divid ) { return; }
						console.log( division.name.toUpperCase(), division );
						let summary = `<h3>${division.name.toUpperCase()}: ${division.description}</h3>`;
						let tables  = [];
						let rounds  = [{ code : 'finals', name : 'Final' }];
						let n       = division.athletes.length;

						if( n >   8 ) { rounds.push({ code : 'semfin', name : 'Semi-Final' }); }
						if( n >= 20 ) { rounds.push({ code : 'prelim', name : 'Preliminary' }); }
						if( 'flight' in division ) {
							rounds = [{ code : 'prelim', name : 'Preliminary' }];
						}
						
						rounds.forEach( round => {
              let forms = '<div class="forms">' + division.forms[ round.code ]?.join( ', ' ) + '</div>';
							let table = $( '<table class="table table-striped" />' );
							let thead = $( '<thead />' );
							let tbody = $( '<tbody />' );
							if( division.name.match( /^p[pt]/ )) {
								thead.append( '<tr><th class="place">Place</th><th class="name">Names</th><th class="usatid">USAT IDs</th><th class="score">Score</th><th class="tb1">TB1</th><th class="tb2">TB2</th></tr>' );
							} else {
								thead.append( '<tr><th class="place">Place</th><th class="name">Name</th><th class="usatid">USAT ID</th><th class="score">Score</th><th class="tb1">TB1</th><th class="tb2">TB2</th></tr>' );
							}
							table.append( thead, tbody );
							tables.push( forms, `<h3>${round.name} Round</h3>`, table );

							let placements = round.code in division.placement ? division.placement[ round.code ] : [];
							let athletes   = placements.map( i => division.athletes[ i ]);

							athletes.forEach(( athlete, i ) => {
								let j        = i > 0 ? i - 1 : null;
								let k        = i < athletes.length ? i + 1 : null;
								let prev     = j === null ? null : athletes[ j ];
								let next     = k === null ? null : athletes[ k ];
								let num      = `${i + 1}.`;
								let name     = athlete.name;
								let usatid   = athlete.info.usatid.replace( /,/g, ', ' );
								let scores   = round.code in athlete.scores ? athlete.scores[ round.code ] : { adjusted : { presentation : null, total : null }, allscore : null };
								let pscore   = prev && round.code in prev.scores ? prev.scores[ round.code ] : { adjusted : { presentation : null, total : null }, allscore : null };
								let nscore   = next && round.code in next.scores ? next.scores[ round.code ] : { adjusted : { presentation : null, total : null }, allscore : null };
								let tb1      = '';
								let tb2      = '';
								let decision = display.athlete.decision( scores );
								let score    = '';
								console.log( athlete.name, decision );
								if( decision ) { score = decision; num = '&ndash;';} 
								else           { score = parseFloat( scores.adjusted.total ).toFixed( 2 ); }
								if( scores.adjusted.total && ((scores.adjusted.total == pscore.adjusted.total) || (scores.adjusted.total == nscore.adjusted.total))) {
									tb1 = parseFloat( scores.adjusted.presentation ).toFixed( 2 );
									if( scores.adjusted.presentation && ((scores.adjusted.presentation == pscore.adjusted.presentation) || (scores.adjusted.presentation == nscore.adjusted.presentation))) {
										tb2 = parseFloat( scores.allscore.total ).toFixed( 2 );
									}
								}
								tbody.append( `<tr><td>${num}</td><td class="name">${name}</td><td class="usatid">${usatid}</td><td class="score">${score}</td><td class="tb1">${tb1}</td><td class="tb1">${tb2}</td></tr>` );


							});

						});

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
