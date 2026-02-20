<?php 
	include( 'session.php' );
	include( 'include/php/config.php' ); 

	function iis( $value ) {
		if( isset( $value )) { return $value; }
		return null;
	}

	function param( $key, $default = null ) {
		$value = [ iis( $_GET[ $key ]), iis( $_COOKIE[ $key ]), $default ];
		$value = array_filter( $value, function( $value ) { return $value; });
		return array_shift( $value );
	}

	function is_ring( $rnum, $k ) {
		if( $rnum == 'staging' || (ctype_digit( $rnum ) && (integer) $rnum >= 1 && (integer) $rnum <= $k)) { return true; }
		return false;
	}

	$k    = count( json_decode( $tournament )->rings );
	$rnum = param( 'ring', 1 );
	if( is_ring( $rnum, $k )) { setcookie( 'ring', $rnum, 0, '/' ); }
	$rnumjs  = is_numeric( $rnum ) ? $rnum : "'$rnum'";
	$service = param( 'service', 'worldclass' );
	$service = $config->service( $service );
	if( ! $service ) { $service = [ 'name' => 'worldclass', 'path' => 'forms-worldclass' ]; }
	$service[ 'path' ] = preg_replace( '/-/', '/', $service[ 'path' ]);

	$url = [];
	for( $i = 1; $i <= $k; $i++ ) {
		$url []= $config->websocket( $service[ 'name' ], $i, 'register' );
	}
?>
<html>
	<head>
		<title>Register Device</title>
		<link href="include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="include/jquery/js/jquery.js"></script>
		<script src="include/jquery/js/jquery-ui.min.js"></script>
		<script src="include/jquery/js/jquery.howler.min.js"></script>
		<script src="include/jquery/js/jquery.purl.js"></script>
		<script src="include/bootstrap/js/bootstrap.min.js"></script>
		<script src="include/bootstrap/add-ons/bootstrap-list-filter.min.js"></script>
		<script src="include/alertify/alertify.min.js"></script>
		<script src="include/opt/js-cookie/js.cookie.js"></script>
		<script src="include/js/freescore.js"></script>
		<script src="include/js/uuid.js"></script>
		<script src="include/js/websocket.js"></script>
		<script src="include/js/sound.js"></script>
		<script src="include/js/event.js"></script>
		<script src="include/js/app.js"></script>
		<script src="include/js/client.js"></script>
		<script src="include/js/date.format.js"></script>
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
			var ring       = { num: <?= $rnumjs ?> };
			var html       = FreeScore.html;
			var url        = <?= json_encode( $url, JSON_UNESCAPED_SLASHES ) ?>;
			var first      = el => el;
			var reg        = {
				ring : ring.num,
				role : [ '<?= $_GET[ 'role' ] ?>', Cookies.get( 'role' )].find( first ),
				judge: parseInt( [ '<?= $_GET[ 'jid' ] ?>', Cookies.get( 'judge' )].find( first )),
			};
			var app        = new FreeScore.App();

			$( '.register h1' ).html( `Register ${reg.role.split( ' ' ).map(( word ) => { return word.capitalize(); }).join( ' ' )} Device` );

			[ 'ring', 'role', 'id', 'judge' ].forEach(( item ) => { Cookies.remove( item ); });

			app.on.connect( '<?= $url[ $rnum - 1 ] ?>' ).read.division();
			app.ping.off();

			app.network.on
				// ========================================
				.heard( 'division' )
				// ========================================
				.command( 'update' )
				.respond( update => {
					app.refresh.roles( update );
					app.refresh.rings( tournament );
					app.refresh.actions();
				});

			app.refresh = { 
				rings : tournament => {
					// ===== RING VIEW UPDATE
					$( '#rings' ).empty();
					tournament.rings.forEach(( ring ) => {
						let button = html.button.clone().addClass( 'btn btn-warning' ).attr({ 'data-ring' : ring }).html( `Ring ${ring}` );
						if( ring == reg.ring ) { button.addClass( 'active' ); }
						$( '#rings' ).append( button );
					});

					// ===== RING SELECTION BEHAVIOR
					$( '#rings button' ).off( 'click' ).click(( ev ) => {
						let target = $( ev.target ).hasClass( 'btn' ) ? $( ev.target ) : $( ev.target ).parents( '.btn' );
						$( '#rings button' ).removeClass( 'active' );
						target.addClass( 'active' );
						ring.num = reg.ring = parseInt( target.attr( 'data-ring' ));
						app.network.reconnect( url[ ring.num - 1 ]);
						app.sound.next.play();
					});
				},

				roles : ( update ) => {
					let judges = [];
					for( let i = 0; i < update.division.judges; i++ ) {
						judges.push({ id : null, num : i, name : i == 0 ? 'Referee' : `Judge ${i}` });
					}
					let registered = new Clients( update.users ).judges();
					registered.forEach( judge => judges[ judge.jid ].id = judge.id );

					// ===== ROLE VIEW UPDATE
					$( '#roles' ).empty();
					if( reg.role == 'judge' ) {
						if( isNaN( reg.judge )) { $( '#ok' ).addClass( 'disabled' ); }

						if( judges.length == 0 ) {
							let button = html.button.clone().addClass( 'btn btn-default' ).html( 'No division available or division not selected' );
							button.off( 'click' );
							$( '#roles' ).append( button );
							$( '#ok' ).addClass( 'disabled' );

						} else {
							for( let i = 0; i < judges.length; i++ ) {
								let judge  = judges[ i ];
								let name   = `<span class="fa fa-user"></span>&nbsp;${judge.name}`;
								let button = html.button.clone().addClass( 'btn btn-info role' ).attr({ 'data-judge' : i }).html( name );
								if( registered.find( judge => judge.jid == i )) { 
									button.removeClass( 'btn-info' ).addClass( 'btn-primary' );
								}
								$( '#roles' ).append( button );
							}
						}
					} else {
						let button = html.button.clone().addClass( 'btn btn-primary role active disabled' ).attr({ 'data-role' : 'computer operator' }).html( 'Ring Computer' );
						$( '#roles' ).append( button );
					}

					// ===== ROLE SELECTION BEHAVIOR
					$( '#roles button.role' ).off( 'click' ).click(( ev ) => {
						$( '#ok' ).removeClass( 'disabled' );
						let target = $( ev.target ).hasClass( 'btn' ) ? $( ev.target ) : $( ev.target ).parents( '.btn' );
						let i      = parseInt( target.attr( 'data-judge' ));
						if( target.hasClass( 'active' ) && ! target.hasClass( 'disabled' )) {
							let name = (i ? `Judge ${i}` : 'Referee');
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
							Cookies.set( 'judge', reg.judge, { path : '/' });

							setTimeout( function() { location = `<?= $service[ 'path' ] ?>/judge.php?ring=${reg.ring}&judge=${reg.judge}`; }, 500 ); 

						} else {
							setTimeout( function() { location = `<?= $service[ 'path' ] ?>/coordinator.php?ring=${reg.ring}`; }, 500 ); 
						}
					});
				}
			};
		</script>
	</body>
</html>
