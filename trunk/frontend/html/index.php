<?php
	include_once( __DIR__ . "/include/php/version.php" );
	include_once( __DIR__ . "/include/php/config.php" );
	include_once( __DIR__ . "/include/php/session/authenticate.php" );
?>
<html>
	<head>
		<title>FreeScore TKD v<?=$freescore[ 'version' ] ?></title>
		<link href="./include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="./include/bootstrap/css/freescore-theme.min.css" rel="stylesheet" />
		<link href="./include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="./include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<script src="./include/jquery/js/jquery.js"></script>
		<script src="./include/jquery/js/jquery.howler.min.js"></script>
		<script src="./include/bootstrap/js/bootstrap.min.js"></script>
		<script src="./include/alertify/alertify.min.js"></script>
		<script src="./include/js/freescore.js"></script>

		<meta name="viewport" content="width=device-width; initial-scale=1; viewport-fit=cover">
		<meta name="mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="theme-color" content="#000000">
		<link rel="manifest" href="./manifest.json">

		<style type="text/css">
			@font-face {
			  font-family: Nimbus;
			  src: url("include/fonts/nimbus-sans-l_bold-condensed.ttf"); }
			@font-face {
			  font-family: Biolinum;
			  font-weight: bold;
			  src: url("include/fonts/LinBiolinum_Rah.ttf"); }
			.register { margin-top: 18px; }
			.page-footer { text-align: center; }

			.device {
				width: 200px;
			}

			.config {
				width: 226px;
			}

		</style>
	</head>
	<body>
		<div class="container">
			<div class="page-header">
				<h1>FreeScore TKD Wifi <small>v<?=$freescore[ 'version' ]?></small></h1>
				<p><a href="http://mikewongtkd.github.io/freescoretkd">Open Source Taekwondo Poomsae Scoring Software</a> available under the GPL v2.</p>
			</div>

			<div id="devices">
				<div class="register" id="judge">
					<a class="btn btn-default worldclass" href="register.php?service=worldclass&role=judge" ><img class="device" src="images/roles/tablet-worldclass.png" /><p>Sport Poomsae Judge Tablet</p></a>
					<a class="btn btn-default freestyle"  href="register.php?service=freestyle&role=judge"  ><img class="device" src="images/roles/tablet-freestyle.png"  /><p>Freestyle Judge Tablet</p></a>
					<a class="btn btn-default grassroots" href="forms/grassroots/register.php?role=judge" ><img class="device" src="images/roles/tablet-grassroots.png" /><p>Open Poomsae Judge Tablet</p></a>
					<a class="btn btn-default breaking"   href="register.php?service=breaking&role=judge"   ><img class="device" src="images/roles/tablet-breaking.png"   /><p>Creative Breaking Judge Tablet</p></a>
				</div>

				<div class="register" id="computer-operator">
					<a class="btn btn-default worldclass" href="register.php?service=worldclass&role=computer+operator" ><img class="device" src="images/roles/coordinator-worldclass.png" /><p>Sport Poomsae Ring Computer</p></a>
					<a class="btn btn-default freestyle"  href="register.php?service=freestyle&role=computer+operator"  ><img class="device" src="images/roles/coordinator-freestyle.png"  /><p>Freestyle Ring Computer</p></a>
					<a class="btn btn-default grassroots" href="forms/grassroots/register.php?role=computer+operator" ><img class="device" src="images/roles/coordinator-grassroots.png" /><p>Open Poomsae Ring Computer</p></a>
					<a class="btn btn-default breaking"   href="register.php?service=breaking&role=computer+operator"   ><img class="device" src="images/roles/coordinator-breaking.png"   /><p>Creative Breaking Ring Computer</p></a>
				</div>

				<div class="register" id="divisions">
					<a class="btn btn-default worldclass" href="forms/worldclass/divisions.php" ><img class="device" src="images/roles/laptop-manage.png" /><p>Edit Sport Poomsae Divisions</p></a>
					<a class="btn btn-default freestyle"  href="forms/freestyle/divisions.php"  ><img class="device" src="images/roles/laptop-manage.png" /><p>Edit Freestyle Divisions</p></a>
					<a class="btn btn-default grassroots" href="forms/grassroots/divisions.php" ><img class="device" src="images/roles/laptop-manage.png" /><p>Edit Open Poomsae Divisions</p></a>
					<a class="btn btn-default breaking"   href="feats/breaking/divisions.php"   ><img class="device" src="images/roles/laptop-manage.png" /><p>Edit Creative Breaking Divisions</p></a>
				</div>

				<div class="register" id="tournament">
					<a class="btn btn-primary config worldclass" id="forms" href="forms/worldclass/draws.php"> Sport Poomsae Draws </a>
					<a class="btn btn-primary config" id="setup" href="setup.php"> Tournament and Rings Setup </a>
					<a class="btn btn-primary config" id="wifi"  href="wifi.php"> Network Setup </a>
				</div>

				<div class="register" id="registration">
					<a class="btn btn-primary config" id="registration"  href="registration.php"> Import USAT Registration </a>
					<a class="btn btn-primary config" id="schedule"  href="forms/worldclass/schedule/days.php"> Sport Poomsae Schedule </a>
					<a class="btn btn-primary config" id="update"  href="update.php"> Check for Software Updates </a>
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
	error     : new Howl({ urls: [ "./sounds/quack.mp3",    "./sounds/quack.ogg"   ]}),
};

$( '.list-group a' ).click( function( ev ) { 
	ev.preventDefault(); 
	sound.next.play(); 
	var href = $( this ).attr( 'href' );
	setTimeout( function() { window.location = href }, 300 );
});

var host       = '<?= $host ?>';
var tournament = <?= $tournament ?>;
<?php
	$services = [];
	foreach( $config->services() as $service ) {
		$services[ $service ] = $config->service_test( $service );
	}
	$services = json_encode( $services, JSON_UNESCAPED_SLASHES );
?>
var services   = <?= $services ?>

// ------------------------------------------------------------
function disable_service( service ) {
// ------------------------------------------------------------
	if( service == 'fswifi' ) {
		for( let setup of [ 'setup', 'wifi' ]) {
			let button = $( `#${setup}` );
			button.addClass( 'disabled' );
			button.css({ opacity: 0.20 });
		}
	} else {
		var div = `.${service}`;
		$( `${div} a` ).addClass( 'disabled' ); // Disable clicking
		$( div ).css({ opacity : 0.20 });
	}
}

// ------------------------------------------------------------
function test_service( service, url ) {
// ------------------------------------------------------------
	$.ajax( {
		type:        'GET',
		crossDomain: true,
		url:         url,
		data:        {},
		success:     response => { 
			if( response != 'OK' ) {
				sound.error.play();
				alertify.error( response.error );
				if( service != 'fswifi' ) { disable_service( service ); }
			}
		},
		error:       response => { 
			sound.error.play(); 
			if( service == 'fswifi' ) { alertify.error( "Setup service failed to start." ); } 
			else                      { alertify.error( `${service.capitalize()} service failed to start.` ); }
			disable_service( service );
		},
	});
}


$( function() {
	for (service in services) {
		var port = services[ service ];
		test_service( service, port );
	}
});

		</script>
	</body>
</html>
