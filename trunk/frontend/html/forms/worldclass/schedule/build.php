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
		<link href="../../../include/page-transitions/css/animations.css" rel="stylesheet" type="text/css" />
		<link href="../../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../../include/jquery/js/jquery-dateformat.min.js"></script>
		<script src="../../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-list-filter.min.js"></script>
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
			var handler  = { read: {}, write: {}, build: {}, check: {} };
			var show     = {};
			var schedule = { days: 1, day: [] };
		</script>
		<div id="pt-main" class="pt-perspective">
			<?php include( "rings.php" ); ?>
		</div>
		<script src="../../../include/page-transitions/js/pagetransitions.js"></script>
		<script>

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
var wait       = { build: undefined, check: undefined };

// ===== BUSINESS LOGIC
var sort = { alphabetically: ( x ) => { return Object.keys( x ).sort(); }, numerically: ( x ) => { return Object.keys( x ).sort(( a, b ) => { return parseInt( a ) - parseInt( b ); }); }};

// ===== DIALOG
alertify.waitDialog || alertify.dialog( 'waitDialog', function() {
	return {
		main: function( content ) {
			this.setHeader( content );
			this.setContent( '<div style="text-align: center;"><span class="fa fa-spinner fa-spin" style="font-size: 48pt; color: #ccc;"></span></div>' );
		},
		setup: function() {
			return {
				options: {
					closable: false,
					maximizable: false,
					movable: false,
					resizable: false
				}
			}
		}
	}
});

// ===== SERVER COMMUNICATION
var ws = new WebSocket( 'ws://' + host + ':3088/worldclass/' + tournament.db + '/staging' );

ws.onopen = function() {
	var request;

	wait.check = alertify.waitDialog( 'Checking Schedule for Correctness' );
	request = { data : { type : 'schedule', action : 'check' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
};

ws.onmessage = function( response ) {
	var update = JSON.parse( response.data );
	console.log( update );
	if( update.action in handler ) {
		var pages = Object.keys( handler[ update.action ]);
		pages.forEach(( page ) => {
			handler[ update.action ][ page ]( update );
		});
	}
};

		</script>
	</body>
</html>
