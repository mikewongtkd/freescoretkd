<?php 
	$an_hour_ago = time() - 3600; # set cookie expiration data to an hour ago (expire immediately)
	include( "../../../include/php/config.php" ); 
	setcookie( 'judge', '', $an_hour_ago, '/' );
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
		<link href="../se/css/coordinator.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/page-transitions/css/animations.css" rel="stylesheet" type="text/css" />
		<link href="../../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-list-filter.min.js"></script>
		<script src="../../../include/alertify/alertify.min.js"></script>
		<script src="../../../include/js/freescore.js"></script>
		<script src="../../../include/js/websocket.js"></script>
		<script src="../../../include/js/sound.js"></script>
		<script src="../../../include/js/event.js"></script>
		<script src="../../../include/js/app.js"></script>
		<script src="../../../include/js/widget.js"></script>
		<script src="../se/widgets/controls/autopilot.js"></script>
		<script src="../se/widgets/controls/navigation.js"></script>
		<script src="../se/widgets/controls/penalties.js"></script>
		<script src="../se/widgets/controls/decision.js"></script>
		<script src="../se/widgets/controls/admin.js"></script>
		<script src="../se/widgets/division-list.js"></script>
		<script src="../se/widgets/header.js"></script>
		<script src="../se/widgets/athlete-list.js"></script>
		<script src="../se/widgets/judges.js"></script>
		<script src="../../../include/js/forms/worldclass/form.class.js"></script>
		<script src="../../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../../include/js/forms/worldclass/division.class.js"></script>
		<title>World Class Ring <?= $rnum ?> Operations</title>
	</head>
	<body>
		<div id="pt-main" class="pt-perspective">
			<!-- ============================================================ -->
			<!-- RING DIVISIONS -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-1">
				<div class="container">
					<div class="page-header ring"><span id="ring-header">Ring <?= $rnum ?> Operations</span></div>
					<div class="clearfix">
						<div class="pull-left">
							<ul class="nav nav-tabs" id="division-nav-tabs">
							</ul>
						</div>
					</div>
					<div class="tab-content" id="division-tab-contents">
					</div>
				</div>
			</div>
			<!-- ============================================================ -->
			<!-- DIVISION ATHLETES -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-2">
				<div class="container">
				<div class="page-header division" id="division-header">
					<a id="back-to-divisions" class="btn btn-warning"><span class="glyphicon glyphicon-menu-left"></span> Ring <?= $rnum ?></a> <span id="division-summary"></span>
				</div>
					<div class="row">
						<div class="col-lg-9">
							<div>
								<div id="division-round">Round</div>
								<div id="current-form"></div>
							</div>
							<div class="list-group" id="athletes">
							</div>
						</div>
						<div class="action-menu col-lg-3">
							<div id="judge-scores">
							</div>
							<div id="controls">
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<script src="../../../include/page-transitions/js/pagetransitions.js"></script>
		<script>
			alertify.defaults.theme.ok     = "btn btn-danger";
			alertify.defaults.theme.cancel = "btn btn-warning";

			let tournament = <?= $tournament ?>;
			let ring       = { num: <?= $rnum ?> };
			let html       = FreeScore.html;
			let app        = new FreeScore.App();

			app.state = { current : {}, divisions : null, loaded : false };

			app.page = {
				num : 1,
				count: 2,
				show: {
					division: () => { if( app.page.num == 2 ) { return; } app.page.transition(); },
					ring:     () => { if( app.page.num == 1 ) { return; } app.page.transition(); }
				},
				transition: ( ev ) => { app.page.num = PageTransitions.nextPage({ animation: app.page.animation( app.page.num )}); },
				animation:  ( pn ) => { return pn; } // Left-right movement is animation #1 and #2 coinciding with page numbers
			};

			app.forwardIf = {
				cutoff : () => {
					let round = app.state.current.division?.round;
					let forms = app.state.current.division?.forms;

					if( ! round?.match( /^ro/ )) { 
						window.location = '../coordinator.php?ring=<?= $rnum ?>'; 
					}
				},
				se : () => {
					let round = app.state.current.division?.round;
					let forms = app.state.current.division?.forms;

					if( ! forms?.[ round ]?.some( form => form.match( /^draw/i ))) {
						window.location = '../se/coordinator.php?ring=<?= $rnum ?>'; 
					}
				}
			};

			// ============================================================
			// APP COMPOSITION
			// ============================================================
			app.widget = {
				divisions : {
					ready     : new FreeScore.Widget.SEDivisionList( app, 'ready'     ),
					completed : new FreeScore.Widget.SEDivisionList( app, 'completed' ),
					staging   : new FreeScore.Widget.SEDivisionList( app, 'staging'   ),
				},
				division : {
					athlete : {
						list : new FreeScore.Widget.SEAthleteList( app, 'athletes' )
					},
					header : new FreeScore.Widget.SEHeader( app, 'division-header' )
				},
				judges     : new FreeScore.Widget.SEJudges( app, 'judge-scores' ),
				autopilot  : new FreeScore.Widget.SEAutopilot( app, 'controls' ),
				navigation : new FreeScore.Widget.SENavigation( app, 'controls' ),
				penalties  : new FreeScore.Widget.SEPenalties( app, 'controls' ),
				decision   : new FreeScore.Widget.SEDecision( app, 'controls' ),
				admin      : new FreeScore.Widget.SEAdmin( app, 'controls' )
			};

			app.on.connect( '<?= $url ?>' ).read.ring();

			// ===== NETWORK LISTENER/HANDLERS
			app.network.on
			// ============================================================
			.heard( 'ring' )
			// ============================================================
				.command( 'update' )
					.respond( update => {
						if( ! defined( update?.ring )) { return; }
						let ring  = update.ring;
						let divid = $.cookie( 'divid' ) ? $.cookie( 'divid' ) : (ring?.current ? ring.current : ring?.divisions?.[ 0 ]?.name);
						app.state.divisions        = ring?.divisions;
						app.state.current.divid    = divid;
						app.state.current.division = app.state.divisions?.find( div => div.name == app.state.current.divid );

						app.forwardIf.cutoff();
						app.forwardIf.se();

						if( defined( divid ) && ! app.state.loaded ) {
							let message = { divid, current : divid };
							app.event.trigger( 'division-show', message );
							app.state.loaded = true;
						}
					})
			// ============================================================
			.heard( 'autopilot' )
			// ============================================================
				.command( 'update' )
					.respond( update => {
						let action = update?.request?.action;
						if( action != 'next' ) { return; }
						let request = { type: 'division', action: 'read' };
						app.network.send( request );

					});

			// ===== EVENT LISTENER/HANDLERS
			app.event
				.listen( 'division-show' )
					.respond(( type, source, message ) => {
						app.state.current.divid    = message.divid;
						app.state.current.division = app.state.divisions?.find( div => div.name == app.state.current.divid );
						app.sound.next.play();
						app.page.show.division();
					})
				.listen( 'ring-show' )
					.respond(( type, source, message ) => {
						$.removeCookie( 'divid' );
						let request = { type : 'ring', action : 'read' };
						app.network.send( request );
						app.sound.prev.play();
						app.page.show.ring();
					});

			$(() => {
				// ===== PREVENT LIST FILTER FORM FROM SUBMITTING ON ENTER
				$( 'form' ).keydown(( ev ) => {
					if( ev.keyCode == 13 ) {
						ev.preventDefault();
						$( ev.target ).blur();
						return false;
					}
				});
			});
		</script>
	</body>
</html>
