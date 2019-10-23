<?php 
	include( "../../include/php/config.php" ); 
	$ring = isset( $_GET[ 'ring' ]) ? $_GET[ 'ring' ] : (isset( $_COOKIE[ 'ring' ]) ? $_COOKIE[ 'ring' ] : null );
?>
<html>
	<head>
		<link href="../../include/css/flippable.css" rel="stylesheet" />
		<link href="../../include/css/forms/grassroots/tiebreaker.css" rel="stylesheet" />
		<link href="../../include/css/forms/grassroots/grassrootsApp.css" rel="stylesheet" />
		<link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<link href="../../include/css/brackets.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/forms/grassroots/score.class.js"></script>
		<script src="../../include/js/forms/grassroots/athlete.class.js"></script>
		<script src="../../include/js/forms/grassroots/division.class.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.grassroots.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.voteDisplay.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.leaderboard.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.scoreboard.js"></script>
		<script src="../../include/js/forms/grassroots/jquery.judgeScore.js"></script>
		<script src="../../include/alertify/alertify.min.js"></script>
		<script src="../../include/opt/svg/svg.min.js"></script>
		<script src="../../include/bootstrap/add-ons/brackets.js"></script>
	</head>
	<body>
		<div id="grassroots"></div>
		<script type="text/javascript">
			var host       = '<?= $host ?>';
			var tournament = <?= $tournament ?>;
			var ring       = { num : <?= $ring ?> };
			var ws = new WebSocket( `ws://${host}:3080/grassroots/${tournament.db}/${ring.num}` );

			var handle = {
				open : () => {
					var request = { data : { type : 'ring', action : 'read' }};
					request.json = JSON.stringify( request.data );
					ws.send( request.json );
				},
				message: ( response ) => {
					update = JSON.parse( response.data );
					console.log( update.ring );
					refresh( update.ring );
				},
			};

			ws.onopen    = handle.open;
			ws.onmessage = handle.message;
			ws.onclose   = handle.close;

			function refresh( progress ) {
				$( '#grassroots' ).empty();
				$( '#grassroots' ).grassroots({ progress: progress, ring : ring });
			}
			var zoom = { scale: 1.0 };

			zoom.screen = function( scale ) { zoom.scale += scale; $( 'body' ).css({ 'transform' : 'scale( ' + zoom.scale.toFixed( 2 ) + ' )', 'transform-origin': '0 0' }); };
			$( 'body' ).keydown(( ev ) => {
				switch( ev.key ) {
				case '=': zoom.screen(  0.05 );break;
				case '-': zoom.screen( -0.05 );break;
			}});
		</script>
	</body>
</html>
