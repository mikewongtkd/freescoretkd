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
			#instructions {
				height: 300px;
				overflow-x: auto;
			}
			#instructions a {
				width: 360px;
			}
			#instructions .version {
				display: inline-block;
				width: 80px;
			}
			#instructions .date {
				display: inline-block;
				width: 200px;
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
					<div>
						<div class="row">
							<div class="col-lg-3"><img id="instructions-image" src="images/help/rpi-eth0.png" style="width: 200px;"></div>
							<div class="col-lg-9" id="instructions">
								<p>To check for updates, the Raspberry Pi must be connected to the Internet.</p>
								<ul>
									<li>Please connect an internet-enabled ethernet cable to the Raspberry Pi as shown.</li>
									<li>Wait 10-15 seconds for the network to connect.</li>
								</ul>
							</div>
						</div>
					</div>
					<button type="button" id="cancel" class="btn btn-danger pull-right">Cancel</button> 
					<button class="btn btn-success disabled pull-right" id="updates" style="margin-right: 20px;">Install Updates</button>
				</div>
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
var message    = { 'checking' : undefined };
var selected   = { 'revision' : undefined };

// ===== SET TOURNAMENT CONFIGURATION FORM
$( '#cancel' ).off( 'click' ).click(() => { 
	sound.next.play();
	setTimeout( function() { window.location = 'index.php' }, 500 ); 
});

// ===== SOFTWARE UPDATES
$( '#updates' ).off( 'click' ).click(( ev ) => {
	var target = $( ev.target );
	if( target.hasClass( 'disabled' )) { return; }
	var request;
	alertify.message( 'Installing update' );
	sound.confirmed.play();
	request = { data : { type : 'software', action : 'update', 'hash' : selected.revision.hash, 'datetime': selected.revision.datetime }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
});

// ===== SERVER COMMUNICATION
var ws = new WebSocket( 'ws://' + host + ':3085/setup/' + tournament.db );

ws.onopen = function() {
	$( '#instructions' ).append( "<p>Detecting network.</p>" );

	var request = { data : { type : 'software', action : 'connect to repo' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
};

ws.onerror = function() {
	alertify.error( "FreeScore Setup system failed to start" );
};

ws.onmessage = function( response ) {
	var update = JSON.parse( response.data );
	console.log( update );
	if( update.type == 'software' ) {
		if( update.action == 'connect_to_repo' ) {
			if( update.connected ) {
				$( '#instructions' ).append( "<p>Network detected!</p>" );

				setTimeout( () => {
					$( '#instructions' ).append( "<p>Checking for updates.</p>" );
					var request = { data : { type : 'software', action : 'check updates' }};
					request.json = JSON.stringify( request.data );
					ws.send( request.json );
				}, 500 );

			} else {
				if( attempts < 5 ) {
					attempts++;
					alertify.error( "No network detected; please plug in the ethernet cable." + (attempts > 1 ? '<br>' + attempts + ' out of 5 attempts.' : ''));
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
			if( defined( message.checking )) { message.checking.dismiss(); }
			if( update.available ) {
				selected.revision = update.version;
				$( '#instructions' ).html( "<h3>Updates Available</h3><p>Version dated " + selected.revision.datetime + " available to install</p>" );
				$( '#updates' ).html( 'Install Updates' ).removeClass( 'disabled btn-primary' ).addClass( 'btn-success' );
			} else {
				$( '#instructions' ).html( "<h3>No Updates Available</h3>" )
				$( '#instructions' ).append( "<p>You can install older versions of FreeScore by clicking on the <i>Install previous version</i> button.</p>" );
				$( '#instructions' ).append( '<ul class="list-group">' );
				update.revisions.forEach(( revision ) => {
					if( revision.hash == update.current.hash ) { return; }
					$( '#instructions' ).append( '<a class="list-group-item list-group-item-primary" data-version="' + revision.tag + '.' + revision.patch + '" data-datetime="' + revision.datetime + '" data-hash="' + revision.hash + '"><div class="version">' + revision.tag + '.' + revision.patch + '</div> <div class="date">' + revision.datetime + '</div></a>' );
				});
				$( '#instructions' ).append( '</ul>' );
				$( '#instructions a' ).off( 'click' ).click(( ev ) => {
					var target   = $( ev.target ); if( ! target.hasClass( 'list-group-item' )) { target = target.parent(); }
					var hash     = target.attr( 'data-hash' );
					var datetime = target.attr( 'data-datetime' );
					var version  = target.attr( 'data-version' );
					target.siblings().removeClass( 'active' );
					target.addClass( 'active' );
					selected.revision = { hash: hash, datetime: datetime, version: version };
					console.log( 'Selecting ' + target.text() + ', (' + selected.revision.hash + ')' );
					$( '#updates' ).html( 'Install ' + version ).removeClass( 'disabled' );
				});
				$( '#updates' ).html( 'Install previous version' ).addClass( 'btn-primary' ).removeClass( 'btn-success' );
			}
		} else if( update.action == 'update' ) {
			alertify.success( 'Version dated ' + update.datetime + ' installed!' );
			sound.next.play();
			setTimeout( function() { window.location = 'index.php' }, 750 ); 
		}
	}
};

		</script>
	</body>
</html>
