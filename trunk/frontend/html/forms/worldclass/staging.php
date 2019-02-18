<?php
	include "../../include/php/version.php";
	include "../../include/php/config.php";
?>
<html>
	<head>
		<title>Schedule</title>
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/css/forms/worldclass/coordinator.css" rel="stylesheet" />
		<link href="../../include/bootstrap/add-ons/bootstrap-select.min.css" rel="stylesheet" />
		<link href="../../include/bootstrap/add-ons/bootstrap-toggle.min.css" rel="stylesheet" />
		<link href="../../include/page-transitions/css/animations.css" rel="stylesheet" type="text/css" />
		<link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootstrap-select.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootstrap-toggle.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootstrap-sortable.min.js"></script>
		<script src="../../include/alertify/alertify.min.js"></script>
		<script src="../../include/js/freescore.js"></script>

		<meta name="viewport" content="width=device-width, initial-scale=1">
		<style type="text/css">
			@font-face {
			  font-family: Nimbus;
			  src: url("include/fonts/nimbus-sans-l_bold-condensed.ttf"); }
			@font-face {
			  font-family: Biolinum;
			  font-weight: bold;
			  src: url("include/fonts/LinBiolinum_Rah.ttf"); }
			@media print {
				.btn { display: none; }
				.page-header { display: none; }
			}
			.page-footer { text-align: center; }
			.btn-default.active {
				background-color: #77b300;
				border-color: #558000;
			}
			.pill {
				padding: 4px;
				border-radius: 4px;
			}
			.bootstrap-select { width: 120px !important; }
			label.disabled {
				pointer-events: none;
			}

			.btn-group .btn.active {
				color: white;
			}

			#schedule .row {
				width: 100%;
				margin-left: 0;
			}

			#schedule .ring {
				height: 1260px;
				border: 0px;
			}

			ul.list-group-sortable-connected, ol.list-group-sortable-connected {
				min-height: 40px;
			}

			.time .hour {
				position: absolute;
				right: 12px;
			}

			.droptarget {
				border: 2px dashed #333;
			}

			.schedule {
				height: 1200px;
				width: calc( 100% - 8px );
				margin-left: 8px;
			}

			.schedule .round {
				position: absolute;
				left: 0;
				width: calc( 100% - 12px );
				margin-left: 10px;
				text-align: center;
				border-radius: 4px;
				border: 1px solid #ccc;
				cursor: move;
			}

			a.active {
				background-color: #cce5ff !important;
				border-color: #b8daff !important;
				color: #004085 !important;
			}

			.coed   { background-color: #ffddc0; }
			.male   { background-color: #b0e9e9; }
			.female { background-color: #ffc0c0; }

			.coed.error      { background-color: #6b482b; }
			.male.error      { background-color: #1a4040; }
			.female.error    { background-color: #6b2b2b; }

			.coed.selected   { background-color: #af550b; }
			.male.selected   { background-color: #af0b0b; }
			.female.selected { background-color: #076969; }

		</style>
	</head>
	<body>
		<script>
			var handler  = { read: [], write: [] };
			var show     = {};
			var schedule = { days: 1, day: [] };
		</script>
		<div id="pt-main" class="pt-perspective">
			<?php include( "ovr/schedule.php" ); ?>
		</div>
		<script src="../../include/page-transitions/js/pagetransitions.js"></script>
		<script>

var sound = {
	send      : new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg"   ]}),
	confirmed : new Howl({ urls: [ "../../sounds/received.mp3", "../../sounds/received.ogg" ]}),
	next      : new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"     ]}),
	prev      : new Howl({ urls: [ "../../sounds/prev.mp3",     "../../sounds/prev.ogg"     ]}),
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
