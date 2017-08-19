<?php 
	$an_hour_ago = time() - 3600;
	setcookie( 'judge', '', $an_hour_ago, '/' );
	setcookie( 'role',  '', $an_hour_ago, '/' );
	setcookie( 'ring',  '', $an_hour_ago, '/' );
	include( "../../include/php/config.php" ); 

	$t = json_decode( $tournament );
?>
<html>
	<head>
		<title>World Class Divisions</title>
		<link href="../../include/jquery/css/smoothness/jquery-ui.css" rel="stylesheet" />
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/bootstrap/css/bootstrap-theme.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/opt/elfinder/css/elfinder.min.css" rel="stylesheet" />
		<link href="../../include/opt/elfinder/css/theme.css" rel="stylesheet" />
		<link href="../../include/css/forms/worldclass/divisions.css" rel="stylesheet" />
		<link href="../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/opt/elfinder/js/elfinder.min.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootstrap-list-filter.min.js"></script>
		<script src="../../include/alertify/alertify.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../include/js/forms/worldclass/division.class.js"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1"></meta>

		<script>
			$( function() {
				$( '#refresh' ).hide().click(( ev ) => { window.location.reload(); });
				$( '#elfinder' ).elfinder({
					url : '../../include/opt/elfinder/php/connector.worldclass.php',  // connector URL (REQUIRED)
					getFileCallback: function( files, fm ) { 
						files.url = files.url.replace( /ring0/, '' );
						files.url = files.url.replace( /\bdiv\./, '' );
						files.url = files.url.replace( /\.txt$/, '' );
						window.open( files.url ); 
					},
					commands : [ 'open', 'reload', 'home', 'up', 'back', 'forward', 'getfile', 'download', 'rm', 'duplicate', 'rename', 'upload', 'copy', 'cut', 'paste', 'edit', 'search', 'info', 'view', 'help', 'sort' ],
					contextmenu: {
						files : [
							'getfile', '|', 'download', '|', 'copy', 'cut', 'paste', 'duplicate', '|', 'edit', 'rename'
						]
					},
					soundPath: '../../include/opt/elfinder/sounds',
				});
			});
		</script>
	</head>
	<body>
		<div class="container">
			<div class="page-header">Division Manager</div>
			<ul class="nav nav-tabs">
				<li><a data-toggle="tab" id="staging-tab" href="#staging">Staging</a></li>
				<?php foreach( $t->rings as $i ): 
						$num = $i;
						if( $num < 10 ) { $num = '0' . $num; }
					?>
					<li><a data-toggle="tab" href="#ring<?= $num ?>">Ring <?= $i ?></a></li>
				<?php endforeach; ?>
				<li><a data-toggle="tab" href="#files">All Files</a></li>
			</ul>
			<div class="tab-content">
				<div id="staging" class="tab-pane fade in">
					<form role="form">
						<div class="form-group">
							<input id="search-completed" class="form-control" type="search" placeholder="Search..." />
						</div>
						<div>
							<a class="btn btn-block btn-success" href="division/editor.php?file=test/staging/new" target="_blank">New Division for Staging</a>
						</div>
						<div class="list-group" id="staging-divisions">
						</div>
					</form>
				</div>
				<?php foreach( $t->rings as $i ): 
						$num = $i;
						if( $num < 10 ) { $num = '0' . $num; }
					?>
					<div id="ring<?= $num ?>" class="tab-pane fade in">
						<form role="form">
							<div class="form-group">
								<input id="search-completed" class="form-control" type="search" placeholder="Search..." />
							</div>
							<div>
								<a class="btn btn-block btn-success" href="division/editor.php?file=test/<?= $i ?>/new" target="_blank">New Division for Ring <?= $num ?></a>
							</div>
							<div class="list-group" id="ring<?= $num ?>-divisions">
							</div>
						</form>
					</div>
				<?php endforeach; ?>
				<div id="files" class="tab-pane fade in">
					<h4>Ring and Division Files</h4>
					<p>FreeScore treats folders with the names like <code>ring01</code> as rings, 
					where <code>01</code> is the two-digit ring number.</p>

					<p>You can drag-and-drop ring folders with divisions in them into
					the <b>forms-worldclass</b> directory. You can also drag-and-drop
					from FreeScore TKD to your computer.</p>

					<h4>File Manager</h4>
					<div id="elfinder" class="panel-body"></div>
				</div>
			</div>
		</div>
		<script>
			var host       = '<?= $host ?>';
			var tournament = <?= $tournament ?>;
			var html       = FreeScore.html;
			var network    = { reconnect: 0 }
			var ws         = undefined;

			var sound = {
				ok    : new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg" ]}),
				error : new Howl({ urls: [ "../../sounds/quack.mp3",    "../../sounds/quack.ogg"  ]}),
				next  : new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"   ]}),
				prev  : new Howl({ urls: [ "../../sounds/prev.mp3",     "../../sounds/prev.ogg"   ]}),
			};

			$( 'a[data-toggle="tab"]' ).on( 'shown.bs.tab', function( e ) {
				var target = $( e.target ).attr( "href" );
				target = target.replace( '#', '' );
				target = target.replace( 'ring', '' );
				if( target != 'staging' ) { target = parseInt( target ); }

				if( defined( ws )) { ws.close(); }

				ws = new WebSocket( 'ws://<?= $host ?>:3088/worldclass/' + tournament.db + '/' + target );

				ws.onerror = network.error = function() {
					setTimeout( function() { location.reload(); }, 15000 ); // Attempt to reconnect every 15 seconds
				};

				ws.onopen = network.connect = function() {
					var request;
					request      = { data : { type : 'ring', action : 'read' }};
					request.json = JSON.stringify( request.data );
					ws.send( request.json );
				};

				ws.onmessage = network.message = function( response ) {
					var update = JSON.parse( response.data );
					console.log( update );

					if( update.type == 'ring' && update.action == 'update' ) {
						if( ! defined( update.ring )) { return; }
						refresh.rings( update );
					}
				};
			});

			var refresh = {
				rings : function( update ) {
					var ring = { num: update.request.ring, divisions : update.ring.divisions };
					if( ring.num == 'staging' ) { ring.name = 'staging'; ring.num = undefined; }
					else {
						if( ring.num < 10 ) { ring.name = 'ring0' + ring.num; } else { ring.name = 'ring' + ring.num; }
					}
					var list = $( '#' + ring.name + '-divisions' );
					list.empty();

					ring.divisions.forEach(( d ) => {
						var division    = new Division( d );
						var button      = html.a.clone().addClass( "list-group-item" );
						var title       = html.h4.clone().html( division.summary() );
						var count       = division.athletes().length;
						var description = html.p.clone().append( '<b>' + count + ' Athlete' + (count > 1 ? 's' : '') + ':</b> ', division.athletes().map(( a ) => { return a.name(); }).join( ', ' ));

						button.empty();
						button.append( title, description );
						button.attr({ divid: division.name() });
						button.off( 'click' ).click(( ev ) => {
							var clicked  = $( ev.target ); if( ! clicked.is( 'a' ) ) { clicked = clicked.parent(); }
							var divid    = clicked.attr( 'divid' );
							var division = ring.divisions.find(( d ) => { return d.name == divid; });

							$.cookie( 'divid', divid, { expires: 1, path: '/' });
							sound.next.play();
							$( 'a.list-group-item.active' ).removeClass( 'active' );
							button.addClass( 'active' );
						});

						list.append( button );
					});
				}
			};

			$( function() {
				$( '#staging-tab' ).click();
			});
		</script>
	</body>
</html>
