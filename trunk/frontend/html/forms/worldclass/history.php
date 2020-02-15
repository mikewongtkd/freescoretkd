<?php 
	$clear_cookie = time() - 3600; # set cookie expiration data to an hour ago (expire immediately)
	include( "../../include/php/config.php" ); 
	setcookie( 'judge', '', $clear_cookie, '/' );
	setcookie( 'role', 'history', 0, '/' );
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
		<link href="../../include/css/forms/worldclass/history.css" rel="stylesheet" />
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
		<script src="../../include/js/date.format.js"></script>
		<script src="../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../include/js/forms/worldclass/division.class.js"></script>
	</head>
	<body>
		<div id="pt-main" class="pt-perspective">
			<!-- ============================================================ -->
			<!-- DIVISION ATHLETES -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-1">
				<div class="container">
				<div class="page-header">
					<span id="division-header"></span>
				</div>
					<div class="row">
						<div class="col-lg-9">
							<div class="list-group" id="history">
							</div>
						</div>
						<div class="action-menu col-lg-3">
							<div class="administration">
								<h4>Administration</h4>
								<div class="list-group">
									<a class="list-group-item" id="admin-restore"><span class="glyphicon glyphicon-save"></span>Restore <span id='restore-version'>this Version</span></a>
								</div>
								<div class="list-group">
									<a class="list-group-item" id="exit"><span class="glyphicon glyphicon-home"></span>Exit History</span></a>
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
			var ws         = new WebSocket( `ws://${host}:3088/worldclass/${tournament.db}/${ring.num}/computer+operator` );
			var network    = { reconnect: 0 }

			ws.onerror = network.error = function() {
				setTimeout( function() { location.reload(); }, 15000 ); // Attempt to reconnect every 15 seconds
			};

			ws.onopen = network.connect = function() {
				var request;
				request      = { data : { type : 'division', action : 'history' }};
				request.json = JSON.stringify( request.data );
				ws.send( request.json );
			};

			ws.onmessage = network.message = function( response ) {
				var update = JSON.parse( response.data );
				console.log( update );

				if( update.type == 'division' && update.action == 'update' ) {
					var division = update.division;
					if( ! defined( division )) { return; }
					division = new Division( division );

					refresh.history( division );
					if( page.num == 2 ) { page.transition() };
				}
			};

			// ===== TRY TO RECONNECT IF WEBSOCKET CLOSES
			ws.onclose = network.close = function() {
				if( network.reconnect < 10 ) { // Give 10 attempts to reconnect
					if( network.reconnect == 0 ) { alertify.error( 'Network error. Trying to reconnect.' ); }
					network.reconnect++;
					ws = new WebSocket( `ws://${host}:3088/worldclass/${tournament.db}/${ring.num}/computer+operator` );
					
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

			var administration = {
				restore : ( revision, division ) => {
					return () => { 
						sound.ok.play();
						alertify.success( "Division restored to version " + revision.number );
						alertify.success( "Returning to Coordinator screen." );
						setTimeout( () => { window.close(); }, 2500 );

						request      = { data : { type : 'division', action : 'restore', divid : division.name(), version : revision.number }};
						request.json = JSON.stringify( request.data );
						ws.send( request.json );
					}
				}
			};

			var dateformat = ( datetime ) => {
				var a = new Date( datetime + ' UTC');
				var b = new Date();

				if( a.getYear() == b.getYear()) {
					if( a.getMonth() == b.getMonth()) {
						if     ( a.getDate() == b.getDate()     ) { return a.format( "h:MM:ss TT" ); }
						else if( a.getDate() == b.getDate() - 1 ) { return 'Yesterday, ' + a.format( "h:MM:ss TT" ); } 
						else                                      { return a.format( "dddd, h:MM:ss TT" ); }
					}
					return a.format( "mm-dd h:MM:ss TT" );
				}
				return a.format( "yyyy-mm-dd h:MM:ss TT" );
			};

			var refresh = { 
				history: function( division ) {
					$( '#division-header' ).html( division.summary() );
					var history = division.history();
					if( ! defined( history )) { return; }

					// ===== POPULATE THE HISTORY LIST
					$( '#history' ).empty();
					history.forEach(( revision, i ) => {
						var button    = html.a.clone().addClass( "list-group-item" );
						var version   = html.span.clone().addClass( "version" ).append( revision.number );
						var datetime  = html.span.clone().addClass( "datetime" ).append( dateformat( revision.datetime ));
						var name      = html.span.clone().addClass( "revision" ).append( revision.description );

						button.off( 'click' ).click(( ev ) => { 
							$( '#history a.list-group-item' ).removeClass( 'active' );
							button.addClass( 'active' );
							refresh.actions( revision, division );
							$( '#restore-version' ).html( ' Version ' + revision.number );
							sound.prev.play(); 
						});

						button.append( version, datetime, name );
						$( '#history' ).append( button );
					});

					// ===== DISABLE THE RESTORE BUTTON
					$( '#admin-restore' ).css({ opacity: 0.25 }).off( 'click' );
				},
				actions : function( revision, division ) {
					console.log( revision );
					var action = {
						administration : {
							restore     : () => { 
								sound.next.play(); 
								alertify.confirm( 
									'Restore Division ' + division.name().toUpperCase() + ' to Previous Version?', 
									'<p>Restore Division ' + division.name().toUpperCase() + ' to version ' + revision.number + '?</p><p><span class="text-danger">' + revision.description + '</span></p><p>Click <b>OK</b> to restore, <b>Cancel</b> to not restore</p>',  
									administration.restore( revision, division ),
									() => { sound.prev.play(); }
								); 
							},
						},
					};

					$( '#admin-restore' ) .css({ opacity: 1.0 }).off( 'click' ).click( action.administration.restore );
				}
			};
			$( '#exit' ).off( 'click' ).click( () => { sound.prev.play(); setTimeout( () => { window.close(); }, 250 ); } );
		</script>
	</body>
</html>
