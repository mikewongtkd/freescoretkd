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
						<div class="file-drop-zone" id="male"   action="#"><span class="fa fa-male"  >&nbsp;</span><br>Male<br>Division File Here</div>
					</div>
				</div>
			</div>
			<div class="pt-page pt-page-2">
				<div class="container">
					<div class="page-header">
						<a id="back-to-upload" class="btn btn-warning"><span class="glyphicon glyphicon-menu-left"></span> Back to Upload</a>
						<span id="page-2-title">Imported Divisions</span>
					</div>

					<ul class="nav nav-tabs">
						<li class="active"><a data-toggle="tab" href="#poomsae-divisions">World Class Poomsae Divisions</a></li>
						<li><a data-toggle="tab" href="#grassroots-poomsae-divisions">Grassroots Poomsae Divisions</a></li>
						<li><a data-toggle="tab" href="#freestyle-divisions">Freestyle Divisions</a></li>
						<li><a data-toggle="tab" href="#sparring-divisions">Sparring Divisions</a></li>
					</ul>

					<div class="tab-content">
						<div class="tab-pane fade in active" id="poomsae-divisions">
							<div class="panel panel-primary poomsae" id="worldclass-individuals">
								<div class="panel-heading">
									<div class="panel-title">Sport Poomsae World Class Individuals</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
								</div>
							</div>

							<div class="panel panel-primary poomsae" id="worldclass-pairs">
								<div class="panel-heading">
									<div class="panel-title">Sport Poomsae World Class Pairs</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
								</div>
							</div>

							<div class="panel panel-primary poomsae" id="worldclass-teams">
								<div class="panel-heading">
									<div class="panel-title">Sport Poomsae World Class Teams</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
								</div>
							</div>
						</div>

						<div class="tab-pane fade in" id="grassroots-poomsae-divisions">
							<div class="panel panel-primary freestyle" id="yellow-belt-individuals">
								<div class="panel-heading">
									<div class="panel-title">Yellow Belt Individuals</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
								</div>
							</div>

							<div class="panel panel-primary freestyle" id="green-belt-individuals">
								<div class="panel-heading">
									<div class="panel-title">Green Belt Individuals</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
								</div>
							</div>

							<div class="panel panel-primary freestyle" id="blue-belt-individuals">
								<div class="panel-heading">
									<div class="panel-title">Blue Belt Individuals</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
								</div>
							</div>

							<div class="panel panel-primary freestyle" id="red-belt-individuals">
								<div class="panel-heading">
									<div class="panel-title">Red Belt Individuals</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
								</div>
							</div>

							<div class="panel panel-primary freestyle" id="black-belt-individuals">
								<div class="panel-heading">
									<div class="panel-title">Black Belt Individuals</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
								</div>
							</div>
						</div>

						<div class="tab-pane fade in" id="freestyle-divisions">
							<div class="panel panel-primary freestyle" id="freestyle-individuals">
								<div class="panel-heading">
									<div class="panel-title">Freestyle Individuals</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
								</div>
							</div>

							<div class="panel panel-primary freestyle" id="freestyle-pairs">
								<div class="panel-heading">
									<div class="panel-title">Freestyle Pairs</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
								</div>
							</div>

							<div class="panel panel-primary freestyle" id="freestyle-teams">
								<div class="panel-heading">
									<div class="panel-title">Freestyle Mixed Teams</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
								</div>
							</div>
						</div>

						<div class="tab-pane fade in" id="sparring-divisions">
							<div class="panel panel-primary sparring" id="worldclass-sparring">
								<div class="panel-heading">
									<div class="panel-title">World Class Olympic Sparring</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
								</div>
							</div>

							<div class="panel panel-primary sparring" id="black-belt-sparring">
								<div class="panel-heading">
									<div class="panel-title">Black Belt Olympic Sparring</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
									<p class="pull-right" style="margin-top: 12px;"><span class="exhibition"><b>* Exhibition Matches</b></span></p>
								</div>
							</div>

							<div class="panel panel-primary sparring" id="red-belt-sparring">
								<div class="panel-heading">
									<div class="panel-title">Red Belt Olympic Sparring</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
									<p class="pull-right" style="margin-top: 12px;"><span class="exhibition"><b>* Exhibition Matches</b></span></p>
								</div>
							</div>

							<div class="panel panel-primary sparring" id="blue-belt-sparring">
								<div class="panel-heading">
									<div class="panel-title">Blue Belt Olympic Sparring</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
									<p class="pull-right" style="margin-top: 12px;"><span class="exhibition"><b>* Exhibition Matches</b></span></p>
								</div>
							</div>

							<div class="panel panel-primary sparring" id="green-belt-sparring">
								<div class="panel-heading">
									<div class="panel-title">Green Belt Olympic Sparring</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
									<p class="pull-right" style="margin-top: 12px;"><span class="exhibition"><b>* Exhibition Matches</b></span></p>
								</div>
							</div>

							<div class="panel panel-primary sparring" id="yellow-belt-sparring">
								<div class="panel-heading">
									<div class="panel-title">Yellow Belt Olympic Sparring</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
									<p class="pull-right" style="margin-top: 12px;"><span class="exhibition"><b>* Exhibition Matches</b></span></p>
								</div>
							</div>

							<div class="panel panel-primary sparring" id="white-belt-sparring">
								<div class="panel-heading">
									<div class="panel-title">White Belt Olympic Sparring</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
									<p class="pull-right" style="margin-top: 12px;"><span class="exhibition"><b>* Exhibition Matches</b></span></p>
								</div>
							</div>

						</div>
					</div>
					<div class="clearfix">
						<button type="button" id="import" class="btn btn-success pull-right">Import</button> 
						<button type="button" id="cancel" class="btn btn-danger  pull-right" style="margin-right: 40px;">Cancel</button> 
					</div>
					<p>&nbsp;</p>

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
	all : {
		send : ( request ) => {
			ws.worldclass.send( request );
			ws.grassroots.send( request );
			ws.freestyle.send( request );
			ws.sparring.send( request );
		}
	},
	worldclass : new WebSocket( `ws://${host}:3088/worldclass/${tournament.db}/staging/computer+operator` ),
	grassroots : new WebSocket( `ws://${host}:3080/grassroots/${tournament.db}/staging` ),
	freestyle  : new WebSocket( `ws://${host}:3082/freestyle/${tournament.db}/staging` ),
	sparring   : new WebSocket( `ws://${host}:3086/sparring/${tournament.db}/staging` ),
};

