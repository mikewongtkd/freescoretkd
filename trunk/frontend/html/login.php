<?php
	include_once( "./include/php/version.php" );
	include_once( "./include/php/config.php" );
	include_once( "session.php" );

	$referrer = isset( $_GET[ 'referrer' ]) ? base64_decode( rawurldecode( $_GET[ 'referrer' ])) : false;
	$message  = isset( $_GET[ 'message' ]) ? base64_decode( rawurldecode( $_GET[ 'message' ])) : false;

	// No password needed? Go straight to the desired page
	if( ! $config->secured()) { 
		$_SESSION[ 'is_auth' ] = True;
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
    <style>
input[name="password"] {
  font-size: 6em;
  height: 1em;
  width: 3em;
}
    </style>

		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body>
		<div class="container">
			<div class="page-header">
				<h1>Welcome</h1>
<?php if( ! $config->password()): ?>
        <p>Please specify your ring number and passcode.</p>
				<div class="btn-group rings">
<?php foreach( $config->rings() as $ring ): $ringid = sprintf( 'ring%02d', $ring ); ?>
					<button class="btn btn-ring" data-ring="<?= $ringid ?>">Ring <?= $ring ?></button>
<?php endforeach; ?>
				</div>
<?php else: ?>
        <p>Please enter the passcode.</p>
<?php endif; ?>
			</div>
        <form method="POST" action="include/php/session/login.php">
          <input type="hidden" name="referrer" value="<?= $referrer ?>" />
          <input type="hidden" name="ring" value="" />
          <input class="form-control" type="number" name="password" value="" minlength=4 maxlength=4 />
          <button class="btn btn-success btn-login disabled">Login</button>
        </form>
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
		login : {
			click: ev => {
				ev.preventDefault();
				sound.send.play();
				$( 'input[name="ring"]' ).val( state.ring );

				setTimeout(() => {
					$( 'form' ).submit();
				}, 1500 );
			},
			disable : () => { $( '.btn-login' ).addClass( 'disabled' ).off( 'click' ); },
			enable  : () => { $( '.btn-login' ).removeClass( 'disabled' ).off( 'click' ).click( handle.button.login.click ); }
		}
	}
};

$( '.btn-ring' ).off( 'click' ).click( handle.button.ring.click );
		</script>
	</body>
</html>
