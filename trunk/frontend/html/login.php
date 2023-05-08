<?php
	include_once( "./include/php/version.php" );
	include_once( "./include/php/config.php" );
	include_once( "session.php" );

	$referrer = isset( $_GET[ 'referrer' ]) ? base64_decode( rawurldecode( $_GET[ 'referrer' ])) : false;
	$message  = isset( $_GET[ 'message' ]) ? base64_decode( rawurldecode( $_GET[ 'message' ])) : false;

	// No password needed? Go straight to the desired page
	if( ! $config->secured()) { 
		$_SESSION[ 'is_auth' ] = 1;
		if( $referrer ) { Session::redirect( $referrer ); } 
		else            { Session::redirect( 'index.php' ); }
	}
?>
<html>
	<head>
		<title>FreeScore TKD v<?=$freescore[ 'version' ] ?></title>
		<link href="./include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="./include/bootstrap/css/freescore-theme.min.css" rel="stylesheet" />
		<link href="./include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="./include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="./include/css/password.css" rel="stylesheet" />
		<script src="./include/jquery/js/jquery.js"></script>
		<script src="./include/jquery/js/jquery.howler.min.js"></script>
		<script src="./include/bootstrap/js/bootstrap.min.js"></script>
		<script src="./include/alertify/alertify.min.js"></script>
		<script src="./include/js/freescore.js"></script>

		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body>
		<div class="container">
			<div class="page-header">
				<h1>Welcome</h1>
				<p class="text-primary">Please choose a ring and enter a password to login</p>
<?php if( is_null( $config->password())): ?>
				<div class="btn-group rings">
<?php foreach( $config->rings() as $ring ): $ringid = sprintf( 'ring%02d', $ring ); ?>
					<button class="btn btn-ring" data-ring="<?= $ringid ?>">Ring <?= $ring ?></button>
<?php endforeach; ?>
				</div>
<?php endif; ?>
			</div>

			<div class="password-input">
				<div class="code-display">
					<input class="code-number" type="text" name="code-0" readonly>
					<input class="code-number" type="text" name="code-1" readonly>
					<input class="code-number" type="text" name="code-2" readonly>
					<input class="code-number" type="text" name="code-3" readonly>
				</div>
				<div class="number-pad">
					<div class="number-pad-row">
						<button class="btn btn-numeric">7</button>
						<button class="btn btn-numeric">8</button>
						<button class="btn btn-numeric">9</button>
					</div>
					<div class="number-pad-row">
						<button class="btn btn-numeric">4</button>
						<button class="btn btn-numeric">5</button>
						<button class="btn btn-numeric">6</button>
					</div>
					<div class="number-pad-row">
						<button class="btn btn-numeric">1</button>
						<button class="btn btn-numeric">2</button>
						<button class="btn btn-numeric">3</button>
					</div>
					<div class="number-pad-row">
						<button class="btn btn-clear disabled">Clear</button>
						<button class="btn btn-numeric">0</button>
						<button class="btn btn-back disabled">Back</button>
					</div>
					<div class="number-pad-row">
						<form method="POST" action="include/php/session/login.php">
							<input type="hidden" name="referrer" value="<?= $referrer ?>" />
							<input type="hidden" name="ring" value="" />
							<input type="hidden" name="password" value="" />
							<button class="btn btn-success btn-login disabled">Login</button>
						</form>
					</div>
				</div>
			</div>

			<footer class="page-footer">
				<p class="text-muted">&copy; <?= $freescore[ 'copyright' ] ?> Mike Wong All Rights Reserved. </p>
			</footer>
		</div>
		<script>
<?php if( $message !== false ): ?>
		$(() => {
			alertify.error( '<?= $message ?>' );
		});
<?php endif; ?>

var sound = {
	send      : new Howl({ urls: [ "./sounds/upload.mp3",   "./sounds/upload.ogg"   ]}),
	confirmed : new Howl({ urls: [ "./sounds/received.mp3", "./sounds/received.ogg" ]}),
	next      : new Howl({ urls: [ "./sounds/next.mp3",     "./sounds/next.ogg"     ]}),
	prev      : new Howl({ urls: [ "./sounds/prev.mp3",     "./sounds/prev.ogg"     ]}),
	error     : new Howl({ urls: [ "./sounds/quack.mp3",    "./sounds/quack.ogg"   ]}),
};

