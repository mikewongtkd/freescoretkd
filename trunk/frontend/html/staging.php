<?php
	include "./include/php/version.php";
	include "./include/php/config.php";
?>
<html>
	<head>
		<title>Staging</title>
		<link href="include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="include/bootstrap/add-ons/bootstrap-select.min.css" rel="stylesheet" />
		<link href="include/bootstrap/css/freescore-theme.min.css" rel="stylesheet" />
		<link href="include/page-transitions/css/animations.css" rel="stylesheet" type="text/css" />
		<link href="include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="include/css/fonts.css" rel="stylesheet" />
		<script src="include/jquery/js/jquery.js"></script>
		<script src="include/jquery/js/jquery.howler.min.js"></script>
		<script src="include/bootstrap/js/bootstrap.min.js"></script>
		<script src="include/bootstrap/add-ons/bootstrap-select.min.js"></script>
		<script src="include/alertify/alertify.min.js"></script>
		<script src="include/js/freescore.js"></script>

		<meta name="viewport" content="width=device-width, initial-scale=1">
		<style type="text/css">
body {
	margin: 12px;
}
		</style>
	</head>
	<body>
<script>
var refresh = {};
</script>
		<div id="pt-main" class="pt-perspective">
<?php include( 'staging/rings.php' ); ?>
		</div>
<script src="include/page-transitions/js/pagetransitions.js"></script>
<script>

var sound = {
	send      : new Howl({ urls: [ "./sounds/upload.mp3",   "./sounds/upload.ogg"   ]}),
	confirmed : new Howl({ urls: [ "./sounds/received.mp3", "./sounds/received.ogg" ]}),
	next      : new Howl({ urls: [ "./sounds/next.mp3",     "./sounds/next.ogg"     ]}),
};

var host       = '<?= $host ?>';
var tournament = <?= $tournament ?>;
var html       = FreeScore.html;

var page = {
	num : 1,
	transition: ( ev ) => { page.num = PageTransitions.nextPage({ animation: page.animation( page.num )}); },
	animation:  ( pn ) => {
		switch( pn ) {
			case 1: return 1;
			case 2: return 2;
		}
	}
};

// ===== SERVER COMMUNICATION
var server = {
	worldclass: new WebSocket( 'ws://' + host + ':3088/worldclass/' + tournament.db + '/staging' ),
	grassroots: new EventSource( 'http://' + host + '/cgi-bin/freescore/forms/grassroots/update?tournament=' + tournament.db ),
//	sparring:   new WebSocket( 'ws://' + host + ':3086/sparring/' + tournament.db + '/staging' ),
};

server.grassroots.addEventListener( 'message', ( update ) => {
	console.log( 'Grassroots', update );
}, false );

/* Sparring server doesn't handle reads yet
server.sparring.onopen = () => {
	var request;

	request = { data : { type : 'ring', action : 'read' }};
	request.json = JSON.stringify( request.data );
	server.worldclass.send( request.json );
};

server.sparring.onmessage = ( response ) => {
	var update = JSON.parse( response.data );
	console.log( 'Sparring', update );
};
*/

server.worldclass.onopen = () => {
	var request;

	request = { data : { type : 'ring', action : 'read' }};
	request.json = JSON.stringify( request.data );
	server.worldclass.send( request.json );
};

server.worldclass.onmessage = ( response ) => {
	var update = JSON.parse( response.data );
	console.log( 'Worldclass', update );
};

</script>
	</body>
</html>
