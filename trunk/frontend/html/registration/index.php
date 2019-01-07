<?php
	include "../include/php/version.php";
	include "../include/php/config.php";
?>
<html>
	<head>
		<title>Upload USAT Registration</title>
		<link href="../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../include/css/registration.css" rel="stylesheet" />
		<link href="../include/bootstrap/add-ons/bootstrap-select.min.css" rel="stylesheet" />
		<link href="../include/bootstrap/add-ons/bootstrap-toggle.min.css" rel="stylesheet" />
		<link href="../include/page-transitions/css/animations.css" rel="stylesheet" type="text/css" />
		<link href="../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="../include/jquery/js/jquery.js"></script>
		<script src="../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../include/bootstrap/add-ons/bootstrap-select.min.js"></script>
		<script src="../include/bootstrap/add-ons/bootstrap-toggle.min.js"></script>
		<script src="../include/alertify/alertify.min.js"></script>
		<script src="../include/js/freescore.js"></script>

		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body>
		<div id="pt-main" class="pt-perspective">
			<div class="pt-page pt-page-1">
<?php include "settings.php" ?>
			</div>
			<div class="pt-page pt-page-2">
<?php include "upload.php" ?>
			</div>
			<div class="pt-page pt-page-3">
<?php include "import.php" ?>
			</div>
		</div>
		<script src="../include/page-transitions/js/pagetransitions.js"></script>
		<script>

var host       = '<?= $host ?>';
var tournament = <?= $tournament ?>;
var html       = FreeScore.html;
var divisions  = undefined;

var sound = {
	send      : new Howl({ urls: [ "../sounds/upload.mp3",   "../sounds/upload.ogg"   ]}),
	confirmed : new Howl({ urls: [ "../sounds/received.mp3", "../sounds/received.ogg" ]}),
	error     : new Howl({ urls: [ "../sounds/warning.mp3",  "../sounds/warning.ogg"  ]}),
	next      : new Howl({ urls: [ "../sounds/next.mp3",     "../sounds/next.ogg"     ]}),
	prev      : new Howl({ urls: [ "../sounds/prev.mp3",     "../sounds/prev.ogg"     ]}),
};

var page = {
	num : 1,
	transition: ( to ) => { PageTransitions.nextPage({ animation: page.animation( page.num, to ), showPage: (to - 1) }); page.num = to; },
	animation:  ( from, to ) => {
		if     ( from > to ) { return 2; }
		else if( from < to ) { return 1; }
	}
};

var ws = {
	worldclass : new WebSocket( 'ws://' + host + ':3088/worldclass/' + tournament.db + '/staging' ),
	sparring   : new WebSocket( 'ws://' + host + ':3086/sparring/' + tournament.db + '/staging' ),
	// grassroots : new WebSocket( 'ws://' + host + ':3080/grassroots/' + tournament.db + '/staging' ),
};

ws.worldclass.onopen = () => {
	var request;
	request = { data : { type : 'registration', action : 'read' }};
	request.json = JSON.stringify( request.data );
	ws.worldclass.send( request.json );
};

ws.worldclass.onmessage = ( response ) => {
	var update = JSON.parse( response.data );
	if( ! defined( update )) { return; }
	console.log( update );

	if( update.request.action == 'read' ) {
		if( update.male   ) { dropzone.disable( 'male'   ); } else { dropzone.enable( 'male'   ); }
		if( update.female ) { dropzone.disable( 'female' ); } else { dropzone.enable( 'female' ); }
	
	} else if( update.request.action == 'upload' ) {
		if( update.male   ) { dropzone.disable( 'male'   ); } else { dropzone.enable( 'male'   ); }
		if( update.female ) { dropzone.disable( 'female' ); } else { dropzone.enable( 'female' ); }
		$( '#upload,#remove' ).removeClass( 'disabled' );
		display_sport_poomsae_divisions( update.divisions );

	} else if( update.request.action == 'import' ) {
		if( update.result == 'success' ) {
			imported.poomsae = true;
			if( imported.poomsae && imported.sparring ) {
				var request;
				request = { data : { type : 'registration', action : 'clear' }};
				request.json = JSON.stringify( request.data );
				ws.worldclass.send( request.json );
			}
		} else {
			alertify.error( 'Import failed for World Class Poomsae' );
			sound.warning.play();
		}
	} else if( update.request.action == 'clear' ) {
		if( update.result == 'success' ) {
			sound.send.play();
			setTimeout(() => { window.location = 'index.php'; }, 750 );
		} else {
			alertify.error( 'Import failed for World Class Poomsae' );
			sound.warning.play();
		}
	}
};

ws.sparring.onopen = () => {
	var request;
	request = { data : { type : 'registration', action : 'read' }};
	request.json = JSON.stringify( request.data );
	ws.sparring.send( request.json );
};

ws.sparring.onmessage = ( response ) => { 
	var update = JSON.parse( response.data );
	if( ! defined( update )) { return; }
	console.log( update );

	if( update.request.action == 'upload' ) {
		display_sparring_divisions( update.divisions );

	} else if( update.request.action == 'import' ) {
		if( update.result == 'success' ) {
			imported.sparring = true;
			if( imported.poomsae && imported.sparring ) {
				var request;
				request = { data : { type : 'registration', action : 'clear' }};
				request.json = JSON.stringify( request.data );
				ws.worldclass.send( request.json );
			}
		} else {
			alertify.error( 'Import failed for Olympic Sparring' );
			sound.warning.play();
		}
	}
};
		</script>
	</body>
</html>
