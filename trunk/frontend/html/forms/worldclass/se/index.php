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
		<script src="../../../include/js/websocket.js"></script>
		<script src="../../../include/js/sound.js"></script>
		<script src="../../../include/js/event.js"></script>
		<script src="../../../include/js/app.js"></script>
		<script src="../../../include/js/widget.js"></script>
		<script src="../../../include/js/ioc.js"></script>
		<script src="widgets/display/match-list.js"></script>
		<script src="widgets/display/bracket.js"></script>
		<script src="widgets/display/scoreboard.js"></script>
		<script src="../../../include/js/forms/worldclass/form.class.js"></script>
		<script src="../../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../../include/js/forms/worldclass/division.class.js"></script>
		<title>Recognized Poomsae Ring <?= $rnum ?> Display</title>
	</head>
	<body>
		<div id="pt-main" class="pt-perspective">
			<!-- ============================================================ -->
			<!-- DISPLAY SCORE -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-1">
				<div id="display-score" <?= $flip ?>>
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- DISPLAY RESULTS -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-2">
			<div id="display-results" <?= $flip ?>>
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- DISPLAY BRACKET -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-3">
				<div id="display-bracket">
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- DISPLAY LEADERBOARD -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-4">
				<div id="display-leaderboard" <?= $flip ?>>
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- DISPLAY MATCHES -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-5">
				<div id="display-matches" <?= $flip ?>>
				</div>
			</div>
		</div>
		<script>
			alertify.defaults.theme.ok     = "btn btn-danger";
			alertify.defaults.theme.cancel = "btn btn-warning";

			var tournament = <?= $tournament ?>;
			var ring       = { num: <?= $rnum ?> };
			var html       = FreeScore.html;
			var app        = new FreeScore.App();

			app.on.connect( '<?= $url ?>' ).read.division();

			app.page = {
				num: 1,
				for : {
					score: 1,
					results: 2,
					bracket: 3,
					leaderboard: 4,
					matches: 5
				},
				show : {
					score:       () => { app.page.transition( 'score' ); },
					results:     () => { app.page.transition( 'results' ); },
					bracket:     () => { app.page.transition( 'bracket' ); },
					leaderboard: () => { app.page.transition( 'leaderboard' ); },
					matches:     () => { app.page.transition( 'matches' ); }
				},
				transition: target => { 
					let page = app.page.for?.[ target ] ? app.page.for[ target ] : app.page.for.score;
					if( app.page.num == page ) { return; }
					app.page.num = page;
					$( '.pt-page' ).hide();
					$( `.pt-page-${page}` ).show();
				}
			};

			// ============================================================
			// APP COMPOSITION
			// ============================================================
			app.widget = {
				bracket:    { display : new FreeScore.Widget.SEBracket( app, 'display-bracket' ) },
				match:      { display : new FreeScore.Widget.SEMatchList( app, 'display-matches' ) },
				scoreboard: { display : new FreeScore.Widget.SEScoreboard( app, 'display-score' ) }
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
						app.page.show[ state ]();
					})
				// ============================================================
				.heard( 'autopilot' )
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
						app.page.show[ state ]();
					})
		</script>
	</body>
</html>
