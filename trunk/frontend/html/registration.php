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
			.subevent table { width: 100%; }
			.subevent table th.count { width: 10%; min-width: 120px; text-align: right; }
			.subevent table td.count { width: 10%; min-width: 120px; text-align: right; }
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
						<li class="active"><a data-toggle="tab" href="#poomsae-divisions">Poomsae Divisions</a></li>
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

							<div class="panel panel-primary sparring" id="blackbelt-sparring">
								<div class="panel-heading">
									<div class="panel-title">Black Belt Olympic Sparring</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
								</div>
							</div>

							<div class="panel panel-primary sparring" id="colorbelt-sparring">
								<div class="panel-heading">
									<div class="panel-title">Color Belt Olympic Sparring</div>
								</div>
								<div class="panel-body subevent">
									<table>
									</table>
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
	worldclass : new WebSocket( 'ws://' + host + ':3088/worldclass/' + tournament.db + '/staging' ),
	freestyle  : new WebSocket( 'ws://' + host + ':3082/freestyle/' + tournament.db + '/staging' ),
	sparring   : new WebSocket( 'ws://' + host + ':3086/sparring/' + tournament.db + '/staging' ),
	// grassroots : new WebSocket( 'ws://' + host + ':3080/grassroots/' + tournament.db + '/staging' ),
};

var registration = { male: '', female: '' };
var imported     = { poomsae: false, freestyle: false, sparring: false };
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
					ws.worldclass.send( request.json );
					ws.freestyle.send( request.json );
					ws.sparring.send( request.json );
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
	d = d.replace( /18-30/, 'Under 30' );
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

var th = { count : ( text ) => { return html.th.clone().addClass( 'count' ).html( text ); }, div : ( text ) => { return html.th.clone().addClass( 'division' ).html( text ); }};
var td = { count : ( text ) => { return html.td.clone().addClass( 'count' ).html( text ); }, div : ( text ) => { return html.td.clone().addClass( 'division' ).html( text ); }};

function display_sport_poomsae_divisions( divisions ) {
	var map = {
		'world class poomsae'       : 'worldclass-individuals',
		'world class pairs poomsae' : 'worldclass-pairs',
		'world class team poomsae'  : 'worldclass-teams',
	};

	for( var subevent of Object.keys( map )) {
		if( !( subevent in divisions )) { continue; }
		var id    = '#' + map[ subevent ] + ' .panel-body table';
		var table = $( id );
		table.empty();
		var tr = html.tr.clone();
		tr.append( th.div( 'Division' ).attr({ 'valign': 'bottom' }));
		if( subevent.match( /pair/i)) {
			tr.append( th.count( 'Athletes' ), th.count( 'Pairs' ));

		} else if( subevent.match( /team/i )) {
			tr.append( th.count( 'Female<br>Athletes' ), th.count( 'Female<br>Teams' ), th.count( 'Male<br>Athletes' ), th.count( 'Male<br>Teams' ));

		} else {
			tr.append( th.count( 'Female<br>Athletes' ), th.count( 'Male<br>Athletes' ),);
		}
		table.append( tr );
		var sum    = {};
		var groups = {};
		var i      = 0;
		for( var division in divisions[ subevent ] ) {
			var count = divisions[ subevent ][ division ].length;
			var name  = sport_poomsae_division_description( subevent, division );
			var gid   = name.replace( /(?:fe)?male\s*/i, '' );
			var group = undefined;
			if( name.match( /female/i )) {
				if( gid in groups ) {
					group = groups[ gid ];
					group.females = count;
				} else {
					group = groups[ gid ] = { name: gid, females: count, i: i };
					i++;
				}
				sum.females = 'females' in sum ? sum.females + group.females : group.females;
				if( name.match( /team/i )) { group.female_teams = Math.ceil( count/3 ); sum.female_teams = 'female_teams' in sum ? sum.female_teams + group.female_teams : group.female_teams; }

			} else if( name.match( /\bmale/i )) {
				if( gid in groups ) {
					group = groups[ gid ];
					group.males = count;
				} else {
					group = groups[ gid ] = { name: gid, males: count, i: i };
					i++;
				}
				sum.males = 'males' in sum ? sum.males + group.males : group.males;
				if( name.match( /team/i )) { group.male_teams = Math.ceil( count/3 ); sum.male_teams = 'male_teams' in sum ? sum.male_teams + group.male_teams : group.male_teams; }

			} else {
				if( name.match( /pair/i )) {
					groups[ gid ] = { name: gid, athletes: count, pairs: Math.ceil( count/2 ) };
					sum.athletes = 'athletes' in sum ? sum.athletes + groups[ gid ].athletes : groups[ gid ].athletes;
					sum.pairs    = 'pairs' in sum ? sum.pairs + groups[ gid ].pairs : groups[ gid ].pairs;
				}
			}
		}

		// ===== ADD EACH GROUP TO THE TABLE
		Object.values( groups ).sort(( a, b ) => { return a.i < b.i ? -1 : a.i > b.i ? 1 : 0; }).forEach(( group ) => {
			var tr    = html.tr.clone();

			tr.append( td.div( group.name ));
			if( group.name.match( /pair/i )) {
				tr.append( td.count( group.athletes ), td.count( group.pairs ));
			} else if( group.name.match( /team/i )) {
				tr.append( td.count( group.females ), td.count( group.female_teams ), td.count( group.males ), td.count( group.male_teams ));
			} else {
				tr.append( td.count( group.females ), td.count( group.males ));
			}
			table.append( tr );
		});

		if       ( subevent.match( /pair/i )) {
			tr = html.tr.clone();
			tr.append( th.div( 'Total' ));
			tr.append( th.count( sum.athletes ), th.count( sum.pairs ),);
			tr.children( 'th' ).css({ 'padding-top': '8px' });
			table.append( tr );

		} else if( subevent.match( /team/i )) {
			tr = html.tr.clone();
			tr.append( th.div( 'Subtotal' ));
			tr.append( th.count( sum.females ), th.count( sum.female_teams ), th.count( sum.males ), th.count( sum.male_teams ),);
			tr.children( 'th' ).css({ 'padding-top': '8px' });
			table.append( tr );

			tr = html.tr.clone();
			tr.append( th.div( 'Total' ));
			tr.append( th.count( `Athletes: ${sum.males + sum.females}` ).attr({ colspan : 3 }), th.count( `Teams: ${sum.male_teams + sum.female_teams}` ));
			tr.children( 'th' ).css({ 'padding-top': '8px' });
			table.append( tr );

		} else {
			tr = html.tr.clone();
			tr.append( th.div( 'Subtotal' ));
			tr.append( html.th.clone().addClass( 'count' ).html( sum.females ), html.th.clone().addClass( 'count' ).html( sum.males ),);
			tr.children( 'th' ).css({ 'padding-top': '8px' });
			table.append( tr );

			tr = html.tr.clone();
			tr.append( th.div( 'Total' ));
			tr.append( th.count( sum.males + sum.females ).attr({ colspan : 2 }));
			tr.children( 'th' ).css({ 'padding-top': '8px' });
			table.append( tr );
		}
	}
}

