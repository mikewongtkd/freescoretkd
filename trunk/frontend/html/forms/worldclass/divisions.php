<?php 
	$an_hour_ago = time() - 3600;
	setcookie( 'judge', '', $an_hour_ago, '/' );
	setcookie( 'role',  '', $an_hour_ago, '/' );
	setcookie( 'ring',  '', $an_hour_ago, '/' );
	include( "../../include/php/config.php" ); 
?>
<html>
	<head>
		<title>World Class Divisions</title>
		<link href="../../include/jquery/css/smoothness/jquery-ui.css" rel="stylesheet" />
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/bootstrap/css/bootstrap-theme.min.css" rel="stylesheet" />
		<link href="../../include/opt/elfinder/css/elfinder.min.css" rel="stylesheet" />
		<link href="../../include/opt/elfinder/css/theme.css" rel="stylesheet" />
		<link href="../../include/css/forms/worldclass/divisions.css" rel="stylesheet" />
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
				$('#elfinder').elfinder({
					url : '/freescore/include/opt/elfinder/php/connector.worldclass.php',  // connector URL (REQUIRED)
					getFileCallback: function( files, fm ) { 
						console.log( files );
						// window.open( files.url ); 
					},
					commands : [ 'open', 'reload', 'home', 'up', 'back', 'forward', 'getfile', 'download', 'rm', 'duplicate', 'rename', 'mkdir', 'mkfile', 'upload', 'copy', 'cut', 'paste', 'edit', 'search', 'info', 'view', 'help', 'sort' ],
					contextmenu: {
						files : [
							'getfile', '|', 'download', '|', 'copy', 'cut', 'paste', 'duplicate', '|', 'edit', 'rename'
						]
					}
				});
			});
		</script>
	</head>
	<body>
		<div class="container">
			<h1>Edit Rings and Divisions</h1>

			<p>You can drag-and-drop ring folders with divisions in them into
			the <b>forms-worldclass</b> directory. You can also drag-and-drop
			from FreeScore TKD to your computer. Right-click on a file to edit
			or duplicate the division.</p>

			<div class="panel panel-primary">
				<div class="panel-heading">
					<h4 class="panel-title">World Class Sport Poomsae Rings and Divisions</h4>
				</div>
				<div id="elfinder" class="panel-body"></div>
			</div>
		</div>
	</body>
</html>
