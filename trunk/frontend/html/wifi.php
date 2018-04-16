<?php
	include "./include/php/version.php";
	include "./include/php/config.php";
?>
<html>
	<head>
		<title>FreeScore Setup</title>
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
			#wifi-pass {
				font-family: monospace;
			}
			label.disabled {
				pointer-events: none;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<div class="page-header">
				<h1>Network Setup</h1>
			</div>

			<form>
				<div class="panel panel-primary" id="fs-wifi">
					<div class="panel-heading">
						<h1 class="panel-title">FreeScore WiFi Server Configuration [Loading... ]</h1>
					</div>
					<div class="panel-body">
						<div class="form-group row">
							<label for="wifi-ssid" class="col-xs-2 col-form-label">FreeScore Wifi Name</label>
							<div class="col-xs-10">
								<select class="selectpicker" id="wifi-ssid" disabled>
								  <optgroup label="Default">
									<option value="freescore">freescore</option>
								  </optgroup>
								  <optgroup label="Zones">
									<option value="freescore-zone-a">freescore-zone-a</option>
									<option value="freescore-zone-b">freescore-zone-b</option>
									<option value="freescore-zone-c">freescore-zone-c</option>
									<option value="freescore-zone-d">freescore-zone-d</option>
									<option value="freescore-zone-e">freescore-zone-e</option>
									<option value="freescore-zone-f">freescore-zone-f</option>
								  </optgroup>
								</select>
							</div>
						</div>
						<div class="form-group row">
							<label for="wifi-pass" class="col-xs-2 col-form-label">FreeScore Wifi Password</label>
							<div class="col-xs-10">
								<button type="button" id="random-pass" class="btn btn-primary pull-right disabled">Generate Random Password</button>
								<input class="form-control" type="text" name="wifi-pass" id="wifi-pass" style="width:60%;" disabled>
							</div>
						</div>

						<div class="form-group row">
							<label for="wifi-channel" class="col-xs-2 col-form-label">Wifi Channel</label>
							<div class="col-xs-10">
								<div class="btn-group" data-toggle="buttons" id="wifi-channel">
									<label class="btn btn-default disabled"><input type="radio" name="wifi-channel" value="1" >1</label>
									<label class="btn btn-default disabled"><input type="radio" name="wifi-channel" value="2" >2</label>
									<label class="btn btn-default disabled"><input type="radio" name="wifi-channel" value="3" >3</label>
									<label class="btn btn-default disabled"><input type="radio" name="wifi-channel" value="4" >4</label>
									<label class="btn btn-default disabled"><input type="radio" name="wifi-channel" value="5" >5</label>
									<label class="btn btn-default disabled"><input type="radio" name="wifi-channel" value="6" >6</label>
									<label class="btn btn-default disabled"><input type="radio" name="wifi-channel" value="7" >7</label>
									<label class="btn btn-default disabled"><input type="radio" name="wifi-channel" value="8" >8</label>
									<label class="btn btn-default disabled"><input type="radio" name="wifi-channel" value="9" >9</label>
									<label class="btn btn-default disabled"><input type="radio" name="wifi-channel" value="10">10</label>
									<label class="btn btn-default disabled"><input type="radio" name="wifi-channel" value="11">11</label>
								</div>
								<div>
									<p style="margin-top: 10px;"><span class="bg-danger text-white pill">Red</span> High noise; <span class="bg-warning text-white pill">Orange</span> Medium noise; <span class="bg-success text-white pill">Green</span> Low noise; <span class="bg-primary text-white pill">Blue</span> Current channel</p>
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

$( '#cancel' ).off( 'click' ).click(() => { 
	sound.next.play();
	setTimeout( function() { window.location = 'index.php' }, 500 ); 
});
$( '#accept' ).off( 'click' ).click(() => { 
	// Identify desired ring configuration
	var rings    = $( 'label.active input[name=ring]' ).map(( i, el ) => { return parseInt($( el ).val()); }).toArray();
	var name     = $( '#tournament-name' ).val();
	var wifi     = { pass : $( '#wifi-pass' ).val(), ssid : $( '#wifi-ssid' ).val(), channel: $( '#wifi-channel input[name=wifi-channel]:checked' ).val() };
	var request  = { data : { type : 'setup', action : 'write', edits : { wifi : wifi }}};
	request.json = JSON.stringify( request.data );
	console.log( request.json ); 
	ws.send( request.json );
});
$( '#random-pass' ).off( 'click' ).click(() => {
	var password = '';
	for( i = 0; i < 8; i++ ) {
		var j = Math.floor( Math.random() * 62 );
		var c = '';
		if( j < 10 ) { c = String.fromCharCode( j + 48 ); } else
		if( j < 36 ) { c = String.fromCharCode( j + 55 ); } else
		             { c = String.fromCharCode( j + 61 ); }
		password = password + c;
	}
	$( '#wifi-pass' ).val( password );
});

// ------------------------------------------------------------
function set_wifi_form( wifi ) {
// ------------------------------------------------------------
	$( '#ssid' ).val( wifi.config.ssid );
	$( '#wifi-pass' ).val( wifi.config.wpa_passphrase );
	$( '#fs-wifi .panel-title' ).html( "FreeScore WiFi Server Configuration" );

	// ===== ENABLE ELEMENTS
	$( '.selectpicker' ).removeAttr( 'disabled' );
	$( '.selectpicker' ).selectpicker( 'refresh' );
	$( '#wifi-pass' ).removeAttr( 'disabled' );
	$( '#random-pass' ).removeClass( 'disabled' );
	$( '#wifi-channel label' ).removeClass( 'disabled' );

	if( wifi.config.ssid ) {
		$( '#wifi-ssid' ).val( wifi.config.ssid );
		$( '.selectpicker' ).selectpicker( 'refresh' );
	}

	if( wifi.channels ) {
		$( '#wifi-channel label input' ).each( (i, el) => { 
			var channel = $( el ).attr( 'value' );
			var matches = wifi.channels.filter(( c ) => { return c.id == channel; });
			var max     = matches.reduce(( max, cur ) => Math.max( max, cur.quality ), 0 );
			if( channel == wifi.config.channel ) { return; }
			var label = $( el ).parent();
			if( max >= 0.66 ) { label.addClass( 'btn-danger' ); } else
			if( max >= 0.33 ) { label.addClass( 'btn-warning' ); } else
			                  { label.addClass( 'btn-success' ); }
		});
	}
	$( '#wifi-channel label input[value=' + wifi.config.channel + ']' ).parent().addClass( 'active btn-success' );
}

// ===== SERVER COMMUNICATION
var ws = new WebSocket( 'ws://' + host + ':3085/setup/' + tournament.db );

ws.onopen = function() {
	var request;

	request = { data : { type : 'setup', action : 'read' }};
	request.json = JSON.stringify( request.data );
	ws.send( request.json );
};

ws.onmessage = function( response ) {
	var update = JSON.parse( response.data );
	console.log( update );
	if( update.type == 'software' ) {
		if( update.available ) { $( '#fs-updates' ).fadeIn(); }
	} else if( update.type == 'setup' ) {
		var wifi = update.setup.wifi;
		if( wifi.config ) { 
			set_wifi_form( wifi );
		} else {
			$( '#fs-wifi .panel-title' ).html( "FreeScore WiFi Server Configuration [Error: Configuration File Not Found]" );
		}
		if( defined( update.request ) && update.request.action == 'write' ) {
			alertify.success( 'Configuration Saved.' );
			alertify.notify( 'Reboot system if freescore wifi fails to restart.' );
			sound.send.play();
			setTimeout( function() { window.location = 'index.php' }, 5000 );
		}
	}
};

		</script>
	</body>
</html>
