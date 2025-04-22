<?php 
	include( "include/php/app.php" ); 
	$ring = isset( $_GET[ 'ring' ]) ? $_GET[ 'ring' ] : $_COOKIE[ 'ring' ];
	$app  = new App( $ring, 'dispay' );
	$app->title( 'Recognized Poomsae Display' );
	$app->header();
?>
	<body>
		<div id="worldclass"></div>
		<script type="text/javascript">
			$( '#worldclass' ).worldclass({ server: '<?= $app->websocket( 'worldclass', $ring ) ?>', tournament : <?= $tournament ?>, ring : <?= $ring ?> });
			$( 'body' ).click( function() {
				if( screenfull.enabled ) { screenfull.toggle(); }
			});
		</script>
	</body>
</html>
