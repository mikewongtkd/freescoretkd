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
		<link href="../../../include/page-transitions/css/animations.css" rel="stylesheet" type="text/css" />
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
		<script src="../../../include/js/forms/worldclass/form.class.js"></script>
		<script src="../../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../../include/js/forms/worldclass/division.class.js"></script>
		<title>Recognized Poomsae Ring <?= $rnum ?> Display</title>
	</head>
	<body>
		<div id="pt-main" class="pt-perspective">
			<!-- ============================================================ -->
			<!-- DISPLAY MATCHES -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-1">
				<div id="display-matches" <?= $flip ?>>
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
				<div id="display-bracket" <?= $flip ?>>
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- DISPLAY LEADERBOARD -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-5">
				<div id="display-leaderboard" <?= $flip ?>>
				</div>
			</div>
		</div>
		<script src="../../../include/page-transitions/js/pagetransitions.js"></script>
		<script>
			alertify.defaults.theme.ok     = "btn btn-danger";
			alertify.defaults.theme.cancel = "btn btn-warning";

			var tournament = <?= $tournament ?>;
			var ring       = { num: <?= $rnum ?> };
			var html       = FreeScore.html;
			var app        = new FreeScore.App();

			app.on.connect( '<?= $url ?>' ).read.division();

			app.page = {
				animation : {
					default: 4, // Move to bottom / From top
					matches: 41, // Push buttom / From top
					score: 8, // Fade from top
					results: 34, // Flip top
					bracket: 52, // Move to bottom / Unfold top
					leaderboard: 61, // Cube to bottom
				},
				num: 1,
				count: 3,
				for : {
					matches: 1,
					score: 2,
					results: 3,
					bracket: 4,
					leaderboard: 5
				},
				show : {
					matches:     () => { app.page.transition( 'matches' ); },
					score:       () => { app.page.transition( 'score' ); },
					results:     () => { app.page.transition( 'results' ); },
					bracket:     () => { app.page.transition( 'bracket' ); },
					leaderboard: () => { app.page.transition( 'leaderboard' ); }
				},
				transition: target => { 
					let animation = app.page.animation?.[ target ] ? app.page.animation[ target ] : app.page.animation.default;
					let showPage  = app.page.for?.[ target ] ? app.page.for[ target ] : app.page.for.match;
					PageTransitions.nextPage({ animation, showPage }); 
				}
			};

			// ============================================================
			// APP COMPOSITION
			// ============================================================
			app.widget = {
				match : {
					display : new FreeScore.Widget.SEMatchList( app, 'match-display' )
				}
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
					});

		</script>
	</body>
</html>
