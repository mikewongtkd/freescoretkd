<?php
	include "./include/php/version.php";
	include "./include/php/config.php";
?>
<html>
	<head>
		<title>Tournament Setup</title>
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
				<h1>Tournament Setup</h1>
			</div>

			<form>
				<div class="panel panel-primary" id="fs-updates" style="display: none;">
					<div class="panel-heading">
						<h1 class="panel-title">Software Updates are Available</h1>
					</div>
					<div class="panel-body">
						<p>New software updates are available; click the Install Updates button to download and install the updates.</p>
						<button class="btn btn-block btn-success" id="install-updates">Install Updates</button>
					</div>
				</div>

				<div class="panel panel-primary" id="fs-rings">
					<div class="panel-heading">
						<h1 class="panel-title">Tournament Configuration</h1>
					</div>
					<div class="panel-body">
						<div class="form-group row">
							<label for="tournament-name" class="col-xs-2 col-form-label">Tournament Name</label>
							<div class="col-xs-10">
								<input class="form-control" type="text" name="tournament-name" id="tournament-name" style="width:80%;">
							</div>
						</div>
						<div class="form-group row">
							<label for="rings" class="col-xs-2 col-form-label">Rings</label>
							<div class="col-xs-10">
								<div class="btn-group" data-toggle="buttons" id="rings">
									<label class="btn btn-default"><input type="checkbox" name="ring" value="01">1</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="02">2</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="03">3</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="04">4</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="05">5</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="06">6</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="07">7</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="08">8</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="09">9</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="10">10</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="11">11</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="12">12</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="13">13</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="14">14</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="15">15</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="16">16</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="17">17</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="18">18</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="19">19</label>
									<label class="btn btn-default"><input type="checkbox" name="ring" value="20">20</label>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="clearfix">
					<button type="button" id="accept" class="btn btn-success pull-right">Accept</button> 
					<button type="button" id="cancel" class="btn btn-danger  pull-right" style="margin-right: 40px;">Cancel</button> 
				</div>
			</form>
		</div>
		<script>

var sound = {
	send      : new Howl({ urls: [ "./sounds/upload.mp3",   "./sounds/upload.ogg"   ]}),
	confirmed : new Howl({ urls: [ "./sounds/received.mp3", "./sounds/received.ogg" ]}),
	next      : new Howl({ urls: [ "./sounds/next.mp3",     "./sounds/next.ogg"     ]}),
};

$( '.list-group a' ).click( function( ev ) { 
	ev.preventDefault(); 
	sound.next.play(); 
	var href = $( this ).attr( 'href' );
	setTimeout( function() { window.location = href }, 300 );
});

var host       = '<?= $host ?>';
var tournament = <?= $tournament ?>;

// ===== SET TOURNAMENT CONFIGURATION FORM
$( '#tournament-name' ).val( tournament.name );
$( '#rings label' ).removeClass( 'active' );
$.each( tournament.rings, (i, r) => {
	$( '#rings label' ).each(( j, b ) => { 
		if( r == (j + 1)) { 
			$( b ).addClass( 'active' ); 
			$( b ).find( "input[type=checkbox]" ).attr( { checked: 'checked' }); 
		} 
	});
});
$( '#cancel' ).off( 'click' ).click(() => { 
	sound.next.play();
	setTimeout( function() { window.location = 'index.php' }, 500 ); 
});
$( '#accept' ).off( 'click' ).click(() => { 
	// Identify desired ring configuration
	var rings    = $( 'label.active input[name=ring]' ).map(( i, el ) => { return parseInt($( el ).val()); }).toArray();
	var name     = $( '#tournament-name' ).val();
	var request  = { data : { type : 'setup', action : 'write', edits : { rings : rings, name : name }}};
	request.json = JSON.stringify( request.data );
	console.log( request.json ); 
	ws.send( request.json );
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

	request = { data : { type : 'setup', action : 'read' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );

	request = { data : { type : 'software', action : 'check updates' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
};

ws.onmessage = function( response ) {
	var update = JSON.parse( response.data );
	console.log( update );
	if( update.type == 'software' ) {
		if( update.available ) { $( '#fs-updates' ).fadeIn(); }
	} else if( update.type == 'setup' ) {
		if( defined( update.request ) && update.request.action == 'write' ) {
			alertify.success( 'Configuration Saved.' );
			sound.send.play();
			setTimeout( function() { window.location = 'index.php' }, 5000 );
		}
	}
};

		</script>
	</body>
</html>
