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
		<title>World Class Ring <?= $i ?> Operations</title>
	</head>
	<body>
		<div id="pt-main" class="pt-perspective">
			<?php include_once( 'display/scoreboard/individual.php' ); ?>
			<div class="pt-page pt-page-2">
				<div class="container">
				</div>
			</div>
			<div class="pt-page pt-page-3">
				<div class="container">
				</div>
			</div>
			<div class="pt-page pt-page-2">
				<div class="container">
				</div>
			</div>
		</div>
		<script src="../../include/page-transitions/js/pagetransitions.js"></script>
		<script>
			var host       = '<?= $host ?>';
			var tournament = <?= $tournament ?>;
			var ring       = { num: <?= $i ?> };
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

			};

			ws.onmessage = network.message = function( response ) {
				var update = JSON.parse( response.data );
				console.log( update );
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
				animation:  ( pn ) => { var animation = [ ]; return animation[ pn ]; }
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

			var changeCurrentForm = function( i, form ) {
				return function() {
					sound.next.play();
					var title   = 'Start scoring ' + ordinal(( parseInt( i ) +1)) + ' form ' + form + '?'; 
					var message = 'Click <b class="text-danger">OK</b> to start scoring ' + form + ' or <b class="text-warning">Cancel</b> to do nothing.';
					var ok      = function() {
						sendRequest( { data : { type : 'division', action : 'navigate', target : { destination: 'form', index: i }}} );
						sound.ok.play();
						alertify.success( 'Scoring for ' + form );

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
								sound.prev.play(); 
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
								sound.next.play(); 
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
							show       : () => { sound.next.play(); action.penalty.toggle(); },
							bounds     : () => { sound.next.play(); athlete.penalize.bounds( round, form );     action.penalty.send(); alertify.error( athlete.name() + ' has been given an<br><strong>out-of-bounds&nbsp;penalty</strong>' ); action.penalty.toggle(); },
							restart    : () => { sound.next.play(); athlete.penalize.restart( round, form );    action.penalty.send(); alertify.error( athlete.name() + ' has been given a <strong>restart&nbsp;penalty</strong>' ); action.penalty.toggle(); },
							time       : () => { sound.next.play(); athlete.penalize.timelimit( round, form );  action.penalty.send(); alertify.error( athlete.name() + ' has been given a <strong>under/over time penalty</strong>' ); action.penalty.toggle(); },
							misconduct : () => { sound.next.play(); athlete.penalize.misconduct( round, form ); action.penalty.send(); alertify.error( athlete.name() + ' has been given a <strong>misconduct&nbsp;penalty</strong>' ); action.penalty.toggle(); },
							clear      : () => { sound.prev.play(); athlete.penalize.clear( round, form );      action.penalty.send(); alertify.success( athlete.name() + ' has been <strong>cleared of all penalties</strong>' ); if( $( '#penalty-give>.text' ).text().match( /hide/i )) { action.penalty.toggle();}},
							send       : () => { sendRequest( { data : { type : 'division', action : 'award penalty', penalties: athlete.penalties( round, form ), athlete_id: current }} ); },
							toggle     : () => { if( $( '#penalty-give>.text' ).text().match( /give/i )) { $( '.penalty-button' ).show(); $( '#penalty-give>.glyphicon' ).removeClass( 'glyphicon-hand-right' ).addClass( 'glyphicon-menu-up' );  $( '#penalty-give>.text' ).text( 'Hide penalties' ); } else {$( '.penalty-button' ).hide(); $( '#penalty-give>.glyphicon' ).removeClass( 'glyphicon-menu-up' ).addClass( 'glyphicon-hand-right' );  $( '#penalty-give>.text' ).text( 'Give a penalty' );  }}
						},
						decision : {
							withdraw   : () => { sound.next.play(); alertify.confirm( "Withdraw "   + athlete.name() + "?", 'Click <b class="text-danger">OK</b> to withdraw <b class="text-danger">' + athlete.name() + '</b> from competition or <b class="text-warning">Cancel</b> to do nothing.', function() { sound.ok.play(); action.decision.send( 'withdraw'   ); alertify.error( athlete.name() + ' has withdrawn' );         }, function() { sound.prev.play(); }); $( '.ajs-header' ).addClass( 'decision-punitive-header' ); },
							disqualify : () => { sound.next.play(); alertify.confirm( "Disqualify " + athlete.name() + "?", 'Click <b class="text-danger">OK</b> to disqualify <b class="text-danger">' + athlete.name() + '</b> from competition or <b class="text-warning">Cancel</b> to do nothing.', function() { sound.ok.play(); action.decision.send( 'disqualify' ); alertify.error( athlete.name() + ' has been disqualified' ); }, function() { sound.prev.play(); }); $( '.ajs-header' ).addClass( 'decision-punitive-header' ); },
							clear      : () => { sound.next.play(); alertify.confirm( "Clear Decisions for " + athlete.name() + "?", 'Click <b class="text-danger">OK</b> to clear WD and DQ decisions for <b class="text-danger">' + athlete.name() + '</b> or <b class="text-warning">Cancel</b> to do nothing.', function() { sound.ok.play(); action.decision.send( 'clear' ); alertify.success( athlete.name() + ' has been cleared of punitive decisions' ); }, function() { sound.prev.play(); }); $( '.ajs-header' ).addClass( 'decision-punitive-header' ); },
							send       : ( reason ) => { sendRequest( { data : { type : 'division', action : 'award punitive', decision: reason, athlete_id: current }} ); }
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
							athlete   : () => { sound.ok.play(); var i = $( '#navigate-athlete' ).attr( 'athlete-id' ); action.navigate.to( { destination: 'athlete',  index : i     } ); },
							division  : () => { sound.ok.play(); action.navigate.to( { destination: 'division', divid : divid } ); if( ring == 'staging' ) { alertify.success( "Transferred division from staging to ring. Starting to score division." ); setTimeout( function() { location.reload(); }, 3000 );}},
							to        : ( target ) => { sendRequest( { data : { type : 'division', action : 'navigate', target : target }} ); }
						},
						administration : {
							view       : () => { sound.next.play(); sendRequest( { data: { type: 'division', action: 'display' }});},
							display    : () => { sound.next.play(); page.display = window.open( 'index.php?ring=' + ring, '_blank' )},
							edit       : () => { sound.next.play(); page.editor  = window.open( 'division/editor.php?file=' + tournament.db + '/' + ring + '/' + divid, '_blank' )},
							results    : () => { sound.next.play(); page.results = window.open( '/cgi-bin/freescore/forms/worldclass/results?ring=' + ring + '&divid=' + divid, '_blank' )},
							history    : () => { sound.next.play(); page.results = window.open( 'history.php?ring=' + ring, '_blank' )},
						}
					};

					$( "#navigate-athlete" )    .off( 'click' ).click( action.navigate.athlete );
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