function freestyle_division_description( s, d ) {
	d = JSON.parse( d );
	d = d.gender + ' ' + d.age;
	var format = '';
	if     ( s.match( /pair/i )) { format = 'Pair' }
	else if( s.match( /team/i )) { format = 'Team' }
	else                         { format = 'Individual' }
	d = d.replace( /12-17/, 'Under 17' );
	d = d.replace( /18-99/, 'Over 17' );
	d = d.replace( /black all/, '' );
	d = d.replace( /coed/, format );
	d = d.replace( /female/, 'Female ' + format );
	d = d.replace( /\bmale/, 'Male ' + format );

	return d;
};

function display_freestyle_divisions( divisions ) {
	var map = {
		'world class freestyle poomsae'       : 'freestyle-individuals',
		'world class freestyle pairs poomsae' : 'freestyle-pairs',
		'world class freestyle team poomsae'  : 'freestyle-teams',
	};

	for( var subevent of Object.keys( map )) {
		if( !( subevent in divisions )) { continue; }
		var id    = '#' + map[ subevent ] + ' .panel-body table';
		var table = $( id );
		table.empty();
		var tr = html.tr.clone();
		tr.append( th.div( 'Division' ), th.count( 'Athletes' ));
		if     ( subevent.match( /pair/i )) { tr.append( th.count( 'Pairs' )); }
		else if( subevent.match( /team/i )) { tr.append( th.count( 'Teams' )); }
		table.append( tr );
		var sum = 0;
		for( var division in divisions[ subevent ] ) {
			var tr    = html.tr.clone();
			var count = divisions[ subevent ][ division ].length;

			if( subevent.match( /pair/i )) { count = Math.ceil( count/2 ); }
			if( subevent.match( /team/i )) { count = Math.ceil( count/5 ); }

			var row = {
				name : td.div( freestyle_division_description( subevent, division )),
				count: td.count( divisions[ subevent ][ division ].length ),
				group: td.count( count )
			};
			tr.append( row.name, row.count );
			if( subevent.match( /(?:pair|team)/i )) { tr.append( row.group ); }
			table.append( tr );
			sum += count;
		}

		tr = html.tr.clone();
		tr.append( th.div( 'Total' ), th.count( sum ).attr({ 'colspan': subevent.match( /(?:pair|team)/i ) ? 2 : 1 }) );
		tr.children( 'th' ).css({ 'padding-top': '8px' });
		table.append( tr );
	}
}

