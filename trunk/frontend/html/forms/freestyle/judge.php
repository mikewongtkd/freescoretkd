<?php 
	include( "../../include/php/config.php" ); 
	$judge = $_GET[ 'judge' ] ? $_GET[ 'judge' ] : ($_COOKIE[ 'judge' ] ? $_COOKIE[ 'judge' ] : 0);
	$ring  = $_GET[ 'ring' ]  ? $_GET[ 'ring' ]  : ($_COOKIE[ 'ring' ]  ? $_COOKIE[ 'ring' ]  : 1);
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
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/forms/freestyle/jquery.deductions.js"></script>
		<script src="../../include/js/forms/freestyle/athlete.class.js"></script>
		<script src="../../include/js/forms/freestyle/division.class.js"></script>
		<script src="../../include/alertify/alertify.min.js"></script>

		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta charset="UTF-8">
		<meta name="google" content="notranslate">
		<meta http-equiv="Content-Language" content="en">
	</head>
	<body>
		<div class="container">
			<div class="menu">
				<ul id="tabs" class="nav nav-pills nav-stacked" role="tablist">
					<li class="active" ><a href="#mft1"         id="mft1-tab"         role="tab" data-toggle="tab" >Jumping Side Kick</a><li>
					<li                ><a href="#mft2"         id="mft2-tab"         role="tab" data-toggle="tab" >Jumping Front Kicks</a><li>
					<li                ><a href="#mft3"         id="mft3-tab"         role="tab" data-toggle="tab" >Jumping Spin Kick</a><li>
					<li                ><a href="#mft4"         id="mft4-tab"         role="tab" data-toggle="tab" >Consecutive Kicks</a><li>
					<li                ><a href="#mft5"         id="mft5-tab"         role="tab" data-toggle="tab" >Acrobatic Kicks</a><li>
					<li                ><a href="#basic"        id="basic-tab"        role="tab" data-toggle="tab" >Basic Movements</a><li>
					<li                ><a href="#controls"     id="controls-tab"     role="tab" data-toggle="tab" >Stances &amp; Deductions</a><li>
					<li                ><a href="#presentation" id="presentation-tab" role="tab" data-toggle="tab" >Presentation</a><li>
					<li                ><a href="#review"       id="review-tab"       role="tab" data-toggle="tab" >Review &amp; Send</a><li>
				</ul>
			</div>
			<div id="tabpanels" class="tab-content">
				<div id="mft1" role="tabpanel" class="tab-pane active fade in">
					<img class="mft-icon" src="../../images/icons/freestyle/jumping-side-kick.png" width=150>
					<h1>Jumping Side Kick</h1>
					<p>Height of the jumping side kick</p>
					<table>
						<tr>
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
									<label class="btn btn-danger" ><input type="radio" name="jumping-side-kick" value="0.0">0.0</label>
									<label class="btn btn-warning"><input type="radio" name="jumping-side-kick" value="0.1">0.1</label>
									<label class="btn btn-warning"><input type="radio" name="jumping-side-kick" value="0.2">0.2</label>
									<label class="btn btn-warning"><input type="radio" name="jumping-side-kick" value="0.3">0.3</label>
									<label class="btn btn-success"><input type="radio" name="jumping-side-kick" value="0.4">0.4</label>
									<label class="btn btn-success"><input type="radio" name="jumping-side-kick" value="0.5">0.5</label>
									<label class="btn btn-success"><input type="radio" name="jumping-side-kick" value="0.6">0.6</label>
									<label class="btn btn-primary"><input type="radio" name="jumping-side-kick" value="0.7">0.7</label>
									<label class="btn btn-primary"><input type="radio" name="jumping-side-kick" value="0.8">0.8</label>
									<label class="btn btn-primary"><input type="radio" name="jumping-side-kick" value="0.9">0.9</label>
									<label class="btn btn-info"   ><input type="radio" name="jumping-side-kick" value="1.0">1.0</label>
								</div>
							</td>
						</tr>
					</table>
					<div class="athlete"></div>
					<a id="mft1-next" class="btn btn-success next-button disabled">OK</a>
				</div>

				<div id="mft2" role="tabpanel" class="tab-pane fade">
					<img class="mft-icon" src="../../images/icons/freestyle/jumping-front-kick.png" width=150>
					<h1>Jumping Front Kicks</h1>
					<p>Number of front kicks in a jump</p>
					<table>
						<tr>
							<td>
								<div class="performance-description">
									<div class="poor">&lt;3</div>
									<div class="good">3 kicks</div>
									<div class="very-good">4 kicks</div>
									<div class="excellent">5 kicks</div>
									<div class="perfect"></div>
								</div>
							</td>
						</tr><tr>
							<td class="button-group">
								<div id="jumping-front-kicks" class="btn-group" data-toggle="buttons">
									<label class="btn btn-danger" ><input type="radio" name="jumping-front-kicks" value="0.0">0.0</label>
									<label class="btn btn-warning"><input type="radio" name="jumping-front-kicks" value="0.1">0.1</label>
									<label class="btn btn-warning"><input type="radio" name="jumping-front-kicks" value="0.2">0.2</label>
									<label class="btn btn-warning"><input type="radio" name="jumping-front-kicks" value="0.3">0.3</label>
									<label class="btn btn-success"><input type="radio" name="jumping-front-kicks" value="0.4">0.4</label>
									<label class="btn btn-success"><input type="radio" name="jumping-front-kicks" value="0.5">0.5</label>
									<label class="btn btn-success"><input type="radio" name="jumping-front-kicks" value="0.6">0.6</label>
									<label class="btn btn-primary"><input type="radio" name="jumping-front-kicks" value="0.7">0.7</label>
									<label class="btn btn-primary"><input type="radio" name="jumping-front-kicks" value="0.8">0.8</label>
									<label class="btn btn-primary"><input type="radio" name="jumping-front-kicks" value="0.9">0.9</label>
									<label class="btn btn-info"   ><input type="radio" name="jumping-front-kicks" value="1.0">1.0</label>
								</div>
							</td>
						</tr>
					</table>
					<div class="athlete"></div>
					<a id="mft2-next" class="btn btn-success next-button disabled">OK</a>
				</div>
				<div id="mft3" role="tabpanel" class="tab-pane fade">
					<img class="mft-icon"   src="../../images/icons/freestyle/jumping-spin-kick.png" width=150>
					<h1>Jumping Spin Kick</h1>
					<p>Jump spin kick degree of rotation</p>
					<table>
						<tr>
							<td>
								<div class="performance-description">
									<div class="poor">&lt;360&deg;</div>
									<div class="good">&gt;360&deg;</div>
									<div class="very-good">&gt;540&deg;</div>
									<div class="excellent">&gt;720&deg</div>
									<div class="perfect"></div>
								</div>
							</td>
						</tr><tr>
							<td class="button-group">
								<div id="jumping-spin-kick" class="btn-group" data-toggle="buttons">
									<label class="btn btn-danger" ><input type="radio" name="jumping-spin-kick" value="0.0">0.0</label>
									<label class="btn btn-warning"><input type="radio" name="jumping-spin-kick" value="0.1">0.1</label>
									<label class="btn btn-warning"><input type="radio" name="jumping-spin-kick" value="0.2">0.2</label>
									<label class="btn btn-warning"><input type="radio" name="jumping-spin-kick" value="0.3">0.3</label>
									<label class="btn btn-success"><input type="radio" name="jumping-spin-kick" value="0.4">0.4</label>
									<label class="btn btn-success"><input type="radio" name="jumping-spin-kick" value="0.5">0.5</label>
									<label class="btn btn-success"><input type="radio" name="jumping-spin-kick" value="0.6">0.6</label>
									<label class="btn btn-primary"><input type="radio" name="jumping-spin-kick" value="0.7">0.7</label>
									<label class="btn btn-primary"><input type="radio" name="jumping-spin-kick" value="0.8">0.8</label>
									<label class="btn btn-primary"><input type="radio" name="jumping-spin-kick" value="0.9">0.9</label>
									<label class="btn btn-info"   ><input type="radio" name="jumping-spin-kick" value="1.0">1.0</label>
								</div>
							</td>
						</tr>
					</table>
					<div class="athlete"></div>
					<a id="mft3-next" class="btn btn-success next-button disabled">OK</a>
				</div>
				<div id="mft4" role="tabpanel" class="tab-pane fade">
					<img class="mft-icon"   src="../../images/icons/freestyle/consecutive-kicks.png" width=150>
					<h1>Consecutive Kicks</h1>
					<p>Up to 5 consecutive kicking techniques</p>
					<table>
						<tr>
							<td>
								<div class="performance-description">
									<div class="poor">&lt;3 kicks</div>
									<div class="good">Average</div>
									<div class="very-good">Good</div>
									<div class="excellent">Excellent</div>
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
									<label class="btn btn-info"   ><input type="radio" name="consecutive-kicks">1.0</label>
								</div>
							</td>
						</tr>
					</table>
					<div class="athlete"></div>
					<a id="mft4-next" class="btn btn-success next-button disabled">OK</a>
				</div>
				<div id="mft5" role="tabpanel" class="tab-pane fade">
					<img class="mft-icon"   src="../../images/icons/freestyle/acrobatic-kick.png" width=150>
					<h1>Acrobatic Kicks</h1>
					<p>Difficulty of acrobatic action with one or more kicks</p>
					<table>
						<tr>
							<td>
								<div class="performance-description">
									<div class="poor" style="font-size: 9pt !important;">No TKD kick</div>
									<div class="good">Average</div>
									<div class="very-good">Good</div>
									<div class="excellent">Excellent</div>
									<div class="perfect"></div>
								</div>
							</td>
						</tr><tr>
							<td class="button-group">
								<div id="acrobatic-kicks" class="btn-group" data-toggle="buttons">
									<label class="btn btn-danger" ><input type="radio" name="acrobatic-kicks">0.0</label>
									<label class="btn btn-warning"><input type="radio" name="acrobatic-kicks">0.1</label>
									<label class="btn btn-warning"><input type="radio" name="acrobatic-kicks">0.2</label>
									<label class="btn btn-warning"><input type="radio" name="acrobatic-kicks">0.3</label>
									<label class="btn btn-success"><input type="radio" name="acrobatic-kicks">0.4</label>
									<label class="btn btn-success"><input type="radio" name="acrobatic-kicks">0.5</label>
									<label class="btn btn-success"><input type="radio" name="acrobatic-kicks">0.6</label>
									<label class="btn btn-primary"><input type="radio" name="acrobatic-kicks">0.7</label>
									<label class="btn btn-primary"><input type="radio" name="acrobatic-kicks">0.8</label>
									<label class="btn btn-primary"><input type="radio" name="acrobatic-kicks">0.9</label>
									<label class="btn btn-info"   ><input type="radio" name="acrobatic-kicks">1.0</label>
								</div>
							</td>
						</tr>
					</table>
					<div class="athlete"></div>
					<a id="mft5-next" class="btn btn-success next-button disabled">OK</a>
				</div>

				<div id="basic" role="tabpanel" class="tab-pane fade">
					<img class="mft-icon basic-movements" src="../../images/icons/freestyle/basic-movements.png" width=150>
					<h1>Basic Movements</h1>
					<p>Technique &amp; Practicality</p>
					<table class="basic-movements">
						<tr>
							<th rowspan=2>Technique &amp; Practicality</th>
							<td>
								<div class="performance-description">
									<div class="poor">Poor</div>
									<div class="good">Average</div>
									<div class="very-good">Good</div>
									<div class="excellent">Excellent</div>
									<div class="perfect"></div>
								</div>
							</td>
						</tr><tr>
							<td class="button-group">
								<div id="basic-movements" class="btn-group" data-toggle="buttons">
									<label class="btn btn-danger" ><input type="radio" name="basic-movements">0.0</label>
									<label class="btn btn-warning"><input type="radio" name="basic-movements">0.1</label>
									<label class="btn btn-warning"><input type="radio" name="basic-movements">0.2</label>
									<label class="btn btn-warning"><input type="radio" name="basic-movements">0.3</label>
									<label class="btn btn-success"><input type="radio" name="basic-movements">0.4</label>
									<label class="btn btn-success"><input type="radio" name="basic-movements">0.5</label>
									<label class="btn btn-success"><input type="radio" name="basic-movements">0.6</label>
									<label class="btn btn-primary"><input type="radio" name="basic-movements">0.7</label>
									<label class="btn btn-primary"><input type="radio" name="basic-movements">0.8</label>
									<label class="btn btn-primary"><input type="radio" name="basic-movements">0.9</label>
									<label class="btn btn-info"   ><input type="radio" name="basic-movements">1.0</label>
								</div>
							</td>
						</tr>
					</table>
					<div class="athlete"></div>
					<a id="basic-next" class="btn btn-success next-button disabled">OK</a>
				</div>

				<div id="controls" role="tabpanel" class="tab-pane fade">
					<h1>Stances &amp; Deductions</h1>
					<div id="major-deductions" class="major-deductions"></div>
					<div id="stances">
						<div id="ms-hakdari"   class="mandatory-stances hakdari-seogi" ><img src="../../images/icons/freestyle/hakdari-seogi.png" ><br>Hakdari Seogi</div>
						<div id="ms-beomseogi" class="mandatory-stances beom-seogi"    ><img src="../../images/icons/freestyle/beom-seogi.png"    ><br>Beom Seogi</div>
						<div id="ms-dwigubi"   class="mandatory-stances dwigubi"       ><img src="../../images/icons/freestyle/dwigubi.png"       ><br>Dwigubi</div>
					</div>
					<div id="minor-deductions" class="minor-deductions"></div>
					<div class="athlete"></div>
					<a id="controls-next" class="btn btn-success next-button">OK</a>
				</div>

				<div id="presentation" role="tabpanel" class="tab-pane fade">
					<h1>Presentation</h1>
					<table>
						<tr>
							<td colspan=2>Creativity</td>
						</tr><tr>
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
							<td colspan=2>Harmony</td>
						</tr><tr>
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
							<td colspan=2>Expression of Energy</td>
						</tr><tr>
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
							<td colspan=2>Music &amp; Choreography</td>
						</tr><tr>
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
					<a id="presentation-next" class="btn btn-success next-button disabled">Review</a>
				</div>

				<div id="review" role="tabpanel" class="tab-pane fade">
					<h1>Review &amp; Send</h1>
					<p>Review your score. Choose from the menu on the left to make changes.</p>
					<div class="technical-scores">
						<div class="technical-component" id="mft1-score">
							<div class="component-label">Jumping side kick</div>
							<div class="component-score">0.0</div>
						</div>

						<div class="technical-component" id="mft2-score">
							<div class="component-label">Jumping front kicks</div>
							<div class="component-score">0.0</div>
						</div>

						<div class="technical-component" id="mft3-score">
							<div class="component-label">Jumping spin kick</div>
							<div class="component-score">0.0</div>
						</div>

						<div class="technical-component" id="mft4-score">
							<div class="component-label">Consecutive kicks</div>
							<div class="component-score">0.0</div>
						</div>

						<div class="technical-component" id="mft5-score">
							<div class="component-label">Acrobatic kick</div>
							<div class="component-score">0.0</div>
						</div>

						<div class="technical-component" id="basics-score">
							<div class="component-label">Basic movements</div>
							<div class="component-score">0.0</div>
						</div>
					</div>

					<div class="presentation-scores">
						<div class="presentation-component" id="creativity-score">
							<div class="component-label">Creativity</div>
							<div class="component-score">0.0</div>
						</div>

						<div class="presentation-component" id="harmony-score">
							<div class="component-label">Harmony</div>
							<div class="component-score">0.0</div>
						</div>

						<div class="presentation-component" id="energy-score">
							<div class="component-label">Expression of Energy</div>
							<div class="component-score">0.0</div>
						</div>

						<div class="presentation-component" id="choreography-score">
							<div class="component-label">Music &amp; Choreography</div>
							<div class="component-score">0.0</div>
						</div>
					</div>

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
				</div>
			</div>
		</div>

		<script>
			var score       = { technical: {}, presentation: {}, deductions: { stances: { hakdari: false, beomseogi: false, dwigubi: false }, minor: 0.0, major: 0.0 }};
			var performance = { timeline: [], start: false, complete: false };
			var sound       = {};
			var tournament  = <?= $tournament ?>;
			var judge       = { num: parseInt( <?= $judge ?> )}; 
			var ring        = { num: parseInt( <?= $ring ?> )}; 
			var html        = FreeScore.html;
			var refresh     = {};
			console.log( judge, ring, "<?= $_GET[ 'ring' ] . ' ' . $_GET[ 'judge' ] ?>" );

			judge.name = judge.num == 0 ? 'Referee' : 'Judge ' + judge.num;
			$( '.judge-name' ).html( judge.name );

			sound.ok    = new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg" ]});
			sound.error = new Howl({ urls: [ "../../sounds/quack.mp3",    "../../sounds/quack.ogg"  ]});
			sound.next  = new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"   ]});
			sound.prev  = new Howl({ urls: [ "../../sounds/prev.mp3",     "../../sounds/prev.ogg"   ]});

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
				console.log( update );

				if( ! defined( update.division )) { return; }
				if( $( '#total .alert' ).attr( 'sending' )) {
					sound.ok.play();
					alertify.success( "Score has been sent and received." );
				}
				var division = new Division( update.division );
				var athlete  = division.current.athlete(); 
				if( athlete.name() != previous.athlete.name ) {
					alertify.success( 'Ready to score for ' + athlete.display.name() );
					refresh.division( division );
					previous.athlete.name = athlete.name();
				}
			}

			// ===== REFRESH DIVISION
			refresh.division = ( division ) => {
				var athlete = division.current.athlete();
				$( 'input[type=radio]' ).prop( 'checked', false );
				$( '.athlete-name' ).html( ordinal( division.current.athleteId() + 1) + ' athlete ' + athlete.display.name() );
				$( '.athlete' ).empty().append( 
					html.div.clone().addClass( 'division' ).append( division.summary()),
					html.div.clone().addClass( 'name'     ).append( athlete.display.name()),
					html.div.clone().addClass( 'progress' ).append( division.current.progress() + ' Athletes in the ' + division.current.round() + ' Round' )
				);
			};

			// ===== SCORING RADIO BUTTONS
			var presentation = { creativity : false, harmony : false, energy : false, choreography : false };
			presentation.complete = ( category ) => {
				console.log( category );
				presentation[ category ] = true;
				var complete = true;
				[ 'creativity', 'harmony', 'energy', 'choreography' ].forEach(( c ) => {
					if( ! presentation[ c ] ) { console.log( presentation ); complete = false; return; }
				});
				if( complete ) { $( '#presentation-next' ).removeClass( 'disabled' ); }
			};
			$( "input[type=radio][name='jumping-side-kick']"   ).change(( e ) => { score.technical.mft1            = $( e.target ).val(); $( '#mft1-next' ).removeClass( 'disabled' ); });
			$( "input[type=radio][name='jumping-front-kicks']" ).change(( e ) => { score.technical.mft2            = $( e.target ).val(); $( '#mft2-next' ).removeClass( 'disabled' ); });
			$( "input[type=radio][name='jumping-spin-kick']"   ).change(( e ) => { score.technical.mft3            = $( e.target ).val(); $( '#mft3-next' ).removeClass( 'disabled' ); });
			$( "input[type=radio][name='consecutive-kicks']"   ).change(( e ) => { score.technical.mft4            = $( e.target ).val(); $( '#mft4-next' ).removeClass( 'disabled' ); });
			$( "input[type=radio][name='acrobatic-kicks']"     ).change(( e ) => { score.technical.mft5            = $( e.target ).val(); $( '#mft5-next' ).removeClass( 'disabled' ); });
			$( "input[type=radio][name='basic-movements']"     ).change(( e ) => { score.technical.basic           = $( e.target ).val(); $( '#basic-next' ).removeClass( 'disabled' ); });
			$( "input[type=radio][name='creativity']"          ).change(( e ) => { score.presentation.creativity   = $( e.target ).val(); presentation.complete( 'creativity' ); });
			$( "input[type=radio][name='harmony']"             ).change(( e ) => { score.presentation.harmony      = $( e.target ).val(); presentation.complete( 'harmony' ); });
			$( "input[type=radio][name='energy']"              ).change(( e ) => { score.presentation.energy       = $( e.target ).val(); presentation.complete( 'energy' ); });
			$( "input[type=radio][name='choreography']"        ).change(( e ) => { score.presentation.choreography = $( e.target ).val(); presentation.complete( 'choreography' ); });

			// ===== STANCES
			$( '#ms-hakdari'   ).off( 'click' ).click(() => { if( ! score.deductions.stances.hakdari   ) { score.deductions.stances.hakdari   = true; $( '#ms-hakdari'   ).addClass( 'done' ); $( '#major-deductions' ).deductions({ count: $( '#major-deductions' ).deductions( 'count' ) - 1 }); } else { score.deductions.stances.hakdari   = false; $( '#ms-hakdari'   ).removeClass( 'done' ); $( '#major-deductions' ).deductions({ count: $( '#major-deductions' ).deductions( 'count' ) + 1 });} });
			$( '#ms-beomseogi' ).off( 'click' ).click(() => { if( ! score.deductions.stances.beomseogi ) { score.deductions.stances.beomseogi = true; $( '#ms-beomseogi' ).addClass( 'done' ); $( '#major-deductions' ).deductions({ count: $( '#major-deductions' ).deductions( 'count' ) - 1 }); } else { score.deductions.stances.beomseogi = false; $( '#ms-beomseogi' ).removeClass( 'done' ); $( '#major-deductions' ).deductions({ count: $( '#major-deductions' ).deductions( 'count' ) + 1 });} });
			$( '#ms-dwigubi'   ).off( 'click' ).click(() => { if( ! score.deductions.stances.dwigubi   ) { score.deductions.stances.dwigubi   = true; $( '#ms-dwigubi'   ).addClass( 'done' ); $( '#major-deductions' ).deductions({ count: $( '#major-deductions' ).deductions( 'count' ) - 1 }); } else { score.deductions.stances.dwigubi   = false; $( '#ms-dwigubi'   ).removeClass( 'done' ); $( '#major-deductions' ).deductions({ count: $( '#major-deductions' ).deductions( 'count' ) + 1 });} });

			// ===== MAJOR AND MINOR DEDUCTIONS
			$( '#major-deductions' ).deductions({ value : 0.3, count : 3 });
			$( '#major-deductions' ).on( 'change', ( e, total ) => { score.deductions.major = total; });
			$( '#minor-deductions' ).deductions({ value : 0.1 });
			$( '#minor-deductions' ).on( 'change', ( e, total ) => { score.deductions.minor = total; });

			// ===== NEXT BUTTONS
			$( '#mft1-next' )         .off( 'click' ).click(() => { $( '#mft2-tab'         ).tab( 'show' ); });
			$( '#mft2-next' )         .off( 'click' ).click(() => { $( '#mft3-tab'         ).tab( 'show' ); });
			$( '#mft3-next' )         .off( 'click' ).click(() => { $( '#mft4-tab'         ).tab( 'show' ); });
			$( '#mft4-next' )         .off( 'click' ).click(() => { $( '#mft5-tab'         ).tab( 'show' ); });
			$( '#mft5-next' )         .off( 'click' ).click(() => { $( '#basic-tab'        ).tab( 'show' ); });
			$( '#basic-next' )        .off( 'click' ).click(() => { $( '#controls-tab'     ).tab( 'show' ); });
			$( '#controls-next' )     .off( 'click' ).click(() => { $( '#presentation-tab' ).tab( 'show' ); });
			$( '#presentation-next' ) .off( 'click' ).click(() => { $( '#review-tab'       ).tab( 'show' ); });

			// ===== SEND BUTTON
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
