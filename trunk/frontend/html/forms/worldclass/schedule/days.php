<?php
	include "../../../include/php/version.php";
	include "../../../include/php/config.php";
?>
<html>
	<head>
		<title>Sport Poomsae Scheduling</title>
		<link href="../../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/css/forms/worldclass/coordinator.css" rel="stylesheet" />
		<link href="../../../include/css/forms/worldclass/schedule.css" rel="stylesheet" />
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

		<meta name="viewport" content="width=device-width, initial-scale=1">
		<style type="text/css">
		</style>
	</head>
	<body>
		<script>
			var handler   = { read: {}, write: {}, freestyle: { read: {}, update: {}}};
			var show      = {};
			var schedule  = { divisions: [], days: [{divisions: [], start: '9:00 AM' }]};
			var divisions = undefined;
			var settings  = { checksum: undefined };
		</script>
		<div id="pt-main" class="pt-perspective">
			<?php include( "days/settings.php" ); ?>
			<?php include( "days/times.php" ); ?>
		</div>
		<script src="../../../include/page-transitions/js/pagetransitions.js"></script>
		<script>

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

// ===== BUSINESS LOGIC
var sort = { alphabetically: ( x ) => { return Object.keys( x ).sort(); }, numerically: ( x ) => { return Object.keys( x ).sort(( a, b ) => { return parseInt( a ) - parseInt( b ); }); }};

// ===== SERVER COMMUNICATION
var wc = new WebSocket( 'ws://' + host + ':3088/worldclass/' + tournament.db + '/staging' );
var fs = new WebSocket( 'ws://' + host + ':3082/freestyle/' + tournament.db + '/staging' );

wc.onopen = function() {
	var request;

	request = { data : { type : 'schedule', action : 'read' }};
	request.json = JSON.stringify( request.data );
	wc.send( request.json );
};

wc.onmessage = function( response ) {
	var update = JSON.parse( response.data );
	console.log( 'WORLDCLASS', update );

	if( ! (update.action in handler)) { alertify.error( `No handler for <b>${update.action}</b>` ); return; }
	if( ! (update.type in handler[ update.action ])) { alertify.error( `No handler for <b>${update.action} ${update.type}</b>` ); return; }

	handler[ update.action ][ update.type ]( update );
};

fs.onopen = function() {
	var request;

	request = { data : { type : 'ring', action : 'read' }};
	request.json = JSON.stringify( request.data );
	fs.send( request.json );
};

fs.onmessage = function( response ) {
	var update = JSON.parse( response.data );
	console.log( 'FREESTYLE', update );

	if( ! (update.action in handler.freestyle)) { alertify.error( `No FreeStyle handler for <b>${update.action.capitalize()}</b>` ); return; }
	if( ! (update.type in handler.freestyle[ update.action ])) { alertify.error( `No FreeStyle handler for <b>${update.action.capitalize()} ${update.type.capitalize()}</b>` ); return; }

	handler.freestyle[ update.action ][ update.type ]( update );
}

		</script>
	</body>
</html>
