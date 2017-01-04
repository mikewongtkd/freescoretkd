<?php 
	$clear_cookie = time() - 3600; # set cookie expiration data to an hour ago (expire immediately)
	include( "../../include/php/config.php" ); 
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
?>
<html>
	<head>
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/css/forms/freestyle/coordinator.css" rel="stylesheet" />
		<link href="../../include/css/flippable.css" rel="stylesheet" />
		<link href="../../include/page-transitions/css/animations.css" rel="stylesheet" type="text/css" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/jquery/js/jquery.totemticker.min.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootstrap-list-filter.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootbox.min.js"></script>
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
					<div id="ring-header">Ring <?= $i ?> Divisions</div>
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
					<div id="division-header"></div>
					<div class="row">
						<div class="col-lg-9">
							<h4>Athletes</h4>
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
									<a class="list-group-item" id="penalty-clear"><span class="glyphicon glyphicon-trash"  ></span>Clear Penalties</a>
								</div>
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
			var ring       = { num: <?= $i ?> };
			var judges     = { name : [ 'referee', 'j1', 'j2', 'j3', 'j4', 'j5', 'j6' ] };
			var html       = FreeScore.html;
			var ws         = new WebSocket( 'ws://<?= $host ?>:3082/freestyle/' + tournament.db + '/' + ring.num );

			ws.onerror = function() {
				bootbox.alert( "Network Error: Cannot connect to server!" );
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
						if( page.num == 1 ) { page.transition() };
					}
				} else if( update.type == 'division' && update.action == 'update' ) {
					var division = update.division;
					if( ! defined( division )) { return; }

					division   = new Division( division );
					refresh.athletes( division, true );
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
					$( '#division-header' ).html( division.summary() );
					$( '#division-header' ).off( 'click' ).click(( ev ) => { 
						sound.prev.play();
						$.removeCookie( 'divid' );
						page.transition(); 
					});

					// ===== POPULATE THE ATHLETE LIST
					$( '#athletes' ).empty();
					division.athletes().forEach(( athlete, i ) => {
						var button  = html.a.clone().addClass( "list-group-item" );
						var name    = html.span.clone().addClass( "athlete-name" ).append( athlete.name() );
						var j       = division.current.athleteId();

						// ===== CURRENT ATHLETE
						if( i == j && currentDivision ) { 
							button.addClass( "active" ); 
							button.off( 'click' ).click(( ev ) => { 
								sound.prev.play(); 
								$( '#athletes .list-group-item' ).removeClass( 'selected-athlete' ); 
								$( "#navigate-athlete" ).attr({ 'athlete-id' :i });
								$( ".navigate-athlete" ).hide(); 
								$( ".penalties,.decision" ).show(); 
							});
							refresh.actions( division );

						// ===== ATHLETE IN CURRENT DIVISION
						} else if( currentDivision ) {
							if( i == j + 1 ) { button.addClass( "on-deck" ); } // Athlete on deck
							button.off( 'click' ).click(( ev ) => { 
								sound.next.play(); 
								$( '#athletes .list-group-item' ).removeClass( 'selected-athlete' ); 
								$( ev.target ).addClass( 'selected-athlete' ); 
								$( "#navigate-athlete-label" ).html( "Start scoring " + athlete.name()); 
								$( "#navigate-athlete" ).attr({ 'athlete-id' :i });
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
						$( ".navigate-division" ).hide(); $( ".penalties,.decision" ).show();
					} else { 
						$( ".navigate-division" ).show(); $( ".penalties,.decision" ).hide(); }
					$( ".navigate-athlete" ).hide();
				},
				actions : function( division ) {
					var athlete = division.current.athlete();
					var current = division.current.athleteId();
					var ring    = division.ring();
					var divid   = division.name();
					var action = {
						penalty : {
							bounds     : () => { sound.next.play(); athlete.penalty.bounds();     action.penalty.send(); },
							restart    : () => { sound.next.play(); athlete.penalty.restart();    action.penalty.send(); },
							misconduct : () => { sound.next.play(); athlete.penalty.misconduct(); action.penalty.send(); },
							clear      : () => { sound.prev.play(); athlete.penalty.clear();      action.penalty.send(); },
							send       : () => { sendRequest( { data : { type : 'division', action : 'award penalty', penalty: athlete.penalties(), athlete_id: current }} ); }
						},
						decision : {
							withdraw   : () => { sound.next.play(); bootbox.confirm( "Withdraw " + athlete.name() + "?", function( ok ) { if( ok ) { sound.ok.play(); action.decision.send( 'withdraw'   ); } else { sound.prev.play(); }}); },
							disqualify : () => { sound.next.play(); bootbox.confirm( "Withdraw " + athlete.name() + "?", function( ok ) { if( ok ) { sound.ok.play(); action.decision.send( 'disqualify' ); } else { sound.prev.play(); }}); },
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
				navadmin : function( division ) {
					var ring    = division.ring();
					var divid   = division.name();
					var action = {
						navigate : {
							athlete   : () => { sound.ok.play(); var i = $( '#navigate-athlete' ).attr( 'athlete-id' ); console.log( i ); action.navigate.to( { destination: 'athlete',  index : i     } ); },
							division  : () => { sound.ok.play(); action.navigate.to( { destination: 'division', divid : divid } ); },
							to        : ( target ) => { sendRequest( { data : { type : 'division', action : 'navigate', target : target }} ); }
						},
						administration : {
							display    : () => { sound.next.play(); page.display = window.open( 'index.php', '_blank' )},
							edit       : () => { sound.next.play(); page.editor  = window.open( 'division/editor.php?file=' + tournament.db + '/forms-freestyle/ring' + (ring < 10 ? '0' + ring : ring) + '/div.' + divid + '.txt', '_blank' )},
							print      : () => { sound.next.play(); page.print   = window.open( 'index.php', '_blank' )},
						}
					};

					$( "#navigate-athlete" )    .off( 'click' ).click( action.navigate.athlete );
					$( "#navigate-division" )   .off( 'click' ).click( action.navigate.division );
					$( "#admin-display" )       .off( 'click' ).click( action.administration.display );
					$( "#admin-edit" )          .off( 'click' ).click( action.administration.edit );
					$( "#admin-print" )         .off( 'click' ).click( action.administration.print );
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
