<?php
	include "./include/php/version.php";
	include "./include/php/config.php";
?>
<html>
	<head>
		<title>Checking for FreeScore Software Updates</title>
		<link href="./include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="./include/bootstrap/add-ons/bootstrap-select.min.css" rel="stylesheet" />
		<link href="./include/bootstrap/css/freescore-theme.min.css" rel="stylesheet" />
		<link href="./include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="./include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<script src="./include/jquery/js/jquery.js"></script>
		<script src="./include/jquery/js/jquery.howler.min.js"></script>
		<script src="./include/bootstrap/js/bootstrap.min.js"></script>
		<script src="./include/bootstrap/add-ons/bootstrap-select.min.js"></script>
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
			.page-footer { text-align: center; }
			.btn-default.active {
				background-color: #77b300;
				border-color: #558000;
			}
			.pill {
				padding: 4px;
				border-radius: 4px;
			}
			label.disabled {
				pointer-events: none;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<div class="page-header">
				<h1>FreeScore Software Updates</h1>
			</div>

			<div class="panel panel-primary" id="fs-updates">
				<div class="panel-heading">
					<h1 class="panel-title">Software Updates</h1>
				</div>
				<div class="panel-body">
					<div style="float: left;"><img src="images/help/rpi-eth0.png" style="width: 200px; border-radius: 8px; margin-right: 40px;"></div>
					<div style="float: left;">
						<p>To check for updates, the Raspberry Pi must be connected to the Internet.</p>
						<ul>
							<li>Please connect an internet-enabled ethernet cable to the Raspberry Pi as shown.</li>
							<li>Wait 10-15 seconds for the network to connect.</li>
							<li>Click on <i>Check for Updates</i> button below.</li>
						</ul>
						<button class="btn btn-warning disabled" id="updates">Check for Updates</button>
					</div>
				</div>
			</div>

			<div class="clearfix">
				<button type="button" id="cancel" class="btn btn-danger">Cancel</button> 
			</div>
		</div>
		<script>

var sound = {
	send      : new Howl({ urls: [ "./sounds/upload.mp3",   "./sounds/upload.ogg"   ]}),
	confirmed : new Howl({ urls: [ "./sounds/received.mp3", "./sounds/received.ogg" ]}),
	next      : new Howl({ urls: [ "./sounds/next.mp3",     "./sounds/next.ogg"     ]}),
};

var host       = '<?= $host ?>';
var tournament = <?= $tournament ?>;
var mode       = 'connect';
var attempts   = 0;

// ===== SET TOURNAMENT CONFIGURATION FORM
$( '#cancel' ).off( 'click' ).click(() => { 
	sound.next.play();
	// setTimeout( function() { window.location = 'index.php' }, 500 ); 
});
$( '#accept' ).off( 'click' ).click(() => { 
});

// ===== SOFTWARE UPDATES
$( '#updates' ).off( 'click' ).click(() => {
	var request;

	if(        mode == 'connected' ) {
		console.log( 'Checking for updates' );
		request = { data : { type : 'software', action : 'check updates' }};
		request.json = JSON.stringify( request.data );
		ws.send( request.json );
		sound.confirmed.play();

	} else if( mode == 'updates-found' ) {
		console.log( 'Installing updates' );
		request = { data : { type : 'software', action : 'update' }};
		request.json = JSON.stringify( request.data );
		ws.send( request.json );
		sound.confirmed.play();
	}
});

// ===== SERVER COMMUNICATION
var ws = new WebSocket( 'ws://' + host + ':3085/setup/' + tournament.db );

ws.onopen = function() {

	var request = { data : { type : 'software', action : 'connect to repo' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
};

ws.onmessage = function( response ) {
	var update = JSON.parse( response.data );
	console.log( update );
	if( update.type == 'software' ) {
		if( update.action == 'connect_to_repo' ) {
			if( update.connected ) {
				alertify.success( "Network detected!<br>Click on <i>Check for Updates</i> button to check for updates." );
				$( '#updates' ).removeClass( 'disabled' );
				mode = 'connected';
			} else {
				if( attempts < 5 ) {
					attempts++;
					alertify.error( "No network detected; please plug in the ethernet cable" );
					setTimeout( () => {
						var request = { data : { type : 'software', action : 'connect_to_repo' }};
						request.json = JSON.stringify( request.data );
						ws.send( request.json );
					}, 10000 );

				} else {
					alertify.error( "Can't connect to software server. Ethernet cable not connected to internet." );
				}
			}
		} else if( update.action == 'updates' ) {
		}
	}
};

		</script>
	</body>
</html>
