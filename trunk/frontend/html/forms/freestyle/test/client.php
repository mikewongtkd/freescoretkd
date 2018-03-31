<?php 
	include( "../../../include/php/config.php" ); 
	$t = json_decode( $tournament );
?>
<html>
	<head>
		<link href="../../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/css/freescore-theme.min.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/themes/default.min.css" rel="stylesheet" />
		<link href="../../../include/css/forms/freestyle/test/client.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../../include/jquery/js/jquery.tappy.js"></script>
		<script src="../../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../../include/js/freescore.js"></script>
		<script src="../../../include/js/forms/freestyle/jquery.deductions.js"></script>
		<script src="../../../include/js/forms/freestyle/athlete.class.js"></script>
		<script src="../../../include/js/forms/freestyle/division.class.js"></script>
		<script src="../../../include/alertify/alertify.min.js"></script>

		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta charset="UTF-8">
		<meta name="google" content="notranslate">
		<meta http-equiv="Content-Language" content="en">
	</head>
	<body>
		<div class="container">
			<div id="ring" class="btn-group" data-toggle="buttons">
				<?php foreach( $t->rings as $ring ): ?>
					<label class="btn btn-primary"><input type="radio" name="ring" value="<?= $ring ?>">Ring <?= $ring ?></label>
				<?php endforeach; ?>
			</div>

			<div id="athlete"></div>
			<div id="send"><a id="send-scores" class="btn btn-success disabled">Send scores</a></div>

		</div>
		<script>
			$.cookie( 'judge', 0 );
			var sound      = {};
			var division   = undefined;
			var tournament = <?= $tournament ?>;
			var ring       = { num: 1 };
			var ws         = undefined;

			sound.ok    = new Howl({ urls: [ "../../../sounds/upload.mp3",   "../../../sounds/upload.ogg" ]});
			sound.error = new Howl({ urls: [ "../../../sounds/quack.mp3",    "../../../sounds/quack.ogg"  ]});
			sound.next  = new Howl({ urls: [ "../../../sounds/next.mp3",     "../../../sounds/next.ogg"   ]});
			sound.prev  = new Howl({ urls: [ "../../../sounds/prev.mp3",     "../../../sounds/prev.ogg"   ]});

			$( "input[type=radio][name='ring']"   ).change(( e ) => { 
				ring.num = $( e.target ).val(); 
				if( defined( ws )) { ws.close(); }
				ws = new WebSocket( 'ws://<?= $host ?>:3082/freestyle/' + tournament.db + '/' + ring.num );

				ws.onopen = () => {
					var request  = { data : { type : 'division', action : 'read' }};
					request.json = JSON.stringify( request.data );
					ws.send( request.json );
				};

				ws.onmessage = ( response ) => {
					var update = JSON.parse( response.data );
					console.log( update );

					if( defined( update.error )) {
						if( update.error.match( /Division not in ring/i )) { alertify.error( "No division in ring " + ring.num ); }
					}

					if( ! defined( update.division )) { return; }

					division = new Division( update.division );
					if( ! defined( division )) { return; }

					if( update.action == 'update' && update.type == 'division' ) {
						var athlete = division.current.athlete()
						$( '#send-scores' ).removeClass( 'disabled' );
						$( '#athlete' ).html( athlete.display.name() );
					}
				};
			});

			var rand = ( x ) => { return Math.floor( Math.random() * x ); };
			var create_scores = ( j ) => {
				var skills = [ 4, 5, 5, 5, 5, 6, 6, 7 ];
				var skill  = skills[ rand( 8 ) ];
				var scores = [];

				for( i = 0; i < j; i++ ) {
					var score  = { technical: { mft1: 0, mft2: 0, mft3: 0, mft4: 0, mft5: 0, basic: 0 }, presentation: { creativity: 0, harmony: 0, energy: 0, choreography: 0 }, deductions: { stances: { hakdari: true, beomseogi: true, dwigubi: true }, minor: 0.0, major: 0.0 }};
					for( subcat in score.technical )    { score.technical[ subcat ]    = (parseInt( skills ) + parseInt( rand( 3 )))/10; }
					for( subcat in score.presentation ) { score.presentation[ subcat ] = (parseInt( skills ) + parseInt( rand( 3 )))/10; }
					var minor = rand( 8 ) - skill;
					var major = rand( 8 ) - skill;
					score.deductions.minor = minor > 0 ? rand( 2 * minor ) : 0;
					score.deductions.minor = major > 0 ? rand( major )     : 0;

					scores.push( score );
				}

				return scores;
			}

			$( '#send-scores' ).off( 'click' ).click(() => {
				var request = undefined;
				var j       = division.judges();
				var scores  = create_scores( j );
				var athlete = division.current.athlete();

				for( i = 0; i < j; i++ ) {
					sound.ok.play();
					var send = ( i, scores ) => { return () => {
						alertify.notify( 'Score for ' + athlete.display.name() + ' sent for ' + ( i == 0 ? 'Referee' : 'Judge ' + i ));
						score        = scores[ i ];
						request      = { data : { type : 'division', action : 'score', judge: i, score: score }};
						request.json = JSON.stringify( request.data );
						ws.send( request.json );
					}};
					setTimeout( send( i, scores ), ((i + rand( 5 )) * 500));
				}
			});
		</script>
	</body>
</html>
