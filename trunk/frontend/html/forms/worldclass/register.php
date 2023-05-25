<?php 
	$clear_cookie = time() - 3600; # set cookie expiration data to an hour ago (expire immediately)
	include( '../../session.php' );
	include( '../../include/php/config.php' ); 
	$rnum = isset( $_GET[ 'ring' ] ) ? $_GET[ 'ring' ] : $_COOKIE[ 'ring' ];
	if( ! isset( $rnum )) { $rnum = 1; }
	$k = json_decode( $tournament )->rings->count;
	if( $rnum == 'staging' || (ctype_digit( $rnum ) && (integer) $rnum >= 1 && (integer) $rnum <= $k)) { 
		setcookie( 'ring', $rnum, 0, '/' ); 
		$cookie_set = true;
	} else {
		setcookie( 'ring', 1, 0, '/' ); 
	}

	$url = $config->websocket( 'worldclass', $rnum, 'register' );
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
		<script src="../../include/opt/js-cookie/js.cookie.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/websocket.js"></script>
		<script src="../../include/js/sound.js"></script>
		<script src="../../include/js/app.js"></script>
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

			var tournament = <?= $tournament ?>;
			var ring       = { num: <?= $rnum ?> };
			var judges     = {};
			var html       = FreeScore.html;
			var url        = $.url();
			var first      = ( el ) => { return defined( el ); };
			var reg        = {
				ring : [ ring.num, url.param( 'ring' ), Cookies.get( 'ring' )].find( first ),
				role : [ url.param( 'role' ), Cookies.get( 'role' )].find( first ),
				id   : [ url.param( 'id' ), Cookies.get( 'id' )].find( first ),
				judge: parseInt( [ url.param( 'judge' ), Cookies.get( 'judge' )].find( first )),
			};
			var app        = new FreeScore.App();

			$( '.register h1' ).html( `Register ${reg.role.split( ' ' ).map(( word ) => { return word.capitalize(); }).join( ' ' )} Device` );

			[ 'ring', 'role', 'id', 'judge' ].forEach(( item ) => { Cookies.remove( item ); });

			app.ping.off();

			app.network.on
				// ========================================
				.response( 'division' )
				// ========================================
				.handle( 'read' )
				.by( update => {
					console.log( 'DIVISION READ' );
					app.refresh.roles( update );
					app.refresh.rings( tournament );
					app.refresh.actions();
				});

			app.refresh = { 
				rings : tournament => {
					// ===== RING VIEW UPDATE
					$( '#rings' ).empty();
					tournament.rings.forEach(( ring ) => {
						var button = html.button.clone().addClass( 'btn btn-warning' ).attr({ 'data-ring' : ring }).html( `Ring ${ring}` );
						if( ring == reg.ring ) { button.addClass( 'active' ); }
						$( '#rings' ).append( button );
					});

					// ===== RING SELECTION BEHAVIOR
					$( '#rings button' ).off( 'click' ).click(( ev ) => {
						var target = $( ev.target ).hasClass( 'btn' ) ? $( ev.target ) : $( ev.target ).parents( '.btn' );
						$( '#rings button' ).removeClass( 'active' );
						target.addClass( 'active' );
						ring.num = reg.ring = parseInt( target.attr( 'data-ring' ));
						app.sound.next.play();
					});
				},

				roles : ( judges ) => {
					console.log( judges );
					// ===== ROLE VIEW UPDATE
					$( '#roles' ).empty();
					if( reg.role == 'judge' ) {
						if( isNaN( reg.judge )) { $( '#ok' ).addClass( 'disabled' ); }

						if( judges.length == 0 ) {
							var button = html.button.clone().addClass( 'btn btn-default' ).html( 'No division available or division not selected' );
							button.off( 'click' );
							$( '#roles' ).append( button );
							$( '#ok' ).addClass( 'disabled' );

						} else {
							for( var i = 0; i < judges.length; i++ ) {
								var name   = '<span class="fa fa-user"></span>&nbsp;' + (i ? `Judge ${i}` : 'Referee');
								var button = html.button.clone().addClass( 'btn btn-info role' ).attr({ 'data-judge' : i }).html( name );
								var registered = defined( judges[ i ].id );
								if( reg.judge == i || registered ) { button.addClass( 'active' ); }
								if( registered ) { button.removeClass( 'btn-info' ).addClass( 'btn-primary' ); }
								$( '#roles' ).append( button );
							}
						}
					} else {
						var button = html.button.clone().addClass( 'btn btn-primary role active disabled' ).attr({ 'data-role' : 'computer operator' }).html( 'Ring Computer' );
						$( '#roles' ).append( button );
					}

					// ===== ROLE SELECTION BEHAVIOR
					$( '#roles button.role' ).off( 'click' ).click(( ev ) => {
						$( '#ok' ).removeClass( 'disabled' );
						var target = $( ev.target ).hasClass( 'btn' ) ? $( ev.target ) : $( ev.target ).parents( '.btn' );
						var i      = parseInt( target.attr( 'data-judge' ));
						if( target.hasClass( 'active' ) && ! target.hasClass( 'disabled' )) {
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
							$( '#roles button.role' ).removeClass( 'active' );
							target.addClass( 'active' );
							if( reg.role == 'judge' ) { reg.judge = i; }
							app.sound.next.play();
						}
					});

				},
				actions : () => {
					// ===== ACTION BUTTON BEHAVIOR
					$( '#ok' ).off( 'click' ).click(( ev ) => { 
						if( $( ev.target ).hasClass( 'disabled' )) { alertify.message( 'Choose a judge seat' ); return; }
						Cookies.set( 'ring',  reg.ring,  { path : '/' });
						app.sound.ok.play(); 

						if( reg.role == 'judge' ) {
							if( ! defined( reg.id )) { reg.id = "<?= session_id() ?>"; }
							Cookies.set( 'id',    reg.id,    { path : '/' });
							Cookies.set( 'judge', reg.judge, { path : '/' });

							setTimeout( function() { location = 'judge.php'; }, 500 ); 

						} else {
							setTimeout( function() { location = `coordinator.php?ring=${reg.ring}`; }, 500 ); 
						}
					});
				}
			};

			app.on.connect( '<?= $url ?>' ).read.division();
		</script>
	</body>
</html>
