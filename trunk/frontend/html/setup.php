<?php
	include "./include/php/version.php";
	include "./include/php/config.php";

	var_dump( $_POST );
?>
<html>
	<head>
		<title>FreeScore Setup</title>
		<link href="./include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="./include/bootstrap/css/freescore-theme.min.css" rel="stylesheet" />
		<link href="./include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="./include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<script src="./include/jquery/js/jquery.js"></script>
		<script src="./include/jquery/js/jquery.howler.min.js"></script>
		<script src="./include/bootstrap/js/bootstrap.min.js"></script>
		<script src="./include/alertify/alertify.min.js"></script>

		<meta name="viewport" content="width=device-width, initial-scale=1">
		<style type="text/css">
			@font-face {
			  font-family: Nimbus;
			  src: url("/freescore/include/fonts/nimbus-sans-l_bold-condensed.ttf"); }
			@font-face {
			  font-family: Biolinum;
			  font-weight: bold;
			  src: url("/freescore/include/fonts/LinBiolinum_Rah.ttf"); }
			.page-footer { text-align: center; }
			.btn-default.active {
				background-color: #77b300;
				border-color: #558000;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<div class="page-header">
				<h1>FreeScore Setup</h1>
			</div>

			<form method="post">
				<div class="panel panel-primary">
					<div class="panel-heading">
						<h1 class="panel-title">Tournament Rings</h1>
					</div>
					<div class="panel-body">
						<div class="form-group row">
							<label for="rings" class="col-xs-2 col-form-label">Rings</label>
							<div class="col-xs-10">
								<div class="btn-group" data-toggle="buttons" id="rings">
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="01">1</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="02">2</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="03">3</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="04">4</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="05">5</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="06">6</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="07">7</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="08">8</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="09">9</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="10">10</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="11">11</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="12">12</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="13">13</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="14">14</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="15">15</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="16">16</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="17">17</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="18">18</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="19">19</label>
									<label class="btn btn-default"><input type="checkbox" name="ring[]" value="20">20</label>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel panel-primary">
					<div class="panel-heading">
						<h1 class="panel-title">FreeScore WiFi Server Configuration</h1>
					</div>
					<div class="panel-body">
						<div class="form-group row">
							<label for="wifi-ssid" class="col-xs-2 col-form-label">FreeScore Wifi Name</label>
							<div class="col-xs-10">
								<input class="form-control" type="text" name="wifi-ssid" id="wifi-ssid" style="width:80%;">
							</div>
						</div>
						<div class="form-group row">
							<label for="wifi-pass" class="col-xs-2 col-form-label">FreeScore Wifi Password</label>
							<div class="col-xs-10">
								<input class="form-control" type="text" name="wifi-pass" id="wifi-pass" style="width:80%;">
							</div>
						</div>

						<div class="form-group row">
							<label for="wifi-channel" class="col-xs-2 col-form-label">Wifi Channel</label>
							<div class="col-xs-10">
								<div class="btn-group" data-toggle="buttons" id="wifi-channel">
									<label class="btn btn-default"><input type="radio" name="wifi-channel" value="01">1</label>
									<label class="btn btn-default"><input type="radio" name="wifi-channel" value="02">2</label>
									<label class="btn btn-default"><input type="radio" name="wifi-channel" value="03">3</label>
									<label class="btn btn-default"><input type="radio" name="wifi-channel" value="04">4</label>
									<label class="btn btn-default"><input type="radio" name="wifi-channel" value="05">5</label>
									<label class="btn btn-default"><input type="radio" name="wifi-channel" value="06">6</label>
									<label class="btn btn-default"><input type="radio" name="wifi-channel" value="07">7</label>
									<label class="btn btn-default"><input type="radio" name="wifi-channel" value="08">8</label>
									<label class="btn btn-default"><input type="radio" name="wifi-channel" value="09">9</label>
									<label class="btn btn-default"><input type="radio" name="wifi-channel" value="10">10</label>
									<label class="btn btn-default"><input type="radio" name="wifi-channel" value="11">11</label>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="clearfix">
					<button type="submit" id="accept" class="btn btn-success pull-right">Accept</button> 
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

$( '#name' ).val( tournament.name );
$( '#rings label' ).removeClass( 'active' );
$.each( tournament.rings, (i, r) => {
	$( '#rings label' ).each(( j, b ) => { 
		if( r == (j + 1)) { 
			$( b ).addClass( 'active' ); 
			$( b ).find( "input[type=checkbox]" ).attr( { checked: 'checked' }); 
		} 
	});
});
$( '#cancel' ).off( 'click' ).click(() => { location = "index.php"; });
$( '#accept' ).off( 'click' ).click(() => { console.log( "Submitting" ); });


var wifi = [{"address":"18:64:72:37:AD:E0","channel":"1","frequency":"2.412","id":1,"quality":0.428571428571429,"ssid":"SFState"},{"address":"18:64:72:37:AD:E1","channel":"1","frequency":"2.412","id":2,"quality":0.414285714285714,"ssid":"eduroam"},{"address":"F8:1E:DF:FC:64:89","channel":"2","frequency":"2.417","id":3,"quality":0.371428571428571},{"address":"FE:1E:DF:FC:64:89","channel":"2","frequency":"2.417","id":4,"quality":0.414285714285714,"ssid":"CSME"},{"address":"F4:F2:6D:40:D5:64","channel":"5","frequency":"2.432","id":5,"quality":0.385714285714286},{"address":"14:35:8B:0C:E0:A4","channel":"5","frequency":"2.432","id":6,"quality":0.314285714285714,"ssid":"habitablezone"},{"address":"10:9A:DD:84:03:5D","channel":"6","frequency":"2.437","id":7,"quality":0.314285714285714,"ssid":"WifiGspot"},{"address":"00:E1:B0:53:82:38","channel":"8","frequency":"2.447","id":8,"quality":1,"ssid":"freescore"},{"address":"66:2A:2F:53:7C:99","channel":"11","frequency":"2.462","id":9,"quality":0.4,"ssid":"SETUP"},{"address":"84:D4:7E:F1:A1:61","channel":"11","frequency":"2.462","id":10,"quality":0.9,"ssid":"SFState"},{"address":"70:3A:0E:22:CC:40","channel":"11","frequency":"2.462","id":11,"quality":0.357142857142857,"ssid":"SFState"},{"address":"70:3A:0E:22:CC:41","channel":"11","frequency":"2.462","id":12,"quality":0.385714285714286,"ssid":"eduroam"},{"address":"70:3A:0E:22:CC:42","channel":"11","frequency":"2.462","id":13,"quality":0.371428571428571},{"address":"18:64:72:37:B2:A0","channel":"11","frequency":"2.462","id":14,"quality":0.371428571428571,"ssid":"SFState"},{"address":"18:64:72:37:B2:A1","channel":"11","frequency":"2.462","id":15,"quality":0.4,"ssid":"eduroam"},{"address":"18:64:72:37:B2:A2","channel":"11","frequency":"2.462","id":16,"quality":0.4},{"address":"00:1F:33:34:94:C8","channel":"11","frequency":"2.462","id":17,"quality":0.357142857142857},{}];
		</script>
	</body>
</html>
