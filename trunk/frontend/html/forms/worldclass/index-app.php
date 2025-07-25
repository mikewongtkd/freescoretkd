<?php 
	include( "include/php/app.php" ); 
	$ring = isset( $_GET[ 'ring' ]) ? $_GET[ 'ring' ] : $_COOKIE[ 'ring' ];
	$app  = new App( $ring, 'display' );
	$app->title( 'Recognized Poomsae Display' );
	$app->header();
?>
	<body>
		<div id="worldclass"></div>
		<script type="text/javascript">
			let app = new FreeScore.App.WorldClass( <?= $ring ?> );
			app.on.connect( '<?= $app->url ?>' ).read.division();

			app.forwardIf = {
				sbs : division => {
					let method = division.current.method();
					if( method == 'sbs' ) { window.location = `sbs/index.php?ring=<?= $rnum ?>`; }
				},
				se : division => {
					let method = division.current.method();
					if( method == 'se'  ) { window.location = `se/index.php?ring=<?= $rnum ?>`; }
				}
			};

			app.comms.when
			// ============================================================
			.receiving( 'ring' )
			// ============================================================
			.command( 'update' )
				.respond( update => {
					let response = app.comms.response( update );
					let division = response.current.division();
					Object.entries( app.widget ).forEach(([ name, widget ]) => widget.display.refresh.all( division ));
				})
			// ============================================================
			.receiving( 'division' )
			// ============================================================
			.command( 'update' )
				.respond( update => {
					let response = app.comms.response( update );
					let division = response.current.division();

					app.forwardIf.se( division );
					app.forwardIf.sbs( division );
				})
		</script>
	</body>
</html>
