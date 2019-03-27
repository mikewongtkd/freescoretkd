<?php 
	$clear_cookie = time() - 3600; # set cookie expiration data to an hour ago (expire immediately)
	include( "../../include/php/config.php" ); 
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

#ok {
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
				<div class="btn-group" role="group" id="rings"></div>
				<div class="btn-group" role="group" id="roles"></div>
				<button class="btn btn-success pull-right" id="ok">OK</button>
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

				request      = { data : { type : 'division', action : 'read' }};
				request.json = JSON.stringify( request.data );
				ws.send( request.json );
			};

			ws.onmessage = network.message = function( response ) {
				var update = JSON.parse( response.data );
				console.log( update );

				if( update.type == 'division' ) {
					if( update.action == 'judges' ) {
						judges = update.judges;			
						refresh.roles( judges );
					} else

					if( update.action == 'update' ) {
						var division = update.division;
						if( ! defined( division )) { return; }
						division  = new Division( division );
						refresh.rings( division );
					}
					refresh.actions();
				}
			};

			var sound = {
				ok    : new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg" ]}),
				error : new Howl({ urls: [ "../../sounds/quack.mp3",    "../../sounds/quack.ogg"  ]}),
				next  : new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"   ]}),
				prev  : new Howl({ urls: [ "../../sounds/prev.mp3",     "../../sounds/prev.ogg"   ]}),
			};

			var refresh = { 

				rings : ( division ) => {
					// ===== RING VIEW UPDATE
					$( '#rings' ).empty();
					tournament.rings.forEach(( ring ) => {
						var button = html.button.clone().addClass( 'btn btn-warning' ).attr({ 'data-ring' : ring }).html( `<span class="fa fa-square"></span>&nbsp;Ring ${ring}` );
						if( ring == reg.ring ) { button.addClass( 'active' ); }
						$( '#rings' ).append( button );
					});

					// ===== RING SELECTION BEHAVIOR
					$( '#rings button' ).off( 'click' ).click(( ev ) => {
						var target = $( ev.target ).hasClass( 'btn' ) ? $( ev.target ) : $( ev.target ).parents( '.btn' );
						$( '#rings button' ).removeClass( 'active' );
						target.addClass( 'active' );
						ring.num = reg.ring = parseInt( target.attr( 'data-ring' ));
						sound.next.play();

						ws.close();
						ws = new WebSocket( 'ws://' + host + ':3088/worldclass/' + tournament.db + '/' + ring.num ); 
						ws.onopen    = network.connect;
						ws.onerror   = network.error;
						ws.onmessage = network.message;
						ws.onclose   = network.close;
					});
				},

				roles : ( judges ) => {
					console.log( judges );
					// ===== ROLE VIEW UPDATE
					$( '#roles' ).empty();
					if( reg.role == 'judge' ) {
						if( isNaN( reg.judge )) { $( '#ok' ).addClass( 'disabled' ); }
						for( var i = 0; i < judges.length; i++ ) {
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

					// ===== ROLE SELECTION BEHAVIOR
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

									$( '#ok' ).click();
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

				},
				actions : () => {
					// ===== ACTION BUTTON BEHAVIOR
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
				}
			};
		</script>
	</body>
</html>
