<?php
	include "include/php/version.php";
	include "include/php/config.php";
?>
<html>
	<head>
		<title>Upload USAT Registration</title>
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
<?php
	$t = json_decode( $tournament );
	if( ! file_exists( "/usr/local/freescore/data/" . $t->db . "/forms-worldclass/draws.json" )):
?>
	<script>
		alertify.dialog( 'drawPoomsae', function() {
			return {
				main: function( message ) {
					this.message = message;
				},
				build: function() {
					$( this.elements.header ).css({ 'background-color':'#dc3545', 'color':'white' });
				},
				setup: function() {
					return {
						buttons: [ { text: "Draw Poomsae", key: 13 /* Enter */ }, { text: "Continue Import" }],
						focus: { element: 0 },
						options: {
							title: 'Warning: Designated Poomsae Have Not Been Drawn',
						},
					};
				},
				prepare: function() {
					this.setContent( this.message );
				},
				callback: function( closeEvent ) {
					switch( closeEvent.index ) {
						case 0:
							window.location = 'forms/worldclass/draws.php';
							break;
						case 1:
							alertify.error( 'After importing, please remember to edit each division to include the proper poomsae' );
							break;
					}
				}
			}
		});
		alertify.drawPoomsae(
			'Designated Poomsae have not yet been drawn. If you proceed without drawing the designated poomsae, you will have to edit each division. Drawing poomsae first is highly recommended.',
		);
	</script>
<?php
	endif
?>
					<h1>Drag &amp; Drop USAT Weight Divisions Below</h1>

					<div class="drop-zones">
						<div class="file-drop-zone" id="female" action="#"><span class="fa fa-female">&nbsp;</span><br>Female<br>Division File Here</div>
						<div class="file-drop-zone" id="male" action="#"><span class="fa fa-male">&nbsp;</span><br>Male<br>Division File Here</div>
					</div>
				</div>
			</div>
			<div class="pt-page pt-page-2">
				<div class="container">
					<div class="page-header">
						<a id="back-to-upload" class="btn btn-warning"><span class="glyphicon glyphicon-menu-left"></span> Back to Upload</a>
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
						<button type="button" id="import" class="btn btn-success pull-right">Import</button> 
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
var divisions  = undefined;

var sound = {
	send      : new Howl({ urls: [ "sounds/upload.mp3",   "sounds/upload.ogg"   ]}),
	confirmed : new Howl({ urls: [ "sounds/received.mp3", "sounds/received.ogg" ]}),
	error     : new Howl({ urls: [ "sounds/warning.mp3",  "sounds/warning.ogg"  ]}),
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

var registration = { male: '', female: '' };
var dropzone     = { 
	disable: ( target ) => {
		$( '#' + target ).html( '<span class="fa fa-' + target + '">&nbsp;</span><br>' + target.capitalize() + '<br>Division Uploaded' ).css({ 'border-color': '#ccc', 'color': '#999' });
	},
	enable: ( target ) => {
		$( '#' + target ).html( '<span class="fa fa-' + target + '">&nbsp;</span><br>' + target.capitalize() + '<br>Division File Here' ).css({ 'border-color': '#17a2b8', 'color': 'black' });
	}
};

$( '#back-to-upload' ).off( 'click' ).click( ( ev ) => {
	sound.prev.play();
	page.transition( 1 );
});

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
		var target = $( ev.target ).attr( 'id' );
		if( registration[ target ] ) { sound.next.play(); return; }

		var upload = ev.originalEvent;
		var reader = new FileReader();

		if( ! defined( upload )) { return; }
		upload = upload.dataTransfer;
		if( ! defined( upload )) { return; }

		var data = '';
		for( file of upload.files ) {
			reader.onload = (( f ) => {
				return ( e ) => { 
					if( e.target.result == registration.female || e.target.result == registration.male ) {
						alertify.error( 'Same file uploaded twice; possible user error?' );
						return;
					}
					dropzone.disable( target );

					registration[ target ] = e.target.result;
					sound.send.play();

					$( '#upload' ).css({ 'padding-top' : '64px' }).html( 'Importing Registrations...' );
					var request;
					request = { data : { type : 'registration', action : 'upload', gender: target, data: registration[ target ] }};
					request.json = JSON.stringify( request.data );
					ws.worldclass.send( request.json );
				};
			})( file );

			data = reader.readAsText( file );
		}

	});

