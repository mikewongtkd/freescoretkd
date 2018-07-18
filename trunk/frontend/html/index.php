<?php
	include "./include/php/version.php";
	include "./include/php/config.php";
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

		<meta name="viewport" content="width=device-width, initial-scale=1">
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
					<a class="btn btn-default worldclass" href="forms/worldclass/register.php?role=judge" ><img class="device" src="images/roles/tablet-worldclass.png" /><p>Sport Poomsae Referee Tablet</p></a>
					<a class="btn btn-default freestyle"  href="forms/freestyle/register.php?role=judge"  ><img class="device" src="images/roles/tablet-freestyle.png"  /><p>Freestyle Referee Tablet</p></a>
					<a class="btn btn-default grassroots" href="forms/grassroots/register.php?role=judge" ><img class="device" src="images/roles/tablet-grassroots.png" /><p>Open Poomsae Referee Tablet</p></a>
				</div>

				<div class="register" id="computer-operator">
					<a class="btn btn-default worldclass" href="forms/worldclass/register.php?role=computer+operator" ><img class="device" src="images/roles/coordinator-worldclass.png" /><p>Sport Poomsae Ring Computer</p></a>
					<a class="btn btn-default freestyle"  href="forms/freestyle/register.php?role=computer+operator"  ><img class="device" src="images/roles/coordinator-freestyle.png"  /><p>Freestyle Ring Computer</p></a>
					<a class="btn btn-default grassroots" href="forms/grassroots/register.php?role=computer+operator" ><img class="device" src="images/roles/coordinator-grassroots.png" /><p>Open Poomsae Ring Computer</p></a>
				</div>

				<div class="register" id="divisions">
					<a class="btn btn-default worldclass" href="forms/worldclass/divisions.php" ><img class="device" src="images/roles/laptop-manage.png" /><p>Edit Sport Poomsae Divisions</p></a>
					<a class="btn btn-default freestyle"  href="forms/freestyle/divisions.php"  ><img class="device" src="images/roles/laptop-manage.png" /><p>Edit Freestyle Divisions</p></a>
					<a class="btn btn-default grassroots" href="forms/grassroots/divisions.php" ><img class="device" src="images/roles/laptop-manage.png" /><p>Edit Open Poomsae Divisions</p></a>
				</div>

				<div class="register" id="tournament">
					<a class="btn btn-primary config worldclass" id="forms" href="forms/worldclass/draws.php"> Sport Poomsae Draws </a>
					<a class="btn btn-primary config" id="setup" href="setup.php"> Tournament and Rings Setup </a>
					<a class="btn btn-primary config" id="wifi"  href="wifi.php"> Network Setup </a>
				</div>

				<div class="register" id="registration">
					<a class="btn btn-primary config" id="registration"  href="registration.php"> Import USAT Registration </a>
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
var services   = { setup: 3085, grassroots: 3080, worldclass: 3088, freestyle: 3082 };

// ------------------------------------------------------------
function disable_service( service ) {
// ------------------------------------------------------------
	if( service == 'setup' ) {
		for( var setup of [ 'setup', 'wifi' ]) {
			var button = $( '#' + setup );
			console.log( button );
			button.addClass( 'disabled' );
			button.css({ opacity: 0.20 });
		}
	} else {
		var div = '.' + service;
		$( div + ' a' ).addClass( 'disabled' ); // Disable clicking
		$( div ).css({ opacity : 0.20 });
	}
}

// ------------------------------------------------------------
function test_service( service, port ) {
// ------------------------------------------------------------
	var url = 'http://' + host + ':' + port + '/status';
	$.ajax( {
		type:        'GET',
		crossDomain: true,
		url:         url,
		data:        {},
		success:     function( response ) { 
			if( defined( response.error )) {
				sound.error.play();
				alertify.error( response.error );
				if( service != 'setup' ) { disable_service( service ); }
			}
		},
		error:       function( response ) { 
			sound.error.play(); 
			alertify.error( "FreeScore " + service.capitalize() + " system failed to start." ); 
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
