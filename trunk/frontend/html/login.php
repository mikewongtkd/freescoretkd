<?php
	include_once( "./include/php/version.php" );
	include_once( "./include/php/config.php" );
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
				<p class="text-primary">Please Login</p>
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
						<button class="btn btn-success btn-login disabled">Login</button>
					</div>
				</div>
			</div>

			<footer class="page-footer">
				<p class="text-muted">&copy; <?= $freescore[ 'copyright' ] ?> Mike Wong All Rights Reserved. </p>
			</footer>
		</div>
		<script>

var sound = {
	send      : new Howl({ urls: [ "./sounds/upload.mp3",   "./sounds/upload.ogg"   ]}),
	confirmed : new Howl({ urls: [ "./sounds/received.mp3", "./sounds/received.ogg" ]}),
	next      : new Howl({ urls: [ "./sounds/next.mp3",     "./sounds/next.ogg"     ]}),
	prev      : new Howl({ urls: [ "./sounds/prev.mp3",     "./sounds/prev.ogg"     ]}),
	error     : new Howl({ urls: [ "./sounds/quack.mp3",    "./sounds/quack.ogg"   ]}),
};

var inputs = [ 0, 1, 2, 3 ];
var state  = { cursor : 0, password : null };
var handle = {
	button : {
		numeric : {
			click: ev => {
				sound.next.play(); 
				let target = $( ev.target );
				let value  = parseInt( target.text());
				let code   = $( `input[name="code-${state.cursor}"]` );
				code.val( value );

				if( state.cursor <= 3 ) {
					state.cursor++;
					state.password = inputs.map( i => { return $( `input[name="code-${i}"]` ).val(); }).reduce(( a, b ) => a + b, '' );
					alertify.notify( state.password );
					handle.button.clear.enable();
					handle.button.back.enable();

				} else {
					handle.button.login.enable(); 
					handle.button.numeric.disable(); 
				}
			},
			disable : () => { $( '.btn-numeric' ).addClass( 'disabled' ).off( 'click' ); },
			enable  : () => { $( '.btn-numeric' ).removeClass( 'disabled' ).off( 'click' ).click( handle.button.numeric.click ); }
		},
		back : {
			click: ev => {
				sound.prev.play();

				state.cursor--;
				let code   = $( `input[name="code-${state.cursor}"]` );
				code.val( null );

				handle.button.numeric.enable();
				handle.button.login.disable();

				if( state.cursor == 0 ) {
					handle.button.clear.disable();
					handle.button.back.disable();
				}

				state.password = inputs.map( i => { return $( `input[name="code-${i}"]` ).val(); }).reduce(( a, b ) => a + b, '' );
				alertify.notify( state.password );
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
				sound.send.play();
			},
			disable : () => { $( '.btn-login' ).addClass( 'disabled' ).off( 'click' ); },
			enable  : () => { $( '.btn-login' ).removeClass( 'disabled' ).off( 'click' ).click( handle.button.login.click ); }
		}
	}
};

$( '.btn-numeric' ).off( 'click' ).click( handle.button.numeric.click );
$( '.btn-back' ).off( 'click' );
$( '.btn-clear' ).off( 'click' );
$( '.btn-login' ).off( 'click' );
		</script>
	</body>
</html>
