<?php 
	$an_hour_ago = time() - 3600;
	setcookie( 'judge', '', $an_hour_ago, '/' );
	setcookie( 'role',  '', $an_hour_ago, '/' );
	setcookie( 'ring',  '', $an_hour_ago, '/' );
	include( "../../include/php/config.php" ); 
?>
<html>
	<head>
		<title>Grassroots Divisions</title>
		<link href="../../include/jquery/css/smoothness/jquery-ui.css" rel="stylesheet" />
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/bootstrap/css/bootstrap-theme.min.css" rel="stylesheet" />
		<link href="../../include/opt/elfinder/css/elfinder.min.css" rel="stylesheet" />
		<link href="../../include/opt/elfinder/css/theme.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/opt/elfinder/js/elfinder.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1"></meta>

		<script>
			$( function() {
				$( '#new-division' ).css({ position: 'relative', top: '-120px', left: '28px' }).hide();
				$( '#refresh' ).hide().click(( ev ) => { window.location.reload(); });
				$('#elfinder').elfinder({
					url : '/freescore/include/opt/elfinder/php/connector.grassroots.php',  // connector URL (REQUIRED)
					getFileCallback: function( files, fm ) {
						window.open( files.url, '_blank' );
					},
					commands : [ 'open', 'reload', 'home', 'up', 'back', 'forward', 'getfile', 'quicklook', 'download', 'rm', 'duplicate', 'rename', 'upload', 'copy', 'cut', 'paste', 'edit', 'search', 'info', 'view', 'help', 'sort' ],
					contextmenu: {
						files: [
							'getfile', '|', 'download', '|', 'copy', 'cut', 'paste', 'duplicate', '|', 'edit', 'rename'
						]
					},
					handlers: {
						open: function( ev, elfinder ) {
							var ring = ev.data.cwd.name;
							var divid = ev.data.files
								.map(( f ) => { return f.name; })
								.map(( f ) => { var match = f.match( /^div.\w+?(\d+).txt$/ ); return (match != null) ? match[ 1 ] : null })
								.filter(( f ) => { return f != null; })
								.map(( f ) => { return parseInt( f ); })
								.reduce(( max, cur ) => Math.max( max, cur ));
							divid++;
							if( divid < 10 ) { divid = '0' + divid; }
							divid = 'p' + divid;
							$( '#new-division' ).show();
							$( '#refresh' ).show();
							$( '#new-division' ).off( 'click' ).click(( ev ) => {
								window.open( 'division/editor.php?file=test/forms-grassroots/' + ring + '/div.' + divid + '.txt' );
							});
						}
					}
				});
			});
		</script>
	</head>
	<body>
		<div class="container">
			<h1>Edit Rings and Divisions</h1>

			<p>You can drag-and-drop ring folders with divisions in them into the <b>forms-grassroots</b> directory. You can also drag-and-drop from FreeScore TKD to your computer. Use the buttons to edit the rings and divisions.</p>

			<div class="panel panel-primary">
				<div class="panel-heading">
					<button id="refresh" class="btn btn-success btn-sm pull-right" type="button" style="margin-top: -6px">Refresh View <span class="glyphicon glyphicon-repeat"></span></button>
					<h4 class="panel-title">Grassroots Rings and Divisions</h4>
				</div>
				<div id="elfinder" class="panel-body"></div>
			</div>

			<button id="new-division" class="btn btn-success btn-lg" type='button'>Add New Division</button>

		</div>
	</body>
</html>