function sparring_division_description( s, g, d ) {
	d = JSON.parse( d );
	age = d.age; age = age.replace( /\-99/, '+' );
	s = s.split( /\s/ ).map(( i ) => { return i.capitalize(); }).join( ' ' );
	if( s.match( /(?:cadet|junior|senior)/i )) {
		s = s.replace( /(cadet|junior|senior)/i, g.capitalize() + ' $&' );
		s = s.replace( /\s*sparring/i, '' );
		s = s + ' (' + age + ')';
		return s;
	}
	s = s.replace( /\s*sparring/i, ' ' + g.capitalize() );
	s = s + ' (' + age + ')';
	return s;
}

function display_sparring_divisions( divisions ) {
	var sum = 0;
	var tr = html.tr.clone();
	tr.append( html.th.clone().html( 'Events' ), html.th.clone().html( 'Divisions' ), html.th.clone().html( 'Athletes' ));
	var table = $( '.sparring .panel-body table' );
	table.empty();
	table.append( tr );

	var subevents = { 'worldclass-sparring' : {}, 'blackbelt-sparring' : {}, 'colorbelt-sparring' : {}};
	for( var subevent in divisions ) {
		for( var json in divisions[ subevent ] ) {
			var d = JSON.parse( json );
			if( subevent.match( /world class/i )) { 
				var name = 'worldclass-sparring';
				if( ! defined( subevents[ name ][ subevent ])) { subevents[ name ][ subevent ] = {}; }
				if( ! defined( subevents[ name ][ subevent ][ d.gender ])) { subevents[ name ][ subevent ][ d.gender ] = {}; }
				subevents[ name ][ subevent ][ d.gender ][ json ] = divisions[ subevent ][ json ];
				continue;
			}
			if( d.belt.match( /black/i )) {
				var name = 'blackbelt-sparring';
				if( ! defined( subevents[ name ][ subevent ])) { subevents[ name ][ subevent ] = {}; }
				if( ! defined( subevents[ name ][ subevent ][ d.gender ])) { subevents[ name ][ subevent ][ d.gender ] = {}; }
				subevents[ name ][ subevent ][ d.gender ][ json ] = divisions[ subevent ][ json ];
				continue;
			}
			var name = 'colorbelt-sparring';
			if( ! defined( subevents[ name ][ subevent ])) { subevents[ name ][ subevent ] = {}; }
			if( ! defined( subevents[ name ][ subevent ][ d.gender ])) { subevents[ name ][ subevent ][ d.gender ] = {}; }
			subevents[ name ][ subevent ][ d.gender ][ json ] = divisions[ subevent ][ json ];
		}
	}

	for( var name in subevents ) {
		var id         = '#' + name + ' .panel-body table';
		var table      = $( id );
		var divcount   = 0;
		var count      = 0;
		for( var subevent of Object.keys( subevents[ name ]).sort(( a, b ) => {
			// Sort by age, regardless of gender
			var i = subevents[ name ][ a ];
			var j = subevents[ name ][ b ];
			if( 'male' in i ) { i = i[ 'male' ]; } else if( 'female' in i ) { i = i[ 'female' ]; } else { return -1; }
			if( 'male' in j ) { j = j[ 'male' ]; } else if( 'female' in j ) { j = j[ 'female' ]; } else { return  1; }
			i = Object.keys( i )[ 0 ];
			j = Object.keys( j )[ 0 ];
			i = JSON.parse( i );
			j = JSON.parse( j );
			i = parseInt( i.age );
			j = parseInt( j.age );
			if( i == j ) { return  0; }
			if( i  > j ) { return  1; }
			if( i <  j ) { return -1; }
		})) {
			for( var gender in subevents[ name ][ subevent ] ) {
				var count = Object.values( subevents[ name ][ subevent ][ gender ]).map(( i ) => { return i.length; }).reduce(( acc, cur ) => { return acc + cur; });
				var tr   = html.tr.clone();
				var d    = Object.keys( subevents[ name ][ subevent ][ gender ])[ 0 ];
				var evnt = sparring_division_description( subevent, gender, d );
				var divs = Object.keys( subevents[ name ][ subevent ][ gender ]).length;
				var row  = {
					name       : html.td.clone().html( evnt ),
					categories : html.td.clone().html( divs ),
					count      : html.td.clone().html( count )
				};
				tr.append( row.name, row.categories, row.count );
				table.append( tr );
				divcount += divs;
				sum += count;
			}
		}
		tr = html.tr.clone();
		tr.append( html.th.clone().html( 'Total' ), html.th.clone().html( divcount ), html.th.clone().html( sum ));
		table.append( tr );
	}
}

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
		ws.worldclass.send( request.json );
		ws.freestyle.send( request.json );
		ws.sparring.send( request.json );

	} else if( update.request.action == 'upload' ) {
		sound.next.play();
		page.transition( 2 );
		display_sport_poomsae_divisions( update.divisions );

	} else if( update.request.action == 'import' ) {
		if( update.result == 'success' ) {
			imported.poomsae = true;
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
