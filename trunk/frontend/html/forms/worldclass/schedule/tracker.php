<?php
	include "../../../include/php/version.php";
	include "../../../include/php/config.php";
?>
<html>
	<head>
		<title>Sport Poomsae Division Tracker</title>
		<link href="../../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/css/freescore-dark.css" rel="stylesheet" />
		<link href="../../../include/css/forms/worldclass/tracker.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/add-ons/bootstrap-select.min.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/add-ons/bootstrap-toggle.min.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/add-ons/bootstrap-datepicker/css/bootstrap-datepicker.min.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/add-ons/bootstrap-timepicker.min.css" rel="stylesheet" />
		<link href="../../../include/page-transitions/css/animations.css" rel="stylesheet" type="text/css" />
		<link href="../../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/js/jquery.howler.min.js"></script>
 		<script src="../../../include/jquery/js/screenfull.min.js"></script>
		<script src="../../../include/jquery/js/jquery-dateformat.min.js"></script>
		<script src="../../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-list-filter.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-datepicker/js/bootstrap-datepicker.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-timepicker.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-select.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-toggle.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-sortable.min.js"></script>
		<script src="../../../include/alertify/alertify.min.js"></script>
		<script src="../../../include/js/freescore.js"></script>
		<script src="../../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../../include/js/forms/worldclass/division.class.js"></script>

		<meta name="viewport" content="width=device-width, initial-scale=1">
		<style type="text/css">

		</style>
	</head>
	<body>
		<script>
			var handler   = { read: {}, write: {} };
			var show      = {};
			var template  = {};
			var schedule  = { days: [{divisions: [], start: '9:00 AM' }]};
			var divisions = {};
			var settings  = { zoom: 1.0 };
		</script>
		<div id="pt-main" class="pt-perspective">
			<?php include( "tracker/list.php" ); ?>
		</div>
		<footer>
<div id="date"></div>
<div id="clock"></div>
		</footer>
		<script src="../../../include/page-transitions/js/pagetransitions.js"></script>
		<script>

// ===== DATE
$(() => {
	let date = { ui : $( '#date' )};
	let d    = new Date();
	date.ui.html( $.format.date( d, 'ddd, MMM d, yyyy' ));
});

// ===== CLOCK
var clock = { ui: $( '#clock' )};
clock.tick = setInterval(() => {
	let d = new Date();
	let h = d.getHours();
	let m = d.getMinutes();
	let a = h >= 12 ? 'pm' : 'am';

	h = h > 12 ? h - 12 : h;
	m = m < 10 ? `0${m}` : m;
	let time = `${h}<span class="colon">:</span>${m} <span class="ampm">${a}</span>`;
	clock.ui.html( time )
	if( clock.blink ) {
		$( '#clock .colon' ).animate({ 'opacity' : 0 }, 200);
		clock.blink = false;
	} else {
		$( '#clock .colon' ).animate({ 'opacity' : 1 }, 200);
		clock.blink = true;
	}
	
}, 1000 );

// ===== ZOOM
$( 'body' ).keydown(( ev ) => {
	var zoom = ( scale ) => { $( 'body' ).css({ 'transform' : `scale( ${settings.zoom} )`, 'transform-origin' : '0 0' }); alertify.message( `Zoom: ${Math.round( scale * 100 )}%` ); };
	switch( ev.key ) {
		case '+':
		case '=': settings.zoom += 0.05; zoom( settings.zoom ); break;
		case '-': settings.zoom -= 0.05; zoom( settings.zoom ); break;
	}
});

alertify.defaults.transition   = 'slide';
alertify.defaults.theme.ok     = "btn btn-success";
alertify.defaults.theme.cancel = "btn btn-danger";
alertify.defaults.theme.input  = "form-control";

var sound = {
	send      : new Howl({ urls: [ "../../../sounds/upload.mp3",   "../../../sounds/upload.ogg"   ]}),
	confirmed : new Howl({ urls: [ "../../../sounds/received.mp3", "../../../sounds/received.ogg" ]}),
	next      : new Howl({ urls: [ "../../../sounds/next.mp3",     "../../../sounds/next.ogg"     ]}),
	prev      : new Howl({ urls: [ "../../../sounds/prev.mp3",     "../../../sounds/prev.ogg"     ]}),
};

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

var html       = FreeScore.html;
var host       = '<?= $host ?>';
var tournament = <?= $tournament ?>;

// ===== SERVER COMMUNICATION
var ws = new WebSocket( 'ws://' + host + ':3088/worldclass/' + tournament.db + '/staging' );

ws.onopen = function() {
	var request;

	request = { data : { type : 'schedule', action : 'read' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
};

ws.onmessage = function( response ) {
	var update = JSON.parse( response.data );
	console.log( update );

	if( ! (update.action in handler)) { alertify.error( `No handler for <b>${update.action.capitalize()}</b>` ); return; }
	if( ! (update.type in handler[ update.action ])) { alertify.error( `No handler for <b>${update.action.capitalize()} ${update.type.capitalize()}</b>` ); return; }

	handler[ update.action ][ update.type ]( update );
};

		</script>
	</body>
</html>
