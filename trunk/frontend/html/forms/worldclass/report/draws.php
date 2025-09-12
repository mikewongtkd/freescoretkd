<?php 
	include( __DIR__ . './../../../session.php' );
	include( __DIR__ . '/../../../include/php/config.php' ); 
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
		<script src="../../../include/js/forms/worldclass/form.class.js"></script>
		<script src="../../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../../include/js/forms/worldclass/division.class.js"></script>
		<style>
table .order { width: 5%; text-align: center; }
table .name { width: 65%; }
table .usatid { width: 30%; text-align: right; }
.results { page-break-after: always; }
		</style>
	</head>
	<body>
		<div id="report-tabular" class="container"></div>
		<script type="text/javascript">
			var tournament = <?= $tournament ?>;
			var ring       = { num : 1 };
			var ws         = new WebSocket( '<?= $config->websocket( 'worldclass', 1, 'computer+operator' ) ?>' );
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
						let div     = new Division( division );
						let results = $( '<div class="results"></div>' );
						let summary = `<h3>${division.name.toUpperCase()}: ${division.description}</h3>`;
						let round   = { display: `<h4>${div.current.round.display.name()}</h4>`, code : div.current.round.name() };

						if( 'flight' in division ) {
							round = { display : '<h4>Preliminary Round</h4>', code : 'prelim' };
						}
						
						let table = $( '<table class="table table-striped" />' );
						let thead = $( '<thead />' );
						let tbody = $( '<tbody />' );
						if( division.name.match( /^p[pt]/ )) {
							// thead.append( '<tr><th class="order">Num</th><th class="name">Names</th><th class="usatid">USAT IDs</th></tr>' );
							thead.append( '<tr><th class="order">Num</th><th class="name">Names</th><th class="usatid">&nbsp;</th></tr>' );
						} else {
							// thead.append( '<tr><th class="order">Num</th><th class="name">Name</th><th class="usatid">USAT ID</th></tr>' );
							thead.append( '<tr><th class="order">Num</th><th class="name">Name</th><th class="usatid">&nbsp;</th></tr>' );
						}
						table.append( thead, tbody );

						let athletes = division.athletes;

						athletes.forEach(( athlete, i ) => {
							let num      = `${i + 1}.`;
							let name     = athlete.name;
							let usatid   = athlete.info?.usatid ? athlete.info.usatid.replace( /,/g, ', ' ) : '';
							tbody.append( `<tr><td>${num}</td><td class="name">${name}</td><td class="usatid">${usatid}</td></tr>` );
						});

						results.append( summary, round.display, division.forms[ round.code ]?.join( ', ' ), table );
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
						ws = new WebSocket( '<?= $config->websocket( 'worldclass', 1, 'computer+operator' ) ?>' ); 
						
						ws.onerror   = network.error;
						ws.onmessage = network.message;
						ws.onclose   = network.close;
					}, 3000 );
				}
			};

		</script>
	</body>
</html>
