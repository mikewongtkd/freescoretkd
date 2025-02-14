<?php 
	include( "../../../include/php/config.php" ); 
	$t = json_decode( $tournament );
	$ringnum = isset( $_GET[ 'ring' ]) ? $_GET[ 'ring' ] : 'staging';
?>
<html>
	<head>
		<link href="../../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/css/freescore-theme.min.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../../include/alertify/css/themes/default.min.css" rel="stylesheet" />
		<link href="../../../include/css/forms/worldclass/test/client.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../../include/jquery/js/jquery.tappy.js"></script>
		<script src="../../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../../include/js/freescore.js"></script>
		<script src="../../../include/js/forms/worldclass/score.class.js"></script>
		<script src="../../../include/js/forms/worldclass/athlete.class.js"></script>
		<script src="../../../include/js/forms/worldclass/division.class.js"></script>
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
			<div id="send"><a id="send-scores" class="btn btn-success disabled">Send scores</a><a id="clear-scores" class="btn btn-danger disabled" style="margin-left: 40px;">Clear Scores</a></div>

		</div>
		<script>
			$.cookie.json = true;
			let sound         = {};
			let state         = { current: { divid: null }, skill: {}};
			let division      = undefined;
			let tournament    = <?= $tournament ?>;
			let ring          = { num: '<?= $ringnum ?>' };
			let ws            = new WebSocket( `<?= $config->websocket( 'worldclass', $ringnum ) ?>` );
			const skills      = [ 4, 5, 5, 5, 5, 6, 6, 7 ];
			const contestants = [ 'chung', 'hong' ];

			function rand( x ) { return Math.floor( Math.random() * x ); };
			function create_score( skill ) {

				let score  = { major: 0.0, minor: 0.0, power: 0.0, rhythm: 0.0, ki: 0.0 };
				[ 'power', 'rhythm', 'ki' ].forEach(( p ) => { score[ p ] = (Math.floor( 2.5 * skill) + parseInt( rand( 3 )))/10; });
				let minor = rand( 12 ) - skill;
				let major = rand( 8  ) - skill;
				score.minor = minor > 0 ? (rand( 2 * minor ) + 3)/10 : (3 + rand( 3 ))/10;
				score.major = major > 0 ? (rand( major ) * 3    )/10 : 0;

				return score;
			}


			if( $.cookie( 'test' )) { state = $.cookie( 'test' ); }

			ws.onopen = () => {
				let request  = { data : { type : 'division', action : 'read' }};
				request.json = JSON.stringify( request.data );
				ws.send( request.json );
			};

			ws.onmessage = ( response ) => {
				let update = JSON.parse( response.data );
				console.log( update );

				if( defined( update.error )) {
					if( update.error.match( /Division not in ring/i )) { alertify.error( "No division in ring " + ring.num ); }
				}

				if( ! defined( update.division )) { return; }

				division = new Division( update.division );
				if( ! defined( division )) { return; }

				// ASSIGN EACH PLAYER A SKILL LEVEL
				if( state.current.divid != division.name() ) {
					$.removeCookie( 'test' );
					state.current.divid = division.name();
					division.athletes().forEach( athlete => state.skill[ athlete.id() ] = skills[ rand( skills.length )]);
					$.cookie( 'test', state );
				}

				if( update.action == 'update' && update.type == 'division' ) {
					let match    = division.current.match();
					let athletes = match.order.filter( i => defined( i )).map( i => division.athlete( i ).display.name( 16 )).join( ' and ' );
					$( '#send-scores, #send-one-score, #clear-scores' ).removeClass( 'disabled' );
					$( '#athlete' ).html( athletes );
				}
			};

			sound.ok    = new Howl({ urls: [ "../../../sounds/upload.mp3",   "../../../sounds/upload.ogg" ]});
			sound.error = new Howl({ urls: [ "../../../sounds/quack.mp3",    "../../../sounds/quack.ogg"  ]});
			sound.next  = new Howl({ urls: [ "../../../sounds/next.mp3",     "../../../sounds/next.ogg"   ]});
			sound.prev  = new Howl({ urls: [ "../../../sounds/prev.mp3",     "../../../sounds/prev.ogg"   ]});

			$( "input[type=radio][name='ring']"   ).change(( e ) => { 
				$.removeCookie( 'test' );
				ring.num = $( e.target ).val(); 
				window.location = `?ring=${ring.num}`;
			});


			$( '#send-scores' ).off( 'click' ).click(() => {
				let request  = undefined;
				let n        = division.judges();
				let match    = division.current.match();
				let athletes = {};
				let scores   = [];

				contestants.forEach( contestant => {
					if( isNaN( match[ contestant ])) { return; }
					athletes[ contestant ] = division.athlete( match[ contestant ]);
				});

				for( let j = 0; j < n; j++ ) {
					let score = {};
					Object.entries( athletes ).forEach(([ contestant, athlete ]) => {
						let aid = athlete.id();
						score[ contestant ] = create_score( state.skill[ aid ]);
						score[ contestant ].index = aid;
					});
					scores.push( score );
				}

				sound.ok.play();
				for( i = 0; i < n; i++ ) {
					let send = ( i, scores ) => { return () => {
						alertify.notify( `Score for ${athletes.chung.display.name()} and ${athletes.hong.display.name()} sent for ${( i == 0 ? 'Referee' : 'Judge ' + i )}` );
						request = { data : { type : 'division', action : 'score', score: { match: match.number }, judge: i, cookie : { judge: i }}};
						contestants.forEach( contestant => {
							score = scores[ i ];
							request.data.score[ contestant ] = score[ contestant ];
						});
						request.json = JSON.stringify( request.data );
						ws.send( request.json );
						console.log( request.data );
					}};
					setTimeout( send( i, scores ), (((i + rand( 5 )) * 500) + rand( 250 )));
				}
			});

			$( '#clear-scores' ).off( 'click' ).click(() => {
				let j       = division.judges();
				let athlete = division.current.athlete();

				alertify.notify( `Clearing scores for ${athlete.display.name()}` );
				for( i = 0; i < j; i++ ) {
					let request  = { data : { type : 'division', action : 'clear judge score', judge: i }};
					request.json = JSON.stringify( request.data );
					ws.send( request.json );
					console.log( request.data );
				}
			});

		</script>
	</body>
</html>
