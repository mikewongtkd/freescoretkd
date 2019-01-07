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

			<form>
				<div class="panel panel-primary" id="fs-updates">
					<div class="panel-heading">
						<h1 class="panel-title">Check for Software Updates</h1>
					</div>
					<div class="panel-body">
						<button class="btn btn-warning" id="check-updates">Check for Software Updates</button>
						<button class="btn btn-success" id="install-updates">Install Updates</button>
					</div>
				</div>

				<div class="clearfix">
					<button type="button" id="cancel" class="btn btn-danger">Cancel</button> 
				</div>
			</form>
		</div>
		<script>

var sound = {
	send      : new Howl({ urls: [ "./sounds/upload.mp3",   "./sounds/upload.ogg"   ]}),
	confirmed : new Howl({ urls: [ "./sounds/received.mp3", "./sounds/received.ogg" ]}),
	next      : new Howl({ urls: [ "./sounds/next.mp3",     "./sounds/next.ogg"     ]}),
};

var host       = '<?= $host ?>';
var tournament = <?= $tournament ?>;

// ===== SET TOURNAMENT CONFIGURATION FORM
$( '#cancel' ).off( 'click' ).click(() => { 
	sound.next.play();
	setTimeout( function() { window.location = 'index.php' }, 500 ); 
});
$( '#accept' ).off( 'click' ).click(() => { 
});

// ===== SOFTWARE UPDATES
$( '#install-updates' ).off( 'click' ).click(() => {
	var request = { data : { type : 'software', action : 'update' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
	sound.confirmed.play();
});

// ===== SERVER COMMUNICATION
var ws = new WebSocket( 'ws://' + host + ':3085/setup/' + tournament.db );

ws.onopen = function() {
	var request;

	request = { data : { type : 'software', action : 'check updates' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
};

ws.onmessage = function( response ) {
	var update = JSON.parse( response.data );
	console.log( update );
	if( update.type == 'software' ) {
		if( update.available ) { $( '#fs-updates' ).fadeIn(); }
	}
};

		</script>
	</body>
</html>
