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
		<script src="../../../include/jquery/js/jquery.nodoubletapzoom.js"></script>
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
		<div class="display-config modal fade" tabindex="-1" role="dialog">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h4 class="modal-title">Display Configuration and Reset</h4>
					</div>
					<div class="modal-body">
						<div class="display-config-group">
							<label>Flip Chung and Hong</label>
							<button type="button" class="btn flip btn-flip"><span class="fas fa-exchange-alt"></span></button>
						</div>
						<div class="display-config-group">
							<label>Pan and Zoom</label>
							<div class="btn-group">
								<button type="button" class="btn pan btn-pan-up"><span class="fas fa-arrow-up"></span></button>
								<button type="button" class="btn pan btn-pan-down"><span class="fas fa-arrow-down"></span></button>
								<button type="button" class="btn pan btn-pan-left"><span class="fas fa-arrow-left"></span></button>
								<button type="button" class="btn pan btn-pan-right"><span class="fas fa-arrow-right"></span></button>
							</div>
							<div class="btn-group">
								<button type="button" class="btn zoom btn-zoom-out"><span class="fas fa-search-minus"></span></button>
								<button type="button" class="btn zoom btn-zoom-in"><span class="fas fa-search-plus"></span></button>
							</div>
						</div>
						<div class="display-config-group">
							<label>Resets</label>
							<div class="btn-group">
								<button type="button" class="btn reload btn-reload"><span class="fas fa-sync"></span></button>
								<button type="button" class="btn reboot btn-reboot"><span class="fas fa-power-off"></span></button>
							</div>
            </div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-default btn-cancel">Restore to Defaults</button>
						<button type="button" class="btn btn-primary btn-ok">OK</button>
					</div>
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

			// ===== MODAL
			app.modal.display = { 
				config: {
					all: $( '.display-config.modal' ), 
					show: () => {
						app.modal.display.config.all.modal( 'show' );
					},
					hide: () => {
						app.modal.display.config.all.modal( 'hide' );
					}
				}
			};

			// ===== DISPLAY CONFIG
			app.display.config  = { current: { flip: false, zoom: 1.0, pan: { x: 0, y: 0 }}};
			app.display.cookie  = 'judge-app-display';
			app.display.config.apply = () => {
				let display = app.display.config.current;
				$( '#pt-main' ).css({ transform: `scale( ${display.zoom}) translate( ${Math.round( display.pan.x * 100 )}%, ${Math.round( display.pan.y * 100)}% )`, 'transform-origin': '0 0' });
				app.display.flip();
			}
			app.display.config.reset = () => {
				$.removeCookie( app.display.cookie );
				app.display.config.current = { flip: false, zoom: 1.0, pan: { x: 0, y: 0 }};
			};
			app.display.config.restore = () => {
				if( ! defined( $.cookie( app.display.cookie ))) { app.display.config.reset(); return; }
				app.display.config.current = $.cookie( app.display.cookie ); 
			};
			app.display.config.save = () => {
				$.cookie( app.display.cookie, app.display.config.current, { expires: 1 }); 
			};
			app.display.panzoom = delta => {
				let display = app.display.config.current;
				display.pan.x = parseFloat((display.pan.x + delta.x).toFixed( 2 ));
				display.pan.y = parseFloat((display.pan.y + delta.y).toFixed( 2 ));
				display.zoom  = parseFloat((display.zoom  + delta.z).toFixed( 2 ));

				alertify.dismissAll();
				if( delta.z != 0 ) { alertify.notify( `Zoom: ${Math.round( display.zoom * 100 )}%` ); }
				else               { alertify.notify( `Pan: X: ${Math.round( display.pan.x * 100 )}%, Y: ${Math.round( display.pan.y * 100 )}%` ); }

				app.display.config.apply();
			}
			app.display.flip = () => {
				let display = app.display.config.current;
				let acc     = $( '#score-accuracy' );
				let widgets = $( '#score-accuracy, #score-presentation' );
				if( display.flip ) {
					widgets.each(( i, el ) => { $( el ).removeClass( 'chung-right' ); $( el ).addClass( 'chung-left' ); });
				} else {
					widgets.each(( i, el ) => { $( el ).removeClass( 'chung-left' ); $( el ).addClass( 'chung-right' ); });
				}
			}

			// ===== BUTTONS & BEHAVIOR
			app.button.flip   = $( '.display-config .btn-flip' );
			app.button.zoom   = $( '.display-config .btn.zoom' );
			app.button.pan    = $( '.display-config .btn.pan' );
			app.button.reload = $( '.display-config .btn.reload' );
			app.button.reboot = $( '.display-config .btn.reboot' );
			app.button.ok     = $( '.display-config .btn-ok' );
			app.button.cancel = $( '.display-config .btn-cancel' );

			app.button.flip.off( 'click' ).click( ev => {
				let acc     = $( '#score-accuracy' );
				app.display.config.current.flip = app.display.config.current.flip ? false : true;
				app.display.flip();
			});

			app.button.pan.off( 'click' ).click( ev => {
				let target = $( ev.target );
				if( ! target.hasClass( 'btn' )) { target = target.parent( '.btn' ); }

				let display = app.display.config.current;
				if( target.hasClass( 'btn-pan-up' ))    { app.display.panzoom({ x:  0.00, y: -0.05, z:  0.00 }); } else
				if( target.hasClass( 'btn-pan-down' ))  { app.display.panzoom({ x:  0.00, y:  0.05, z:  0.00 }); } else
				if( target.hasClass( 'btn-pan-left' ))  { app.display.panzoom({ x: -0.05, y:  0.00, z:  0.00 }); } else
				if( target.hasClass( 'btn-pan-right' )) { app.display.panzoom({ x:  0.05, y:  0.00, z:  0.00 }); }
			});

			app.button.zoom.off( 'click' ).click( ev => {
				let target = $( ev.target );
				if( ! target.hasClass( 'btn' )) { target = target.parent( '.btn' ); }

				let display = app.display.config.current;
				if( target.hasClass( 'btn-zoom-in' )) {
					app.display.panzoom({ x: 0, y: 0, z: +0.05 });
				} else {
					app.display.panzoom({ x: 0, y: 0, z: -0.05 });
				}
			});

      app.button.reload.off( 'click' ).click( ev => { window.location.reload(); });
      app.button.reboot.off( 'click' ).click( ev => { 
        app.state.reset();
        window.location.reload(); 
      });

			app.button.ok.off( 'click' ).click( ev => {
				app.display.config.save();
				app.modal.display.config.hide();
			});

			app.button.cancel.off( 'click' ).click( ev => {
				app.display.config.reset();
				window.location.reload();
				app.modal.display.config.hide();
			});

			// ===== STATE
			app.state.current = { ring: <?= $rnum ?>, judge: <?= $jnum ?>, divid: null, round: null, match: null, form: null, page: 'accuracy', score: null };
			app.state.cookie  = 'judge-app';
			app.state.athlete = {
				chung: null,
				hong:  null
			};

			app.state.score = { 
				chung: { index: null, major: 0, minor: 0, power: 0, rhythm: 0, ki: 0 },
				hong:  { index: null, major: 0, minor: 0, power: 0, rhythm: 0, ki: 0 }
			};

			app.state.reset = () => { 
				$.removeCookie( app.state.cookie ); 
				app.state.current = { ring: <?= $rnum ?>, judge: <?= $jnum ?>, divid: null, round: null, match: null, form: null, page: 'accuracy', score: null }; 
				app.state.score   = {
					chung: { index: null, major: 0, minor: 0, power: 0, rhythm: 0, ki: 0 },
					hong:  { index: null, major: 0, minor: 0, power: 0, rhythm: 0, ki: 0 }
				};
			}
			app.state.restore = () => { 
				if( ! defined( $.cookie( app.state.cookie ))) { app.state.reset(); return; }
				app.state.current = $.cookie( app.state.cookie ); 
				app.state.score   = app.state.current.score;
				app.page.transition( app.state.current.page );
			};
			app.state.save = () => { 
				app.state.current.score = app.state.score;
				app.state.current.page  = Object.keys( app.page.for ).find( page => app.page.for[ page ] == app.page.num );
				$.cookie( app.state.cookie, app.state.current, { expires: 1 }); 
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
			app.display.config.restore();
			app.display.config.apply();

			// ============================================================
			// APP COMPOSITION
			// ============================================================
			app.widget = {
				accuracy:     new FreeScore.Widget.SBSJudgeAccuracy( app, 'score-accuracy' ),
				presentation: new FreeScore.Widget.SBSJudgePresentation( app, 'score-presentation' )
			};

			app.forwardIf = {
				cutoff: division => {
					let method = division.current.method();
					let ring   = division.ring();

					if( method == 'cutoff' ) { window.location = `../judge.php?ring=<?= $rnum ?>&judge=<?= $jnum ?>`; }
				},
				se: division => {
					let method = division.current.method();
					let ring   = division.ring();

					if( method == 'se' ) { window.location = `../judge.php?ring=<?= $rnum ?>&judge=<?= $jnum ?>`; }
				}
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
						app.forwardIf.cutoff( division );
						app.forwardIf.se( division );

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

			$(() => { $( 'body' ).nodoubletapzoom(); });
		</script>
	</body>
</html>