var registration = { male: '', female: '' };
var imported     = { worldclass: false, grassroots: false, freestyle: false, sparring: false };
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

function remove_registration() {
	// Do nothing unless all (e.g. recognized, freestyle, and sparring)
	// registrations have been imported
	if( ! Object.values( imported ).every( i => i )) { return; }

	var request;
	request = { data : { type : 'registration', action : 'remove' }};
	request.json = JSON.stringify( request.data );
	ws.worldclass.send( request.json );
}


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
					alertify.success( target.capitalize() + ' divisions uploaded' );

					$( '#upload' ).css({ 'padding-top' : '64px' }).html( 'Uploading Registrations...' );
					var request;
					request = { data : { type : 'registration', action : 'upload', gender: target, data: registration[ target ] }};
					request.json = JSON.stringify( request.data );
					ws.all.send( request.json );
				};
			})( file );

			data = reader.readAsText( file );
		}

	});

var th = { count : ( text ) => { return html.th.clone().addClass( 'count' ).html( text ); }, div : ( text ) => { return html.th.clone().addClass( 'division' ).html( text ); }};
var td = { count : ( text ) => { return html.td.clone().addClass( 'count' ).html( text ); }, div : ( text ) => { return html.td.clone().addClass( 'division' ).html( text ); }};

<?php 
	include( "registration/worldclass.js" );
	include( "registration/grassroots.js" );
	include( "registration/freestyle.js" );
	include( "registration/sparring.js" );
