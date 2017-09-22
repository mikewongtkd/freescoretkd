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
		<link href="../../include/fontawesome/css/font-awesome.css" rel="stylesheet" type="text/css" />
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
			
			function handle_update( response ) {
				var update = JSON.parse( response.data );
				if( ! defined( update )) { return; }

					refresh.ring( update );
					var divid = $.cookie( 'grassroots-divid' );
					if( defined( divid )) {
						var division = update.divisions.find(( d ) => { return d.name == divid; });
						var current  = update.divisions.find(( d ) => { return d.name == update.current; });
						var curDiv   = division.name == current.name;

						if( ! defined( division )) { return; }
						division = new Division( division );
						if( division.is.single.elimination()) {
							$( '#athletes' ).hide();
							$( '#brackets' ).show();
							$( '#brackets' ).empty();
							refresh.brackets( division, curDiv );
							$( '.drawing' ).css({ position: 'absolute;', top: '0px;', left: '80px;' }); 
						} else {
							$( '#athletes' ).show();
							$( '#brackets' ).hide();
							refresh.athletes( division, curDiv );
						}
						if( page.num == 1 ) { page.transition() };
					}
				if( update.type == 'division' && update.action == 'update' ) {
					var division = update.division;
					if( ! defined( division )) { return; }

					division   = new Division( division );
					refresh.athletes( division, true );
					if( page.num == 1 ) { page.transition() };
				}
			};

			var source = new EventSource( '/cgi-bin/freescore/forms/grassroots/update?tournament=' + tournament.db );
			source.addEventListener( 'message', handle_update, false );

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
				var url = 'http://' + host + ':3080/' + tournament.db + '/' + ring.num + '/coordinator'
				var data = JSON.stringify( request.data );
				console.log( url, data );
				$.post( url, data );
			};

			var refresh = { 
				// ------------------------------------------------------------
				athletes: function( division, currentDivision ) {
				// ------------------------------------------------------------
					$( '#division-header' ).html( division.summary() );
					$( '#back-to-divisions' ).off( 'click' ).click(( ev ) => { 
						sound.prev.play();
						$.removeCookie( 'divid' );
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
						if( i == j && currentDivision ) { 
							button.addClass( "active" ); 
							button.off( 'click' ).click(( ev ) => { 
								sound.prev.play(); 
								$( '#athletes .list-group-item' ).removeClass( 'selected-athlete' ); 
								$( "#navigate-athlete" ).attr({ 'athlete-id' :i });
								$( ".navigate-athlete" ).hide(); 
								$( ".penalties,.decision" ).show(); 
							});

						// ===== ATHLETE IN CURRENT DIVISION
						} else if( currentDivision ) {
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
					if( currentDivision ) { 
						$( ".navigate-division" ).hide(); $( ".penalties,.decision" ).show();
					} else { 
						$( ".navigate-division" ).show(); $( ".penalties,.decision" ).hide(); }
					$( ".navigate-athlete" ).hide();
				},
				// ------------------------------------------------------------
				brackets : function( division, currentDivision ) {
				// ------------------------------------------------------------
					$( '#brackets' ).brackets( division );

					$( '.match' ).each( function( k, match ) { if( k == division.current.athleteId() ) { $( match ).addClass( 'current selected' ); } });

					$( '.match' ).off( 'click' ).click( function( ev ) {
						var clicked  = $( ev.target ); clicked = ! clicked.is( 'match' ) ? clicked.parent() : clicked;
						var brackets = division.brackets();
						var i        = parseInt( clicked.attr( 'match' ));
						var j        = parseInt( clicked.attr( 'round' ));
						var k        = parseInt( clicked.attr( 'index' ));
						var bracket  = brackets[ j ][ i ];
						var athletes = division.athletes();
						var blue     = { athlete : defined( bracket.blue.athlete ) ? athletes[ bracket.blue.athlete ] : { name: () => { return '[Bye]' }} };
						var red      = { athlete : defined( bracket.red.athlete )  ? athletes[ bracket.red.athlete ]  : { name: () => { return '[Bye]' }} };

						$( '.match' ).removeClass( 'selected' );
						if( k == division.current.athleteId() && currentDivision ) {
							sound.prev.play();
							$( ".navigate-athlete" ).hide(); 

						} else if( currentDivision ) {
							sound.next.play(); 
							$( '#athletes .list-group-item' ).removeClass( 'selected-athlete' ); 
							$( "#navigate-athlete-label" ).html( "Start scoring for " + blue.athlete.name() + ' vs ' + red.athlete.name() ); 
							$( "#navigate-athlete" ).attr({ 'athlete-id' : k });
							$( ".navigate-athlete" ).show(); 
						}
						clicked.addClass( 'selected' ); 
						refresh.navadmin( division );
					});

					// ===== ACTION MENU BEHAVIOR
					if( currentDivision ) { 
						$( ".navigate-division" ).hide(); $( ".penalties,.decision" ).show();
					} else { 
						$( ".navigate-division" ).show(); $( ".penalties,.decision" ).hide(); }
					$( ".navigate-athlete" ).hide();

				},
				// ------------------------------------------------------------
				navadmin : function( division ) {
				// ------------------------------------------------------------
					var ring    = division.ringName();
					var ringid  = division.ring();
					var divid   = division.name();
					var action = {
						navigate : {
							athlete   : () => { sound.ok.play(); var i = $( '#navigate-athlete' ).attr( 'athlete-id' ); console.log( i ); action.navigate.to( { destination: 'athlete',  index : i     } ); },
							division  : () => { sound.ok.play(); action.navigate.to( { destination: 'division', divid : divid } ); },
							to        : ( target ) => { sendRequest( { data : { type : 'division', action : 'navigate', target : target }} ); }
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
