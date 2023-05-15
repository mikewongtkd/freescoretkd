<?php 
	$clear_cookie = time() - 3600; # set cookie expiration data to an hour ago (expire immediately)
	include( "../../include/php/config.php" ); 
	include( "../../session.php" ); 
	setcookie( 'judge', '', $clear_cookie, '/' );
	setcookie( 'role', 'display', 0, '/' );
	$i = isset( $_GET[ 'ring' ] ) ? $_GET[ 'ring' ] : $_COOKIE[ 'ring' ];
	$k = json_decode( $tournament )->rings->count;
	if( $i == 'staging' || (ctype_digit( $i ) && (integer) $i >= 1 && (integer) $i <= $k)) { 
		setcookie( 'ring', $i, 0, '/' ); 
		$cookie_set = true;
	} else {
		setcookie( 'ring', 1, 0, '/' ); 
	}
	$url = $config->websocket( 'breaking', $i, 'computer+operator' );
?>
<html>
	<head>
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="include/css/coordinator.css" rel="stylesheet" />
		<link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/page-transitions/css/animations.css" rel="stylesheet" type="text/css" />
		<link href="../../include/css/brackets-bootstrap.css" rel="stylesheet" type="text/css" />
		<link href="../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
		<script src="../../include/opt/svg/svg.min.js"></script>
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/jquery/js/jquery.totemticker.min.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootstrap-list-filter.min.js"></script>
		<script src="../../include/bootstrap/add-ons/brackets.js"></script>
		<script src="../../include/alertify/alertify.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/websocket.js"></script>
		<script src="../../include/js/sound.js"></script>
		<script src="../../include/js/app.js"></script>
		<script src="include/js/score.js"></script>
		<script src="include/js/athlete.js"></script>
		<script src="include/js/division.js"></script>
	</head>
	<body>
		<div id="pt-main" class="pt-perspective">
			<!-- ============================================================ -->
			<!-- RING DIVISIONS -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-1">
				<div class="container">
					<div class="page-header"><span id="ring-header">Ring <?= $i ?> Divisions</span></div>
					<form role="form">
						<div class="form-group">
							<input id="search-ring" class="form-control" type="search" placeholder="Search..." />
						</div>
						<div class="list-group" id="ring">
						</div>
					</form>
				</div>
			</div>
			<!-- ============================================================ -->
			<!-- DIVISION ATHLETES -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-2">
				<div class="container">
				<div class="page-header"><a id="back-to-divisions" class="btn btn-warning"><span class="glyphicon glyphicon-menu-left"></span> Ring <?= $i ?></a> <span id="division-header"></span><div class="ping-display"><span class="fas fa-heart"></span></div></div>
					<div class="row">
						<div class="col-lg-9">
							<div class="list-group" id="athletes">
							</div>
							<div class="brackets" id="brackets"></div>
						</div>
						<div class="action-menu col-lg-3">
							<div class="navigate-division">
								<h4>Division</h4>
								<div class="list-group">
									<a class="list-group-item" id="navigate-division"><span class="glyphicon glyphicon-play"></span><span id="navigate-division-label">Start Scoring this Division</span></a>
								</div>
							</div>
							<div class="navigate-athlete">
								<h4>Athlete</h4>
								<div class="list-group">
									<a class="list-group-item" id="navigate-athlete"><span class="glyphicon glyphicon-play"></span><span id="navigate-athlete-label">Start Scoring this Athlete</span></a>
								</div>
							</div>
							<div class="scoring">
								<h4>Judge Scores</h4>
								<div id="judge-scores">
