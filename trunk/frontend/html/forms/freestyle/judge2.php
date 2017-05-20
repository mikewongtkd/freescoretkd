<?php 
	include( "../../include/php/config.php" ); 
?>
<html>
	<head>
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/bootstrap/css/freescore-theme.min.css" rel="stylesheet" />
		<link href="../../include/css/forms/freestyle/judgeController2.css" rel="stylesheet" />
		<link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/themes/default.min.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery.tappy.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/forms/freestyle/jquery.deductions.js"></script>
		<script src="../../include/js/forms/freestyle/athlete.class.js"></script>
		<script src="../../include/js/forms/freestyle/division.class.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/alertify/alertify.min.js"></script>

		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body>
		<div class="container">
			<div id="technical-skills">
				<table class="mandatory-foot-technique-1">
					<tr>
						<th rowspan=2>Jumping side kick height</td>
						<th rowspan=2><img class="mandatory-foot-technique-icon mandatory-foot-technique-1"   src="../../images/icons/freestyle/jumping-side-kick.png" width=60></th>
						<td>
							<div class="performance-description">
								<div class="poor">Below belt</div>
								<div class="good">Body</div>
								<div class="very-good">Head</div>
								<div class="excellent">Above head</div>
								<div class="perfect"></div>
							</div>
						</td>

					</tr><tr>
						<td class="button-group">
							<div id="jumping-side-kick" class="btn-group" data-toggle="buttons">
								<label class="btn btn-danger" ><input type="radio" name="jumping-side-kick">0.0</label>
								<label class="btn btn-warning"><input type="radio" name="jumping-side-kick">0.1</label>
								<label class="btn btn-warning"><input type="radio" name="jumping-side-kick">0.2</label>
								<label class="btn btn-warning"><input type="radio" name="jumping-side-kick">0.3</label>
								<label class="btn btn-success"><input type="radio" name="jumping-side-kick">0.4</label>
								<label class="btn btn-success"><input type="radio" name="jumping-side-kick">0.5</label>
								<label class="btn btn-success"><input type="radio" name="jumping-side-kick">0.6</label>
								<label class="btn btn-primary"><input type="radio" name="jumping-side-kick">0.7</label>
								<label class="btn btn-primary"><input type="radio" name="jumping-side-kick">0.8</label>
								<label class="btn btn-primary"><input type="radio" name="jumping-side-kick">0.9</label>
								<label class="btn btn-default"><input type="radio" name="jumping-side-kick">1.0</label>
							</div>
						</td>
					</tr>
				</table>

				<table class="mandatory-foot-technique-2">
					<tr>
						<th rowspan=2>Number of front kicks in a jump</th>
						<th rowspan=2><img class="mandatory-foot-technique-icon mandatory-foot-technique-2"   src="../../images/icons/freestyle/jumping-front-kick.png" width=60></th>
						<td>
							<div class="performance-description">
								<div class="poor">&lt;3</div>
								<div class="good">3 Apchagi</div>
								<div class="very-good">4 Apchagi</div>
								<div class="excellent">5 Apchagi</div>
								<div class="perfect"></div>
							</div>
						</td>
					</tr><tr>
						<td class="button-group">
							<div id="jumping-front-kicks" class="btn-group" data-toggle="buttons">
								<label class="btn btn-danger" ><input type="radio" name="jumping-front-kicks">0.0</label>
								<label class="btn btn-warning"><input type="radio" name="jumping-front-kicks">0.1</label>
								<label class="btn btn-warning"><input type="radio" name="jumping-front-kicks">0.2</label>
								<label class="btn btn-warning"><input type="radio" name="jumping-front-kicks">0.3</label>
								<label class="btn btn-success"><input type="radio" name="jumping-front-kicks">0.4</label>
								<label class="btn btn-success"><input type="radio" name="jumping-front-kicks">0.5</label>
								<label class="btn btn-success"><input type="radio" name="jumping-front-kicks">0.6</label>
								<label class="btn btn-primary"><input type="radio" name="jumping-front-kicks">0.7</label>
								<label class="btn btn-primary"><input type="radio" name="jumping-front-kicks">0.8</label>
								<label class="btn btn-primary"><input type="radio" name="jumping-front-kicks">0.9</label>
								<label class="btn btn-default"><input type="radio" name="jumping-front-kicks">1.0</label>
							</div>
						</td>
					</tr>
				</table>
				<table class="mandatory-foot-technique-3">
					<tr>
						<th rowspan=2>Jump spin kick degree of rotation</th>
						<th rowspan=2><img class="mandatory-foot-technique-icon mandatory-foot-technique-3"   src="../../images/icons/freestyle/jumping-spin-kick.png" width=60></th>
						<td>
							<div class="performance-description">
								<div class="poor">&lt;360&deg;</div>
								<div class="good">360&deg;&ndash;540&deg;</div>
								<div class="very-good">540&deg;&ndash;720&deg;</div>
								<div class="excellent">&gt;720&deg</div>
								<div class="perfect"></div>
							</div>
						</td>
					</tr><tr>
						<td class="button-group">
							<div id="jumping-spin-kick" class="btn-group" data-toggle="buttons">
								<label class="btn btn-danger" ><input type="radio" name="jumping-spin-kick">0.0</label>
								<label class="btn btn-warning"><input type="radio" name="jumping-spin-kick">0.1</label>
								<label class="btn btn-warning"><input type="radio" name="jumping-spin-kick">0.2</label>
								<label class="btn btn-warning"><input type="radio" name="jumping-spin-kick">0.3</label>
								<label class="btn btn-success"><input type="radio" name="jumping-spin-kick">0.4</label>
								<label class="btn btn-success"><input type="radio" name="jumping-spin-kick">0.5</label>
								<label class="btn btn-success"><input type="radio" name="jumping-spin-kick">0.6</label>
								<label class="btn btn-primary"><input type="radio" name="jumping-spin-kick">0.7</label>
								<label class="btn btn-primary"><input type="radio" name="jumping-spin-kick">0.8</label>
								<label class="btn btn-primary"><input type="radio" name="jumping-spin-kick">0.9</label>
								<label class="btn btn-default"><input type="radio" name="jumping-spin-kick">1.0</label>
							</div>
						</td>
					</tr>
				</table>
				<table class="mandatory-foot-technique-4">
					<tr>
						<th rowspan=2>Consecutive sparring kicks</th>
						<th rowspan=2><img class="mandatory-foot-technique-icon mandatory-foot-technique-4"   src="../../images/icons/freestyle/consecutive-kicks.png" width=60></th>
						<td>
							<div class="performance-description">
								<div class="poor">&lt;3 kicks</div>
								<div class="good">3&ndash;5 kicks; good</div>
								<div class="very-good">3&ndash;5 kicks; very good</div>
								<div class="excellent">3&ndash;5 kicks; excellent</div>
								<div class="perfect"></div>
							</div>
						</td>
					</tr><tr>
						<td class="button-group">
							<div id="consecutive-kicks" class="btn-group" data-toggle="buttons">
								<label class="btn btn-danger" ><input type="radio" name="consecutive-kicks">0.0</label>
								<label class="btn btn-warning"><input type="radio" name="consecutive-kicks">0.1</label>
								<label class="btn btn-warning"><input type="radio" name="consecutive-kicks">0.2</label>
								<label class="btn btn-warning"><input type="radio" name="consecutive-kicks">0.3</label>
								<label class="btn btn-success"><input type="radio" name="consecutive-kicks">0.4</label>
								<label class="btn btn-success"><input type="radio" name="consecutive-kicks">0.5</label>
								<label class="btn btn-success"><input type="radio" name="consecutive-kicks">0.6</label>
								<label class="btn btn-primary"><input type="radio" name="consecutive-kicks">0.7</label>
								<label class="btn btn-primary"><input type="radio" name="consecutive-kicks">0.8</label>
								<label class="btn btn-primary"><input type="radio" name="consecutive-kicks">0.9</label>
								<label class="btn btn-default"><input type="radio" name="consecutive-kicks">1.0</label>
							</div>
						</td>
					</tr>
				</table>
				<table class="mandatory-foot-technique-5">
					<tr>
						<th rowspan=2>Acrobatic actions</th>
						<th rowspan=2><img class="mandatory-foot-technique-icon mandatory-foot-technique-5"   src="../../images/icons/freestyle/acrobatic-kick.png" width=60></th>
						<td>
							<div class="performance-description">
								<div class="poor" style="font-size: 9pt !important;">No TKD kick</div>
								<div class="good">Low difficulty</div>
								<div class="very-good">Middle difficulty</div>
								<div class="excellent">High difficulty</div>
								<div class="perfect"></div>
							</div>
						</td>
					</tr><tr>
						<td class="button-group">
							<div id="acrobatic-kick" class="btn-group" data-toggle="buttons">
								<label class="btn btn-danger" ><input type="radio" name="acrobatic-kick">0.0</label>
								<label class="btn btn-warning"><input type="radio" name="acrobatic-kick">0.1</label>
								<label class="btn btn-warning"><input type="radio" name="acrobatic-kick">0.2</label>
								<label class="btn btn-warning"><input type="radio" name="acrobatic-kick">0.3</label>
								<label class="btn btn-success"><input type="radio" name="acrobatic-kick">0.4</label>
								<label class="btn btn-success"><input type="radio" name="acrobatic-kick">0.5</label>
								<label class="btn btn-success"><input type="radio" name="acrobatic-kick">0.6</label>
								<label class="btn btn-primary"><input type="radio" name="acrobatic-kick">0.7</label>
								<label class="btn btn-primary"><input type="radio" name="acrobatic-kick">0.8</label>
								<label class="btn btn-primary"><input type="radio" name="acrobatic-kick">0.9</label>
								<label class="btn btn-default"><input type="radio" name="acrobatic-kick">1.0</label>
							</div>
						</td>
					</tr>
				</table>

				<table class="basic-movements">
					<tr>
						<th rowspan=2>Technique &amp; practicality</th>
						<th rowspan=2><img class="mandatory-foot-technique-icon basic-movements" src="../../images/icons/freestyle/basic-movements.png" width=60></th>
						<td>
							<div class="performance-description">
								<div class="poor">Poor</div>
								<div class="good">Good</div>
								<div class="very-good">Very good</div>
								<div class="excellent">Excellent</div>
								<div class="perfect"></div>
							</div>
						</td>
					</tr><tr>
						<td class="button-group">
							<div id="basic-movements" class="btn-group" data-toggle="buttons">
								<label class="btn btn-warning"><input type="radio" name="basic-movements">0.0</label>
								<label class="btn btn-warning"><input type="radio" name="basic-movements">0.1</label>
								<label class="btn btn-warning"><input type="radio" name="basic-movements">0.2</label>
								<label class="btn btn-warning"><input type="radio" name="basic-movements">0.3</label>
								<label class="btn btn-warning"><input type="radio" name="basic-movements">0.4</label>
								<label class="btn btn-warning"><input type="radio" name="basic-movements">0.5</label>
								<label class="btn btn-warning"><input type="radio" name="basic-movements">0.6</label>
								<label class="btn btn-warning"><input type="radio" name="basic-movements">0.7</label>
								<label class="btn btn-warning"><input type="radio" name="basic-movements">0.8</label>
								<label class="btn btn-warning"><input type="radio" name="basic-movements">0.9</label>
								<label class="btn btn-warning"><input type="radio" name="basic-movements">1.0</label>
							</div>
						</td>
					</tr>
				</table>
			</div>

			<div id="controls">

				<div id="major-deductions"></div>
				<div id="stances">
					<div class="mandatory-stances hakdari-seogi"><img src="../../images/icons/freestyle/hakdari-seogi.png"><br>Hakdari Seogi</div>
					<div class="mandatory-stances beom-seogi"><img src="../../images/icons/freestyle/beom-seogi.png"><br>Beom Seogi</div>
					<div class="mandatory-stances dwigubi"><img src="../../images/icons/freestyle/dwigubi.png"><br>Dwigubi</div>
				</div>
				<div id="minor-deductions"></div>
			</div>

			<div id="presentation">
				<table>
					<tr>
						<th>Creativity</th>
						<td class="button-group">
							<div id="creativity" class="btn-group" data-toggle="buttons">
								<label class="btn btn-success"><input type="radio" name="creativity">0.0</label>
								<label class="btn btn-success"><input type="radio" name="creativity">0.1</label>
								<label class="btn btn-success"><input type="radio" name="creativity">0.2</label>
								<label class="btn btn-success"><input type="radio" name="creativity">0.3</label>
								<label class="btn btn-success"><input type="radio" name="creativity">0.4</label>
								<label class="btn btn-success"><input type="radio" name="creativity">0.5</label>
								<label class="btn btn-success"><input type="radio" name="creativity">0.6</label>
								<label class="btn btn-success"><input type="radio" name="creativity">0.7</label>
								<label class="btn btn-success"><input type="radio" name="creativity">0.8</label>
								<label class="btn btn-success"><input type="radio" name="creativity">0.9</label>
								<label class="btn btn-success"><input type="radio" name="creativity">1.0</label>
							</div>
						</td>
					</tr><tr>
						<td colspan=2>&nbsp;</td>
					</tr><tr>
						<th>Harmony</th>
						<td class="button-group">
							<div id="harmony" class="btn-group" data-toggle="buttons">
								<label class="btn btn-success"><input type="radio" name="harmony">0.0</label>
								<label class="btn btn-success"><input type="radio" name="harmony">0.1</label>
								<label class="btn btn-success"><input type="radio" name="harmony">0.2</label>
								<label class="btn btn-success"><input type="radio" name="harmony">0.3</label>
								<label class="btn btn-success"><input type="radio" name="harmony">0.4</label>
								<label class="btn btn-success"><input type="radio" name="harmony">0.5</label>
								<label class="btn btn-success"><input type="radio" name="harmony">0.6</label>
								<label class="btn btn-success"><input type="radio" name="harmony">0.7</label>
								<label class="btn btn-success"><input type="radio" name="harmony">0.8</label>
								<label class="btn btn-success"><input type="radio" name="harmony">0.9</label>
								<label class="btn btn-success"><input type="radio" name="harmony">1.0</label>
							</div>
						</td>
					</tr><tr>
						<td colspan=2>&nbsp;</td>
					</tr><tr>
						<th>Expression of Energy</th>
						<td class="button-group">
							<div id="energy" class="btn-group" data-toggle="buttons">
								<label class="btn btn-success"><input type="radio" name="energy">0.0</label>
								<label class="btn btn-success"><input type="radio" name="energy">0.1</label>
								<label class="btn btn-success"><input type="radio" name="energy">0.2</label>
								<label class="btn btn-success"><input type="radio" name="energy">0.3</label>
								<label class="btn btn-success"><input type="radio" name="energy">0.4</label>
								<label class="btn btn-success"><input type="radio" name="energy">0.5</label>
								<label class="btn btn-success"><input type="radio" name="energy">0.6</label>
								<label class="btn btn-success"><input type="radio" name="energy">0.7</label>
								<label class="btn btn-success"><input type="radio" name="energy">0.8</label>
								<label class="btn btn-success"><input type="radio" name="energy">0.9</label>
								<label class="btn btn-success"><input type="radio" name="energy">1.0</label>
							</div>
						</td>
					</tr><tr>
						<td colspan=2>&nbsp;</td>
					</tr><tr>
						<th>Music &amp; Choreography</th>
						<td class="button-group">
							<div id="choreography" class="btn-group" data-toggle="buttons">
								<label class="btn btn-success"><input type="radio" name="choreography">0.0</label>
								<label class="btn btn-success"><input type="radio" name="choreography">0.1</label>
								<label class="btn btn-success"><input type="radio" name="choreography">0.2</label>
								<label class="btn btn-success"><input type="radio" name="choreography">0.3</label>
								<label class="btn btn-success"><input type="radio" name="choreography">0.4</label>
								<label class="btn btn-success"><input type="radio" name="choreography">0.5</label>
								<label class="btn btn-success"><input type="radio" name="choreography">0.6</label>
								<label class="btn btn-success"><input type="radio" name="choreography">0.7</label>
								<label class="btn btn-success"><input type="radio" name="choreography">0.8</label>
								<label class="btn btn-success"><input type="radio" name="choreography">0.9</label>
								<label class="btn btn-success"><input type="radio" name="choreography">1.0</label>
							</div>
						</td>
					</tr>
				</table>
		</div>

		<div id="deductions">
			<div class="deduction-scores">
				<div class="deduction-component" id="major-deduction-score">
					<div class="component-label">Major deductions</div>
					<div class="component-score">0.0</div>
				</div>

				<div class="deduction-component" id="minor-deduction-score">
					<div class="component-label">Minor deductions</div>
					<div class="component-score">0.0</div>
				</div>
			</div>
			<div id="stance-deductions">
				<div class="mandatory-stances hakdari-seogi"><img src="../../images/icons/freestyle/hakdari-seogi.png"><br>Hakdari Seogi</div>
				<div class="mandatory-stances beom-seogi"><img src="../../images/icons/freestyle/beom-seogi.png"><br>Beom Seogi</div>
				<div class="mandatory-stances dwigubi"><img src="../../images/icons/freestyle/dwigubi.png"><br>Dwigubi</div>
			</div>
		</div>

		<script>
			var score       = { technical: {}, presentation: {}, deductions: { stances: { 'hakdari-seogi': 0.3, 'beom-seogi': 0.3, 'dwigubi': 0.3 }, timing: { start: undefined, stop: undefined }, minor: 0.0, major: 0.0 }};
			var performance = { timeline: [], start: false, complete: false };
			var sound       = {};
			var tournament  = <?= $tournament ?>;
			var judge       = { num: parseInt( isNaN( $.cookie( "judge" )) ? 0 : $.cookie( "judge" )) }; 
			var ring        = { num: parseInt( isNaN( $.cookie( "ring"  )) ? 1 : $.cookie( "ring"  )) }; 

			judge.name = judge.num == 0 ? 'Referee' : 'Judge ' + judge.num;
			$( '.judge-name' ).html( judge.name );

			sound.ok    = new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg" ]});
			sound.error = new Howl({ urls: [ "../../sounds/quack.mp3",    "../../sounds/quack.ogg"  ]});
			sound.next  = new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"   ]});
			sound.prev  = new Howl({ urls: [ "../../sounds/prev.mp3",     "../../sounds/prev.ogg"   ]});

			// ============================================================
			// INITIAL STATE: MOST EVERYTHING IS HIDDEN
			// ============================================================
			var state = {
				technical: {
					start : function() {
						$( '#presentation' ).hide();
						$( '#deductions' ).hide();
					},
				}
			};


			$( function() { state.technical.start(); });

			// ============================================================
			// COMMUNICATION WITH SERVICE
			// ============================================================
			var ws       = new WebSocket( 'ws://<?= $host ?>:3082/freestyle/' + tournament.db + '/' + ring.num );
			var previous = { athlete: { name: undefined }};

			ws.onopen = function() {
				var request  = { data : { type : 'division', action : 'read' }};
				request.json = JSON.stringify( request.data );
				ws.send( request.json );
			};

			ws.onmessage = function( response ) {
				var update = JSON.parse( response.data );
				if( ! defined( update.division )) { return; }
				if( $( '#total .alert' ).attr( 'sending' )) {
					sound.ok.play();
					alertify.success( "Score has been sent and received." );
				}
				var division = new Division( update.division );
				var athlete  = division.current.athlete(); 
				if( athlete.name() != previous.athlete.name ) {
					state.technical.start();
					$( '.athlete-name' ).html( ordinal( division.current.athleteId() + 1) + ' athlete ' + athlete.display.name() );
					previous.athlete.name = athlete.name();
				}
			}

			$( '#total' ).off( 'click' ).click(( ev ) => {
				var clicked = $( ev.target );
				if( ! clicked.is( '#total .alert' )) { clicked = clicked.parents( '#total' ).find( '.alert' ); }
				if( clicked.attr( 'sending' )) {
				} else {
					var request  = { data : { type : 'division', action : 'score', judge: judge.num, score: score, timeline: performance.timeline }};
					request.json = JSON.stringify( request.data );
					ws.send( request.json );
					clicked .attr({ sending: true }) .animate({ 'background-color' : '#888', 'border-color' : '#999' }, 400, 'swing', () => {
						clicked .removeAttr( 'sending' ) .animate({ 'background-color' : '#77b300', 'border-color' : '#809a00' }, 400 )
					});
				}
			});

		</script>
	</body>
</html>