function sport_poomsae_division_description( s, d ) {
	d = JSON.parse( d );
	d = d.gender + ' ' + d.age;
	var format = '';
	if( s.match( /pair/i ))      { format = 'Pair' }
	else if( s.match( /team/i )) { format = 'Team' }
	else                         { format = 'Individual' }
	d = d.replace( /10-11/, 'Youths' );
	d = d.replace( /12-14/, 'Cadets' );
	d = d.replace( /15-17/, 'Juniors' );
	d = d.replace( /18-30/, 'Seniors' );
	d = d.replace( /31-40/, 'Under 40' );
	d = d.replace( /41-50/, 'Under 50' );
	d = d.replace( /51-60/, 'Under 60' );
	d = d.replace( /61-65/, 'Under 65' );
	d = d.replace( /66-99/, 'Over 65' );
	d = d.replace( /31-99/, 'Over 30' );
	d = d.replace( /black all/, '' );
	d = d.replace( /coed/, format );
	d = d.replace( /female/, 'Female ' + format );
	d = d.replace( /\bmale/, 'Male ' + format );

	return d;
};

$( '#import' ).off( 'click' ).click(( ev ) => {
	var request;
	request = { data : { type : 'registration', action : 'import' }};
	request.json = JSON.stringify( request.data );
	ws.worldclass.send( request.json );
});

ws.worldclass.onopen = () => {
	var request;
	request = { data : { type : 'registration', action : 'read' }};
	request.json = JSON.stringify( request.data );
	ws.worldclass.send( request.json );
};

ws.worldclass.onmessage = ( response ) => {
	var update = JSON.parse( response.data );
	if( ! defined( update )) { return; }
	console.log( update );

	if( update.request.action == 'read' ) {
		if( update.male   ) { dropzone.disable( 'male'   ); } else { dropzone.enable( 'male'   ); }
		if( update.female ) { dropzone.disable( 'female' ); } else { dropzone.enable( 'female' ); }
	
	} else if( update.request.action == 'upload' ) {
		sound.next.play();
		page.transition( 2 );

		var map = {
			'world class poomsae' : 'worldclass-individuals',
			'world class pairs poomsae' : 'worldclass-pairs',
			'world class team poomsae' : 'worldclass-teams',
		};

		var events = [ 'world class poomsae', 'world class pairs poomsae', 'world class team poomsae' ];

		divisions = update.divisions;

		for( var subevent of events) {
			if( !( subevent in divisions )) { continue; }
			var id    = '#' + map[ subevent ] + ' .panel-body table';
			var table = $( id );
			table.empty();
			var tr = html.tr.clone();
			tr.append( html.th.clone().html( 'Division' ), html.th.clone().html( 'Num.' ));
			table.append( tr );
			var sum = 0;
			for( var division in divisions[ subevent ] ) {
				var tr    = html.tr.clone();
				var count = divisions[ subevent ][ division ].length;

				if( subevent.match( /pair/i )) { count = Math.ceil( count/2 ); }
				if( subevent.match( /team/i )) { count = Math.ceil( count/3 ); }

				var row = {
					name : html.td.clone().html( sport_poomsae_division_description( subevent, division )),
					count: html.td.clone().html( divisions[ subevent ][ division ].length )
				};
				tr.append( row.name, row.count );
				table.append( tr );
				sum += count;
			}

			tr = html.tr.clone();
			tr.append( html.th.clone().html( 'Total' ), html.th.clone().html( sum ));
			table.append( tr );
		}

	} else if( update.request.action == 'import' ) {
		if( update.result == 'success' ) {
			sound.send.play();
			setTimeout(() => { window.location = 'index.php'; }, 750 );
		} else {
			sound.warning.play();
		}
	}
};
		</script>
	</body>
</html>
