<?php 
	$clear_cookie = time() - 3600; # set cookie expiration data to an hour ago (expire immediately)
	include( "../../include/php/config.php" ); 
	setcookie( 'judge', '', $clear_cookie, '/' );
	setcookie( 'role', 'display', 0, '/' );
	$i = isset( $_GET[ 'ring' ] ) ? $_GET[ 'ring' ] : $_COOKIE[ 'ring' ];
	$k = json_decode( $tournament )->rings->count;
	if( $i == 'staging' || (ctype_digit( $i ) && (integer) $i >= 1 && (integer) $i <= $k)) { 
		setcookie( 'ring', $i, 0, '/' ); 
		$cookie_set = true;
	} else {
		setcookie( 'ring', 1, 0, '/' ); 
	}
?>
<html>
	<head>
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/bootstrap/css/freescore-theme.min.css" rel="stylesheet" />
		<link href="../../include/css/forms/freestyle/display.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/jquery/js/jquery.totemticker.min.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootbox.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/forms/freestyle/athlete.class.js"></script>
		<script src="../../include/js/forms/freestyle/division.class.js"></script>
	</head>
	<body>
		<div class="display">
			<div class="judges">
				<div class="judge" id="referee"></div>
				<div class="judge" id="j1"></div>
				<div class="judge" id="j2"></div>
				<div class="judge" id="j3"></div>
				<div class="judge" id="j4"></div>
				<div class="judge" id="j5"></div>
				<div class="judge" id="j6"></div>
			</div>
			<div class="athlete">
				<div id="flag"></div><div id="name"></div>
				<div id="deductions">
					<div class="unadjusted"></div>
					<div class="major"></div>
					<div class="minor"></div>
					<div class="timing ok"><div class="glyphicon glyphicon-time"></div><div id="time-over-under">&#10004;</div></div>
				</div>
				<div id="score"></div>
			</div>
			<div id="division">
			</div>
		</div>
		<script>
			var host       = '<?= $host ?>';
			var tournament = <?= $tournament ?>;
			var ring       = { num: <?= $i ?> };
			var judges     = { name : [ 'referee', 'j1', 'j2', 'j3', 'j4', 'j5', 'j6' ] };
			var html       = FreeScore.html;
			var ws         = new WebSocket( 'ws://<?= $host ?>:3082/freestyle/' + tournament.db + '/' + ring.num );
			var zoom       = { scale: 1.0 };

			zoom.screen = function( scale ) { zoom.scale += scale; $( 'body' ).css({ 'transform' : 'scale( ' + zoom.scale.toFixed( 2 ) + ' )', 'transform-origin': '0 0' }); };
			$( 'body' ).keydown(( ev ) => {
				switch( ev.key ) {
				case '=': zoom.screen(  0.05 );break;
				case '-': zoom.screen( -0.05 );break;
			}});

			ws.onopen = function() {
				var request  = { data : { type : 'division', action : 'read' }};
				request.json = JSON.stringify( request.data );
				ws.send( request.json );
			};

			ws.onmessage = function( response ) {
				var update = JSON.parse( response.data );
				console.log( update );

				if( ! defined( update.division )) { return; }
				var division = new Division( update.division );
				refresh.display( division );
			}

			var sum = function( obj ) {
				return parseFloat( Object.keys( obj ).reduce(( acc, cur ) => { acc += obj[ cur ]; return acc; }, 0.0)).toFixed( 1 );
			};

			var refresh = { 
				display: function( division ) {
					var athlete = division.current.athlete();
					refresh.athlete( athlete );

					judges.num   = division.judges();
					refresh.judges( division );

					var complete = athlete.score.complete();
					if( complete ) {
						refresh.total( athlete );
					}
				},
				athlete: function( athlete ) {
					$( '.athlete #name' ).html( athlete.display.name() );
					if( defined( athlete.info( 'flag' ))) { $( '.athlete #flag' ).html( html.img.clone().attr({ src: '../../images/flags/' + athlete.info( 'flag' ) })); }
				},
				judges: function( division ) {
					var athlete = division.current.athlete();

					// ===== DISABLE UNUSED JUDGE POSITIONS
					$( '.judge' ).removeClass( 'judge-disabled' );
					for( var i = judges.num; i < 7; i++ ) { $( '#' + judges.name[ i ] ).addClass( 'judge-disabled' ); }

					var round    = division.current.roundId();
					var complete = athlete.score.complete( round );
					var scores   = athlete.scores( round );
					var adjusted = athlete.adjusted( round );

					// ===== REFRESH EACH JUDGE
					if( complete ) { 
						$.each( scores, refresh.judge.score ); 
						$.each( [ 'technical', 'presentation' ], ( i, category ) => {
							$.each( [ 'min', 'max' ], ( i, minmax ) => {
								var j   = adjusted[ minmax ][ category ];
								var div = $( '#' + judges.name[ j ] + ' .' + category );
								div.addClass( 'ignore' );
							});
						});

					} else { $.each( scores, refresh.judge.submitted ); }
				},
				judge: {
					// ===== SHOW THE JUDGE'S SCORE
					score: function( i, score ) {
						if( ! defined( score )) { score = { technical: [], presentation: [] }; }
						var div          = $( '#' + judges.name[ i ] );
						var technical    = html.div.clone().addClass( 'technical' )    .html( sum( score.technical ));
						var presentation = html.div.clone().addClass( 'presentation' ) .html( sum( score.presentation ));
						div.empty().append( technical, presentation );
					},
					// ===== SHOW THE JUDGE HAS SUBMITTED A SCORE
					submitted: function( i, score ) {
						var div = $( '#' + judges.name[ i ] );
						if( ! defined( score )) { div.empty(); return; }
						var checkmark = html.div.clone().addClass( 'submitted' ).html( '&#10004;' );
						div.empty().append( checkmark );
					},
				},
				total: function( athlete ) {
					var div        = $( '#score' );
					var consensus  = athlete.score.consensus();
					var deductions = consensus.deductions; if( ! defined( deductions )) { return; }
					var major      = { subtotal : parseFloat( deductions.major.subtotal ) }; 
					var minor      = { subtotal : parseFloat( deductions.minor.subtotal ) }; 
					var total      = athlete.score.total() - (major.subtotal + minor.subtotal);
					div.html( total.toFixed( 2 ));
				}
			};
		</script>
	</body>
</html>
