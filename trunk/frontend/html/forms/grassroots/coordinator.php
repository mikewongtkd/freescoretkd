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
		<link href="../../include/css/forms/grassroots/coordinator.css" rel="stylesheet" />
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
		<script src="../../include/js/forms/grassroots/score.class.js"></script>
		<script src="../../include/js/forms/grassroots/athlete.class.js"></script>
		<script src="../../include/js/forms/grassroots/division.class.js"></script>
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
								<h4>Scoring</h4>
								<div class="btn-group btn-group-justified" role="group" id="judge-scores">
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
			
			var ws     = new WebSocket( `ws://${host}:3080/grassroots/${tournament.db}/${ring.num}` );

			var handle = {
				division: {
					score: ( update ) => {
						console.log( update );
						let division = new Division( update.division );
						let judge    = update.judge == 0 ? 'R' : `J${update.judge}`;
						let n        = update.judges;
						let score    = update.score;
						let vote     = update.vote;
						let next     = (update.judge + 1) % n;
						let prev     = (update.judge - 1) > 0 ? update.judge - 1 : n - 1;
						next = next == 0 ? 'R' : `J${next}`;
						next = $( `#judge-scores .${next}` );

						if( score ) { return; } // For now, ignore scoring; can use this to display on coordinator console

						// 
						let button = $( `#judge-scores .${judge}` );
						button.removeClass( 'btn-default' ).removeClass( 'btn-danger'  ).removeClass( 'btn-primary' )
						if( vote == 'clear' ) { button.addClass( 'btn-default' ); button.addClass( 'active' ); } else
						if( vote == 'red' )   { button.addClass( 'btn-danger'  ); next.addClass( 'active' ); } else
						if( vote == 'blue' )  { button.addClass( 'btn-primary' ); next.addClass( 'active' ); }

						refresh.brackets( division, true );
					}
				},
				ring: {
					read : ( update ) => {
						console.log( update );

						var ring = update.ring;
						refresh.ring( ring );
						var divid = $.cookie( 'grassroots-divid' );
						if( defined( divid )) {
							var division = ring.divisions.find( d => d.name == divid );
							var current  = ring.divisions.find( d => d.name == ring.current );
							var isCurDiv = division.name == current.name;

							if( ! defined( division )) { return; }
							division = new Division( division );
							if( division.is.single.elimination()) { refresh.brackets( division, isCurDiv ); } 
							else                                  { refresh.athletes( division, isCurDiv ); }

							if( page.num == 1 ) { page.transition() };
						}
					},
					update: ( update ) => { handle.ring.read( update ); }
				}
			};

			var network = {
				open: () => {
					var request = { data : { type : 'ring', action : 'read' }};
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

			var sendVote = ( judge, vote ) => {
				var request = { data : { type : 'division', action : 'score', judge: judge, vote: vote }}; 
				request.json = JSON.stringify( request.data ); 
				ws.send( request.json );
			};
			var handleKeyDown = ( division ) => { return ( ev ) => {
				var k      = division.judges();
				var code   = ev.keyCode;
				var target = $( '#judge-scores .active' );
				var judge  = parseInt( target.attr( 'data-judge' )); if( isNaN( judge )) { let r = $( '#judge-scores .R' ); if( ! r.hasClass( 'btn-primary' ) && ! r.hasClass( 'btn-danger' )) { judge = 0 } else { judge = k - 1; }}
				var prev   = judge - 1 < 0 ? k - 1 : judge - 1;
				var name   = judge == 0 ? 'Referee' : `Judge ${judge}`;
				var abbr   = x => x == 0 ? 'R' : `J${x}`;

				var button = {
					prev: $( `#judge-scores .${abbr( prev )}` ),
					curr: $( `#judge-scores .${abbr( judge )}` )
				};

				if       ( code == 66 || code == 98 ) { /* B|b */
					sound.prev.play();
					sendVote( judge, 'blue' );
					alertify.message( `Sending ${name} vote for Blue`, 1 );

				} else if( code == 82 || code == 114 ) { /* R|r */
					sound.next.play();
					sendVote( judge, 'red' );
					alertify.message( `Sending ${name} vote for Red`, 1 );

				} else if( code == 8 || code == 46 ) { /* Backspace|Delete */
					sound.warning.play();
					if( button.curr.hasClass( 'btn-primary' ) || button.curr.hasClass( 'btn-danger' )) { sendVote( judge, 'clear' ); } else
					if( button.prev.hasClass( 'btn-primary' ) || button.prev.hasClass( 'btn-danger' )) { sendVote( prev, 'clear' ); }
					alertify.message( `Clearing ${name} vote`, 1 );
				}
				target.removeClass( 'active' );
			}};
			var refresh = { 
				// ------------------------------------------------------------
				athletes: function( division, isCurrentDivision ) {
				// ------------------------------------------------------------
					$( '#athletes' ).show();
					$( '#brackets' ).hide();
					$( 'body' ).off( 'keypress' );
					$( '#division-header' ).html( division.summary() );
					$( '#back-to-divisions' ).off( 'click' ).click(( ev ) => { 
						sound.prev.play();
						$.removeCookie( 'grassroots-divid' );
						page.transition(); 
					});

					// ===== POPULATE THE ATHLETE LIST
					$( '#athletes' ).empty();
					division.athletes().forEach(( athlete, i ) => {
						var score     = athlete.score();
						var button    = html.a.clone().addClass( "list-group-item" );
						var name      = html.span.clone().addClass( "athlete-name" ).append( athlete.name() );
						var total     = html.span.clone().addClass( "athlete-score" ).append( '&nbsp;' ); // MW
						var j         = division.current.athleteId();

						// ===== CURRENT ATHLETE
						if( i == j && isCurrentDivision ) { 
							button.addClass( "active" ); 
							button.off( 'click' ).click(( ev ) => { 
								sound.prev.play(); 
								$( '#athletes .list-group-item' ).removeClass( 'selected-athlete' ); 
								$( "#navigate-athlete" ).attr({ 'athlete-id' :i });
								$( ".navigate-athlete" ).hide(); 
								$( ".penalties,.decision" ).show(); 
							});

						// ===== ATHLETE IN CURRENT DIVISION
						} else if( isCurrentDivision ) {
							if( i == j + 1 ) { button.addClass( "on-deck" ); } // Athlete on deck
							button.off( 'click' ).click(( ev ) => { 
								var clicked = $( ev.target );
								if( ! clicked.is( 'a' )) { clicked = clicked.parents( 'a' ); }
								sound.next.play(); 
								$( '#athletes .list-group-item' ).removeClass( 'selected-athlete' ); 
								clicked.addClass( 'selected-athlete' ); 
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
						button.append( name, total );
						$( '#athletes' ).append( button );
					});

					// ===== ACTION MENU BEHAVIOR
					if( isCurrentDivision ) { $( ".navigate-division" ).hide(); $( ".penalties,.decision" ).show(); } 
					else                    { $( ".navigate-division" ).show(); $( ".penalties,.decision" ).hide(); }

					$( ".navigate-athlete" ).hide();
					$( ".scoring" ).hide();
				},
				// ------------------------------------------------------------
				brackets : function( division, isCurrentDivision ) {
				// ------------------------------------------------------------
					$( '#athletes' ).hide();
					$( '#brackets' ).show();
					$( '.scoring' ).show();
					$( '#division-header' ).html( division.summary() );
					$( '#back-to-divisions' ).off( 'click' ).click(( ev ) => { 
						sound.prev.play();
						$.removeCookie( 'grassroots-divid' );
						page.transition(); 
					});
					refresh.navadmin( division );
					refresh.judges( division );

					// ===== CLEAR BRACKETS AND REDRAW THEM
					$( '#brackets' ).empty();
					$( '#brackets' ).brackets( division );

					if( isCurrentDivision ) {
						// ===== PROVIDE BEHAVIOR WHEN CLICKING ON BRACKETS
						$( '#brackets' ).off( 'matchClicked' ).on( 'matchClicked', ( ev ) => {
							var brackets = division.brackets();
							var rnames   = { ro64: "Round of 64", ro32: "Round of 32", ro16: "Round of 16", qtrfin: "Quarter-Finals", semfin: "Semi-Finals", finals: "Finals" };
							var i        = ev.i;
							var j        = ev.j;
							var k        = ev.k;
							var match    = brackets[ j ][ i ];
							var athletes = division.athletes();
							var bye      = () => { return new Athlete(); };
							var blue     = { athlete : defined( match.blue.athlete ) ? athletes[ match.blue.athlete ] : bye() };
							var red      = { athlete : defined( match.red.athlete )  ? athletes[ match.red.athlete ]  : bye() };

							$( '.match' ).removeClass( 'selected' );
							if( k == division.current.athleteId() && isCurrentDivision ) {
								$( ".scoring" ).show();
								$( 'body' ).off( 'keydown' ).keydown( handleKeyDown( division ) );
								sound.prev.play();
								$( ".navigate-athlete" ).hide(); 

							} else if( isCurrentDivision ) {
								var num = match.round == 'finals' ? '' : i + 1;
								$( ".scoring" ).hide();
								$( 'body' ).off( 'keydown' );
								sound.next.play(); 
								$( '#athletes .list-group-item' ).removeClass( 'selected-athlete' ); 
								$( "#navigate-athlete-label" ).html( `Score ${rnames[ match.round ]} Match ${num}` ); 
								$( "#navigate-athlete" ).attr({ 'athlete-id' : k });
								$( ".navigate-athlete" ).show(); 
							}
							refresh.navadmin( division );
						});
					} else {
						$( 'body' ).off( 'keydown' );
						$( '#brackets' ).off( 'matchClicked' );
						$( ".scoring" ).hide();
					}

					// ===== ACTION MENU BEHAVIOR
					if( isCurrentDivision ) { $( ".navigate-division" ).hide(); $( ".penalties,.decision" ).show(); }
					else                    { $( ".navigate-division" ).show(); $( ".penalties,.decision" ).hide(); }

					$( ".navigate-athlete" ).hide();

				},
				// ------------------------------------------------------------
				judges : function( division ) {
				// ------------------------------------------------------------
					$( '#judge-scores' ).empty();
					var k = division.judges();

					for( var i = 0; i < k; i++ ) {
						var match   = division.current.bracket();
						var vote    = undefined;
						var judge   = i == 0 ? 'R' : `J${i}`;
						var button  = html.a.clone().attr({ 'data-judge' : i }).addClass( `btn btn-default ${judge}` ).html( judge );

						if( match.blue.votes[ i ]) { vote = 'blue'; button.removeClass( 'btn-default' ).addClass( 'btn-primary' ); }
						if( match.red.votes[ i ])  { vote = 'red';  button.removeClass( 'btn-default' ).addClass( 'btn-danger' ); }

						var others = $( '#judge-scores .active' );
						if( ! vote && others.length == 0 ) { button.toggleClass( 'active' ); } // Select the first judge that has not voted
						button.off( 'click' ).click(( ev ) => {
							var target = $( ev.target );
							$( '#judge-scores a.active' ).toggleClass( 'active' );
							target.toggleClass( 'active' );
						});
						$( '#judge-scores' ).append( button );
					}

					// ===== KEYBOARD SCORING BEHAVIOR
					$( 'body' ).off( 'keydown' ).keydown( handleKeyDown( division ));
				},
				// ------------------------------------------------------------
				navadmin : function( division ) {
				// ------------------------------------------------------------
					var ring    = division.ringName();
					var ringid  = division.ring();
					var divid   = division.name();
					var action = {
						navigate : {
							athlete   : () => { sound.ok.play(); var i = $( '#navigate-athlete' ).attr( 'athlete-id' ); action.navigate.to( { destination: 'athlete',  id : i     } ); },
							division  : () => { sound.ok.play(); action.navigate.to( { destination: 'division', id : divid } ); },
							to        : ( target ) => { var request = { data : { type : 'division', action : 'navigate', target: target }}; request.json = JSON.stringify( request.data ); ws.send( request.json ); }
						},
						administration : {
							display    : () => { sound.next.play(); page.display = window.open( 'index.php', '_blank' )},
							edit       : () => { sound.next.play(); page.editor  = window.open( 'division/editor.php?file=' + tournament.db + '/forms-grassroots/' + ring + '/div.' + divid + '.txt', '_blank' )},
							print      : () => { sound.next.play(); page.print   = window.open( '/cgi-bin/freescore/forms/grassroots/results?ring=' + ringid + '&divid=' + divid, '_blank' )},
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

							$.cookie( 'grassroots-divid', divid, { expires: 1, path: '/' });
							division = new Division( division );
							var se = division.is.single.elimination();
							if( se ) { refresh.brackets( division, division.name() == ring.current ); } 
							else     { refresh.athletes( division, division.name() == ring.current ); }
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
