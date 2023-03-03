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
				<div class="page-header"><a id="back-to-divisions" class="btn btn-warning"><span class="glyphicon glyphicon-menu-left"></span> Ring <?= $i ?></a> <span id="division-header"></span></div>
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
			alertify.defaults.theme.ok     = "btn btn-danger";
			alertify.defaults.theme.cancel = "btn btn-warning";

			var host       = '<?= $host ?>';
			var tournament = <?= $tournament ?>;
			var ring       = { num: <?= $i ?> };
			var judges     = { name : [ 'referee', 'j1', 'j2', 'j3', 'j4', 'j5', 'j6' ] };
			var html       = FreeScore.html;
			
			var ws     = new WebSocket( `<?= $config->websocket( 'breaking' ) ?>/${tournament.db}/${ring.num}` );

			var handle = {
				ring: {
					read : ( update ) => {
						console.log( update );

						let ring = update.ring;
						refresh.ring( ring );
						let divid = $.cookie( 'breaking-divid' );
						if( defined( divid )) {
							let division = ring.divisions.find( d => d.name == divid );
							let current  = ring.divisions.find( d => d.name == ring.current );

							if( ! defined( division )) { return; }
							division = new Division( division );
							let isCurDiv = division.name() == current.name;
							refresh.athletes( division, isCurDiv );

							if( page.num == 1 ) { page.transition() };
						}
					},
					update: ( update ) => { handle.ring.read( update ); }
				},
				division : {
					decision: update => {
						let division = new Division( update.division );
						refresh.athletes( division, true );
					},
					update: update => {
						let request = update.request;
						if( ! request || ! request.action ) { return; }
						handle.division[ request.action ]( update );
					}
				}
			};

			var network = {
				open: () => {
					let request = { data : { type : 'ring', action : 'read' }};
					request.json = JSON.stringify( request.data );
					ws.send( request.json );
				},
				message: ( response ) => { 
					let update = JSON.parse( response.data );

					let type = update.type;
					if( ! (type in handle))           { alertify.error( `No handler for ${type} object` );   console.log( update ); return; }

					let action = update.action;
					if( ! (action in handle[ type ])) { alertify.error( `No handler for ${action} action` ); console.log( update ); return; }

					handle[ type ][ action ]( update );
				},
				send: request => {
					request.json = JSON.stringify( request.data ); 
					ws.send( request.json );
				}
			};
			ws.onopen    = network.open;
			ws.onmessage = network.message;

			var sound = {
				ok      : new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg"  ]}),
				warning : new Howl({ urls: [ "../../sounds/warning.mp3",  "../../sounds/warning.ogg" ]}),
				error   : new Howl({ urls: [ "../../sounds/quack.mp3",    "../../sounds/quack.ogg"   ]}),
				next    : new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"    ]}),
				prev    : new Howl({ urls: [ "../../sounds/prev.mp3",     "../../sounds/prev.ogg"    ]}),
			};

			var page = {
				num : 1,
				transition: ( ev ) => { page.num = PageTransitions.nextPage({ animation: page.animation( page.num )}); },
				animation:  ( pn ) => { return pn; } // Left-right movement is animation #1 and #2 coinciding with page numbers
			};

			var refresh = { 
				// ------------------------------------------------------------
				actions : division => {
				// ------------------------------------------------------------
					var athlete = division.current.athlete();
					var current = division.current.athleteid();

					var action = {
						decision : {
							withdraw   : () => { sound.next.play(); alertify.confirm( "Withdraw "   + athlete.name() + "?", 'Click <b class="text-danger">OK</b> to withdraw <b class="text-danger">' + athlete.name() + '</b> from competition or <b class="text-warning">Cancel</b> to do nothing.', function() { sound.ok.play(); action.decision.send( 'WDR'   ); alertify.error( athlete.name() + ' has withdrawn' );         }, function() { sound.prev.play(); }); $( '.ajs-header' ).addClass( 'decision-punitive-header' ); },
							disqualify : () => { sound.next.play(); alertify.confirm( "Disqualify " + athlete.name() + "?", 'Click <b class="text-danger">OK</b> to disqualify <b class="text-danger">' + athlete.name() + '</b> from competition or <b class="text-warning">Cancel</b> to do nothing.', function() { sound.ok.play(); action.decision.send( 'DSQ' ); alertify.error( athlete.name() + ' has been disqualified' ); }, function() { sound.prev.play(); }); $( '.ajs-header' ).addClass( 'decision-punitive-header' ); },
							clear      : () => { sound.next.play(); alertify.confirm( "Clear Decisions for " + athlete.name() + "?", 'Click <b class="text-danger">OK</b> to clear WDR and DSQ decisions for <b class="text-danger">' + athlete.name() + '</b> or <b class="text-warning">Cancel</b> to do nothing.', function() { sound.ok.play(); action.decision.send( 'clear' ); alertify.success( athlete.name() + ' has been cleared of punitive decisions' ); }, function() { sound.prev.play(); }); $( '.ajs-header' ).addClass( 'decision-punitive-header' ); },
							send       : ( reason ) => { network.send( { data : { type : 'division', action : 'decision', decision: reason }} ); }
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
						sound.prev.play();
						$.removeCookie( 'breaking-divid' );
						page.transition(); 
					});

					// ===== POPULATE THE ATHLETE LIST
					$( '#athletes' ).empty();
					division.athletes().forEach(( athlete, i ) => {
						let button    = html.a.clone().addClass( "list-group-item" );
						let name      = html.span.clone().addClass( "athlete-name" ).html( athlete.name() );
						let total     = html.span.clone().addClass( "athlete-score" ).html( athlete.score() );
						let j         = division.current.athleteid();

						// ===== CURRENT ATHLETE
						if( i == j && isCurrentDivision ) { 
							button.addClass( "active" ); 
							button.off( 'click' ).click(( ev ) => { 
								sound.prev.play(); 
								$( '#athletes .list-group-item' ).removeClass( 'selected-athlete' ); 
								$( "#navigate-athlete" ).attr({ 'athlete-id' :i });
								$( ".navigate-athlete" ).hide(); 
								$( ".decision" ).show(); 
							});
							refresh.judges( division );

						// ===== ATHLETE IN CURRENT DIVISION
						} else if( isCurrentDivision ) {
							if( i == j + 1 ) { button.addClass( "on-deck" ); } // Athlete on deck
							button.off( 'click' ).click(( ev ) => { 
								let clicked = $( ev.target );
								if( ! clicked.is( 'a' )) { clicked = clicked.parents( 'a' ); }
								sound.next.play(); 
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
						refresh.navadmin( division );
						button.append( name, total );
						$( '#athletes' ).append( button );
					});

					// ===== ACTION MENU BEHAVIOR
					if( isCurrentDivision ) { $( '.navigate-division' ).hide(); $( '.administration' ).show(); $( '.decision' ).show(); $( '.scoring' ).show(); } 
					else                    { $( '.navigate-division' ).show(); $( '.administration' ).hide(); $( '.decision' ).hide(); $( '.scoring' ).hide(); }

					refresh.actions( division );
					$( '.navigate-athlete' ).hide();
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
						}
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
							technical    : $( '#judge-scores .deductions.tech span' ),
							procedural   : $( '#judge-scores .deductions.proc span' ),
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
							athlete   : () => { sound.ok.play(); let i = $( '#navigate-athlete' ).attr( 'athlete-id' ); action.navigate.to( { destination: 'athlete',  id : i     } ); },
							division  : () => { sound.ok.play(); action.navigate.to( { destination: 'division', id : divid } ); },
							to        : ( target ) => { network.send( { data : { type : 'division', action : 'navigate', target: target }}); }
						},
						administration : {
							display    : () => { sound.next.play(); page.display = window.open( `index.php?ring=${ringid}`, '_blank' )},
							edit       : () => { sound.next.play(); page.editor  = window.open( 'division/editor.php?file=' + tournament.db + '/feats-breaking/' + ring + '/div.' + divid + '.txt', '_blank' )},
							print      : () => { sound.next.play(); page.print   = window.open( '/cgi-bin/freescore/feats/breaking/results?ring=' + ringid + '&divid=' + divid, '_blank' )},
						}
					};

					$( "#navigate-athlete" )    .off( 'click' ).click( action.navigate.athlete );
					$( "#navigate-division" )   .off( 'click' ).click( action.navigate.division );
					$( "#admin-display" )       .off( 'click' ).click( action.administration.display );
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
							refresh.athletes( division, division.name() == ring.current );
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