?>

$( '#import' ).off( 'click' ).click(( ev ) => {
	var request;
	request = { data : { type : 'registration', action : 'archive' }};
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
	console.log( 'worldclass', update );

	if( update.request.action == 'read' ) {
		if( update.male   ) { dropzone.disable( 'male'   ); } else { dropzone.enable( 'male'   ); }
		if( update.female ) { dropzone.disable( 'female' ); } else { dropzone.enable( 'female' ); }
	
	} else if( update.request.action == 'archive' ) {
		request = { data : { type : 'registration', action : 'import' }};
		request.json = JSON.stringify( request.data );
		ws.all.send( request.json );

	} else if( update.request.action == 'upload' ) {
		sound.next.play();
		page.transition( 2 );
		display_worldclass_divisions( update.divisions );

	} else if( update.request.action == 'import' ) {
		if( update.result == 'success' ) {
			imported.worldclass = true;
			remove_registration();

		} else {
			alertify.error( 'Import failed for World Class Poomsae' );
			sound.warning.play();
		}
	} else if( update.request.action == 'remove' ) {
		if( update.result == 'success' ) {
			sound.send.play();
			setTimeout(() => { window.location = 'index.php'; }, 750 );
		} else {
			alertify.error( 'Imported registration not properly cleared from cache.' );
			sound.warning.play();
		}
	}
};

ws.worldclass.onerror = () => {
	alertify.error( 'Error contacting World Class Poomsae service' );
};

ws.grassroots.onopen = () => {
	var request;
	request = { data : { type : 'registration', action : 'read' }};
	request.json = JSON.stringify( request.data );
	ws.grassroots.send( request.json );
};

ws.grassroots.onmessage = ( response ) => {
	var update = JSON.parse( response.data );
	if( ! defined( update )) { return; }
	console.log( 'grassroots', update );

	if( update.request.action == 'upload' ) {
		display_grassroots_divisions( update.divisions );

	} else if( update.request.action == 'import' ) {
		if( update.result == 'success' ) {
			imported.grassroots = true;
			remove_registration();

		} else {
			alertify.error( 'Import failed for Grassroots Poomsae' );
			sound.warning.play();
		}
	}
};

ws.grassroots.onerror = () => {
	alertify.error( 'Error contacting Grassroots Poomsae service' );
};

ws.freestyle.onopen = () => {
	var request;
	request = { data : { type : 'registration', action : 'read' }};
	request.json = JSON.stringify( request.data );
	ws.freestyle.send( request.json );
}

ws.freestyle.onmessage = ( response ) => { 
	var update = JSON.parse( response.data );
	if( ! defined( update )) { return; }
	console.log( 'freestyle', update );

	if( update.request.action == 'upload' ) {
		display_freestyle_divisions( update.divisions );

	} else if( update.request.action == 'import' ) {
		if( update.result == 'success' ) {
			imported.freestyle = true;
			remove_registration();

		} else {
			alertify.error( 'Import failed for Freestyle poomsae' );
			sound.warning.play();
		}
	}
};

ws.freestyle.onerror = () => {
	alertify.error( 'Error contacting Freestyle service' );
};

ws.sparring.onopen = () => {
	var request;
	request = { data : { type : 'registration', action : 'read' }};
	request.json = JSON.stringify( request.data );
	ws.sparring.send( request.json );
};

ws.sparring.onmessage = ( response ) => { 
	var update = JSON.parse( response.data );
	if( ! defined( update )) { return; }
	console.log( 'sparring', update );

	if( update.request.action == 'upload' ) {
		display_sparring_divisions( update.divisions );

	} else if( update.request.action == 'import' ) {
		if( update.result == 'success' ) {
			imported.sparring = true;
			remove_registration();

		} else {
			alertify.error( 'Import failed for Olympic Sparring' );
			sound.warning.play();
		}
	}
};

ws.sparring.onerror = () => {
	alertify.error( 'Error contacting Sparring service' );
};

		</script>
	</body>
</html>
