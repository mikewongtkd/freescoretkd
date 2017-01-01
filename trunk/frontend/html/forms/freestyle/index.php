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
		<link href="../../include/css/flippable.css" rel="stylesheet" />
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
					<div class="mandatory-stances done hakdari-seogi"><img src="../../images/icons/freestyle/hakdari-seogi.png"></div>
					<div class="mandatory-stances done beom-seogi"   ><img src="../../images/icons/freestyle/beom-seogi.png"></div>
					<div class="mandatory-stances done dwigubi"      ><img src="../../images/icons/freestyle/dwigubi.png"></div>
				</div>
				<div id="score"></div>
			</div>
			<div id="division">
			</div>
		</div>
		<script>
			var host       = '<?= $host ?>';
			var tournament = <?= $tournament ?>;
			var ring       = { num: 1 };
			var judges     = { name : [ 'referee', 'j1', 'j2', 'j3', 'j4', 'j5', 'j6' ] };
			var html       = FreeScore.html;
			var ws         = new WebSocket( 'ws://<?= $host ?>:3082/freestyle/' + tournament.db + '/' + ring.num );

			ws.onopen = function() {
				var request  = { data : { type : 'division', action : 'read' }};
				request.json = JSON.stringify( request.data );
				ws.send( request.json );
			};

			ws.onmessage = function( response ) {
				var update = JSON.parse( response.data );
				if( ! defined( update.division )) { return; }
				var division = new Division( update.division );
				refresh.display( division );
			}

			Object.prototype.sum = function() {
				var sum = parseFloat( Object.keys( this ).reduce(( acc, cur ) => { acc += this[ cur ]; return acc; }, 0.0));
				return sum.toFixed( 1 );
			};

			var refresh = { 
				display: function( division ) {
					var athlete = division.current.athlete();
					refresh.athlete( athlete );

					judges.num   = division.judges();
					refresh.judges( athlete );

					var complete = athlete.score.complete();
					refresh.deductions( athlete );
				},
				athlete: function( athlete ) {
					$( '.athlete #name' ).html( athlete.display.name() );
					if( defined( athlete.info( 'flag' ))) { $( '.athlete #flag' ).html( html.img.clone().attr({ src: '../../images/flags/' + athlete.info( 'flag' ) })); }
				},
				deductions: function( athlete ) {
					if( ! athlete.complete ) { return; }
					Object.keys( athlete.findings.stances ).each(( i, stance ) => { $( '.' + stance ).removeClass( 'done' ); });
				},
				judges: function( athlete ) {
					// ===== DISABLE UNUSED JUDGE POSITIONS
					$( '.judge' ).removeClass( 'judge-disabled' );
					for( var i = judges.num; i < 7; i++ ) { $( '#' + judges.name[ i ] ).addClass( 'judge-disabled' ); }

					var complete = athlete.score.complete();
					var scores   = athlete.scores();

					// ===== REFRESH EACH JUDGE
					if( complete ) { 
						$.each( scores, refresh.judge.score ); 
						var findings = athlete.score.consensus();
						$.each( [ 'technical', 'presentation' ], ( i, category ) => {
							Object.keys( findings[ category ] ).each(( i, minmax ) => {
								var j   = findings[ category ][ minmax ];
								var div = $( '#' + judges.name[ j ] + ' .' + category );
								div.addClass( 'ignore' );
							});
						});

					} else { $.each( scores, refresh.judge.submitted ); }
				},
				judge: {
					// ===== SHOW THE JUDGE'S SCORE
					score: function( i, score ) {
						var div          = $( '#' + judges.name[ i ] );
						var technical    = html.div.clone().addClass( 'technical' )    .html( score.technical.sum() );
						var presentation = html.div.clone().addClass( 'presentation' ) .html( score.presentation.sum() );
						div.empty().append( technical, presentation );
					},
					// ===== SHOW THE JUDGE HAS SUBMITTED A SCORE
					submitted: function( i, score ) {
						var div = $( '#' + judges.name[ i ] );
						if( ! defined( score )) { div.empty(); return; }
						var checkmark = html.div.clone().addClass( 'submitted' ).html( '&#10004;' );
						div.empty().append( checkmark );
					},
				}
			};
		</script>
	</body>
</html>
