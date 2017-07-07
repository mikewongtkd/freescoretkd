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
			  src: url("/freescore/include/fonts/nimbus-sans-l_bold-condensed.ttf"); }
			@font-face {
			  font-family: Biolinum;
			  font-weight: bold;
			  src: url("/freescore/include/fonts/LinBiolinum_Rah.ttf"); }
			.register { margin-top: 18px; }
			.page-footer { text-align: center; }
		</style>
	</head>
	<body>
		<div class="container">
			<div class="page-header">
				<h1>FreeScore TKD Wifi <small>v<?=$freescore[ 'version' ]?></small></h1>
				<p><a href="http://mikewongtkd.github.io/freescoretkd">Open Source Taekwondo Poomsae Scoring Software</a> available under the GPL v2.</p>
			</div>

			<div class="register" id="worldclass">
				<a class="btn btn-default" href="forms/worldclass/register.php?role=judge"             ><img src="images/roles/tablet-worldclass.png" width="200px" /><p>Sport Poomsae Referee Tablet</p></a>
				<a class="btn btn-default" href="forms/worldclass/register.php?role=computer+operator" ><img src="images/roles/coordinator-worldclass.png" width="200px" /><p>Sport Poomsae Ring Computer</p></a>
				<a class="btn btn-default" href="forms/worldclass/divisions.php"                       ><img src="images/roles/laptop-manage.png" width="200px" /><p>Edit Sport Poomsae Divisions</p></a>
			</div>

			<div class="register" id="freestyle">
				<a class="btn btn-default" href="forms/freestyle/register.php?role=judge"              ><img src="images/roles/tablet-freestyle.png" width="200px" /><p>Freestyle Referee Tablet</p></a>
				<a class="btn btn-default" href="forms/freestyle/register.php?role=computer+operator"  ><img src="images/roles/coordinator-freestyle.png" width="200px" /><p>Freestyle Ring Computer</p></a>
				<a class="btn btn-default" href="forms/freestyle/divisions.php"                        ><img src="images/roles/laptop-manage.png" width="200px" /><p>Edit Freestyle Divisions</p></a>
			</div>

			<div class="register" id="grassroots">
				<a class="btn btn-default" href="forms/grassroots/register.php?role=judge"             ><img src="images/roles/tablet-grassroots.png" width="200px" /><p>Open Poomsae Referee Tablet</p></a>
				<a class="btn btn-default" href="forms/grassroots/register.php?role=computer+operator" ><img src="images/roles/coordinator-grassroots.png" width="200px" /><p>Open Poomsae Ring Computer</p></a>
				<a class="btn btn-default" href="forms/grassroots/divisions.php"                       ><img src="images/roles/laptop-manage.png" width="200px" /><p>Edit Open Poomsae Divisions</p></a>
			</div>

			<footer class="page-footer">
				<p class="text-muted">&copy; <?= $freescore[ 'copyright' ] ?> Mike Wong All Rights Reserved.</p>
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
				if( service != 'setup' ) { $( '#' + service ).hide(); }
			}
		},
		error:       function( response ) { 
			sound.error.play(); 
			alertify.error( "Cannot connect to " + service + " server" ); 
			if( service != 'setup' ) { $( '#' + service ).hide(); }
		},
	});
}

for (service in services) {
	var port = services[ service ];
	test_service( service, port );
}

/*
var ws = new WebSocket( 'ws://' + host + ':3085/setup/' + tournament.db );

ws.onopen = function() {
	var request = { data : { type : 'software', action : 'check updates' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
};

ws.onmessage = function( response ) {
	var update = JSON.parse( response.data );
	if( update.type == 'software' ) {
		if( update.available ) {
			sound.send.play();
			alertify.confirm({
				title:   "New version " + update.version + " is available.",
				message: "Current installed version is " + update.current + ". Click OK to download and install update version " + update.version + ".",
				callback: function( ok ) {
					if( ok ) {
						var request = { data : { type : 'software', action : 'update' }};
						request.json = JSON.stringify( request.data );
						ws.send( request.json );
						sound.confirmed.play();
					}
				}
			});
		}
	}
};
*/
		</script>
	</body>
</html>
