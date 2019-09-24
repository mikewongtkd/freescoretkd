<?php
	include "../../include/php/version.php";
	include "../../include/php/config.php";
?>
<html>
	<head>
		<title>Staging</title>
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/bootstrap/add-ons/bootstrap-select.min.css" rel="stylesheet" />
		<link href="../../include/css/freescore-light.css" rel="stylesheet" />
		<link href="../../include/page-transitions/css/animations.css" rel="stylesheet" type="text/css" />
		<link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<link href="staging/css/staging.css" rel="stylesheet" />
		<script src="../../include/later/js/later.min.js"></script>
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery-dateformat.min.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootstrap-select.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootstrap-list-filter.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootstrap-sortable.min.js"></script>
		<script src="../../include/alertify/alertify.min.js"></script>
		<script src="../../include/opt/moment/moment.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="staging/js/registration.js"></script>
		<script src="staging/js/announcer.js"></script>

		<meta name="viewport" content="width=device-width, initial-scale=1">
		<style type="text/css">
body {
	margin: 12px;
}
		</style>
	</head>
	<body>
<script>
</script>
		<div id="pt-main" class="pt-perspective">
<?php include( 'staging/checkin.php' ); ?>
		</div>
<script src="../../include/page-transitions/js/pagetransitions.js"></script>
<script>
alertify.set( 'notifier', 'position', 'top-right' );

var announcer = new Announcer();

var sound = {
	send      : new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg"   ]}),
	confirmed : new Howl({ urls: [ "../../sounds/received.mp3", "../../sounds/received.ogg" ]}),
	next      : new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"     ]}),
	previous  : new Howl({ urls: [ "../../sounds/prev.mp3",     "../../sounds/prev.ogg"     ]}),
};

// var host       = '<?= $host ?>';
var host       = 'localhost';
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

$(() => {
	announcer.message( 'Initializing Announcement System' );
	announcer.message( 'Now using Female American English voice' );
	announcer.message( 'Starting Automated Athlete Calling System' );
});

// ===== SERVER COMMUNICATION
var server = {
//	worldclass: new WebSocket( 'ws://' + host + ':3088/worldclass/' + tournament.db + '/staging' ),
	grassroots: new WebSocket( 'ws://' + host + ':3080/grassroots/' + tournament.db + '/staging' ),
//	sparring:   new WebSocket( 'ws://' + host + ':3086/sparring/' + tournament.db + '/staging' ),
};

server.grassroots.onopen = () => {
	var request;

	request = { data : { type : 'schedule', action : 'read' }};
	request.json = JSON.stringify( request.data );
	server.grassroots.send( request.json );
};

server.grassroots.onmessage = ( response ) => {
	if( ! response.data ) { return; }
	var update = JSON.parse( response.data );
	console.log( update );
	var type   = update.type;
	var action = update.action;
	if( type in handle ) {
		if( action in handle[ type ]) {
			handle[ type ][ action ]( update );
		}
	}
};

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

/*
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
 */
</script>
	</body>
</html>
