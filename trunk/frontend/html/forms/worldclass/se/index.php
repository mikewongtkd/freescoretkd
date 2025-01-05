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

	$url = $config->websocket( 'worldclass', $rnum, 'computer+operator' );
?>
<html>
	<head>
		<link href="../../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/css/forms/worldclass/coordinator.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/page-transitions/css/animations.css" rel="stylesheet" type="text/css" />
		<link href="../../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../../include/alertify/alertify.min.js"></script>
		<script src="../../../include/js/freescore.js"></script>
		<script src="../../../include/js/websocket.js"></script>
		<script src="../../../include/js/sound.js"></script>
		<script src="../../../include/js/event.js"></script>
		<script src="../../../include/js/app.js"></script>
		<script src="../../../include/js/widget.js"></script>
		<script src="../../../include/js/forms/worldclass/form.class.js"></script>
		<script src="../../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../../include/js/forms/worldclass/division.class.js"></script>
		<title>World Class Ring <?= $rnum ?> Operations</title>
	</head>
	<body>
		<div id="pt-main" class="pt-perspective">
			<!-- ============================================================ -->
			<!-- MATCH DISPLAY -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-1">
				<div id="match-display">
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- POOMSAE DRAW DISPLAY -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-2">
				<div id="poomsae-draw-display">
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- SCORE DISPLAY -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-3">
				<div id="score-display">
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- LEADERBOARD DISPLAY -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-4">
				<div id="leaderboard-display">
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

			app.network.on
				// ============================================================
				.heard( 'autopilot' )
				// ============================================================
				.command( 'leaderboard' )
					.respond( update => {
						let request = update.request;
						let delay   = (request.delay + 1) * 1000;
						$( '.autopilot .status' ).addClass( 'btn-success' ).removeClass( 'btn-default' ).html( 'Showing Leaderboard' );
						if( app.state.autopilot.timer ) { clearTimeout( app.state.autopilot.timer ); }
						app.state.autopilot.timer = setTimeout( () => { $( '.autopilot .status' ).addClass( 'btn-default' ).removeClass( 'btn-success' ).html( 'Disengaged' ); }, delay );

					})
				.command( 'next' )
					.respond( update => {
						let request = update.request;
						let delay   = (request.delay + 1) * 1000;
						$( '.autopilot .status' ).addClass( 'btn-success' ).removeClass( 'btn-default' ).html( 'Next Athlete' );
						if( app.state.autopilot.timer ) { clearTimeout( app.state.autopilot.timer ); }
						app.state.autopilot.timer = setTimeout( () => { $( '.autopilot .status' ).addClass( 'btn-default' ).removeClass( 'btn-success' ).html( 'Disengaged' ); }, delay );
					})
				.command( 'scoreboard' )
					.respond( update => {
						let request  = update.request;
						let delay    = (request.delay + 1) * 1000;
						let division = new Division( update.division );
						refresh.athletes( division, true );
						$( '.autopilot .status' ).addClass( 'btn-success' ).removeClass( 'btn-default' ).html( 'Showing Score' );
						if( app.state.autopilot.timer ) { clearTimeout( app.state.autopilot.timer ); }
						app.state.autopilot.timer = setTimeout( () => { $( '.autopilot .status' ).addClass( 'btn-default' ).removeClass( 'btn-success' ).html( 'Disengaged' ); }, delay );
					})

				// ============================================================
				.heard( 'division' )
				// ============================================================
				.command( 'update' )
					.respond( update => {
					})
				// ============================================================
				.heard( 'ring' )
				// ============================================================
				.command( 'update' )
					.respond( update => {
					});

			var page = {
				num : 1,
				transition: ( ev ) => { page.num = PageTransitions.nextPage({ animation: page.animation( page.num )}); },
				animation:  ( pn ) => { return pn; } // Left-right movement is animation #1 and #2 coinciding with page numbers
			};
		</script>
	</body>
</html>
