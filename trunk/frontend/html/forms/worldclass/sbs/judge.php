<?php 
	include( "../../../include/php/config.php" ); 
	$rnum  = intval( isset( $_GET[ 'ring' ] ) ? $_GET[ 'ring' ] : $_COOKIE[ 'ring' ]);
	$jnum  = intval( isset( $_GET[ 'judge' ] ) ? $_GET[ 'judge' ] : $_COOKIE[ 'judge' ]);
	if( $rnum == 'staging' || in_array( $rnum, $config->rings())) { 
		setcookie( 'ring', $rnum, 0, '/' ); 
		$cookie_set = true;
	} else {
		setcookie( 'ring', 1, 0, '/' ); 
	}
	include( '../../../session.php' );

	$url  = $config->websocket( 'worldclass', $rnum, $jnum );
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
		<script src="../../../include/js/websocket.js"></script>
		<script src="../../../include/js/sound.js"></script>
		<script src="../../../include/js/event.js"></script>
		<script src="../../../include/js/app.js"></script>
		<script src="../../../include/js/widget.js"></script>
		<script src="../../../include/js/ioc.js"></script>
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
			<!-- SCORE ACCURACY -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-1">
				<div id="score-accuracy">
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- SCORE PRESENTATION -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-2">
				<div id="score-presentation">
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- DISPLAY DIVISION -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-3">
			<div id="display-division">
				</div>
			</div>
		</div>
		<script>
			alertify.defaults.theme.ok     = "btn btn-danger";
			alertify.defaults.theme.cancel = "btn btn-warning";

			let tournament = <?= $tournament ?>;
			let ring       = { num: <?= $rnum ?> };
			let html       = FreeScore.html;
			let app        = new FreeScore.App();

			// ===== NETWORK CONNECT
			app.on.connect( '<?= $url ?>' ).read.division();

			// ===== PAGES
			app.page = {
				count: 3,
				num: 1,
				for : {
					accuracy: 1,
					presentation: 2,
					division: 3
				},
				show : {
					accuracy:     () => { app.page.transition( 'accuracy' ); },
					presentation: () => { app.page.transition( 'presentation' ); },
					division:     () => { app.page.transition( 'division' ); }
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
			};

			app.network.on
				// ============================================================
				.heard( 'division' )
				// ============================================================
				.command( 'update' )
					.respond( update => {
						let division = update?.division;
						if( ! defined( division )) { return; }

						let state = division.state;
						if( ! defined( app.page.show?.[ state ])) { 
							alertify.error( `Unknown division state: '${state}'; defaulting to <b>score</b>` );
							state = 'score'; 
						}
						app.page.transition( state );
					});
		</script>
	</body>
</html>