<?php include_once( 'coordinator/judge-scores.php' ); ?>
								</div>
							</div>
							<div class="autopilot">
								<h4>Autopilot</h4>
								<a class="btn btn-block btn-default disabled status">Disengaged</a>
							</div>
							<div class="timer">
								<h4>Timer</h4>
								<div class="timer-display" id="time">0:00</div>
								<div class="btn-group">
									<a class="btn btn-primary" id="time-start"><span class="fas fa-play"></span></a>
									<a class="btn btn-primary" id="time-stop"><span class="fas fa-pause"></span></a>
									<a class="btn btn-primary" id="time-reset"><span class="fas fa-fast-backward"></span></a>
								</div>
							</div>
							<div class="decision">
								<h4>Decisions</h4>
								<div class="list-group">
									<a class="list-group-item" id="decision-withdraw"><span class="fas fa-minus"></span> Withdraw</a>
									<a class="list-group-item" id="decision-disqualify"><span class="fas fa-exclamation-triangle"></span> Disqualify</a>
									<a class="list-group-item" id="decision-clear"><span class="fas fa-times"></span> Clear Decision</a>
								</div>
							</div>
							<div class="administration">
								<h4>Administration</h4>
								<div class="list-group">
									<a class="list-group-item" id="admin-display"><span class="fas fa-desktop"></span>Show Display</a>
									<a class="list-group-item" id="admin-view"><span class="glyphicon glyphicon-eye-open"></span>Change View</a>
									<a class="list-group-item" id="admin-edit"><span class="glyphicon glyphicon-edit"></span>Edit Division</a>
									<a class="list-group-item" id="admin-print"><span class="glyphicon glyphicon-print"></span>Print Results</a>
								</div>
								<p class="text-muted">Make sure athletes and judge are stopped before clicking any administration actions.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<script src="../../include/page-transitions/js/pagetransitions.js"></script>
		<script>
			alertify.defaults.theme.ok     = "btn btn-danger";
			alertify.defaults.theme.cancel = "btn btn-warning";

			var judges     = { name : [ 'referee', 'j1', 'j2', 'j3', 'j4', 'j5', 'j6' ] };
			var html       = FreeScore.html;
			var app        = new FreeScore.App();

			app.state.reset = () => {
				app.state.autopilot = { timer : null };
				app.state.time = { start : null, elapsed : 0, stop : null, limit : 180, timer : null, warning : false };
			};
			app.state.reset();

			app.on.connect( '<?= $url ?>' ).read.ring();

			app.network.on
				.response( 'autopilot' )
				.handle( 'leaderboard' )
				.by( update => {
					let request = update.request;
					let delay   = (request.delay + 1) * 1000;
					$( '.autopilot .status' ).addClass( 'btn-success' ).removeClass( 'btn-default' ).html( 'Showing Leaderboard' );
					if( app.state.autopilot.timer ) { clearTimeout( app.state.autopilot.timer ); }
					app.state.autopilot.timer = setTimeout( () => { $( '.autopilot .status' ).addClass( 'btn-default' ).removeClass( 'btn-success' ).html( 'Disengaged' ); }, delay );

				})
				.handle( 'next' )
				.by( update => {
					let request = update.request;
					let delay   = (request.delay + 1) * 1000;
					$( '.autopilot .status' ).addClass( 'btn-success' ).removeClass( 'btn-default' ).html( 'Next Athlete' );
					if( app.state.autopilot.timer ) { clearTimeout( app.state.autopilot.timer ); }
					app.state.autopilot.timer = setTimeout( () => { $( '.autopilot .status' ).addClass( 'btn-default' ).removeClass( 'btn-success' ).html( 'Disengaged' ); }, delay );
					app.dispatch( 'division', 'score', update );
				})
				.handle( 'scoreboard' )
				.by( update => {
					let request  = update.request;
					let delay    = (request.delay + 1) * 1000;
					let division = new Division( update.division );
					app.refresh.athletes( division, true );
					$( '.autopilot .status' ).addClass( 'btn-success' ).removeClass( 'btn-default' ).html( 'Showing Score' );
					if( app.state.autopilot.timer ) { clearTimeout( app.state.autopilot.timer ); }
					app.state.autopilot.timer = setTimeout( () => { $( '.autopilot .status' ).addClass( 'btn-default' ).removeClass( 'btn-success' ).html( 'Disengaged' ); }, delay );
				})
				.response( 'ring' )
				.handle( 'read' )
				.by( update => {
					let ring = update.ring;
					app.refresh.ring( ring );
					let divid = $.cookie( 'breaking-divid' );
					if( defined( divid )) {
						let division = ring.divisions.find( d => d.name == divid );
						let current  = ring.divisions.find( d => d.name == ring.current );

						if( ! defined( division )) { return; }
						division = new Division( division );
						let isCurDiv = division.name() == current.name;
						app.refresh.athletes( division, isCurDiv );

						if( page.num == 1 ) { page.transition() };
					}
				})
				.response( 'server' )
				.handle( 'ping' )
				.by( ping => {
					let timestamp = (new Date).toISOString();
					let pong = { type : 'client', action : 'pong', server : { ping : { timestamp : ping.server.timestamp }}, client : { pong : { timestamp }}};
					app.network.send( pong );
					$( '.ping-display .fas' ).removeClass( 'fa-heart' ).addClass( 'fa-heartbeat' );
					setTimeout( () => { $( '.ping-display .fas' ).removeClass( 'fa-heartbeat' ).addClass( 'fa-heart' ); }, 500 );
				})
				.response( 'users' )
				.handle( 'update' )
				.by( update => {
					let color = { strong : 'btn-success', good : 'btn-success', weak : 'btn-warning', bad : 'btn-danger', dead : 'btn-default', 'n/a' : 'btn-default' }; 
					let any = 'btn-success btn-warning btn-danger btn-default';
					update.users.filter( user => user.role.match( /^judge/i )).forEach( user => {
						let role = user.role;
						role = role.replace( /udge/, '' );
						let health = user.health;
						$( `.${role}.judge-col button` ).removeClass( any ).addClass( color[ health ]);
					});
					let display = update.users.find( user => user.role.match( /^display/i ));
					if( ! display ) { alertify.notify( 'No display currently being shown. Please show display' ); }
					else if( display.health == 'strong' || display.health == 'good' ) { alertify.success( `Display connection is ${display.health}` ); }
					else if( display.health == 'weak' )                               { alertify.warning( `Display connection is ${display.health}` ); }
					else if( display.health == 'bad' || display.health == 'dead' )    { alertify.danger( `Display connection is ${display.health}` ); }
				})
				.response( 'division' )
				.handle( 'decision' )
				.by( update => {
					let division = new Division( update.division );
					app.refresh.athletes( division, true );
				})
				.handle( 'leaderboard' )
				.by( update => {
					let division = new Division( update.division );
					app.refresh.navadmin( division );
				})
				.handle( 'score' )
				.by( update => {
					let division = new Division( update.division );
					app.refresh.athletes( division, true );
				})
				.handle( 'scoreboard' )
				.by( update => {
					let division = new Division( update.division );
					app.refresh.navadmin( division );
				})
				.handle( 'time reset' ).pass()
				.handle( 'time start' ).pass()
				.handle( 'time stop'  ).pass();

			var page = {
				num : 1,
				transition: ( ev ) => { page.num = PageTransitions.nextPage({ animation: page.animation( page.num )}); },
				animation:  ( pn ) => { return pn; } // Left-right movement is animation #1 and #2 coinciding with page numbers
			};

			app.refresh = { 
				// ------------------------------------------------------------
				actions : division => {
				// ------------------------------------------------------------
					var athlete = division.current.athlete();
					var current = division.current.athleteid();

					var action = {
						decision : {
							withdraw   : () => { app.sound.next.play(); alertify.confirm( "Withdraw "   + athlete.name() + "?", 'Click <b class="text-danger">OK</b> to withdraw <b class="text-danger">' + athlete.name() + '</b> from competition or <b class="text-warning">Cancel</b> to do nothing.', function() { sound.ok.play(); action.decision.send( 'WDR'   ); alertify.error( athlete.name() + ' has withdrawn' );         }, function() { sound.prev.play(); }); $( '.ajs-header' ).addClass( 'decision-punitive-header' ); },
							disqualify : () => { app.sound.next.play(); alertify.confirm( "Disqualify " + athlete.name() + "?", 'Click <b class="text-danger">OK</b> to disqualify <b class="text-danger">' + athlete.name() + '</b> from competition or <b class="text-warning">Cancel</b> to do nothing.', function() { sound.ok.play(); action.decision.send( 'DSQ' ); alertify.error( athlete.name() + ' has been disqualified' ); }, function() { sound.prev.play(); }); $( '.ajs-header' ).addClass( 'decision-punitive-header' ); },
							clear      : () => { app.sound.next.play(); alertify.confirm( "Clear Decisions for " + athlete.name() + "?", 'Click <b class="text-danger">OK</b> to clear WDR and DSQ decisions for <b class="text-danger">' + athlete.name() + '</b> or <b class="text-warning">Cancel</b> to do nothing.', function() { app.sound.ok.play(); action.decision.send( 'clear' ); alertify.success( athlete.name() + ' has been cleared of punitive decisions' ); }, function() { app.sound.prev.play(); }); $( '.ajs-header' ).addClass( 'decision-punitive-header' ); },
							send       : ( reason ) => { app.network.send({ type : 'division', action : 'decision', decision: reason }); }
						},
					};

					$( "#decision-withdraw" )   .off( 'click' ).click( action.decision.withdraw );
					$( "#decision-disqualify" ) .off( 'click' ).click( action.decision.disqualify );
					$( "#decision-clear" )      .off( 'click' ).click( action.decision.clear );
				},
				// ------------------------------------------------------------
				athletes: function( division, isCurrentDivision ) {
				// ------------------------------------------------------------
					$( '#athletes' ).show();
					$( '#brackets' ).hide();
					$( 'body' ).off( 'keypress' );
					$( '#division-header' ).html( division.summary() );
					$( '#back-to-divisions' ).off( 'click' ).click(( ev ) => { 
						app.sound.prev.play();
						$.removeCookie( 'breaking-divid' );
						page.transition(); 
					});

					// ===== POPULATE THE ATHLETE LIST
					$( '#athletes' ).empty();
					division.athletes().forEach(( athlete, i ) => {
						let button    = html.a.clone().addClass( "list-group-item" );
						let name      = html.span.clone().addClass( "athlete-name" ).html( athlete.name() );
						let boards    = html.span.clone().addClass( "athlete-boards" ).html( `${athlete.boards()} board${athlete.boards()==1 ? '' : 's'}` );
						let total     = html.span.clone().addClass( "athlete-score" ).html( athlete.score() );
						let j         = division.current.athleteid();

						// ===== CURRENT ATHLETE
						if( i == j && isCurrentDivision ) { 
							button.addClass( "active" ); 
							button.off( 'click' ).click(( ev ) => { 
								app.sound.prev.play(); 
								$( '#athletes .list-group-item' ).removeClass( 'selected-athlete' ); 
								$( "#navigate-athlete" ).attr({ 'athlete-id' :i });
								$( ".navigate-athlete" ).hide(); 
								$( ".decision" ).show(); 
							});
							app.refresh.judges( division );

						// ===== ATHLETE IN CURRENT DIVISION
						} else if( isCurrentDivision ) {
							if( i == j + 1 ) { button.addClass( "on-deck" ); } // Athlete on deck
							button.off( 'click' ).click(( ev ) => { 
								let clicked = $( ev.target );
								if( ! clicked.is( 'a' )) { clicked = clicked.parents( 'a' ); }
								app.sound.next.play(); 
								$( '#athletes .list-group-item' ).removeClass( 'selected-athlete' ); 
								clicked.addClass( 'selected-athlete' ); 
								$( "#navigate-athlete-label" ).html( "Start scoring " + athlete.name()); 
								$( "#navigate-athlete" ).attr({ 'athlete-id' :i });
								$( ".navigate-athlete" ).show(); 
								$( ".decision" ).hide(); 
							});

						// ===== ATHLETE IN ANOTHER DIVISION
						} else {
							button.off( 'click' );
						}
						app.refresh.navadmin( division );
						button.append( name, boards, total );
						$( '#athletes' ).append( button );
					});

					// ===== ACTION MENU BEHAVIOR
					if( isCurrentDivision ) { $( '.navigate-division' ).hide(); $( '.administration' ).show(); $( '.decision' ).show(); $( '.scoring' ).show(); } 
					else                    { $( '.navigate-division' ).show(); $( '.administration' ).hide(); $( '.decision' ).hide(); $( '.scoring' ).hide(); }

					app.refresh.actions( division );
					$( '.navigate-athlete' ).hide();

					// ===== TIMER BEHAVIOR
					let time = {
						reset : ev => {
							app.sound.prev.play();
							$( '#time-start' ).show().off( 'click' ).click( ev => { time.start( ev );});
							$( '#time-stop' ).hide();
							$( '#time-reset' ).addClass( 'disabled' );
							$( '#time' ).removeClass( 'overtime' ).html( '0:00' );
							app.state.time.warning = false;
							app.state.time.elapsed = 0;
							if( app.state.time.start ) { 
								app.state.time.start = null;
								app.state.time.stop  = null;
								app.network.send({ type : 'division', action : 'time reset'});
							}
						},
						start : ev => {
							app.sound.next.play();
							app.state.time.timer = setInterval( time.tick, 500 );
							app.state.time.start = Date.now();
							$( '#time-start' ).hide();
							$( '#time-stop' ).show().off( 'click' ).click( ev => { time.stop( ev ); });
							app.network.send({ type : 'division', action : 'time start' });
						},
						stop : ev => {
							app.sound.prev.play();
							clearInterval( app.state.time.timer );
							$( '#time-reset' ).removeClass( 'disabled' ).off( 'click' ).click( ev => { time.reset( ev ); });
							$( '#time-stop' ).hide();
							$( '#time-start' ).show().off( 'click' ).click( ev => { time.start( ev ); });
							app.network.send({ type : 'division', action : 'time stop' });
							app.state.time.stop    = Date.now();
							app.state.time.elapsed = Math.floor(( app.state.time.stop - app.state.time.start) / 1000 ) + app.state.time.elapsed;
							if( app.state.time.warning ) {
								let over  = app.state.time.elapsed - app.state.time.limit;
								let count = Math.ceil( over / 10 );
								alertify.error( `${count} procedural penalties must be applied because the performance is ${over} seconds over time.`, 60 );
							}
						},
						tick : () => {
							let seconds = Math.round(( Date.now() - (app.state.time.start ))/1000) + app.state.time.elapsed;
							let minutes = Math.floor( seconds / 60 );
							if( seconds > app.state.time.limit && ! app.state.time.warning ) { 
								app.state.time.warning = true;
								alertify.error( 'When the performance is complete, let the referee know that an overtime penalty must be applied', 60 );
								$( '#time' ).addClass( 'overtime' ); 
							}
							seconds %= 60;

							let time = `${minutes}:${seconds < 10 ? 0 : ''}${seconds}`;
							$( '#time' ).html( time );
						}
					};
					time.reset();

				},
				// ------------------------------------------------------------
				judges : function( division ) {
				// ------------------------------------------------------------
					let k       = division.judges();
					let athlete = division.current.athlete();
					let scores  = athlete.scores();
					let boards  = parseFloat( athlete.boards() ) * 0.2;


					for( let i = 0; i < 5; i++ ) {
						$( `#judge-scores .j${i}` ).hide();
					}

					for( let i = 0; i < k; i++ ) {
						let score   = scores[ i ];
						let display = {
							column : $( `#judge-scores .j${i}` ),
							technical : $( `#judge-scores .j${i}.tech` ),
							presentation : $( `#judge-scores .j${i}.pres` ),
							sum : $( `#judge-scores .j${i}.sum` )
						};
						let button = {
							clear : $( `#judge-scores .j${i}.clear` )
						};
						display.column.show();
						display.technical.empty().removeClass( 'dropped' );
						display.presentation.empty().removeClass( 'dropped' );
						display.sum.empty().removeClass( 'dropped' );
						if( score.technical()) {
							display.technical.html(( boards + parseFloat( score.technical())).toFixed( 1 ));
							if( score.dropped.technical ) { display.technical.addClass( 'dropped' ); }
						}
						if( score.presentation()) {
							display.presentation.html( parseFloat( score.presentation()).toFixed( 1 ));
							if( score.dropped.presentation ) { display.presentation.addClass( 'dropped' ); }
						}
						if( score.technical() && score.presentation()) {
							display.sum.html(( boards + parseFloat( score.technical()) + parseFloat( score.presentation())).toFixed( 1 ));
						}

						button.clear.off( 'click' ).click( ev => {
							let judge = i == 0 ? 'Referee' : `Judge ${i}`;
							app.sound.next.play();
							alertify.confirm( 
								`Clear score from ${judge}?`, 
								`Click <b>OK</b> to clear the score from ${judge} for ${athlete.name()}, <b>Cancel</b> to leave the score as it is.`,
								ev => {
									app.network.send({ type : 'division', action : 'score', judge : i, score : 'clear' });
									app.sound.ok.play();
									alertify.success( `Score from ${judge} cleared` );
								},
								ev => {}
							);
						});
					}

					let display = {
						mean : {
							technical    : $( '#judge-scores .mean.tech' ),
							presentation : $( '#judge-scores .mean.pres' ),
							sum          : $( '#judge-scores .mean.sum' )
						},
						range : {
							technical    : $( '#judge-scores .range.tech' ),
							presentation : $( '#judge-scores .range.pres' ),
							sum          : $( '#judge-scores .range.sum' )
						},
						deductions : {
							technical    : $( '#judge-scores .deductions.tech' ),
							procedural   : $( '#judge-scores .deductions.proc' ),
						}
					};

					display.mean.technical.html( athlete.mean.technical() );
					display.mean.presentation.html( athlete.mean.presentation() );
					display.mean.sum.html( athlete.mean.total() );
					display.range.technical.html( athlete.range.technical() );
					display.range.presentation.html( athlete.range.presentation() );
					display.range.sum.html( athlete.range.total() );
					display.deductions.technical.html( athlete.deductions.technical());
					display.deductions.procedural.html( athlete.deductions.procedural());
				},
				// ------------------------------------------------------------
				navadmin : function( division ) {
				// ------------------------------------------------------------
					let ringid  = division.ring();
					let ring    = ringid == 'staging' ? 'staging' : `Ring ${ringid}`;
					let divid   = division.name();
					let action = {
						navigate : {
							athlete   : () => { app.sound.ok.play(); let i = $( '#navigate-athlete' ).attr( 'athlete-id' ); action.navigate.to( { destination: 'athlete',  id : i     } ); },
							division  : () => { app.sound.ok.play(); action.navigate.to( { destination: 'division', id : divid } ); },
							to        : ( target ) => { app.network.send({ type : 'division', action : 'navigate', target: target }); }
						},
						administration : {
							refresh    : () => { page.display.location.reload(); window.location.reload(); },
							display    : () => { app.sound.next.play(); page.display = window.open( `index.php?ring=${ringid}`, '_blank' )},
							view       : () => { app.sound.next.play(); app.network.send({ type : 'division', action : (division.scoreboard() ? 'leaderboard' : 'scoreboard') }); },
							edit       : () => { app.sound.next.play(); page.editor  = window.open( `division/editor.php?ring=${ringid}&divid=${divid}`, '_blank' )},
							print      : () => { app.sound.next.play(); page.print   = window.open( `report/results.php?ring=${ringid}&divid=${divid}`, '_blank' )},
						}
					};

					$( "#navigate-athlete" )    .off( 'click' ).click( action.navigate.athlete );
					$( "#navigate-division" )   .off( 'click' ).click( action.navigate.division );
					$( "#admin-display" )       .off( 'click' ).click( action.administration.display );
					$( "#admin-view" )          .off( 'click' ).click( action.administration.view );
					$( "#admin-edit" )          .off( 'click' ).click( action.administration.edit );
					$( "#admin-print" )         .off( 'click' ).click( action.administration.print );
				},
				// ------------------------------------------------------------
				ring: function( ring ) {
				// ------------------------------------------------------------
					$( '#ring' ).empty();
					ring.divisions.forEach(( d ) => {
						let division    = new Division( d );
						let button      = html.a.clone().addClass( "list-group-item" );
						let title       = html.h4.clone().html( division.summary() );
						let count       = division.athletes().length;
						let description = html.p.clone().append( '<b>' + count + ' Athlete' + (count > 1 ? 's' : '') + ':</b> ', division.athletes().map(( a ) => { return a.name(); }).join( ', ' ));

						button.empty();
						button.append( title, description );
						button.attr({ divid: division.name() });
						button.off( 'click' ).click(( ev ) => {
							let clicked  = $( ev.target ); if( ! clicked.is( 'a' ) ) { clicked = clicked.parent(); }
							let divid    = clicked.attr( 'divid' );
							let division = ring.divisions.find(( d ) => { return d.name == divid; });

							$.cookie( 'breaking-divid', divid, { expires: 1, path: '/' });
							division = new Division( division );
							app.refresh.athletes( division, division.name() == ring.current );
							app.sound.next.play();
							page.transition();
						});
						if( d.name == ring.current ) { button.addClass( "active" ); }

						$( '#ring' ).append( button );
					});
					$('#ring').btsListFilter('#search-ring', { initial: false });
				}
			};
		</script>
	</body>
</html>
