<?php 
	$an_hour_ago = time() - 3600; # set cookie expiration data to an hour ago (expire immediately)
	include( "../../include/php/config.php" ); 
	setcookie( 'judge', '', $an_hour_ago, '/' );
	$rnum  = intval( isset( $_GET[ 'ring' ] ) ? $_GET[ 'ring' ] : $_COOKIE[ 'ring' ]);
	if( $rnum == 'staging' || in_array( $rnum, $config->rings())) { 
		setcookie( 'ring', $rnum, 0, '/' ); 
		$cookie_set = true;
	} else {
		setcookie( 'ring', 1, 0, '/' ); 
	}
	include( '../../session.php' );

	$url = $config->websocket( 'worldclass', $rnum, 'computer+operator' );
?>
<html>
	<head>
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/css/forms/worldclass/coordinator.css" rel="stylesheet" />
		<link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/page-transitions/css/animations.css" rel="stylesheet" type="text/css" />
		<link href="../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootstrap-list-filter.min.js"></script>
		<script src="../../include/alertify/alertify.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/uuid.js"></script>
		<script src="../../include/js/websocket.js"></script>
		<script src="../../include/js/sound.js"></script>
		<script src="../../include/js/event.js"></script>
		<script src="../../include/js/app.js"></script>
		<script src="../../include/js/forms/worldclass/form.class.js"></script>
		<script src="../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../include/js/forms/worldclass/division.class.js"></script>
		<title>World Class Ring <?= $rnum ?> Operations</title>
	</head>
	<body>
		<div id="pt-main" class="pt-perspective">
			<!-- ============================================================ -->
			<!-- RING DIVISIONS -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-1">
				<div class="container">
					<div class="page-header"><span id="ring-header">Ring <?= $rnum ?> Operations</span></div>
					<div class="clearfix">
						<div class="pull-left">
							<ul class="nav nav-tabs">
								<li class="active"><a data-toggle="tab" href="#ready">Ready Divisions</a></li>
								<li><a data-toggle="tab" href="#completed">Completed Divisions</a></li>
								<li><a data-toggle="tab" href="#staging">Staging Divisions</a></li>
							</ul>
						</div>
					</div>
					<div class="tab-content">
						<div id="ready" class="tab-pane fade in active">
							<form role="form">
								<div class="form-group">
									<input id="search-ready" class="form-control" type="search" placeholder="Search..." />
								</div>
								<div class="list-group" id="ring-ready">
								</div>
							</form>
						</div>
						<div id="completed" class="tab-pane fade">
							<form role="form">
								<div class="form-group">
									<input id="search-completed" class="form-control" type="search" placeholder="Search..." />
								</div>
								<div class="list-group" id="ring-completed">
								</div>
							</form>
						</div>
						<div id="staging" class="tab-pane fade">
							<form role="form">
								<div class="form-group">
									<input id="search-staging" class="form-control" type="search" placeholder="Search..." />
								</div>
								<div class="list-group" id="staging-divisions">
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
			<!-- ============================================================ -->
			<!-- DIVISION ATHLETES -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-2">
				<div class="container">
				<div class="page-header">
					<a id="back-to-divisions" class="btn btn-warning"><span class="glyphicon glyphicon-menu-left"></span> Ring <?= $rnum ?></a> <span id="division-header"></span>
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
							<div class="navigate-division">
								<h4>Division</h4>
								<div class="list-group">
									<a class="list-group-item" id="navigate-division"><span class="glyphicon glyphicon-play"></span><span id="navigate-division-label">Start Scoring this Division</span></a>
								</div>
							</div>
							<div id="judge-scores">
								<h4>Judge Scores</h4>
								<table>
									<tr>
										<td>&nbsp;</td>
										<th id="j0-col"><button class="btn btn-xs btn-default">R</button></th>
										<th id="j1-col"><button class="btn btn-xs btn-default">1</button></th>
										<th id="j2-col"><button class="btn btn-xs btn-default">2</button></th>
										<th id="j3-col"><button class="btn btn-xs btn-default">3</button></th>
										<th id="j4-col"><button class="btn btn-xs btn-default">4</button></th>
										<th id="j5-col"><button class="btn btn-xs btn-default">5</button></th>
										<th id="j6-col"><button class="btn btn-xs btn-default">6</button></th>
										<th>Score</th>
										<th>Range</th>
									</tr>
									<tr>
										<th class="acc">A</th>
										<td id="j0-acc" class="acc"></td>
										<td id="j1-acc" class="acc"></td>
										<td id="j2-acc" class="acc"></td>
										<td id="j3-acc" class="acc"></td>
										<td id="j4-acc" class="acc"></td>
										<td id="j5-acc" class="acc"></td>
										<td id="j6-acc" class="acc"></td>
										<td id="score-acc" class="acc"></td>
										<td id="spread-acc" class="acc"></td>
									</tr>
									<tr>
										<th class="pre">P</th>
										<td id="j0-pre" class="pre"></td>
										<td id="j1-pre" class="pre"></td>
										<td id="j2-pre" class="pre"></td>
										<td id="j3-pre" class="pre"></td>
										<td id="j4-pre" class="pre"></td>
										<td id="j5-pre" class="pre"></td>
										<td id="j6-pre" class="pre"></td>
										<td id="score-pre" class="pre"></td>
										<td id="spread-pre" class="pre"></td>
									</tr>
									<tr>
										<th class="sum">=</th>
										<td id="j0-sum" class="sum"></td>
										<td id="j1-sum" class="sum"></td>
										<td id="j2-sum" class="sum"></td>
										<td id="j3-sum" class="sum"></td>
										<td id="j4-sum" class="sum"></td>
										<td id="j5-sum" class="sum"></td>
										<td id="j6-sum" class="sum"></td>
										<td id="score-sum" class="sum"></td>
										<td id="spread-sum" class="sum"></td>
									</tr>
									<tr id="clear-judge-scores">
										<td>&nbsp;</td>
										<th id="j0-clr"><button class="btn btn-xs btn-danger"><span class="glyphicon glyphicon-remove"></button></th>
										<th id="j1-clr"><button class="btn btn-xs btn-danger"><span class="glyphicon glyphicon-remove"></button></th>
										<th id="j2-clr"><button class="btn btn-xs btn-danger"><span class="glyphicon glyphicon-remove"></button></th>
										<th id="j3-clr"><button class="btn btn-xs btn-danger"><span class="glyphicon glyphicon-remove"></button></th>
										<th id="j4-clr"><button class="btn btn-xs btn-danger"><span class="glyphicon glyphicon-remove"></button></th>
										<th id="j5-clr"><button class="btn btn-xs btn-danger"><span class="glyphicon glyphicon-remove"></button></th>
										<th id="j6-clr"><button class="btn btn-xs btn-danger"><span class="glyphicon glyphicon-remove"></button></th>
										<th>&nbsp;</th>
										<th>&nbsp;</th>
									</tr>
								</table>
							</div>
							<div class="navigate-athlete">
								<h4>Athlete</h4>
								<div class="list-group">
									<a class="list-group-item" id="navigate-athlete"><span class="glyphicon glyphicon-play"></span><span id="navigate-athlete-label">Start Scoring this Athlete</span></a>
								</div>
							</div>
							<div class="navigate-round">
								<h4>Round</h4>
								<div class="btn-group btn-group-justified">
									<a class="btn btn-primary" id="navigate-prev-round">Previous</a>
									<a class="btn btn-primary" id="navigate-next-round">Next</a>
								</div>
							</div>
							<div class="autopilot">
								<h4>Autopilot</h4>
								<a class="btn btn-block btn-default disabled status">Disengaged</a>
							</div>
							<div class="penalties">
								<h4>Penalties</h4>
								<div class="list-group">
									<a class="list-group-item" id="penalty-give"><span class="glyphicon glyphicon-hand-right"></span><span class="text">Give a Penalty</span></a>
									<a class="list-group-item penalty-button" id="penalty-bounds"><span class="glyphicon glyphicon-log-out"></span>Out-of-bounds</a>
									<a class="list-group-item penalty-button" id="penalty-restart"><span class="glyphicon glyphicon-retweet"></span>Restart Form</a>
									<a class="list-group-item penalty-button" id="penalty-time"><span class="glyphicon glyphicon-time"></span>Over Time</a>
									<a class="list-group-item penalty-button" id="penalty-misconduct"><span class="glyphicon glyphicon-comment"></span>Misconduct</a>
									<a class="list-group-item" id="penalty-clear"><span class="glyphicon glyphicon-remove"  ></span>Clear Penalties</a>
								</div>
							</div>
							<div class="decision">
								<h4>Decision</h4>
								<div class="list-group">
									<a class="list-group-item" id="decision-withdraw"><span class="glyphicon glyphicon-minus"></span>Withdraw</a>
									<a class="list-group-item" id="decision-disqualify"><span class="glyphicon glyphicon-alert"></span>Disqualify</a>
									<a class="list-group-item" id="decision-clear"><span class="glyphicon glyphicon-remove"></span>Clear Decisions</a>
								</div>
							</div>
							<div class="administration">
								<h4>Administration</h4>
								<div class="list-group">
									<a class="list-group-item" id="admin-edit"><span class="glyphicon glyphicon-edit"></span>Edit Division</a>
									<a class="list-group-item" id="admin-display"><span class="glyphicon glyphicon-eye-open"></span>Show Display</a>
									<a class="list-group-item" id="admin-view"><span class="glyphicon glyphicon-list"></span>Change View</a>
									<a class="list-group-item" id="admin-results"><span class="glyphicon glyphicon-list-alt"></span>Show Results</a>
									<a class="list-group-item" id="admin-history"><span class="fa fa-history"></span>Division History</a>
								</div>
								<p class="text-muted">Make sure the judges and athletes are stopped before editing the division.</p>
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

			var tournament = <?= $tournament ?>;
			var ring       = { num: <?= $rnum ?> };
			var html       = FreeScore.html;
			var app        = new FreeScore.App();

			app.on.connect( '<?= $url ?>' ).read.ring();

			app.forwardIf = {
				se : division => {
					let round = division.current.roundId();
					let forms = division.current.form.list();

					if( round?.match( /^ro/ ) && ! forms.some( form => form?.match( /^draw/i ))) { 
						window.location = 'se/coordinator.php?ring=<?= $rnum ?>'; 
					}
				},
				sbs : division => {
					let round = division.current.roundId();
					let forms = division.current.form.list();

					if( round?.match( /^ro/ ) && forms.some( form => form?.match( /^draw/i ))) { 
						window.location = 'sbs/coordinator.php?ring=<?= $rnum ?>'; 
					}
				}
			};

			app.network.on
				// ============================================================
				.heard( 'autopilot' )
				// ============================================================
				.command( 'leaderboard' )
					.respond( update => {
						let request = update.request;
						let delay   = (request.delay + 1) * 1000;
						$( '.autopilot .status' ).addClass( 'btn-success' ).removeClass( 'btn-default' ).html( 'Showing Leaderboard' );
						if( state.autopilot.timer ) { clearTimeout( state.autopilot.timer ); }
						state.autopilot.timer = setTimeout( () => { $( '.autopilot .status' ).addClass( 'btn-default' ).removeClass( 'btn-success' ).html( 'Disengaged' ); }, delay );

					})
				.command( 'next' )
					.respond( update => {
						let request = update.request;
						let delay   = (request.delay + 1) * 1000;
						$( '.autopilot .status' ).addClass( 'btn-success' ).removeClass( 'btn-default' ).html( 'Next Form or Athlete' );
						if( state.autopilot.timer ) { clearTimeout( state.autopilot.timer ); }
						state.autopilot.timer = setTimeout( () => { $( '.autopilot .status' ).addClass( 'btn-default' ).removeClass( 'btn-success' ).html( 'Disengaged' ); }, delay );
					})
				.command( 'scoreboard' )
					.respond( update => {
						let request  = update.request;
						let delay    = (request.delay + 1) * 1000;
						let division = new Division( update.division );
						refresh.athletes( division, true );
						$( '.autopilot .status' ).addClass( 'btn-success' ).removeClass( 'btn-default' ).html( 'Showing Score' );
						if( state.autopilot.timer ) { clearTimeout( state.autopilot.timer ); }
						state.autopilot.timer = setTimeout( () => { $( '.autopilot .status' ).addClass( 'btn-default' ).removeClass( 'btn-success' ).html( 'Disengaged' ); }, delay );
					})

				// ============================================================
				.heard( 'division' )
				// ============================================================
				.command( 'update' )
					.respond( update => {
						let division = update.division;
						if( ! defined( division )) { return; }

						division   = new Division( division );

						app.forwardIf.se( division );
						app.forwardIf.sbs( division );

						refresh.athletes( division, true );
						refresh.judges( update );
						if( page.num == 1 ) { page.transition() };
					})

				// ============================================================
				.heard( 'ring' )
				// ============================================================
				.command( 'update' )
					.respond( update => {
						if( ! defined( update.ring )) { return; }
						refresh.ring( update.ring );
						let divid = $.cookie( 'divid' );
						if( defined( divid ) && divid != 'undefined' ) {
							let division = update.ring.divisions.find(( d ) => { return d.name == divid; }); if( ! defined( division )) { return; }
							let current  = update.ring.divisions.find(( d ) => { return d.name == update.ring.current; });
							let isCurDiv = defined( current ) ? division.name == current.name : false;
							division = new Division( division );

							app.forwardIf.se( division );
							app.forwardIf.sbs( division );

							refresh.athletes( division, isCurDiv );
							refresh.judges( update );

							if( page.num == 1 ) { page.transition() };
						}
					})

				// ============================================================
				.heard( 'users' )
				// ============================================================
				.command( 'update' )
					.respond( update => {
						refresh.judges( update );
					});

			var page = {
				num : 1,
				transition: ( ev ) => { page.num = PageTransitions.nextPage({ animation: page.animation( page.num )}); },
				animation:  ( pn ) => { return pn; } // Left-right movement is animation #1 and #2 coinciding with page numbers
			};

			var clearJudgeScore = function( i, judge, athlete ) {
				return function() {
					app.sound.next.play();
					var name    = i == 0 ? 'Referee' : 'Judge ' + i;
					var title   = 'Clear ' + name + '\'s score for athlete ' + athlete + '?'; 
					var message = 'Click <b class="text-danger">OK</b> to clear <b class="text-danger">' + name + '\'s</b> score for <b class="text-danger">' + athlete + '</b> or <b class="text-warning">Cancel</b> to do nothing.';
					var ok      = function() {
						var request  = { type : 'division', action : 'clear judge score', judge: i };
						app.network.send( request );
						app.sound.ok.play();
						alertify.success( name + ' score cleared for ' + athlete );

						return true;
					}
					var cancel  = function() { app.sound.prev.play(); return true; }
					alertify.confirm( title, message, ok, cancel );
				};
			};

			var changeCurrentForm = function( i, form ) {
				return function() {
					app.sound.next.play();
					var title   = `Start scoring ${ordinal(( parseInt( i ) +1))} form ${form}?`; 
					var message = `Click <b class="text-danger">OK</b> to start scoring ${form} or <b class="text-warning">Cancel</b> to do nothing.`;
					var ok      = () => {
						app.network.send({ type : 'division', action : 'navigate', target : { destination: 'form', index: i }});
						app.sound.ok.play();
						alertify.success( `Scoring for ${form}` );

						return true;
					}
					var cancel  = () => { app.sound.prev.play(); return true; }
					alertify.confirm( title, message, ok, cancel );
				};
			};

			var refresh = { 
				athletes: function( division, currentDivision ) {
					$( '#division-header' ).html( division.summary() );
					$( '#back-to-divisions' ).off( 'click' ).click(( ev ) => { 
						// ===== GET THE LATEST RING STATUS
						var request  = { type : 'ring', action : 'read' };
						app.network.send( request );

						// ===== SWITCH THE PAGE
						app.sound.prev.play();
						$.removeCookie( 'divid' );
						page.transition(); 
					});

					var round = division.current.roundId();
					var n     = division.current.formId();
					var forms = division.forms()[ round ];
					var count = forms.reduce(( acc, cur, i ) => { 
						if( i == n ) { cur = '<a class="btn btn-sm btn-primary disabled">' + cur + '</a>'; } else { cur = '<a class="btn btn-sm btn-default navigate-form" data-navigate="' + i + '" data-form-name="' + cur + '">' + cur + '</a>' }
						return acc + '&nbsp;' + cur; 
					}, '');
					$( '#division-round' ).html( `${division.current.round.display.name()} &ndash; ${division.current.athletes().length} athlete${division.current.athletes().length > 1 ? 's' : '' }` );
					$( '#current-form' ).html( count );
					$( '#current-form>.navigate-form' ).each(( i, btn ) => {
						var button = $( btn );
						button.off( 'click' ).click(( ev ) => {
							var j    = button.attr( 'data-navigate' );
							var form = button.attr( 'data-form-name' );
							changeCurrentForm( j, form )();
						});
					});
					if( division.round.is.complete()) {
						$( '#navigate-prev-round, #navigate-next-round' ).removeClass( 'disabled' );
						var prev = division.prev.round();
						var next = division.next.round();
						if( defined( prev ) && prev in division.data().placement ) { $( '#navigate-prev-round' ).removeClass( 'disabled' ); } else { $( '#navigate-prev-round' ).addClass( 'disabled' ); }
						if( defined( next )                                      ) { $( '#navigate-next-round' ).removeClass( 'disabled' ); } else { $( '#navigate-next-round' ).addClass( 'disabled' ); }
					} else {
						$( '#navigate-prev-round, #navigate-next-round' ).addClass( 'disabled' );
					}

					var iconize = function( penalties ) {
						if( ! defined( penalties )) { return; }
						var bounds     = html.span.clone().addClass( "penalty" );
						var timelimit  = html.span.clone().addClass( "penalty" );
						var restart    = html.span.clone().addClass( "penalty" );
						var misconduct = html.span.clone().addClass( "penalty" );

						if( penalties.bounds > 0 ) {
							bounds.addClass( "glyphicon glyphicon-log-out" );
							bounds.html( ' ' + penalties.bounds );
						}
						if( penalties.timelimit > 0 ) {
							timelimit.addClass( "glyphicon glyphicon-time" );
							timelimit.html( ' ' + penalties.timelimit );
						}
						if( penalties.restart > 0 ) {
							restart.addClass( "glyphicon glyphicon-retweet" );
							restart.html( ' ' + penalties.restart );
						}
						if( penalties.misconduct > 0 ) {
							misconduct.addClass( "glyphicon glyphicon-comment" );
							misconduct.html( ' ' + penalties.misconduct );
						}

						return [ bounds, timelimit, restart, misconduct ];
					};

					// ===== POPULATE THE ATHLETE LIST
					$( '#athletes' ).empty();
					division.current.athletes( round ).forEach(( athlete ) => {
						var score     = athlete.score( round ); 
						var button    = html.a.clone().addClass( "list-group-item" );
						var name      = html.span.clone().addClass( "athlete-name" ).append( athlete.name() );
						var penalties = html.span.clone().addClass( "athlete-penalties" ).append( iconize( athlete.penalties( round, n )));
						var total     = html.span.clone().addClass( "athlete-score" ).append( score.summary() );
						var current   = parseInt( division.current.athleteId());
						var k         = division.current.formId();
						var id        = athlete.id();

						// ===== CURRENT ATHLETE
						if( id == current && currentDivision ) { 
							button.addClass( "active" ); 
							button.off( 'click' ).click(( ev ) => { 
								app.sound.prev.play(); 
								$( '#athletes .list-group-item' ).removeClass( 'selected-athlete' ); 
								$( "#navigate-athlete" ).attr({ 'athlete-id' : id });
								$( ".navigate-athlete" ).hide(); 
								$( ".penalties" ).show();
								$( ".decision" ).show();
								refresh.score( score.score.forms[ k ], athlete.name(), true );
							});
							refresh.score( score.score.forms[ k ], athlete.name(), true );
							$( '.penalties, .decision' ).show();
							$( '.penalty-button' ).hide();
							refresh.actions( division );

						// ===== ATHLETE IN CURRENT DIVISION
						} else if( currentDivision ) {
							if( id == division.next.athleteId() ) { button.addClass( "on-deck" ); } // Athlete on deck
							button.off( 'click' ).click(( ev ) => { 
								var clicked = $( ev.target );
								if( ! clicked.is( 'a' )) { clicked = clicked.parents( 'a' ); }
								app.sound.next.play(); 
								$( '#athletes .list-group-item' ).removeClass( 'selected-athlete' ); 
								clicked.addClass( 'selected-athlete' ); 
								$( "#navigate-athlete-label" ).html( "Start scoring " + athlete.display.name()); 
								$( "#navigate-athlete" ).attr({ 'athlete-id' : id });
								$( ".navigate-athlete" ).show(); 
								refresh.score( score.score.forms[ k ], athlete.name(), false );
								$( '.penalties, .decision' ).hide();
							});

						// ===== ATHLETE IN ANOTHER DIVISION
						} else {
							button.off( 'click' );
						}
						refresh.navadmin( division );
						button.append( name, penalties, total );
						$( '#athletes' ).append( button );
					});

					// ===== ACTION MENU BEHAVIOR
					if( currentDivision ) { 
						$( '#judge-scores' ).show();
						$( '.navigate-division' ).hide();
						$( '.navigate-round' ).show();
						$( '.penalties, .decision, .administration' ).show();

					} else { 
						$( '#judge-scores' ).hide();
						$( '.navigate-division' ).show();
						$( '.navigate-round' ).hide();
						$( '.penalties, .decision, .administration' ).hide();
					}
					$( '.navigate-athlete' ).hide();
				},
				actions : function( division ) {
					var athlete = division.current.athlete();
					var current = division.current.athleteId();
					var ring    = division.ring();
					var divid   = division.name();
					var round   = division.current.roundId();
					var form    = division.current.formId();

					var action = {
						penalty : {
							show       : () => { app.sound.next.play(); action.penalty.toggle(); },
							bounds     : () => { app.sound.next.play(); athlete.penalize.bounds( round, form );     action.penalty.send(); alertify.error( athlete.name() + ' has been given an<br><strong>out-of-bounds&nbsp;penalty</strong>' ); action.penalty.toggle(); },
							restart    : () => { app.sound.next.play(); athlete.penalize.restart( round, form );    action.penalty.send(); alertify.error( athlete.name() + ' has been given a <strong>restart&nbsp;penalty</strong>' ); action.penalty.toggle(); },
							time       : () => { app.sound.next.play(); athlete.penalize.timelimit( round, form );  action.penalty.send(); alertify.error( athlete.name() + ' has been given a <strong>over time penalty</strong>' ); action.penalty.toggle(); },
							misconduct : () => { app.sound.next.play(); athlete.penalize.misconduct( round, form ); action.penalty.send(); alertify.error( athlete.name() + ' has been given a <strong>misconduct&nbsp;penalty</strong>' ); action.penalty.toggle(); },
							clear      : () => { app.sound.prev.play(); athlete.penalize.clear( round, form );      action.penalty.send(); alertify.success( athlete.name() + ' has been <strong>cleared of all penalties</strong>' ); if( $( '#penalty-give>.text' ).text().match( /hide/i )) { action.penalty.toggle();}},
							send       : () => { app.network.send({ type : 'division', action : 'award penalty', penalties: athlete.penalties( round, form ), athlete_id: current }); },
							toggle     : () => { if( $( '#penalty-give>.text' ).text().match( /give/i )) { $( '.penalty-button' ).show(); $( '#penalty-give>.glyphicon' ).removeClass( 'glyphicon-hand-right' ).addClass( 'glyphicon-menu-up' );  $( '#penalty-give>.text' ).text( 'Hide penalties' ); } else {$( '.penalty-button' ).hide(); $( '#penalty-give>.glyphicon' ).removeClass( 'glyphicon-menu-up' ).addClass( 'glyphicon-hand-right' );  $( '#penalty-give>.text' ).text( 'Give a penalty' );  }}
						},
						decision : {
							withdraw   : () => { app.sound.next.play(); alertify.confirm( "Withdraw "   + athlete.name() + "?", 'Click <b class="text-danger">OK</b> to withdraw <b class="text-danger">' + athlete.name() + '</b> from competition or <b class="text-warning">Cancel</b> to do nothing.', function() { app.sound.ok.play(); action.decision.send( 'withdraw'   ); alertify.error( athlete.name() + ' has withdrawn' );         }, function() { app.sound.prev.play(); }); $( '.ajs-header' ).addClass( 'decision-punitive-header' ); },
							disqualify : () => { app.sound.next.play(); alertify.confirm( "Disqualify " + athlete.name() + "?", 'Click <b class="text-danger">OK</b> to disqualify <b class="text-danger">' + athlete.name() + '</b> from competition or <b class="text-warning">Cancel</b> to do nothing.', function() { app.sound.ok.play(); action.decision.send( 'disqualify' ); alertify.error( athlete.name() + ' has been disqualified' ); }, function() { app.sound.prev.play(); }); $( '.ajs-header' ).addClass( 'decision-punitive-header' ); },
							clear      : () => { app.sound.next.play(); alertify.confirm( "Clear Decisions for " + athlete.name() + "?", 'Click <b class="text-danger">OK</b> to clear WD and DQ decisions for <b class="text-danger">' + athlete.name() + '</b> or <b class="text-warning">Cancel</b> to do nothing.', function() { app.sound.ok.play(); action.decision.send( 'clear' ); alertify.success( athlete.name() + ' has been cleared of punitive decisions' ); }, function() { app.sound.prev.play(); }); $( '.ajs-header' ).addClass( 'decision-punitive-header' ); },
							send       : ( reason ) => { app.network.send({ type : 'division', action : 'award punitive', decision: reason, athlete_id: current }); }
						},
					};

					$( "#penalty-give" )        .off( 'click' ).click( action.penalty.show );
					$( "#penalty-bounds" )      .off( 'click' ).click( action.penalty.bounds );
					$( "#penalty-restart" )     .off( 'click' ).click( action.penalty.restart );
					$( "#penalty-time" )        .off( 'click' ).click( action.penalty.time );
					$( "#penalty-misconduct" )  .off( 'click' ).click( action.penalty.misconduct );
					$( "#penalty-clear" )       .off( 'click' ).click( action.penalty.clear );
					$( "#decision-withdraw" )   .off( 'click' ).click( action.decision.withdraw );
					$( "#decision-disqualify" ) .off( 'click' ).click( action.decision.disqualify );
					$( "#decision-clear" )      .off( 'click' ).click( action.decision.clear );
				},
				judges : function( update ) {
					let n = update.judges?.length;
					if( defined( update.ring )) {
						let ring = update.ring;
						if( defined( ring.divisions )) {
							let current = ring.divisions.find( div => div.name == ring.current );
							if( ! defined( n )) { n = current.judges; }
						}
					} else if( defined( update.division )) {
						if( ! defined( n )) { n = update.division.judges; }
					}
					for( var i = 0; i < 7; i++ ) {
						let jname = "judge" + i;
						let color = { strong : 'btn-success', good : 'btn-success', weak : 'btn-warning', bad : 'btn-danger', dead : 'btn-default', 'n/a' : 'btn-default', 'bye' : 'btn-default' }; 
						let any = 'btn-success btn-warning btn-danger btn-default';
						update.users.filter( user => user.role.match( /^judge/i )).forEach( user => {
							let role = user.role;
							role = role.replace( /udge/, '' );
							let health = user.health;
							$( `.${role}.judge-col button` ).removeClass( any ).addClass( color[ health ]);
						});

						let rows = [ 'col', 'acc', 'pre', 'sum', 'clr' ];
						if( n && i < n ) {
							rows.forEach( row => $( `#j${i}-${row}` ).show() );
						} else {
							// Judge registered but not needed
							if( defined( update.judges ) && defined( update.judges[ i ])) { 
								$( `.judges button.${jname}` ).removeClass( `disabled ${any}` ).addClass( 'btn-primary' ).off( 'click' ); 

							// Judge not needed
							} else { 
								$( `.judges button.${jname}` ).removeClass( `disabled ${any}` ).addClass( `${color.bye} disabled` ).off( 'click' ); 
							}

							rows.forEach( row => $( `#j${i}-${row}` ).hide() );
						}
					}
				},
				navadmin : function( division ) {
					let ring    = division.ring();
					let divid   = division.name();
					let action = {
						navigate : {
							round : {
								next : () => { app.sound.next.play(); var round = division.next.round(); if( defined( round )) { action.navigate.to({ destination: 'round', round: round }); }},
								prev : () => { app.sound.prev.play(); var round = division.prev.round(); if( defined( round )) { action.navigate.to({ destination: 'round', round: round }); }},
							},
							athlete   : () => { app.sound.ok.play(); var i = $( '#navigate-athlete' ).attr( 'athlete-id' ); action.navigate.to( { destination: 'athlete',  index : i     } ); },
							division  : () => { app.sound.ok.play(); action.navigate.to( { destination: 'division', divid : divid } ); if( ring == 'staging' ) { alertify.success( "Transferred division from staging to ring. Starting to score division." ); setTimeout( function() { location.reload(); }, 3000 );}},
							to        : ( target ) => { app.network.send({ type : 'division', action : 'navigate', target : target }); }
						},
						administration : {
							view       : () => { app.sound.next.play(); app.network.send({ type: 'division', action: 'display' });},
							display    : () => { app.sound.next.play(); page.display = window.open( 'index.php?ring=' + ring, '_blank' )},
							edit       : () => { app.sound.next.play(); page.editor  = window.open( 'division/editor.php?file=' + tournament.db + '/' + ring + '/' + divid, '_blank' )},
							results    : () => { app.sound.next.play(); page.results = window.open( `/cgi-bin/freescore/forms/worldclass/report/results.php?ring=${ring}&divid=${divid}`, '_blank' )},
							history    : () => { app.sound.next.play(); page.results = window.open( 'history.php?ring=' + ring, '_blank' )},
						}
					};

					$( "#navigate-athlete" )    .off( 'click' ).click( action.navigate.athlete );
					$( "#navigate-next-round" ) .off( 'click' ).click( action.navigate.round.next );
					$( "#navigate-prev-round" ) .off( 'click' ).click( action.navigate.round.prev );
					$( "#navigate-division" )   .off( 'click' ).click( action.navigate.division );
					$( "#admin-view" )          .off( 'click' ).click( action.administration.view );
					$( "#admin-display" )       .off( 'click' ).click( action.administration.display );
					$( "#admin-edit" )          .off( 'click' ).click( action.administration.edit );
					$( "#admin-results" )       .off( 'click' ).click( action.administration.results );
					$( "#admin-history" )       .off( 'click' ).click( action.administration.history );
				},
				ring: function( ring ) {
					$( '#ring-ready' ).empty();
					$( '#ring-completed' ).empty();
					$( '#staging-divisions' ).empty();
					ring.divisions.forEach(( d ) => {
						var division    = new Division( d );
						var button      = html.a.clone().addClass( "list-group-item" );
						var title       = html.h4.clone().html( division.summary() );
						var count       = division.athletes().length;
						var description = html.p.clone().append( '<b>' + count + ' Athlete' + (count > 1 ? 's' : '') + ':</b> ', division.athletes().map(( a ) => { return a.name(); }).join( ', ' ));

						button.empty();
						button.append( title, description );
						button.attr({ divid: division.name() });
						button.off( 'click' ).click(( ev ) => {
							var clicked  = $( ev.target ); if( ! clicked.is( 'a' ) ) { clicked = clicked.parent(); }
							var divid    = clicked.attr( 'divid' );
							var division = ring.divisions.find(( d ) => { return d.name == divid; });

							$.cookie( 'divid', divid, { expires: 1, path: '/' });
							refresh.athletes( new Division( division ), division.name == ring.current );
							app.sound.next.play();
							page.transition();
						});
						if( d.name == ring.current ) { button.addClass( "active" ); }

						if       ( division.ring() == 'staging' ) {
							$( '#staging-divisions' ).append( button );
						} else if( division.is.complete()) {
							$( '#ring-completed' ).append( button );
						} else {
							$( '#ring-ready' ).append( button );
						}
					});
					$( '#ring-ready' ).btsListFilter('#search-ready', { initial: false, resetOnBlur: false });
					$( '#ring-completed' ).btsListFilter('#search-completed', { initial: false, resetOnBlur: false });
					$( '#staging-divisions' ).btsListFilter('#search-staging', { initial: false, resetOnBlur: false });

				},
				score: function( score, athlete, isCurrent ) {
					var spread = { acc : [], pre : [], sum: [] };
					var n      = score.judge.length;
					score.judge.forEach(( judge, i ) => {
						var name = '#j' + i;
						var acc  = $( name + '-acc' );
						var pre  = $( name + '-pre' );
						var sum  = $( name + '-sum' );
						var drop = { hilo : (n > 3), acc : (judge.minacc || judge.maxacc), pre : (judge.minpre || judge.maxpre)};

						acc.removeClass( 'ignore' );
						pre.removeClass( 'ignore' );

						if( defined( judge.accuracy     )) { acc.html( judge.accuracy.toFixed( 1 ));     } else { acc.empty(); }
						if( defined( judge.presentation )) { pre.html( judge.presentation.toFixed( 1 )); } else { pre.empty(); }
						if( drop.hilo && drop.acc ) { acc.addClass( 'ignore' ); } else if( defined( judge.accuracy     )) { spread.acc.push( parseFloat( judge.accuracy ));     }
						if( drop.hilo && drop.pre ) { pre.addClass( 'ignore' ); } else if( defined( judge.presentation )) { spread.pre.push( parseFloat( judge.presentation )); }

						var total = judge.accuracy + judge.presentation;
						if( defined( judge.accuracy ) && defined( judge.presentation )) { sum.html( total.toFixed( 1 )); spread.sum.push( total ); } else { sum.empty(); }

						var clear = $( name + '-clr' );
						clear.find( 'button' ).off( 'click' ).click( clearJudgeScore( i, judge, athlete ));
					});
					if( isCurrent ) { $( '#clear-judge-scores' ).show(); }
					else            { $( '#clear-judge-scores' ).hide(); }

					if( score.complete && spread.acc.length > 0 && spread.pre.length > 0 ) {
						var acc = (Math.max.apply( null, spread.acc ) - Math.min.apply( null, spread.acc ));
						var pre = (Math.max.apply( null, spread.pre ) - Math.min.apply( null, spread.pre ));
						var sum = (Math.max.apply( null, spread.sum ) - Math.min.apply( null, spread.sum ));
						$( '#spread-acc' ).html( acc.toFixed( 1 ));
						$( '#spread-pre' ).html( pre.toFixed( 1 ));
						$( '#spread-sum' ).html( sum.toFixed( 1 ));
						$( '#score-acc' ).html( score.adjusted.accuracy );
						$( '#score-pre' ).html( score.adjusted.presentation );
						$( '#score-sum' ).html( score.adjusted.total );

					} else {
						$( '#spread-acc, #spread-pre, #score-acc, #score-pre, #spread-sum, #score-sum' ).empty();
					}
				}
			};

			$( function() {
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
