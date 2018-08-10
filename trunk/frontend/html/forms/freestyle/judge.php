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
									<label class="btn btn-danger" ><input type="radio" name="consecutive-kicks" value="0.0">0.0</label>
									<label class="btn btn-warning"><input type="radio" name="consecutive-kicks" value="0.1">0.1</label>
									<label class="btn btn-warning"><input type="radio" name="consecutive-kicks" value="0.2">0.2</label>
									<label class="btn btn-warning"><input type="radio" name="consecutive-kicks" value="0.3">0.3</label>
									<label class="btn btn-success"><input type="radio" name="consecutive-kicks" value="0.4">0.4</label>
									<label class="btn btn-success"><input type="radio" name="consecutive-kicks" value="0.5">0.5</label>
									<label class="btn btn-success"><input type="radio" name="consecutive-kicks" value="0.6">0.6</label>
									<label class="btn btn-primary"><input type="radio" name="consecutive-kicks" value="0.7">0.7</label>
									<label class="btn btn-primary"><input type="radio" name="consecutive-kicks" value="0.8">0.8</label>
									<label class="btn btn-primary"><input type="radio" name="consecutive-kicks" value="0.9">0.9</label>
									<label class="btn btn-info"   ><input type="radio" name="consecutive-kicks" value="1.0">1.0</label>
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
									<label class="btn btn-danger" ><input type="radio" name="acrobatic-kicks" value="0.0">0.0</label>
									<label class="btn btn-warning"><input type="radio" name="acrobatic-kicks" value="0.1">0.1</label>
									<label class="btn btn-warning"><input type="radio" name="acrobatic-kicks" value="0.2">0.2</label>
									<label class="btn btn-warning"><input type="radio" name="acrobatic-kicks" value="0.3">0.3</label>
									<label class="btn btn-success"><input type="radio" name="acrobatic-kicks" value="0.4">0.4</label>
									<label class="btn btn-success"><input type="radio" name="acrobatic-kicks" value="0.5">0.5</label>
									<label class="btn btn-success"><input type="radio" name="acrobatic-kicks" value="0.6">0.6</label>
									<label class="btn btn-primary"><input type="radio" name="acrobatic-kicks" value="0.7">0.7</label>
									<label class="btn btn-primary"><input type="radio" name="acrobatic-kicks" value="0.8">0.8</label>
									<label class="btn btn-primary"><input type="radio" name="acrobatic-kicks" value="0.9">0.9</label>
									<label class="btn btn-info"   ><input type="radio" name="acrobatic-kicks" value="1.0">1.0</label>
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
									<label class="btn btn-danger" ><input type="radio" name="basic-movements" value="0.0">0.0</label>
									<label class="btn btn-warning"><input type="radio" name="basic-movements" value="0.1">0.1</label>
									<label class="btn btn-warning"><input type="radio" name="basic-movements" value="0.2">0.2</label>
									<label class="btn btn-warning"><input type="radio" name="basic-movements" value="0.3">0.3</label>
									<label class="btn btn-success"><input type="radio" name="basic-movements" value="0.4">0.4</label>
									<label class="btn btn-success"><input type="radio" name="basic-movements" value="0.5">0.5</label>
									<label class="btn btn-success"><input type="radio" name="basic-movements" value="0.6">0.6</label>
									<label class="btn btn-primary"><input type="radio" name="basic-movements" value="0.7">0.7</label>
									<label class="btn btn-primary"><input type="radio" name="basic-movements" value="0.8">0.8</label>
									<label class="btn btn-primary"><input type="radio" name="basic-movements" value="0.9">0.9</label>
									<label class="btn btn-info"   ><input type="radio" name="basic-movements" value="1.0">1.0</label>
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
									<label class="btn btn-success"><input type="radio" name="creativity" value="0.0">0.0</label>
									<label class="btn btn-success"><input type="radio" name="creativity" value="0.1">0.1</label>
									<label class="btn btn-success"><input type="radio" name="creativity" value="0.2">0.2</label>
									<label class="btn btn-success"><input type="radio" name="creativity" value="0.3">0.3</label>
									<label class="btn btn-success"><input type="radio" name="creativity" value="0.4">0.4</label>
									<label class="btn btn-success"><input type="radio" name="creativity" value="0.5">0.5</label>
									<label class="btn btn-success"><input type="radio" name="creativity" value="0.6">0.6</label>
									<label class="btn btn-success"><input type="radio" name="creativity" value="0.7">0.7</label>
									<label class="btn btn-success"><input type="radio" name="creativity" value="0.8">0.8</label>
									<label class="btn btn-success"><input type="radio" name="creativity" value="0.9">0.9</label>
									<label class="btn btn-success"><input type="radio" name="creativity" value="1.0">1.0</label>
								</div>
							</td>
						</tr><tr>
							<td colspan=2>Harmony</td>
						</tr><tr>
							<td class="button-group">
								<div id="harmony" class="btn-group" data-toggle="buttons">
									<label class="btn btn-success"><input type="radio" name="harmony" value="0.0">0.0</label>
									<label class="btn btn-success"><input type="radio" name="harmony" value="0.1">0.1</label>
									<label class="btn btn-success"><input type="radio" name="harmony" value="0.2">0.2</label>
									<label class="btn btn-success"><input type="radio" name="harmony" value="0.3">0.3</label>
									<label class="btn btn-success"><input type="radio" name="harmony" value="0.4">0.4</label>
									<label class="btn btn-success"><input type="radio" name="harmony" value="0.5">0.5</label>
									<label class="btn btn-success"><input type="radio" name="harmony" value="0.6">0.6</label>
									<label class="btn btn-success"><input type="radio" name="harmony" value="0.7">0.7</label>
									<label class="btn btn-success"><input type="radio" name="harmony" value="0.8">0.8</label>
									<label class="btn btn-success"><input type="radio" name="harmony" value="0.9">0.9</label>
									<label class="btn btn-success"><input type="radio" name="harmony" value="1.0">1.0</label>
								</div>
							</td>
						</tr><tr>
							<td colspan=2>Expression of Energy</td>
						</tr><tr>
							<td class="button-group">
								<div id="energy" class="btn-group" data-toggle="buttons">
									<label class="btn btn-success"><input type="radio" name="energy" value="0.0">0.0</label>
									<label class="btn btn-success"><input type="radio" name="energy" value="0.1">0.1</label>
									<label class="btn btn-success"><input type="radio" name="energy" value="0.2">0.2</label>
									<label class="btn btn-success"><input type="radio" name="energy" value="0.3">0.3</label>
									<label class="btn btn-success"><input type="radio" name="energy" value="0.4">0.4</label>
									<label class="btn btn-success"><input type="radio" name="energy" value="0.5">0.5</label>
									<label class="btn btn-success"><input type="radio" name="energy" value="0.6">0.6</label>
									<label class="btn btn-success"><input type="radio" name="energy" value="0.7">0.7</label>
									<label class="btn btn-success"><input type="radio" name="energy" value="0.8">0.8</label>
									<label class="btn btn-success"><input type="radio" name="energy" value="0.9">0.9</label>
									<label class="btn btn-success"><input type="radio" name="energy" value="1.0">1.0</label>
								</div>
							</td>
						</tr><tr>
							<td colspan=2>Music &amp; Choreography</td>
						</tr><tr>
							<td class="button-group">
								<div id="choreography" class="btn-group" data-toggle="buttons">
									<label class="btn btn-success"><input type="radio" name="choreography" value="0.0">0.0</label>
									<label class="btn btn-success"><input type="radio" name="choreography" value="0.1">0.1</label>
									<label class="btn btn-success"><input type="radio" name="choreography" value="0.2">0.2</label>
									<label class="btn btn-success"><input type="radio" name="choreography" value="0.3">0.3</label>
									<label class="btn btn-success"><input type="radio" name="choreography" value="0.4">0.4</label>
									<label class="btn btn-success"><input type="radio" name="choreography" value="0.5">0.5</label>
									<label class="btn btn-success"><input type="radio" name="choreography" value="0.6">0.6</label>
									<label class="btn btn-success"><input type="radio" name="choreography" value="0.7">0.7</label>
									<label class="btn btn-success"><input type="radio" name="choreography" value="0.8">0.8</label>
									<label class="btn btn-success"><input type="radio" name="choreography" value="0.9">0.9</label>
									<label class="btn btn-success"><input type="radio" name="choreography" value="1.0">1.0</label>
								</div>
							</td>
						</tr>
					</table>
					<a id="presentation-next" class="btn btn-success next-button disabled">Review</a>
				</div>

				<div id="review" role="tabpanel" class="tab-pane fade">
					<h1>Review &amp; Send</h1>
					<p>Review your score and touch <b>Send</b> when ready.</p>
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

						<div class="technical-component" id="basic-score">
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
						<div class="deduction-component" id="major-score">
							<div class="component-label">Major deductions</div>
							<div class="component-score">0.0</div>
						</div>

						<div class="deduction-component" id="minor-score">
							<div class="component-label">Minor deductions</div>
							<div class="component-score">0.0</div>
						</div>
					</div>

					<div class="total-scores">
						<div class="total-component" id="total-score">
							<div class="component-label"><div class="athlete-name"></div><div class="score-label">Total Score</div></div>
							<div class="component-score">0.0</div>
						</div>
					</div>

					<a id="send" class="btn btn-success">Send</a>
				</div>
			</div>
		</div>

		<script>
			var score        = { technical: {}, presentation: {}, deductions: { stances: { hakdari: false, beomseogi: false, dwigubi: false }, minor: 0.0, major: 0.9 }};
			var performance  = { timeline: [], start: false, complete: false };
			var sound        = {};
			var tournament   = <?= $tournament ?>;
			var judge        = { num: parseInt( <?= $judge ?> )}; 
			var ring         = { num: parseInt( <?= $ring ?> )}; 
			var html         = FreeScore.html;
			var refresh      = {};
			var division     = undefined;
			var presentation = { creativity : false, harmony : false, energy : false, choreography : false };
			var scored       = {};
			var sent         = false;

			judge.name = judge.num == 0 ? 'Referee' : 'Judge ' + judge.num;
			$( '.judge-name' ).html( judge.name );

			sound.ok    = new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg" ]});
			sound.error = new Howl({ urls: [ "../../sounds/quack.mp3",    "../../sounds/quack.ogg"  ]});
			sound.next  = new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"   ]});
			sound.prev  = new Howl({ urls: [ "../../sounds/prev.mp3",     "../../sounds/prev.ogg"   ]});

			// ============================================================
			// BEHAVIOR
			// ============================================================
			$( "input[type=radio][name='jumping-side-kick']"   ).change(( e ) => { score.technical.mft1            = $( e.target ).val(); refresh.score( 'technical', 'mft1'  ); $( '#mft1-next' ).removeClass( 'disabled' ); });
			$( "input[type=radio][name='jumping-front-kicks']" ).change(( e ) => { score.technical.mft2            = $( e.target ).val(); refresh.score( 'technical', 'mft2'  ); $( '#mft2-next' ).removeClass( 'disabled' ); });
			$( "input[type=radio][name='jumping-spin-kick']"   ).change(( e ) => { score.technical.mft3            = $( e.target ).val(); refresh.score( 'technical', 'mft3'  ); $( '#mft3-next' ).removeClass( 'disabled' ); });
			$( "input[type=radio][name='consecutive-kicks']"   ).change(( e ) => { score.technical.mft4            = $( e.target ).val(); refresh.score( 'technical', 'mft4'  ); $( '#mft4-next' ).removeClass( 'disabled' ); });
			$( "input[type=radio][name='acrobatic-kicks']"     ).change(( e ) => { score.technical.mft5            = $( e.target ).val(); refresh.score( 'technical', 'mft5'  ); $( '#mft5-next' ).removeClass( 'disabled' ); });
			$( "input[type=radio][name='basic-movements']"     ).change(( e ) => { score.technical.basic           = $( e.target ).val(); refresh.score( 'technical', 'basic' ); $( '#basic-next' ).removeClass( 'disabled' ); });
			$( "input[type=radio][name='creativity']"          ).change(( e ) => { score.presentation.creativity   = $( e.target ).val(); refresh.score( 'presentation'       ); presentation.complete( 'creativity' ); });
			$( "input[type=radio][name='harmony']"             ).change(( e ) => { score.presentation.harmony      = $( e.target ).val(); refresh.score( 'presentation'       ); presentation.complete( 'harmony' ); });
			$( "input[type=radio][name='energy']"              ).change(( e ) => { score.presentation.energy       = $( e.target ).val(); refresh.score( 'presentation'       ); presentation.complete( 'energy' ); });
			$( "input[type=radio][name='choreography']"        ).change(( e ) => { score.presentation.choreography = $( e.target ).val(); refresh.score( 'presentation'       ); presentation.complete( 'choreography' ); });

			// ===== MAJOR AND MINOR DEDUCTIONS
			$( '#major-deductions' ).deductions({ value : 0.3, count: 3, limit: 3 });
			$( '#major-deductions' ).on( 'change', ( e, total ) => { score.deductions.major = total; refresh.score( 'deductions' ); });
			$( '#minor-deductions' ).deductions({ value : 0.1 });
			$( '#minor-deductions' ).on( 'change', ( e, total ) => { score.deductions.minor = total; refresh.score( 'deductions' ); });

			// ===== STANCES
			$( '#ms-hakdari'   ).off( 'click' ).click(() => { refresh.deductions( 'hakdari' )});
			$( '#ms-beomseogi' ).off( 'click' ).click(() => { refresh.deductions( 'beomseogi' )});
			$( '#ms-dwigubi'   ).off( 'click' ).click(() => { refresh.deductions( 'dwigubi' )});

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

				if( defined( update.error )) {
					if( update.error.match( /Division not in ring/i )) { alertify.error( "No division in ring" ); }
				}

				if( ! defined( update.division )) { return; }
				if( $( '#total .alert' ).attr( 'sending' )) {
					sound.ok.play();
					alertify.success( "Score has been sent and received." );
				}
				division = new Division( update.division );
				if( ! defined( division )) { return; }

				if( update.action == 'update' && update.type == 'division' ) {
					if( defined( update.request )) {
						if( update.request.action == 'score' && sent ) {
							alertify.success( 'Score for ' + previous.athlete.name + ' received.' );
							sound.ok.play();
							$( '#send' ).html( 'Resend' );
							sent = false;
						}
					}
					var athlete  = division.current.athlete(); 
					if( athlete.name() != previous.athlete.name ) {
						alertify.success( 'Ready to score for ' + athlete.display.name() );
						refresh.division( division );
						previous.athlete.name = athlete.name();
					}
				}
			}

			// ===== REFRESH UI
			refresh.ui = ( score ) => {
				var tech = { mft1 : 'jumping-side-kick', mft2 : 'jumping-front-kicks', mft3 : 'jumping-spin-kicks', mft4 : 'consecutive-kicks', mft5 : 'acrobatic-kicks', basic : 'basic-movements' };
				for( i in score.technical ) {
					var value = score.technical[ i ];
					var id    = "input[type=radio][name='" + tech[ i ] + "'][value='" + value + "']";
					$( id ).click();
				}
				for( i in score.presentation ) {
					var value = score.presentation[ i ];
					var id    = "input[type=radio][name='" + i + "'][value='" + value + "']";
					$( id ).click();
				}
				var missed = 3;
				for( i in score.deductions.stances ) {
					console.log( i, score.deductions.stances[ i ] );
					if( ! score.deductions.stances[ i ] ) { continue; }
					var id = '#ms-' + i;
					$( id ).click();
					$( id ).addClass( 'done' );
					missed--;
				}
				var m = Math.round( score.deductions.major / 0.3 );
				var n = Math.round( score.deductions.minor / 0.1 );
				var major = $( '#major-deductions' );
				var minor = $( '#minor-deductions' );

				major.deductions({ count: m + missed, limit: missed });
				minor.deductions({ count: n });

				$( '.next-button' ).html( 'OK' );
				$( '#presentation-next' ).html( 'Review' );
			};

			// ===== REFRESH DIVISION
			refresh.division = ( division ) => {
				var athlete = division.current.athlete();

				// Reset the UI
				$( '.btn-group' ).find( 'label' ).removeClass( 'active' ).end().find( "[type='radio']" ).prop( 'checked', false );
				$( '.next-button' ).addClass( 'disabled' );
				$( '#controls-next' ).removeClass( 'disabled' );

				// Reset the Score
				if( defined( athlete.scores() ) && defined( athlete.scores())[ <?= $judge ?> ]) {
					score  = (athlete.scores())[ <?= $judge ?> ];
					refresh.ui( score );
					setTimeout(() => { $( '#review-tab' ).tab( 'show' ); }, 150 );

				} else {
					scored = {};
					score = { technical: { mft1: 0, mft2: 0, mft3: 0, mft4: 0, mft5: 0, basic: 0 }, presentation: { creativity: 0, harmony: 0, energy: 0, choreography: 0 }, deductions: { stances: { hakdari: false, beomseogi: false, dwigubi: false }, minor: 0.0, major: 0.9 }};
				}
					console.log( scored );

				[ 'mft1', 'mft2', 'mft3', 'mft4', 'mft5', 'basic' ].forEach(( category ) => { refresh.score( 'technical', category ); });
				var major = $( '#major-deductions' );
				major.deductions({ count: 3 });
				$( '.mandatory-stances' ).removeClass( 'done' );
				refresh.score( 'deductions' );
				refresh.score( 'presentation' );

				// Reset the athlete ID
				$( '.athlete-name' ).html( ordinal( division.current.athleteId() + 1) + ' athlete ' + athlete.display.name() );
				$( '.athlete' ).empty().append( 
					html.div.clone().addClass( 'division' ).append( division.summary()),
					html.div.clone().addClass( 'name'     ).append( athlete.display.name()),
					html.div.clone().addClass( 'progress' ).append( division.current.progress() + ' in the ' + division.current.round() + ' Round' )
				);

				// Re-label the Send button as 'Send' instead of 'Resend'
				$( '#send' ).html( 'Send' );

				// Start with Jumping Side Kick
				$( '#mft1-tab' ).tab( 'show' );
			};

			// ===== SCORING RADIO BUTTONS
			presentation.complete = ( category ) => {
				presentation[ category ] = true;
				var complete = true;
				[ 'creativity', 'harmony', 'energy', 'choreography' ].forEach(( c ) => {
					if( ! presentation[ c ] ) { complete = false; return; }
				});
				if( complete ) { $( '#presentation-next' ).removeClass( 'disabled' ); }
			};

			// ===== REFRESH DEDUCTIONS AND STANCES
			refresh.deductions = ( category ) => {
				var major  = $( '#major-deductions' );
				var n      = major.deductions( 'count' );
				if( ! score.deductions.stances[ category ]   ) { 
					score.deductions.stances[ category ] = true; 
					$( '#ms-' + category  ).addClass( 'done' ); 
					n--;

				} else { 
					score.deductions.stances[ category ] = false; 
					$( '#ms-' + category  ).removeClass( 'done' ); 
					n++;
				} 
				var missing = [ 'hakdari', 'beomseogi', 'dwigubi' ].reduce(( acc, stance ) => { if( score.deductions.stances[ stance ] ) { return acc - 1; } else { return acc; }}, 3);
				major.deductions({ count: n, limit: missing }); 
				score.deductions.major = major.deductions( 'total' ); 
				refresh.score( 'deductions' ); 
			};

			// ===== NEXT BUTTONS
			refresh.score = ( group, category ) => {
				if( group == 'technical' ) {
					var value = parseFloat( score[ group ][ category ] );
					var id    = '#' + category + '-score';
					var view  = $( id + ' .component-score' );
					view.html( value.toFixed( 1 ));

				} else if( group == 'deductions' ) {
					[ 'major', 'minor' ].forEach(( category ) => {
						var value = parseFloat( score[ group ][ category ] );
						var id    = '#' + category + '-score';
						var view  = $( id + ' .component-score' );
						view.html( '-' + value.toFixed( 1 ));
					});

				} else if( group =='presentation' ) {
					[ 'creativity', 'harmony', 'energy', 'choreography' ].forEach(( category ) => {
						var value = parseFloat( score[ group ][ category ] );
						var id    = '#' + category + '-score';
						var view  = $( id + ' .component-score' );
						view.html( value.toFixed( 1 ));
					});

				} else {
					return;
				}
				var technical    = 0.0; for( i in score.technical    ) { technical    += parseFloat( score.technical[ i ]); }
				var presentation = 0.0; for( i in score.presentation ) { presentation += parseFloat( score.presentation[ i ]); }
				var deductions   = parseFloat( score.deductions.major ) + parseFloat( score.deductions.minor );
				var total        = technical + presentation - deductions;
				$( '#total-score .component-score' ).html( total.toFixed( 1 ));
			};
			refresh.score( 'deductions' );
			$( '#mft1-next' )         .off( 'click' ).click(() => { sound.next.play(); scored.mft1         = true; setTimeout( () => { $( '#mft1-next'     ).html( 'Review' ); }, 750 ); if( scored.mft2         ) { $( '#review-tab' ).tab( 'show' ); } else { $( '#mft2-tab'         ).tab( 'show' ); }});
			$( '#mft2-next' )         .off( 'click' ).click(() => { sound.next.play(); scored.mft2         = true; setTimeout( () => { $( '#mft2-next'     ).html( 'Review' ); }, 750 ); if( scored.mft3         ) { $( '#review-tab' ).tab( 'show' ); } else { $( '#mft3-tab'         ).tab( 'show' ); }});
			$( '#mft3-next' )         .off( 'click' ).click(() => { sound.next.play(); scored.mft3         = true; setTimeout( () => { $( '#mft3-next'     ).html( 'Review' ); }, 750 ); if( scored.mft4         ) { $( '#review-tab' ).tab( 'show' ); } else { $( '#mft4-tab'         ).tab( 'show' ); }});
			$( '#mft4-next' )         .off( 'click' ).click(() => { sound.next.play(); scored.mft4         = true; setTimeout( () => { $( '#mft4-next'     ).html( 'Review' ); }, 750 ); if( scored.mft5         ) { $( '#review-tab' ).tab( 'show' ); } else { $( '#mft5-tab'         ).tab( 'show' ); }});
			$( '#mft5-next' )         .off( 'click' ).click(() => { sound.next.play(); scored.mft5         = true; setTimeout( () => { $( '#mft5-next'     ).html( 'Review' ); }, 750 ); if( scored.basic        ) { $( '#review-tab' ).tab( 'show' ); } else { $( '#basic-tab'        ).tab( 'show' ); }});
			$( '#basic-next' )        .off( 'click' ).click(() => { sound.next.play(); scored.basic        = true; setTimeout( () => { $( '#basic-next'    ).html( 'Review' ); }, 750 ); if( scored.controls     ) { $( '#review-tab' ).tab( 'show' ); } else { $( '#controls-tab'     ).tab( 'show' ); }});
			$( '#controls-next' )     .off( 'click' ).click(() => { sound.next.play(); scored.controls     = true; setTimeout( () => { $( '#controls-next' ).html( 'Review' ); }, 750 ); if( scored.presentation ) { $( '#review-tab' ).tab( 'show' ); } else { $( '#presentation-tab' ).tab( 'show' ); }});
			$( '#presentation-next' ) .off( 'click' ).click(() => { sound.next.play(); scored.presentation = true; $( '#review-tab'       ).tab( 'show' ); });

			// ===== REVIEW BUTTONS
			$( '#mft1-score' )          .off( 'click' ).click(() => { $( '#mft1-tab'         ).tab( 'show' ); });
			$( '#mft2-score' )          .off( 'click' ).click(() => { $( '#mft2-tab'         ).tab( 'show' ); });
			$( '#mft3-score' )          .off( 'click' ).click(() => { $( '#mft3-tab'         ).tab( 'show' ); });
			$( '#mft4-score' )          .off( 'click' ).click(() => { $( '#mft4-tab'         ).tab( 'show' ); });
			$( '#mft5-score' )          .off( 'click' ).click(() => { $( '#mft5-tab'         ).tab( 'show' ); });
			$( '#basic-score' )         .off( 'click' ).click(() => { $( '#basic-tab'        ).tab( 'show' ); });
			$( '.presentation-scores' ) .off( 'click' ).click(() => { $( '#presentation-tab' ).tab( 'show' ); });
			$( '.deduction-scores' )    .off( 'click' ).click(() => { $( '#controls-tab'     ).tab( 'show' ); });

			// ===== SEND BUTTON
			$( '#send' ).off( 'click' ).click(( ev ) => {
				var athlete = division.current.athlete();
				sound.next.play();
				alertify.notify( 'Score for ' + athlete.display.name() + ' sent.' );
				var request  = { data : { type : 'division', action : 'score', judge: judge.num, score: score }};
				request.json = JSON.stringify( request.data );
				ws.send( request.json );
				$( '#send' ).addClass( 'disabled' );
				setTimeout( () => { $( '#send' ).removeClass( 'disabled' ) }, 3000 );
				sent = true;
			});

		</script>
	</body>
</html>
