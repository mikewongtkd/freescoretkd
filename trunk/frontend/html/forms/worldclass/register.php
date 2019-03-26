<?php 
	$clear_cookie = time() - 3600; # set cookie expiration data to an hour ago (expire immediately)
	include( "../../include/php/config.php" ); 
	setcookie( 'judge', '', $clear_cookie, '/' );
	setcookie( 'role', 'history', 0, '/' );
	$i = isset( $_GET[ 'ring' ] ) ? $_GET[ 'ring' ] : $_COOKIE[ 'ring' ];
	if( ! isset( $i )) { $i = 1; }
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
		<title>Register Device</title>
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/css/forms/worldclass/history.css" rel="stylesheet" />
		<link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootstrap-list-filter.min.js"></script>
		<script src="../../include/alertify/alertify.min.js"></script>
		<script src="../../include/opt/js-sha3/sha3.js"></script>
		<script src="../../include/opt/js-cookie/js.cookie.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/date.format.js"></script>
		<script src="../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../include/js/forms/worldclass/division.class.js"></script>
		<style>
body { background-color: black; color: gold; }
	
.register { margin-top: 40px; }

.btn-group { margin: 12px; }

#cancel,#ok {
	display: inline-block;
	width: 80px;
	margin: 12px;
}
		</style>
	</head>
	<body>
		<div class="container">
			<div class="register">
				<h1>Register Device</h1>
				<div>
					<div class="btn-group" role="group" id="rings"></div>
				</div>
				<div>
					<div class="btn-group" role="group" id="roles"></div>
				</div>
				<div>
					<button class="btn btn-danger" id="cancel">Cancel</button>
					<button class="btn btn-success" id="ok">OK</button>
				</div>
			</div>
		</div>
		<script>
			alertify.defaults.theme.ok     = "btn btn-danger";
			alertify.defaults.theme.cancel = "btn btn-warning";

			var host       = '<?= $host ?>';
			var tournament = <?= $tournament ?>;
			var ring       = { num: <?= $i ?> };
			var judges     = {};
			var html       = FreeScore.html;
			var ws         = new WebSocket( 'ws://<?= $host ?>:3088/worldclass/' + tournament.db + '/' + ring.num );
			var network    = { reconnect: 0 }
			var url        = $.url();
			var first      = ( el ) => { return defined( el ); };
			var reg        = {
				ring : [ ring.num, url.param( 'ring' ), Cookies.get( 'ring' )].find( first ),
				role : [ url.param( 'role' ), Cookies.get( 'role' )].find( first ),
				id   : [ url.param( 'id' ), Cookies.get( 'id' )].find( first ),
				judge: parseInt( [ url.param( 'judge' ), Cookies.get( 'judge' )].find( first )),
			};

			[ 'ring', 'role', 'id', 'judge' ].forEach(( item ) => { Cookies.remove( item ); });

			ws.onerror = network.error = function() {
				setTimeout( function() { location.reload(); }, 15000 ); // Attempt to reconnect every 15 seconds
			};

			ws.onopen = network.connect = function() {
				var request;
				request      = { data : { type : 'division', action : 'judge query' }};
				request.json = JSON.stringify( request.data );
				ws.send( request.json );

				request      = { data : { type : 'division', action : 'history' }};
				request.json = JSON.stringify( request.data );
				ws.send( request.json );
			};

			ws.onmessage = network.message = function( response ) {
				var update = JSON.parse( response.data );
				console.log( update );

				if( update.type == 'division' ) {
					if( update.action == 'judges' ) {
						judges = update.judges;			
					} else

					if( update.action == 'update' ) {
						var division = update.division;
						if( ! defined( division )) { return; }
						division  = new Division( division );
						console.log( reg );

						refresh.registration( reg, division );
					}
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

			var sendRequest = ( request ) => {
				request.json = JSON.stringify( request.data );
				ws.send( request.json );
			};

			var refresh = { 
				registration : ( reg, division ) => {
					tournament.rings.forEach(( ring ) => {
						var button = html.button.clone().addClass( 'btn btn-warning' ).attr({ 'data-ring' : ring }).html( `<span class="fa fa-square"></span>&nbsp;Ring ${ring}` );
						if( ring == reg.ring ) { button.addClass( 'active' ); }
						$( '#rings' ).append( button );
					});

					if( reg.role == 'judge' ) {
						if( isNaN( reg.judge )) { $( '#ok' ).addClass( 'disabled' ); }
						for( var i = 0; i < division.judges(); i++ ) {
							var name   = '<span class="fa fa-user"></span>&nbsp;' + (i ? `Judge ${i}` : 'Referee');
							var button = html.button.clone().addClass( 'btn btn-info' ).attr({ 'data-judge' : i }).html( name );
							var registered = defined( judges[ i ].id );
							if( reg.judge == i || registered ) { button.addClass( 'active' ); }
							if( registered ) { button.removeClass( 'btn-info' ).addClass( 'btn-primary' ); }
							$( '#roles' ).append( button );
						}
					} else {
						var button = html.button.clone().addClass( 'btn btn-primary active' ).attr({ 'data-role' : 'computer operator' }).html( 'Computer Operator' );
						$( '#roles' ).append( button );
					}

					$( '#rings button' ).off( 'click' ).click(( ev ) => {
						var target = $( ev.target ).hasClass( 'btn' ) ? $( ev.target ) : $( ev.target ).parents( '.btn' );
						$( '#rings button' ).removeClass( 'active' );
						target.addClass( 'active' );
						reg.ring = parseInt( target.attr( 'data-ring' ));
						sound.next.play();
					});

					$( '#roles button' ).off( 'click' ).click(( ev ) => {
						$( '#ok' ).removeClass( 'disabled' );
						var target = $( ev.target ).hasClass( 'btn' ) ? $( ev.target ) : $( ev.target ).parents( '.btn' );
						var i      = parseInt( target.attr( 'data-judge' ));
						if( target.hasClass( 'active' )) {
							var name = (i ? `Judge ${i}` : 'Referee');
							alertify.confirm( 
								`${name} is already registered`, 
								`${name} is already registered on another device. Override?`,
								() => {
									$( '#roles button' ).removeClass( 'active' );
									target.addClass( 'active' );
									if( reg.role == 'judge' ) { reg.judge = i; }
									sound.next.play();
								},
								() => {}
							);
						} else {
							$( '#roles button' ).removeClass( 'active' );
							target.addClass( 'active' );
							if( reg.role == 'judge' ) { reg.judge = i; }
							sound.next.play();
						}
					});

					$( '#ok' ).off( 'click' ).click(( ev ) => { 
						if( $( ev.target ).hasClass( 'disabled' )) { alertify.message( 'Choose a judge seat' ); return; }
						Cookies.set( 'ring',  reg.ring,  { path : '/' });
						Cookies.set( 'role',  reg.role,  { path : '/' });
						sound.ok.play(); 

						if( reg.role == 'judge' ) {
							if( ! defined( reg.id )) { reg.id = sha3_224( String( Math.round( Math.random() * Math.pow( 10, 16 )))); }
							Cookies.set( 'id',    reg.id,    { path : '/' });
							Cookies.set( 'judge', reg.judge, { path : '/' });

							// Send registration request to broadcast to peers
							var request = { data: { type: 'division', action: 'judge registration', num: reg.judge, id: reg.id }};
							request.json = JSON.stringify( request.data );
							ws.send( request.json );
							setTimeout( function() { location = 'judge.php'; }, 500 ); 

						} else {
							setTimeout( function() { location = `coordinator.php?ring=${reg.ring}`; }, 500 ); 
						}
					});

					$( '#cancel' ).off( 'click' ).click(( ev ) => { window.location = '../../index.php'; });
				}
			};
		</script>
	</body>
</html>
