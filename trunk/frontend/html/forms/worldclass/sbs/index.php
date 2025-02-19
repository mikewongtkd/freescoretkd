<?php 
	include( "../../../include/php/config.php" ); 
	$rnum  = intval( isset( $_GET[ 'ring' ] ) ? $_GET[ 'ring' ] : $_COOKIE[ 'ring' ]);
	if( $rnum == 'staging' || in_array( $rnum, $config->rings())) { 
		setcookie( 'ring', $rnum, 0, '/' ); 
		$cookie_set = true;
	} else {
		setcookie( 'ring', 1, 0, '/' ); 
	}
	include( '../../../session.php' );

	$url  = $config->websocket( 'worldclass', $rnum, 'computer+operator' );
	$flip = isset( $_GET[ 'flip' ]) ? 'class="chung-left"' : 'class="chung-right"';
?>
<html>
	<head>
		<link href="../../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="css/display.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../../include/alertify/alertify.min.js"></script>
		<script src="../../../include/svg/js/svg.js"></script>
		<script src="../../../include/js/freescore.js"></script>
		<script src="../../../include/js/uuid.js"></script>
		<script src="../../../include/js/websocket.js"></script>
		<script src="../../../include/js/sound.js"></script>
		<script src="../../../include/js/event.js"></script>
		<script src="../../../include/js/app.js"></script>
		<script src="../../../include/js/widget.js"></script>
		<script src="../../../include/js/ioc.js"></script>
		<script src="widgets/display/poomsae-draw.js"></script>
		<script src="../se/widgets/display/bracket.js"></script>
		<script src="../se/widgets/display/leaderboard.js"></script>
		<script src="../se/widgets/display/match-list.js"></script>
		<script src="../se/widgets/display/match-results.js"></script>
		<script src="../se/widgets/display/scoreboard.js"></script>
		<script src="../../../include/js/forms/worldclass/form.class.js"></script>
		<script src="../../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../../include/js/forms/worldclass/division.class.js"></script>
		<title>Recognized Poomsae Ring <?= $rnum ?> Display</title>
	</head>
	<body>
		<div id="pt-main" class="pt-perspective">
			<!-- ============================================================ -->
			<!-- DISPLAY POOMSAE DRAW -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-1">
				<div id="display-draw">
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- DISPLAY SCORE -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-2">
				<div id="display-score" <?= $flip ?>>
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- DISPLAY RESULTS -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-3">
			<div id="display-results" <?= $flip ?>>
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- DISPLAY BRACKET -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-4">
				<div id="display-bracket">
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- DISPLAY LEADERBOARD -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-5">
				<div id="display-leaderboard" <?= $flip ?>>
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- DISPLAY MATCHES -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-6">
				<div id="display-matches" <?= $flip ?>>
				</div>
			</div>
		</div>
		<script>
			alertify.defaults.theme.ok     = "btn btn-danger";
			alertify.defaults.theme.cancel = "btn btn-warning";

			let tournament = <?= $tournament ?>;
			let ring       = { num: <?= $rnum ?> };
			let html       = FreeScore.html;
			let app        = new FreeScore.App( ring.num );

			// ===== NETWORK CONNECT
			app.on.connect( '<?= $url ?>' ).read.ring();

			// ===== PAN & ZOOM FUNCTION
			app.state.display  = { x: 0, y: 0, zoom: 1.0 };
			app.display.panzoom = delta => {
				app.state.display.x    += delta.x;
				app.state.display.y    += delta.y;
				app.state.display.zoom += delta.z;
				[ 'x', 'y', 'zoom' ].forEach( pz => app.state.display[ pz ] = parseFloat( app.state.display[ pz ].toFixed( 2 )));
				$( '#pt-main' ).css({ transform: `scale( ${app.state.display.zoom.toFixed( 2 )}) translate( ${Math.round( app.state.display.x * 100 )}%, ${Math.round( app.state.display.y * 100)}% )`, 'transform-origin': '0 0' });
				alertify.dismissAll();
				if( delta.z != 0 ) { alertify.notify( `Zoom: ${Math.round( app.state.display.zoom * 100 )}%` ); }
				else               { alertify.notify( `Pan: X: ${Math.round( app.state.display.x * 100 )}%, Y: ${Math.round( app.state.display.y * 100 )}%` ); }
			}
			$( 'body' ).keydown( ev => { 
				switch( ev.key ) {
					case '=':          app.display.panzoom({ x:  0.00, y:  0.00, z:  0.05 }); break;
					case '-':          app.display.panzoom({ x:  0.00, y:  0.00, z: -0.05 }); break;
					case 'ArrowUp':    app.display.panzoom({ x:  0.00, y: -0.05, z:  0.00 }); break;
					case 'ArrowDown':  app.display.panzoom({ x:  0.00, y:  0.05, z:  0.00 }); break;
					case 'ArrowLeft':  app.display.panzoom({ x: -0.05, y:  0.00, z:  0.00 }); break;
					case 'ArrowRight': app.display.panzoom({ x:  0.05, y:  0.00, z:  0.00 }); break;
				}
			});

			// ===== PAGES
			app.page = {
				count: 6,
				num: 1,
				for : {
					draw: 1,
					score: 2,
					results: 3,
					bracket: 4,
					leaderboard: 5,
					matches: 6
				},
				show : {
					draw:        () => { app.page.transition( 'draw' ); },
					score:       () => { app.page.transition( 'score' ); },
					results:     () => { app.page.transition( 'results' ); },
					bracket:     () => { app.page.transition( 'bracket' ); },
					leaderboard: () => { app.page.transition( 'leaderboard' ); },
					matches:     () => { app.page.transition( 'matches' ); }
				},
				transition: target => { 
					let pnum = app.page.for?.[ target ] ? app.page.for[ target ] : app.page.for.score;
					app.page.num = pnum;
					$( '.pt-page' ).hide();
					$( `.pt-page-${pnum}` ).show();
				}
			};

			// ============================================================
			// APP COMPOSITION
			// ============================================================
			app.widget = {
				bracket:     { display : new FreeScore.Widget.SEBracket( app, 'display-bracket' ) },
				draw:        { display : new FreeScore.Widget.SBSPoomsaeDraw( app, 'display-draw' ) },
				leaderboard: { display : new FreeScore.Widget.SELeaderboard( app, 'display-leaderboard' ) },
				match:       { display : new FreeScore.Widget.SEMatchList( app, 'display-matches' ) },
				results:     { display : new FreeScore.Widget.SEMatchResults( app, 'display-results' ) },
				scoreboard:  { display : new FreeScore.Widget.SEScoreboard( app, 'display-score' ) }
			};

			app.forwardIf = {
				cutoff : division => {
					let method = division.current.method();
					if( method == 'cutoff' ) { window.location = `../index.php?ring=<?= $rnum ?>`; }
				},
				se : division => {
					let method = division.current.method();
					if( method == 'se' ) { window.location = `../se/index.php?ring=<?= $rnum ?>`; }
				}
			};

			app.refresh.page = division => {
				console.log( 'APP REFRESH PAGE', division.name(), app.state.current ); // MW
				if( division.name() != app.state.current ) { return; }

				console.log( division.name() ); // MW

				app.forwardIf.cutoff( division );
				app.forwardIf.se( division );

				let state = division.current.state();
				console.log( state ); // MW
				if( ! defined( app.page.show?.[ state ])) { 
					alertify.error( `Unknown division state: '${state}'; defaulting to <b>score</b>` );
					state = 'score'; 
				}
				app.page.transition( state );
			};

			app.network.on
				// ============================================================
				.heard( 'ring' )
				// ============================================================
				.command( 'update' )
					.respond( update => {
						let ring = update?.ring;
						if( ! defined( ring )) { return; }
						if( ! defined( ring?.current )) { return; }

						app.state.current = ring.current;

						let division = ring?.divisions?.find( division => division?.name == ring.current );
						if( ! defined( division )) { return; }

						division = new Division( division );
						app.refresh.page( division );

						// ACTIVATE SUB WIDGETS
						Object.entries( app.widget ).forEach(([ name, widget ]) => widget.display.refresh.all( division ));
					})
				// ============================================================
				.heard( 'division' )
				// ============================================================
				.command( 'update' )
					.respond( update => {
						console.log( 'DIVISION UPDATE' ); // MW
						let division = update?.division;
						if( ! defined( division )) { return; }

						division = new Division( division );
						app.refresh.page( division );
					})
				// ============================================================
				.heard( 'autopilot' )
				// ============================================================
				.command( 'update' )
					.respond( update => {
						let division = update?.division;
						if( ! defined( division )) { return; }

						division = new Division( division );
						app.refresh.page( division );
					})
		</script>
	</body>
</html>
