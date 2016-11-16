<?php
	include "./include/php/version.php";
	include "./include/php/config.php";
?>
<html>
	<head>
		<title>Tournament Setup</title>
		<link href="./include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="./include/bootstrap/css/freescore-theme.min.css" rel="stylesheet" />
		<script src="./include/jquery/js/jquery.js"></script>
		<script src="./include/jquery/js/jquery.howler.min.js"></script>
		<script src="./include/bootstrap/js/bootstrap.min.js"></script>
		<script src="./include/bootstrap/add-ons/bootbox.min.js"></script>

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
		</style>
	</head>
	<body>
		<div class="container">
			<div class="page-header">
				<h1>Tournament Setup</h1>
			</div>

			<div class="panel panel-primary">
				<div class="panel-heading">
					<h1 class="panel-title">Select the setup for this FreeScore WiFi Server</h1>
				</div>
				<div class="panel-body">
					<form>
						<div class="form-group row">
							<label for="name" class="col-xs-2 col-form-label">Tournament Name</label>
							<div class="col-xs-10">
								<input class="form-control" type="text" id="name">
							</div>
						</div>
						<div class="form-group row">
							<label for="rings" class="col-xs-2 col-form-label">Rings</label>
							<div class="col-xs-10">
								<div class="btn-group" data-toggle="buttons-checkbox">
									<button type="button" class="btn btn-primary">1</button>
									<button type="button" class="btn btn-primary">2</button>
									<button type="button" class="btn btn-primary">3</button>
									<button type="button" class="btn btn-primary">4</button>
									<button type="button" class="btn btn-primary">5</button>
									<button type="button" class="btn btn-primary">6</button>
									<button type="button" class="btn btn-primary">7</button>
									<button type="button" class="btn btn-primary">8</button>
									<button type="button" class="btn btn-primary">9</button>
									<button type="button" class="btn btn-primary">10</button>
									<button type="button" class="btn btn-primary">11</button>
									<button type="button" class="btn btn-primary">12</button>
									<button type="button" class="btn btn-primary">13</button>
									<button type="button" class="btn btn-primary">14</button>
									<button type="button" class="btn btn-primary">15</button>
									<button type="button" class="btn btn-primary">16</button>
									<button type="button" class="btn btn-primary">17</button>
									<button type="button" class="btn btn-primary">18</button>
									<button type="button" class="btn btn-primary">19</button>
									<button type="button" class="btn btn-primary">20</button>
								</div>
							</div>
						</div>

						<div class="clearfix">
							<button type="button" id="cancel" class="btn btn-danger  pull-left" >Cancel</button> 
							<button type="button" id="accept" class="btn btn-success pull-right">Accept</button> 
						</div>
					</form>
				</div>
			</div>
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

/* var ws = new WebSocket( 'ws://' + host + '/worldclass/request/' + tournament.db + '/staging' );

ws.onmessage = function( response ) {
	var update = JSON.parse( response.data );
};
*/

$( '#name' ).val( tournament.name );
$( '.btn-group button' ).removeClass( 'active' );
$.each( tournament.rings, (i, r) => {
	$( '.btn-group button' ).each(( j, b ) => { if( parseInt( $( b ).html()) == r ) { $( b ).addClass( 'active' ); } });
});
$( '#cancel' ).off( 'click' ).click(() => { location = "index.php"; });
$( '#accept' ).off( 'click' ).click(() => { console.log( "Submitting" ); });
		</script>
	</body>
</html>
