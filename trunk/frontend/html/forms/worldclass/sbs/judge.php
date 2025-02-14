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
		<link href="css/judge.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/add-ons/bootstrap-slider.min.css" rel="stylesheet" />
		<link href="../../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-slider.min.js"></script>
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
		<script src="widgets/judge/accuracy.js"></script>
		<script src="widgets/judge/presentation.js"></script>
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
				<div id="score-accuracy" class="chung-right">
					<div class="header"></div>
					<div class="common"></div>
					<div class="chung accuracy"></div>
					<div class="hong accuracy"></div>
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- SCORE PRESENTATION -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-2">
				<div id="score-presentation" class="chung-right">
					<div class="header"></div>
					<div class="common"></div>
					<div class="chung presentation"></div>
					<div class="hong presentation"></div>
				</div>
			</div>

			<!-- ============================================================ -->
			<!-- DISPLAY DIVISION -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-3">
				<div id="display-division">
					<div class="header"></div>
					<div class="division"></div>
				</div>
			</div>
		</div>
		<script>
			alertify.defaults.theme.ok     = "btn btn-danger";
			alertify.defaults.theme.cancel = "btn btn-warning";
			$.cookie.json = true;

			let tournament = <?= $tournament ?>;
			let ring       = { num: <?= $rnum ?> };
			let html       = FreeScore.html;
			let app        = new FreeScore.App( ring.num );

			// ===== NETWORK CONNECT
			app.on.connect( '<?= $url ?>' ).read.division();

			// ===== STATE
			app.state.current = { ring: <?= $rnum ?>, judge: <?= $jnum ?>, divid: null, round: null, match: null, form: null, page: 'accuracy', score: null };

			app.state.athlete = {
				chung: null,
				hong:  null
			};

			app.state.score = { 
				chung: { index: null, major: 0, minor: 0, power: 0, rhythm: 0, ki: 0 },
				hong:  { index: null, major: 0, minor: 0, power: 0, rhythm: 0, ki: 0 }
			};

			app.state.reset = () => { 
				$.removeCookie( 'judge-app' ); 
				app.state.current = { ring: <?= $rnum ?>, judge: <?= $jnum ?>, divid: null, round: null, match: null, form: null, page: 'accuracy', score: null }; 
				app.state.score   = {
					chung: { index: null, major: 0, minor: 0, power: 0, rhythm: 0, ki: 0 },
					hong:  { index: null, major: 0, minor: 0, power: 0, rhythm: 0, ki: 0 }
				};
			}
			app.state.restore = () => { 
				if( ! defined( $.cookie( 'judge-app' ))) { app.state.reset(); return; }
				app.state.current = $.cookie( 'judge-app' ); 
				app.state.score   = app.state.current.score;
			};
			app.state.save = () => { 
				app.state.current.score = app.state.score;
				app.state.current.page  = Object.keys( app.page.for ).find( page => app.page.for[ page ] == app.page.num );
				$.cookie( 'judge-app', app.state.current, { expires: 1 }); 
			};

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
					setTimeout(() => { app.widget?.[ target ]?._refresh.score(); }, 50 );
				}
			};

			// ============================================================
			// RESTORE FROM COOKIE ON LOAD
			// ============================================================
			app.state.restore();

			// ============================================================
			// APP COMPOSITION
			// ============================================================
			app.widget = {
				accuracy:     new FreeScore.Widget.SBSJudgeAccuracy( app, 'score-accuracy' ),
				presentation: new FreeScore.Widget.SBSJudgePresentation( app, 'score-presentation' )
			};

			// ============================================================
			// NETWORK
			// ============================================================
			app.network.on
				// ============================================================
				.heard( 'division' )
				// ============================================================
				.command( 'update' )
					.respond( update => {
						let division = update?.division;
						if( ! defined( division )) { return; }

						division = new Division( division );
						let match = division.current.match();
						if( ! defined( match )) { return; }

						let current   = app.state.current;
						let different = {
							ring:  current.ring  != <?= $rnum ?>,
							judge: current.judge != <?= $jnum ?>,
							divid: current.divid != division.name(),
							round: current.round != division.current.roundId(),
							match: current.match != match.number,
							form:  current.form  != division.current.formId()
						};

						if( different.divid || different.round || different.match || different.form ) {
							app.state.reset();
							let current = app.state.current;
							current.divid = division.name();
							current.round = division.current.roundId();
							current.match = match.number;
							current.form  = division.current.formId();
							app.state.save();
						}

						app.state.score.chung.index = match.chung;
						app.state.score.hong.index  = match.hong;

						app.state.athlete.chung = defined( match.chung ) ? division.athlete( match.chung ) : null;
						app.state.athlete.hong  = defined( match.hong )  ? division.athlete( match.hong )  : null;

						if( current.page in app.page.show ) { app.page.show[ current.page ](); }
						else {
							alertify.error( `${current.page} is not a valid page; defaulting to 'accuracy'` );
							app.page.show.accuracy();
						}
					});
		</script>
	</body>
</html>