var inputs = [ 0, 1, 2, 3 ];
var state  = { cursor : 0, ring : null, password : null };
var handle = {
	button : {
		ring : {
			click: ev => {
				sound.next.play();
				let target = $( ev.target );
				$( '.btn-ring' ).removeClass( 'btn-primary' );
				target.addClass( 'btn-primary' );
				state.ring = target.attr( 'data-ring' );
				if( state.password ) { handle.button.login.enable(); }
			},
		},
		numeric : {
			click: ev => {
				sound.next.play(); 
				let target = $( ev.target );
				let value  = parseInt( target.text());
				let code   = $( `input[name="code-${state.cursor}"]` );
				code.val( value );
				state.password = inputs.map( i => { return $( `input[name="code-${i}"]` ).val(); }).reduce(( a, b ) => a + b, '' );

				if( state.cursor < 3 ) {
					state.cursor   = state.password.length;
					handle.button.clear.enable();
					handle.button.back.enable();

				} else {
					if( state.ring ) { handle.button.login.enable(); }
					handle.button.numeric.disable(); 
				}
			},
			disable : () => { $( '.btn-numeric' ).addClass( 'disabled' ).off( 'click' ); },
			enable  : () => { $( '.btn-numeric' ).removeClass( 'disabled' ).off( 'click' ).click( handle.button.numeric.click ); }
		},
		back : {
			click: ev => {
				sound.prev.play();

				state.password = inputs.map( i => { return $( `input[name="code-${i}"]` ).val(); }).reduce(( a, b ) => a + b, '' );
				state.cursor   = state.password.length - 1;
				let code   = $( `input[name="code-${state.cursor}"]` );
				code.val( null );

				handle.button.numeric.enable();
				handle.button.login.disable();

				if( state.cursor == 0 ) {
					handle.button.clear.disable();
					handle.button.back.disable();
				}

			},
			disable : () => { $( '.btn-back' ).addClass( 'disabled' ).off( 'click' ); },
			enable  : () => { $( '.btn-back' ).removeClass( 'disabled' ).off( 'click' ).click( handle.button.back.click ); }
		},
		clear : {
			click: ev => {
				sound.prev.play();

				state.cursor = 0;
				state.password = null;
				inputs.forEach( i => { $( `input[name="code-${i}"]` ).val( null ); });

				handle.button.numeric.enable();
				handle.button.clear.disable();
				handle.button.back.disable();
				handle.button.login.disable();
			},
			disable : () => { $( '.btn-clear' ).addClass( 'disabled' ).off( 'click' ); },
			enable  : () => { $( '.btn-clear' ).removeClass( 'disabled' ).off( 'click' ).click( handle.button.clear.click ); }
		},
		login : {
			click: ev => {
				ev.preventDefault();
				sound.send.play();
				$( 'input[name="ring"]' ).val( state.ring );
				$( 'input[name="password"]' ).val( state.password );

				setTimeout(() => {
					$( 'form' ).submit();
				}, 1500 );
			},
			disable : () => { $( '.btn-login' ).addClass( 'disabled' ).off( 'click' ); },
			enable  : () => { $( '.btn-login' ).removeClass( 'disabled' ).off( 'click' ).click( handle.button.login.click ); }
		}
	},
	keydown : ev => {
		if( ev.keyCode == 27 ) { $( '.btn-clear' ).click(); return; }
		if( ev.keyCode == 8 )  { $( '.btn-back' ).click();  return; }
		if( ev.keyCode < 48 || ev.keyCode > 57 ) { return; }
		sound.next.play(); 
		let value  = ev.key;
		let code   = $( `input[name="code-${state.cursor}"]` );
		code.val( value );
		state.password = inputs.map( i => { return $( `input[name="code-${i}"]` ).val(); }).reduce(( a, b ) => a + b, '' );
		if( state.cursor < 3 ) {
			state.cursor   = state.password.length;
			handle.button.clear.enable();
			handle.button.back.enable();

		} else {
			if( state.ring ) { handle.button.login.enable(); }
			handle.button.numeric.disable(); 
		}
	}
};

$( 'body' ).off( 'keydown' ).keydown( handle.keydown );
$( '.btn-ring' ).off( 'click' ).click( handle.button.ring.click );
$( '.btn-numeric' ).off( 'click' ).click( handle.button.numeric.click );
$( '.btn-back' ).off( 'click' );
$( '.btn-clear' ).off( 'click' );
$( '.btn-login' ).off( 'click' );
		</script>
	</body>
</html>
