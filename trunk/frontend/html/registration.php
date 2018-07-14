<?php
	include "include/php/version.php";
	include "include/php/config.php";
?>
<html>
	<head>
		<title>Import USAT Registration</title>
		<link href="include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="include/css/registration.css" rel="stylesheet" />
		<link href="include/bootstrap/add-ons/bootstrap-select.min.css" rel="stylesheet" />
		<link href="include/bootstrap/add-ons/bootstrap-toggle.min.css" rel="stylesheet" />
		<link href="include/page-transitions/css/animations.css" rel="stylesheet" type="text/css" />
		<link href="include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="include/jquery/js/jquery.js"></script>
		<script src="include/jquery/js/jquery.howler.min.js"></script>
		<script src="include/bootstrap/js/bootstrap.min.js"></script>
		<script src="include/bootstrap/add-ons/bootstrap-select.min.js"></script>
		<script src="include/bootstrap/add-ons/bootstrap-toggle.min.js"></script>
		<script src="include/alertify/alertify.min.js"></script>
		<script src="include/js/freescore.js"></script>

		<meta name="viewport" content="width=device-width, initial-scale=1">
		<style type="text/css">
			.file-drop-zone {
				height: 200px;
				border: 3px dashed #17a2b8;
				border-radius: 8px;
			}
		</style>
	</head>
	<body>
		<div id="pt-main" class="pt-perspective">
			<div class="pt-page pt-page-1">
				<div class="container">
					<div class="page-header"> Import USAT Registration </div>

					<div class="file-drop-zone" id="upload" action="#">Drag &amp; Drop<br>USAT Weight Divisions File<br>for Females Here</div>
				</div>
			</div>
			<div class="pt-page pt-page-2">
				<div class="container">
					<div class="page-header">
						<a id="back-to-import" class="btn btn-warning"><span class="glyphicon glyphicon-menu-left"></span> Redraw</a>
						<span id="page-2-title">Imported Divisions</span>
					</div>

					<div class="panel panel-primary poomsae" id="worldclass-individuals">
						<div class="panel-heading">
							<div class="panel-title">Sport Poomsae World Class Individuals</div>
						</div>
						<div class="panel-body">
							<table>
							</table>
						</div>
					</div>

					<div class="panel panel-primary poomsae" id="worldclass-pairs">
						<div class="panel-heading">
							<div class="panel-title">Sport Poomsae World Class Pairs</div>
						</div>
						<div class="panel-body">
							<table>
							</table>
						</div>
					</div>

					<div class="panel panel-primary poomsae" id="worldclass-teams">
						<div class="panel-heading">
							<div class="panel-title">Sport Poomsae World Class Teams</div>
						</div>
						<div class="panel-body">
							<table>
							</table>
						</div>
					</div>

					<div class="clearfix">
						<button type="button" id="accept" class="btn btn-success pull-right">Accept</button> 
						<button type="button" id="cancel" class="btn btn-danger  pull-right" style="margin-right: 40px;">Cancel</button> 
					</div>
				</div>
			</div>
		</div>
		<script src="include/page-transitions/js/pagetransitions.js"></script>
		<script>

var host       = '<?= $host ?>';
var tournament = <?= $tournament ?>;
var html       = FreeScore.html;

var sound = {
	send      : new Howl({ urls: [ "sounds/upload.mp3",   "sounds/upload.ogg"   ]}),
	confirmed : new Howl({ urls: [ "sounds/received.mp3", "sounds/received.ogg" ]}),
	next      : new Howl({ urls: [ "sounds/next.mp3",     "sounds/next.ogg"     ]}),
	prev      : new Howl({ urls: [ "sounds/prev.mp3",     "sounds/prev.ogg"     ]}),
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

var ws = {
	worldclass : new WebSocket( 'ws://' + host + ':3088/worldclass/' + tournament.db + '/staging' ),
	// grassroots : new WebSocket( 'ws://' + host + ':3080/grassroots/' + tournament.db + '/staging' ),
};

var registration = { male: '', female: '', wanted: 'female' };

$( '.file-drop-zone' )
	.on( 'dragover', ( ev ) => {
		ev.preventDefault();
		ev.stopPropagation();
	})
	.on( 'dragenter', ( ev ) => {
		ev.preventDefault();
		ev.stopPropagation();
	})
	.on( 'drop', ( ev ) => {
		ev.preventDefault();
		ev.stopPropagation();

		var upload = ev.originalEvent;
		var reader = new FileReader();

		if( ! defined( upload )) { return; }
		upload = upload.dataTransfer;
		if( ! defined( upload )) { return; }

		var data = '';
		for( file of upload.files ) {
			reader.onload = (( f ) => {
				return ( e ) => { 
					if( ! registration.female ) {
						registration.wanted = 'female';
						registration.female = e.target.result;
						$( '#upload' ).css({ 'padding-top' : '12px' }).html( 'Drag &amp; Drop<br>USAT Weight Divisions File<br>for Males Here' );

					} else if( registration.female && ! registration.male ) {
						registration.wanted = 'male';
						if( e.target.result == registration.female ) {
							alertify.error( 'Same file uploaded twice; possible user error?' );
							return;
						}
						registration.male = e.target.result;
					} 

					// TODO Send for each file
					if( registration.female && registration.male ) { 
						$( '#upload' ).css({ 'padding-top' : '64px' }).html( 'Importing Registrations...' );
						var request;
						request = { data : { type : 'registration', action : 'read', male: registration.male}};
						request.json = JSON.stringify( request.data );
						ws.worldclass.send( request.json );
					}
				};
			})( file );

			data = reader.readAsText( file );
		}

	});

ws.worldclass.onmessage = ( response ) => {
	var update = JSON.parse( response.data );
	if( ! defined( update )) { return; }
	console.log( update );

	page.transition( 2 );

	var map = {
		'world class poomsae' : 'worldclass-individuals',
		'world class pairs poomsae' : 'worldclass-pairs',
		'world class team poomsae' : 'worldclass-teams',
	};

	var events = [ 'world class poomsae', 'world class pairs poomsae', 'world class team poomsae' ];

	for( var subevent of events) {
		if( !( subevent in update )) { continue; }
		var id    = '#' + map[ subevent ] + ' .panel-body table';
		var table = $( id );
		console.log( subevent, id );
		for( var division in update[ subevent ] ) {
			console.log( division );
			var tr = html.tr.clone();
			var row = {
				name : html.td.clone().html( division ),
				count: html.td.clone().html( update[ subevent ][ division ].length )
			};
			tr.append( row.name, row.count );
			table.append( tr );
		}
	}

};
		</script>
	</body>
</html>
