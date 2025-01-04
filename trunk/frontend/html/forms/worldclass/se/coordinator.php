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
		<link href="../../../include/css/forms/worldclass/coordinator.css" rel="stylesheet" />
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
		<script src="widgets/autopilot.js"></script>
		<script src="widgets/division-list.js"></script>
		<script src="widgets/judges.js"></script>
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
					<div class="page-header"><span id="ring-header">Ring <?= $rnum ?> Operations</span></div>
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
							</div>
							<div id="timer">
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

			app.page = {
				num : 1,
				count: 2,
				transition: ( ev ) => { app.page.num = PageTransitions.nextPage({ animation: app.page.animation( app.page.num )}); },
				animation:  ( pn ) => { return pn; } // Left-right movement is animation #1 and #2 coinciding with page numbers
			};

			app.on.connect( '<?= $url ?>' ).read.ring();

			app.network.widget = {
				divisions : {
					ready     : new FreeScore.Widget.SEDivisionList( app, 'ready'     ),
					completed : new FreeScore.Widget.SEDivisionList( app, 'completed' ),
					staging   : new FreeScore.Widget.SEDivisionList( app, 'staging'   ),
				},
				judges    : new FreeScore.Widget.SEJudges( app, 'judge-scores' ),
				autopilot : new FreeScore.Widget.SEAutopilot( app, 'autopilot' )
			};

			app.event.listen( 'division-show', ( type, source, message ) => {
				app.state.current = message.divid;
				app.sound.next.play();
				app.page.transition();
			});

			app.network.on
				// ============================================================
				.heard( 'autopilot' )
				// ============================================================
				.command( 'scoreboard' )
					.respond( update => {
						let division = new Division( update.division );
						refresh.athletes( division, true );
					})

				// ============================================================
				.heard( 'division' )
				// ============================================================
				.command( 'update' )
					.respond( update => {
						let division = update.division;
						if( ! defined( division )) { return; }

						division   = new Division( division );
						refresh.athletes( division, true );
						if( app.page.num == 1 ) { app.page.transition() };
					})

				// ============================================================
				.heard( 'ring' )
				// ============================================================
				.command( 'read' )
				.command( 'update' )
					.respond( update => {
						if( ! defined( update?.ring )) { return; }
						let divid = $.cookie( 'divid' );
						app.state.divisions = ring?.divisions;
						app.state.current   = divid ? divid : ring?.current;
						if( defined( divid ) && divid != 'undefined' ) {
							let division = update.ring.divisions.find( d => d.name == divid ); if( ! defined( division )) { return; }
							let current  = update.ring.divisions.find( d => d.name == update.ring.current );
							let isCurDiv = defined( current ) && division.name == current.name ? true : false;
							division = new Division( division );
							refresh.athletes( division, isCurDiv );

							if( app.page.num == 1 ) { app.page.transition() };
						}
					});

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
					$( '#division-round' ).html( division.current.round.display.name() + ' Round &ndash; ' + division.current.athletes().length + ' athlete' + ( division.current.athletes().length > 1 ? 's' : '' ));
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
