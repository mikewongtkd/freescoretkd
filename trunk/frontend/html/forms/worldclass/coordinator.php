<?php 
	$an_hour_ago = time() - 3600; # set cookie expiration data to an hour ago (expire immediately)
	include( "../../include/php/config.php" ); 
	setcookie( 'judge', '', $an_hour_ago, '/' );
	setcookie( 'role', 'computer operator', 0, '/' );
	$i = isset( $_GET[ 'ring' ] ) ? $_GET[ 'ring' ] : $_COOKIE[ 'ring' ];
	$k = json_decode( $tournament )->rings->count;
	if( $i == 'staging' || (ctype_digit( $i ) && (integer) $i >= 1 && (integer) $i <= $k)) { 
		setcookie( 'ring', $i, 0, '/' ); 
		$cookie_set = true;
	} else {
		setcookie( 'ring', 1, 0, '/' ); 
	}
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
		<script src="../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../include/js/forms/worldclass/division.class.js"></script>
	</head>
	<body>
		<div id="pt-main" class="pt-perspective">
			<!-- ============================================================ -->
			<!-- RING DIVISIONS -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-1">
				<div class="container">
					<div class="page-header"><span id="ring-header">Ring <?= $i ?></span></div>
					<div class="clearfix">
						<div class="pull-left">
							<ul class="nav nav-tabs">
								<li class="active"><a data-toggle="tab" href="#ready">Ready Divisions</a></li>
								<li><a data-toggle="tab" href="#completed">Completed Divisions</a></li>
								<li><a data-toggle="tab" href="#staging">Staging Divisions</a></li>
							</ul>
						</div>
						<div class="pull-right judges">
							<label for="judges">Judges</label>
							<div class="btn-group" data-toggle="buttons">
								<button class="btn btn-xs btn-default judge0">R</button>
								<button class="btn btn-xs btn-default judge1">1</button>
								<button class="btn btn-xs btn-default judge2">2</button>
								<button class="btn btn-xs btn-default judge3">3</button>
								<button class="btn btn-xs btn-default judge4">4</button>
								<button class="btn btn-xs btn-default judge5">5</button>
								<button class="btn btn-xs btn-default judge6">6</button>
							</div>
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
					<a id="back-to-divisions" class="btn btn-warning"><span class="glyphicon glyphicon-menu-left"></span> Ring <?= $i ?></a> <span id="division-header"></span>
					<div class="pull-right judges">
						<label for="judges">Judges</label>
						<div class="btn-group" data-toggle="buttons">
							<button class="btn btn-xs btn-default judge0">R</button>
							<button class="btn btn-xs btn-default judge1">1</button>
							<button class="btn btn-xs btn-default judge2">2</button>
							<button class="btn btn-xs btn-default judge3">3</button>
							<button class="btn btn-xs btn-default judge4">4</button>
							<button class="btn btn-xs btn-default judge5">5</button>
							<button class="btn btn-xs btn-default judge6">6</button>
						</div>
					</div>
				</div>
					<div class="row">
						<div class="col-lg-9">
							<h4 id="division-round">Round</h4>
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
										<th id="j0-col">R</th>
										<th id="j1-col">1</th>
										<th id="j2-col">2</th>
										<th id="j3-col">3</th>
										<th id="j4-col">4</th>
										<th id="j5-col">5</th>
										<th id="j6-col">6</th>
										<th>Score</th>
										<th>Spread</th>
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
							<div class="penalties">
								<h4>Penalties</h4>
								<div class="list-group">
									<a class="list-group-item" id="penalty-bounds"><span class="glyphicon glyphicon-log-out"></span>Out-of-bounds</a>
									<a class="list-group-item" id="penalty-restart"><span class="glyphicon glyphicon-retweet"></span>Restart Form</a>
									<a class="list-group-item" id="penalty-misconduct"><span class="glyphicon glyphicon-comment"></span>Misconduct</a>
									<a class="list-group-item" id="penalty-clear"><span class="glyphicon glyphicon-remove"  ></span>Clear Penalties</a>
								</div>
							</div>
							<div class="decision">
								<h4>Decision</h4>
								<div class="list-group">
									<a class="list-group-item" id="decision-withdraw"><span class="glyphicon glyphicon-minus"></span>Withdraw</a>
									<a class="list-group-item" id="decision-disqualify"><span class="glyphicon glyphicon-alert"></span>Disqualify</a>
								</div>
							</div>
							<div class="administration">
								<h4>Administration</h4>
								<div class="list-group">
									<a class="list-group-item" id="admin-edit"><span class="glyphicon glyphicon-edit"></span>Edit Division</a>
								</div>
								<div class="list-group">
									<a class="list-group-item" id="admin-display"><span class="glyphicon glyphicon-eye-open"></span>Show Display</a>
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

			var host       = '<?= $host ?>';
			var tournament = <?= $tournament ?>;
			var ring       = { num: <?= $i ?> };
			var judges     = { name : [ 'referee', 'j1', 'j2', 'j3', 'j4', 'j5', 'j6' ] };
			var html       = FreeScore.html;
			var ws         = new WebSocket( 'ws://<?= $host ?>:3088/worldclass/' + tournament.db + '/' + ring.num );
			var network    = { reconnect: 0 }

			ws.onerror = network.error = function() {
				setTimeout( function() { location.reload(); }, 15000 ); // Attempt to reconnect every 15 seconds
			};

			ws.onopen = network.connect = function() {
				var request;
				request      = { data : { type : 'ring', action : 'read' }};
				request.json = JSON.stringify( request.data );
				ws.send( request.json );

				request      = { data : { type : 'division', action : 'judge query' }};
				request.json = JSON.stringify( request.data );
				ws.send( request.json );
			};

			ws.onmessage = network.message = function( response ) {
				var update = JSON.parse( response.data );
				console.log( update );

				if( update.type == 'ring' && update.action == 'update' ) {
					if( ! defined( update.ring )) { return; }
					refresh.ring( update.ring );
					var divid = $.cookie( 'divid' );
					if( defined( divid ) && divid != 'undefined' ) {
						var division = update.ring.divisions.find(( d ) => { return d.name == divid; }); if( ! defined( division )) { return; }
						var current  = update.ring.divisions.find(( d ) => { return d.name == update.ring.current; });
						var curDiv   = defined( current ) ? division.name == current.name : false;
						division = new Division( division );
						refresh.athletes( division, curDiv );

						if( page.num == 1 ) { page.transition() };

						var request  = { data : { type : 'division', action : 'judge query' }};
						request.json = JSON.stringify( request.data );
						ws.send( request.json );

					}
				} else if( update.type == 'division' && update.action == 'judges' ) {
					refresh.judges( update );

				} else if( update.type == 'division' && update.action == 'judge goodbye' ) {
					refresh.judge( update );

				} else if( update.type == 'division' && update.action == 'update' ) {
					var division = update.division;
					if( ! defined( division )) { return; }

					division   = new Division( division );
					refresh.athletes( division, true );
					if( page.num == 1 ) { page.transition() };

					var request  = { data : { type : 'division', action : 'judge query' }};
					request.json = JSON.stringify( request.data );
					ws.send( request.json );
				}
			};

			// ===== TRY TO RECONNECT IF WEBSOCKET CLOSES
			ws.onclose = network.close = function() {
				if( network.reconnect < 10 ) { // Give 10 attempts to reconnect
					if( network.reconnect == 0 ) { alertify.error( 'Network error. Trying to reconnect.' ); }
					network.reconnect++;
					ws = new WebSocket( 'ws://' + host + ':3088/worldclass/' + tournament.db + '/' + ring.num ); 
					
					ws.onerror   = network.error;
					ws.onmessage = network.message;
					ws.onclose   = network.close;
				}
			};

			var sound = {
				ok    : new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg" ]}),
				error : new Howl({ urls: [ "../../sounds/quack.mp3",    "../../sounds/quack.ogg"  ]}),
				next  : new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"   ]}),
				prev  : new Howl({ urls: [ "../../sounds/prev.mp3",     "../../sounds/prev.ogg"   ]}),
			};

			var page = {
				num : 1,
				transition: ( ev ) => { page.num = PageTransitions.nextPage({ animation: page.animation( page.num )}); },
				animation:  ( pn ) => { return pn; } // Left-right movement is animation #1 and #2 coinciding with page numbers
			};

			var sendRequest = ( request ) => {
				request.json = JSON.stringify( request.data );
				ws.send( request.json );
			};

			var depart = function( i, judge, state ) {
				return function() {
					var name    = i == 0 ? 'Referee' : 'Judge ' + i;
					var title   = name + ' is ' + state; 
					var message = 'Click OK to unregister device for ' + name + ' or Cancel to do nothing.';
					var ok      = function() {
						var request  = { data : { type : 'division', action : 'judge departure', cookie : { id: judge.id }}};
						request.json = JSON.stringify( request.data );
						ws.send( request.json );
						alertify.success( name + ' device unregistered' );

						var request  = { data : { type : 'division', action : 'judge query' }};
						request.json = JSON.stringify( request.data );
						ws.send( request.json );
						return true;
					}
					var cancel  = function() { return true; }
					alertify.confirm( title, message, ok, cancel );
				}
			};

			var judgeStatus = function( i, judge, state ) {
				return function() {
					var name    = i == 0 ? 'Referee' : 'Judge ' + i;
					alertify.error( name + ' is ' + state );
				}
			}

			var clearJudgeScore = function( i, judge, athlete ) {
				return function() {
					sound.next.play();
					var name    = i == 0 ? 'Referee' : 'Judge ' + i;
					var title   = 'Clear ' + name + '\'s score for athlete ' + athlete + '?'; 
					var message = 'Click <b class="text-danger">OK</b> to clear <b class="text-danger">' + name + '\'s</b> score for <b class="text-danger">' + athlete + '</b> or <b class="text-warning">Cancel</b> to do nothing.';
					var ok      = function() {
						var request  = { data : { type : 'division', action : 'clear judge score', judge: i }};
						request.json = JSON.stringify( request.data );
						ws.send( request.json );
						sound.ok.play();
						alertify.success( name + ' score cleared for ' + athlete );

						return true;
					}
					var cancel  = function() { sound.prev.play(); return true; }
					alertify.confirm( title, message, ok, cancel );
				};
			};

			var refresh = { 
				athletes: function( division, currentDivision ) {
					$( '#division-header' ).html( division.summary() );
					$( '#back-to-divisions' ).off( 'click' ).click(( ev ) => { 
						// ===== GET THE LATEST RING STATUS
						var request  = { data : { type : 'ring', action : 'read' }};
						request.json = JSON.stringify( request.data );
						ws.send( request.json );

						// ===== SWITCH THE PAGE
						sound.prev.play();
						$.removeCookie( 'divid' );
						page.transition(); 
					});

					var round = division.current.roundId();
					var form  = division.current.formId();
					var forms = division.forms()[ round ];
					var count = forms.length > 1 ? ', Form ' + (parseInt( form ) + 1) + ' of ' + forms.length + ': ' + forms[ form ] : ''
					$( '#division-round' ).html( division.current.round.display.name() + ' Round' + count );

					var iconize = function( penalties ) {
						if( ! defined( penalties )) { return; }
						var bounds     = html.span.clone().addClass( "penalty" );
						var restart    = html.span.clone().addClass( "penalty" );
						var misconduct = html.span.clone().addClass( "penalty" );

						if( penalties.bounds > 0 ) {
							bounds.addClass( "glyphicon glyphicon-log-out" );
							bounds.html( ' ' + penalties.bounds );
						}
						if( penalties.restart > 0 ) {
							restart.addClass( "glyphicon glyphicon-retweet" );
							restart.html( ' ' + penalties.restart );
						}
						if( penalties.misconduct > 0 ) {
							misconduct.addClass( "glyphicon glyphicon-comment" );
							misconduct.html( ' ' + penalties.misconduct );
						}

						return [ bounds, restart, misconduct ];
					};

					// ===== POPULATE THE ATHLETE LIST
					$( '#athletes' ).empty();
					division.athletes().forEach(( athlete, i ) => {
						var score     = athlete.score( round );
						var button    = html.a.clone().addClass( "list-group-item" );
						var name      = html.span.clone().addClass( "athlete-name" ).append( athlete.name() );
						var penalties = html.span.clone().addClass( "athlete-penalties" ).append( iconize( athlete.penalties( round, form )));
						var total     = html.span.clone().addClass( "athlete-score" ).append( score.summary() );
						var j         = parseInt( division.current.athleteId());
						var k         = division.current.formId();

						// ===== CURRENT ATHLETE
						if( i == j && currentDivision ) { 
							button.addClass( "active" ); 
							button.off( 'click' ).click(( ev ) => { 
								sound.prev.play(); 
								$( '#athletes .list-group-item' ).removeClass( 'selected-athlete' ); 
								$( "#navigate-athlete" ).attr({ 'athlete-id' :i });
								$( ".navigate-athlete" ).hide(); 
								refresh.score( score.score.forms[ k ], athlete.name(), true );
							});
							refresh.score( score.score.forms[ k ], athlete.name(), true );
							$( '.penalties, .decision' ).show();
							refresh.actions( division );

						// ===== ATHLETE IN CURRENT DIVISION
						} else if( currentDivision ) {
							if( i == j + 1 ) { button.addClass( "on-deck" ); } // Athlete on deck
							button.off( 'click' ).click(( ev ) => { 
								var clicked = $( ev.target );
								if( ! clicked.is( 'a' )) { clicked = clicked.parents( 'a' ); }
								sound.next.play(); 
								$( '#athletes .list-group-item' ).removeClass( 'selected-athlete' ); 
								clicked.addClass( 'selected-athlete' ); 
								$( "#navigate-athlete-label" ).html( "Start scoring " + athlete.display.name()); 
								$( "#navigate-athlete" ).attr({ 'athlete-id' :i });
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
						$( '.penalties, .decision, .administration' ).show();
					} else { 
						$( '#judge-scores' ).hide();
						$( '.navigate-division' ).show();
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
							bounds     : () => { sound.next.play(); athlete.penalize.bounds( round, form );     action.penalty.send(); alertify.error( athlete.name() + ' has been given an<br><strong>out-of-bounds&nbsp;penalty</strong>' ); },
							restart    : () => { sound.next.play(); athlete.penalize.restart( round, form );    action.penalty.send(); alertify.error( athlete.name() + ' has been given a <strong>restart&nbsp;penalty</strong>' ); },
							misconduct : () => { sound.next.play(); athlete.penalize.misconduct( round, form ); action.penalty.send(); alertify.error( athlete.name() + ' has been given a <strong>misconduct&nbsp;penalty</strong>' ); },
							clear      : () => { sound.prev.play(); athlete.penalize.clear( round, form );      action.penalty.send(); alertify.success( athlete.name() + ' has been <strong>cleared of all penalties</strong>' ); },
							send       : () => { sendRequest( { data : { type : 'division', action : 'award penalty', penalties: athlete.penalties( round, form ), athlete_id: current }} ); }
						},
						decision : {
							withdraw   : () => { sound.next.play(); alertify.confirm( "Withdraw "   + athlete.name() + "?", 'Click <b class="text-danger">OK</b> to withdraw <b class="text-danger">' + athlete.name() + '</b> from competition or <b class="text-warning">Cancel</b> to do nothing.', function() { sound.ok.play(); action.decision.send( 'withdraw'   ); alertify.error( athlete.name() + ' has withdrawn' );         }, function() { sound.prev.play(); }); $( '.ajs-header' ).addClass( 'decision-punitive-header' ); },
							disqualify : () => { sound.next.play(); alertify.confirm( "Disqualify " + athlete.name() + "?", 'Click <b class="text-danger">OK</b> to disqualify <b class="text-danger">' + athlete.name() + '</b> from competition or <b class="text-warning">Cancel</b> to do nothing.', function() { sound.ok.play(); action.decision.send( 'disqualify' ); alertify.error( athlete.name() + ' has been disqualified' ); }, function() { sound.prev.play(); }); $( '.ajs-header' ).addClass( 'decision-punitive-header' ); },
							send       : ( reason ) => { sendRequest( { data : { type : 'division', action : 'award punitive', decision: reason, athlete_id: current }} ); }
						},
					};

					$( "#penalty-bounds" )      .off( 'click' ).click( action.penalty.bounds );
					$( "#penalty-restart" )     .off( 'click' ).click( action.penalty.restart );
					$( "#penalty-misconduct" )  .off( 'click' ).click( action.penalty.misconduct );
					$( "#penalty-clear" )       .off( 'click' ).click( action.penalty.clear );
					$( "#decision-withdraw" )   .off( 'click' ).click( action.decision.withdraw );
					$( "#decision-disqualify" ) .off( 'click' ).click( action.decision.disqualify );
				},
				judge: function( update ) {
					var i      = update.judge;
					var name   = "judge" + i;
					var button = $( ".judges button." + name );
					if( button.hasClass( 'btn-success' )) {
						button.removeClass( 'disabled btn-primary btn-warning btn-success' ).addClass( 'btn-danger' ).off( 'click' ).click( judgeStatus( i, {}, 'not registered' ));
					} else if( button.hasClass( 'btn-primary' )) {
							button.removeClass( 'disabled btn-primary btn-warning btn-success' ).addClass( 'disabled' ).off( 'click' );
					}
				},
				judges : function( update ) {
					for( var i = 0; i < 7; i++ ) {
						var name = "judge" + i;
						if( i < update.judges.length ) {
							var judge = update.judges[ i ];
							// Judge registered and communicating
							if( defined( judge.id )) { $( ".judges button." + name ).removeClass( 'disabled btn-primary btn-warning btn-danger' ).addClass( 'btn-success' ).click( depart( i, judge, 'Ready' ) ); }
							// Judge not registered or not communicating
							else                     { $( ".judges button." + name ).removeClass( 'disabled btn-primary btn-warning btn-success' ).addClass( 'btn-danger' ).off( 'click' ).click( judgeStatus( i, judge, 'not registered' )); }

							$( '#j' + i + '-col' ).show();
							$( '#j' + i + '-acc' ).show();
							$( '#j' + i + '-pre' ).show();
							$( '#j' + i + '-sum' ).show();
							$( '#j' + i + '-clr' ).show();
						} else {
							// Judge registered but not needed
							if( defined( judge.id )) { $( ".judges button." + name ).removeClass( 'disabled btn-primary btn-warning btn-danger' ).addClass( 'btn-primary' ).off( 'click' ).click( depart( i, judge, 'Not Needed' )); }
							// Judge not needed
							else                     { $( ".judges button." + name ).removeClass( 'disabled btn-primary btn-warning btn-success' ).addClass( 'disabled' ).off( 'click' ); }

							$( '#j' + i + '-col' ).hide();
							$( '#j' + i + '-acc' ).hide();
							$( '#j' + i + '-pre' ).hide();
							$( '#j' + i + '-sum' ).hide();
							$( '#j' + i + '-clr' ).hide();
						}
					}
				},
				navadmin : function( division ) {
					var ring    = division.ring();
					var divid   = division.name();
					var action = {
						navigate : {
							athlete   : () => { sound.ok.play(); var i = $( '#navigate-athlete' ).attr( 'athlete-id' ); console.log( i ); action.navigate.to( { destination: 'athlete',  index : i     } ); },
							division  : () => { sound.ok.play(); action.navigate.to( { destination: 'division', divid : divid } ); if( ring == 'staging' ) { alertify.success( "Transferred division from staging to ring. Starting to score division." ); setTimeout( function() { location.reload(); }, 3000 );}},
							to        : ( target ) => { sendRequest( { data : { type : 'division', action : 'navigate', target : target }} ); }
						},
						administration : {
							display    : () => { sound.next.play(); page.display = window.open( 'index.php?ring=' + ring, '_blank' )},
							edit       : () => { sound.next.play(); page.editor  = window.open( 'division/editor.php?file=' + tournament.db + '/' + ring + '/' + divid, '_blank' )},
							results    : () => { sound.next.play(); page.results = window.open( '/cgi-bin/freescore/forms/worldclass/results?ring=' + ring + '&divid=' + divid, '_blank' )},
							history    : () => { sound.next.play(); page.results = window.open( 'history.php?ring=' + ring, '_blank' )},
						}
					};

					$( "#navigate-athlete" )    .off( 'click' ).click( action.navigate.athlete );
					$( "#navigate-division" )   .off( 'click' ).click( action.navigate.division );
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
							sound.next.play();
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
					score.judge.forEach(( judge, i ) => {
						var name = '#j' + i;
						var acc = $( name + '-acc' );
						var pre = $( name + '-pre' );
						var sum = $( name + '-sum' );

						acc.removeClass( 'ignore' );
						pre.removeClass( 'ignore' );

						if( defined( judge.accuracy     )) { acc.html( judge.accuracy.toFixed( 1 ));     } else { acc.empty(); }
						if( defined( judge.presentation )) { pre.html( judge.presentation.toFixed( 1 )); } else { pre.empty(); }
						if( judge.minacc || judge.maxacc ) { acc.addClass( 'ignore' ); } else if( defined( judge.accuracy     )) { spread.acc.push( parseFloat( judge.accuracy ));     }
						if( judge.minpre || judge.maxpre ) { pre.addClass( 'ignore' ); } else if( defined( judge.presentation )) { spread.pre.push( parseFloat( judge.presentation )); }

						var total = judge.accuracy + judge.presentation;
						if( defined( judge.accuracy ) && defined( judge.presentation )) { sum.html( total.toFixed( 1 )); spread.sum.push( total ); }

						var clear = $( name + '-clr' );
						clear.find( 'button' ).off( 'click' ).click( clearJudgeScore( i, judge, athlete ));
					});
					if( isCurrent ) { $( '#clear-judge-scores' ).show(); }
					else            { $( '#clear-judge-scores' ).hide(); }

					if( score.complete && spread.acc.length > 0 && spread.pre.length > 0 ) {
						console.log( score );
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
						$( '#spread-acc, #spread-pre, #score-acc, #score-pre' ).empty();
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
