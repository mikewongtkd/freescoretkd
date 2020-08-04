<?php 
	$clear_cookie = time() - 3600; # set cookie expiration data to an hour ago (expire immediately)
	include( "../../include/php/config.php" ); 
	setcookie( 'judge', '', $clear_cookie, '/' );
	setcookie( 'role', 'display', 0, '/' );
	$ring = isset( $_GET[ 'ring' ] ) ? $_GET[ 'ring' ] : $_COOKIE[ 'ring' ];
	$k = json_decode( $tournament )->rings->count;
	if( $ring == 'staging' || (ctype_digit( $ring ) && (integer) $ring >= 1 && (integer) $ring <= $k)) { 
		setcookie( 'ring', $ring, 0, '/' ); 
		$cookie_set = true;
	} else {
		setcookie( 'ring', 1, 0, '/' ); 
	}
?>
<html>
	<head>
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/css/forms/freestyle/coordinator.css" rel="stylesheet" />
		<link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/themes/default.min.css" rel="stylesheet" />
		<link href="../../include/page-transitions/css/animations.css" rel="stylesheet" type="text/css" />
		<script src="../../include/opt/js-sha1/sha1.min.js"></script>
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery.easytimer.min.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootstrap-list-filter.min.js"></script>
		<script src="../../include/alertify/alertify.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/forms/freestyle/athlete.class.js"></script>
		<script src="../../include/js/forms/freestyle/division.class.js"></script>
	</head>
	<body>
		<div id="pt-main" class="pt-perspective">
			<!-- ============================================================ -->
			<!-- RING DIVISIONS -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-1">
				<div class="container">
					<div id="ring-header"> Ring <?= $ring ?> Divisions </div>
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
					<div id="division-header">
						<a id="back-to-divisions" class="btn btn-warning"><span class="glyphicon glyphicon-menu-left"></span> Division List</a> <span id="division-summary"></span>
					</div>
					<div class="row">
						<div class="col-lg-9">
							<h4><span id="round-and-athlete-count"></span></h4>
							<div class="list-group" id="athletes">
							</div>
						</div>
						<div class="action-menu col-lg-3">
							<?php include( 'coordinator/judge-scores.php' ); ?>
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
							<div class="navigate-round">
								<h4>Round</h4>
								<div class="btn-group">
									<a class="btn btn-primary" style="width:130px;" id="navigate-round-prev"><span class="glyphicon glyphicon-step-backward"></span> Previous</a>
									<a class="btn btn-primary" style="width:130px;" id="navigate-round-next">Next <span class="glyphicon glyphicon-step-forward"></span></a>
								</div>
							</div>
							<div class="timer">
								<h4>Timer</h4>
								<div id="timer-display">0:00.0</div>
								<div class="btn-group" style="width:100%">
									<a class="btn btn-success" id="timer-start"><span class="glyphicon glyphicon-play"></span> Start</a>
									<a class="btn btn-danger disabled"  id="timer-reset"><span class="glyphicon glyphicon-repeat"></span> Reset</a>
								</div>
								<p style="font-size:8pt; margin-left: 8px;">Press <code>Space</code> to start/pause the timer, <code>0</code> to reset</p>
							</div>
							<div class="decision">
								<h4>Decision</h4>
								<div class="list-group">
									<a class="list-group-item" id="decision-withdraw"><span class="glyphicon glyphicon-remove"></span>Withdraw</a>
									<a class="list-group-item" id="decision-disqualify"><span class="glyphicon glyphicon-ban-circle"></span>Disqualify</a>
								</div>
							</div>
							<div class="administration">
								<h4>Administration</h4>
								<div class="list-group">
									<a class="list-group-item" id="admin-display"><span class="glyphicon glyphicon-eye-open"></span>Show Display</a>
									<a class="list-group-item" id="admin-view"><span class="glyphicon glyphicon-list"></span>Change View</a>
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
			var host       = '<?= $host ?>';
			var tournament = <?= $tournament ?>;
			var ring       = { num: <?= $ring ?> };
			var judges     = { name : [ 'referee', 'j1', 'j2', 'j3', 'j4', 'j5', 'j6' ] };
			var html       = FreeScore.html;
			var ws         = new WebSocket( `ws://<?= $host ?>:3082/freestyle/${tournament.db}/${ring.num}/computer+operator/${sha1.hex(Date.now())}` );
			var timer      = new Timer();

			timer.addEventListener( 'secondTenthsUpdated', function( e ) {
				var time    = timer.getTimeValues();
				var minutes = time.minutes;
				var seconds = time.seconds; seconds = seconds < 10 ? '0' + seconds: seconds;
				var tenths  = time.secondTenths;
				$( '#timer-display' ).html( minutes + ':' + seconds + '.' + tenths );
			});

			ws.onerror = function() {
				alertify.error( "Network Error: Cannot connect to server!" );
			};

			ws.onopen = function() {
				var request  = { data : { type : 'ring', action : 'read' }};
				request.json = JSON.stringify( request.data );
				ws.send( request.json );
			};

			ws.onmessage = function( response ) {
				var update = JSON.parse( response.data );

				console.log( update );

				if( update.type == 'ring' && update.action == 'update' ) {
					if( ! defined( update.ring )) { return; }
					refresh.ring( update.ring );
					var divid = $.cookie( 'divid' );
					if( defined( divid )) {
						var division = update.ring.divisions.find(( d ) => { return d.name == divid; });
						var current  = update.ring.divisions.find(( d ) => { return d.name == update.ring.current; });
						var curDiv   = division.name == current.name;
						if( ! defined( division )) { return; }
						division = new Division( division );
						refresh.athletes( division, curDiv );
						refresh.judges( division, curDiv );
						if( page.num == 1 ) { page.transition() };
					}
				} else if( update.type == 'division' && update.action == 'update' ) {
					var division = update.division;
					if( ! defined( division )) { return; }

					division   = new Division( division );
					refresh.athletes( division, true );
					refresh.judges( division, curDiv );
					if( page.num == 1 ) { page.transition() };
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

			var refresh = { 
				athletes: function( division, currentDivision ) {
					$( '#division-summary' ).html( division.summary() + ' Freestyle' );
					$( '#back-to-divisions' ).off( 'click' ).click(( ev ) => { 
						sound.prev.play();
						$.removeCookie( 'divid' );
						page.transition(); 
					});
					$( '#round-and-athlete-count' ).html( division.current.round() + ' Round &ndash; ' + division.current.athletes().length + ' Athletes' );

					// ===== POPULATE THE ATHLETE LIST
					$( '#athletes' ).empty();
					division.current.athletes().forEach(( athlete, i ) => {
						var button  = html.a.clone().addClass( "list-group-item" );
						var name    = html.span.clone().addClass( "athlete-name" ).append( athlete.name() );
						var j       = division.current.athleteId();
						var order   = division.current.order();
						var round   = division.current.roundId();
						var n       = division.judges();

						// ===== CURRENT ATHLETE
						if( j == order[ i ] && currentDivision ) { 
							button.addClass( "active" ); 
							button.off( 'click' ).click(( ev ) => { 
								sound.prev.play(); 
								$( '#athletes .list-group-item' ).removeClass( 'selected-athlete' ); 
								$( "#navigate-athlete" ).attr({ 'athlete-id' : order[ i ] });
								$( ".navigate-athlete" ).hide(); 
								$( ".penalties,.decision" ).show(); 
							});
							var scores   = athlete.scores( round );
							var adjusted = athlete.adjusted( round );
							var min      = adjusted.min;
							var max      = adjusted.max;
							var rows     = [ 'tec', 'pre', 'sum' ];
							console.log( scores, adjusted );
							for( var k = 0; k < n; k++ ) {
								var score  = scores[ k ];
								var points = {
									tec : Object.values( score.technical ).reduce(( a, b ) => { return a + b; }).toFixed( 2 ),
									pre : Object.values( score.presentation ).reduce(( a, b ) => { return a + b; }).toFixed( 2 ),
								};
								points.sum = (parseFloat( points.tec ) + parseFloat( points.pre )).toFixed( 2 );
								rows.forEach(( key ) => { $( `#j${k}-${key}` ).text( points[ key ] ).removeClass( 'ignore' ); });
								if( k == max.presentation || k == min.presentation ) { $( `#j${k}-pre` ).addClass( 'ignore' ); }
								if( k == max.technical    || k == min.technical    ) { $( `#j${k}-tec` ).addClass( 'ignore' ); }
							}
							var points = {
								tec: adjusted.technical.toFixed( 2 ),
								pre: adjusted.presentation.toFixed( 2 ),
								sum: adjusted.total.toFixed( 2 ),
							};
							rows.forEach(( key ) => { $( `#score-${key}` ).text( points[ key ] ); });
							// Report range here. // MW
							// Add behavior to clear judge score. // MW

							timer.stop(); $( '#timer-display' ).html( '0:00.0' );
							refresh.actions( division );

						// ===== ATHLETE IN CURRENT DIVISION
						} else if( currentDivision ) {
							if( i < (order.length -1) && j == order[ i - 1 ] ) { button.addClass( "on-deck" ); } // Athlete on deck
							button.off( 'click' ).click(( ev ) => { 
								sound.next.play(); 
								$( '#athletes .list-group-item' ).removeClass( 'selected-athlete' ); 
								$( ev.target ).addClass( 'selected-athlete' ); 
								$( "#navigate-athlete-label" ).html( "Start scoring " + athlete.display.name()); 
								$( "#navigate-athlete" ).attr({ 'athlete-id' : order[ i ] });
								$( ".navigate-athlete" ).show(); 
								$( ".penalties,.decision" ).hide(); 
							});

						// ===== ATHLETE IN ANOTHER DIVISION
						} else {
							button.off( 'click' );
						}
						refresh.navadmin( division );
						button.append( name );
						$( '#athletes' ).append( button );
					});

					// ===== ACTION MENU BEHAVIOR
					if( currentDivision ) { 
						$( '#judge-scores' ).show();
						$( ".navigate-division" ).hide(); 
						$( ".penalties,.decision" ).show();
					} else { 
						$( '#judge-scores' ).hide();
						$( ".navigate-division" ).show(); 
						$( ".penalties,.decision" ).hide(); 
					}
					$( ".navigate-athlete" ).hide();
				},
				judges : function( division ) {
					var n  = division.judges();
					var td = [ 'col', 'tec', 'pre', 'sum', 'clr' ];
					for( var i = 0; i < 7; i++ ) {
						if( i < n ) { td.forEach(( id ) => { $( `#j${i}-${id}` ).show(); }); }
						else        { td.forEach(( id ) => { $( `#j${i}-${id}` ).hide(); }); }
					}
				},
				actions : function( division ) {
					var athlete = division.current.athlete();
					var current = division.current.athleteId();
					var divid   = division.name();
					var action = {
						timer : {
							start      : () => { sound.next.play(); timer.start({ precision: 'secondTenths' }); },
							pause      : () => { sound.prev.play(); timer.pause(); },
							reset      : () => { sound.prev.play(); timer.stop(); $( '#timer-display' ).html( '0:00.0' ); },
							toggle     : () => { var button = $( '#timer-start' ); if( button.text().match( /start/i )) { action.timer.start(); button.removeClass( 'btn-success' ).addClass( 'btn-warning' ); button.html( '<span class="glyphicon glyphicon-pause"></span> Pause' ); $( '#timer-reset' ).removeClass( 'disabled' ); } else { action.timer.pause(); button.removeClass( 'btn-warning' ).addClass( 'btn-success' ); button.html( '<span class="glyphicon glyphicon-play"></span> Start' ); } }
						},
						penalty : {
							time       : () => { sound.next.play(); athlete.penalty.time();       action.penalty.send(); alertify.warning( athlete.name() + ' has been given an<br><strong>over/under&nbsp;time&nbsp;penalty</strong>' ); },
							bounds     : () => { sound.next.play(); athlete.penalty.bounds();     action.penalty.send(); alertify.warning( athlete.name() + ' has been given an<br><strong>out-of-bounds&nbsp;penalty</strong>' ); },
							restart    : () => { sound.next.play(); athlete.penalty.restart();    action.penalty.send(); alertify.warning( athlete.name() + ' has been given a <strong>restart&nbsp;penalty</strong>' ); },
							misconduct : () => { sound.next.play(); athlete.penalty.misconduct(); action.penalty.send(); alertify.warning( athlete.name() + ' has been given a <strong>misconduct&nbsp;penalty</strong>' ); },
							clear      : () => { sound.prev.play(); athlete.penalty.clear();      action.penalty.send(); alertify.success( athlete.name() + ' has been <strong>cleared of all penalties</strong>' ); },
							send       : () => { sendRequest( { data : { type : 'division', action : 'award penalty', penalty: athlete.penalties(), athlete_id: current }} ); }
						},
						decision : {
							withdraw   : () => { sound.next.play(); alertify.confirm( "Withdraw " + athlete.name() + "?",   "Click OK to withdraw the athlete from competition. <strong>This action cannot be undone.</strong>",   function() { sound.ok.play(); action.decision.send( 'withdraw'   ); alertify.error( athlete.name() + ' has withdrawn' ); }, function() { sound.prev.play(); }); },
							disqualify : () => { sound.next.play(); alertify.confirm( "Disqualify " + athlete.name() + "?", "Click OK to disqualify the athlete from competition. <strong>This action cannot be undone.</strong>", function() { sound.ok.play(); action.decision.send( 'disqualify' ); alertify.error( athlete.name() + ' has been disqualified' ); }, function() { sound.prev.play(); }); },
							send       : ( reason ) => { sendRequest( { data : { type : 'division', action : 'award punitive', decision: reason, athlete_id: current }} ); }
						},
					};

					$( "#timer-start" )         .off( 'click' ).click( action.timer.toggle );
					$( "#timer-pause" )         .off( 'click' ).click( action.timer.pause );
					$( "#timer-reset" )         .off( 'click' ).click( action.timer.reset );
					$( "#penalty-time" )        .off( 'click' ).click( action.penalty.time );
					$( "#penalty-bounds" )      .off( 'click' ).click( action.penalty.bounds );
					$( "#penalty-restart" )     .off( 'click' ).click( action.penalty.restart );
					$( "#penalty-misconduct" )  .off( 'click' ).click( action.penalty.misconduct );
					$( "#penalty-clear" )       .off( 'click' ).click( action.penalty.clear );
					$( "#decision-withdraw" )   .off( 'click' ).click( action.decision.withdraw );
					$( "#decision-disqualify" ) .off( 'click' ).click( action.decision.disqualify );

					$( document ).off( 'keydown' ).keypress(( ev ) => {
						console.log( ev.keyCode, ev.charCode, ev.key );
						switch( ev.keyCode ) {
							case 32: 
								action.timer.toggle();
								break;

							case 48: 
								action.timer.reset();
								break;
						}
					});
				},
				navadmin : function( division ) {
					var divid   = division.name();
					var action = {
						navigate : {
							athlete   : () => { sound.ok.play(); var i = $( '#navigate-athlete' ).attr( 'athlete-id' ); action.navigate.to( { destination: 'athlete',  index : i     } ); },
							division  : () => { sound.ok.play(); action.navigate.to( { destination: 'division', divid : divid } ); },
							round     : { next : () => { sound.ok.play(); sendRequest( { data : { type : 'division', action : 'round next' }} ); }, prev : () => { sound.ok.play(); sendRequest({ data : { type : 'division', action : 'round prev' }} ); }},
							to        : ( target ) => { sendRequest( { data : { type : 'division', action : 'navigate', target : target }} ); }
						},
						administration : {
							view       : () => { sound.next.play(); sendRequest({ data : { type : 'division', action: 'view next' }})},
							display    : () => { sound.next.play(); page.display = window.open( 'index.php?ring=<?= $ring?>', '_blank' )},
							edit       : () => { sound.next.play(); page.editor  = window.open( 'division/editor.php?file=' + tournament.db + '/forms-freestyle/ring' + (ring.num < 10 ? '0' + ring.num : ring.num) + '/div.' + divid + '.txt', '_blank' )},
							print      : () => { sound.next.play(); page.print   = window.open( '/cgi-bin/freescore/forms/freestyle/results?ring=' + ring.num + '&divid=' + divid, '_blank' )},
						}
					};

					$( "#navigate-round-next" ) .off( 'click' ).click( action.navigate.round.next );
					$( "#navigate-round-prev" ) .off( 'click' ).click( action.navigate.round.prev );
					$( "#navigate-athlete" )    .off( 'click' ).click( action.navigate.athlete );
					$( "#navigate-division" )   .off( 'click' ).click( action.navigate.division );
					$( "#admin-view" )          .off( 'click' ).click( action.administration.view );
					$( "#admin-display" )       .off( 'click' ).click( action.administration.display );
					$( "#admin-edit" )          .off( 'click' ).click( action.administration.edit );
					$( "#admin-print" )         .off( 'click' ).click( action.administration.print );

					if( division.athletes().length <= 8 ) { $( '.navigate-round' ).hide(); } 
					else                                  { $( '.navigate-round' ).show(); }
				},
				ring: function( ring ) {
					$( '#ring' ).empty();
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
							refresh.judges( division, curDiv );
							sound.next.play();
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
