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
table .order { width: 5%; text-align: center; }
table .name { width: 65%; }
table .usatid { width: 30%; text-align: right; }
.results { page-break-after: always; }
.forms { font-size: 1.25em; float: right; }
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
						let results = $( '<div class="results"></div>' );
						let summary = `<h3>${division.name.toUpperCase()}: ${division.description}</h3>`;
						let round   = 'finals';
						let n       = division.athletes.length;
            let rname   = { prelim : '<h4>Preliminary Round</h4>', semfin : '<h4>Semi-Final Round</h4>', finals : '<h4>Final Round</h4>' };
            let forms   = '<div class="forms">' + division.forms[ round ].join( ', ' ) + '</div>';

						if( n >   8 ) { round = 'semfin'; }
						if( n >= 20 ) { round = 'prelim' }

						if( 'flight' in division ) {
							round = 'prelim';
						}
						
						let table = $( '<table class="table table-striped" />' );
						let thead = $( '<thead />' );
						let tbody = $( '<tbody />' );
						if( division.name.match( /^p[pt]/ )) {
							thead.append( '<tr><th class="order">Num</th><th class="name">Names</th><th class="usatid">USAT IDs</th></tr>' );
						} else {
							thead.append( '<tr><th class="order">Num</th><th class="name">Name</th><th class="usatid">USAT ID</th></tr>' );
						}
						table.append( thead, tbody );

						let athletes = division.athletes;

						athletes.forEach(( athlete, i ) => {
							let num      = `${i + 1}.`;
							let name     = athlete.name;
							let usatid   = athlete.info.usatid.replace( /,/g, ', ' );
							tbody.append( `<tr><td>${num}</td><td class="name">${name}</td><td class="usatid">${usatid}</td></tr>` );
						});

						results.append( summary, forms, rname[ round ], table );
						$( '#report-tabular' ).append( results );
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
