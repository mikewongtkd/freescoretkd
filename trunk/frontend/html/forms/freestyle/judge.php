<?php 
	include( "../../include/php/config.php" ); 
?>
<html>
	<head>
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/bootstrap/css/freescore-theme.min.css" rel="stylesheet" />
		<link href="../../include/css/forms/freestyle/judgeController.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.tappy.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/forms/freestyle/jquery.deductions.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootbox.min.js"></script>

		<meta name="viewport" content="width=device-width, initial-scale=1">
	</head>
	<body>
		<div class="container">
			<div id="technical-skills">
				<div class="alert alert-default" role="alert"><strong>Technical Skills</strong>
					<div id="technical-score" class="pull-right subtotal">0.0</div>
					<div id="stances" class="btn-group pull-right" data-toggle="buttons-checkbox">
						<button type="button" class="btn btn-xs btn-warning">Hakdari Seogi</button>
						<button type="button" class="btn btn-xs btn-warning">Beom Seogi</button>
						<button type="button" class="btn btn-xs btn-warning">Dwitkubi</button>
					</div>
				</div>

				<table id="mandatory-foot-technique-1">
					<tr>
						<th rowspan=2>Jumping side kick height</td>
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
							<div id="jumping-side-kick-height" class="btn-group" data-toggle="buttons">
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

				<table id="mandatory-foot-technique-2">
					<tr>
						<th rowspan=2>Number of front kicks in a jump</th>
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
							<div id="jumping-front-kicks-count" class="btn-group" data-toggle="buttons">
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
				<table id="mandatory-foot-technique-3">
					<tr>
						<th rowspan=2>Jump spin kick degree of rotation</th>
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
							<div id="spinning-kick-degree" class="btn-group" data-toggle="buttons">
								<label class="btn btn-danger" ><input type="radio" name="spinning-kick">0.0</label>
								<label class="btn btn-warning"><input type="radio" name="spinning-kick">0.1</label>
								<label class="btn btn-warning"><input type="radio" name="spinning-kick">0.2</label>
								<label class="btn btn-warning"><input type="radio" name="spinning-kick">0.3</label>
								<label class="btn btn-success"><input type="radio" name="spinning-kick">0.4</label>
								<label class="btn btn-success"><input type="radio" name="spinning-kick">0.5</label>
								<label class="btn btn-success"><input type="radio" name="spinning-kick">0.6</label>
								<label class="btn btn-primary"><input type="radio" name="spinning-kick">0.7</label>
								<label class="btn btn-primary"><input type="radio" name="spinning-kick">0.8</label>
								<label class="btn btn-primary"><input type="radio" name="spinning-kick">0.9</label>
								<label class="btn btn-default"><input type="radio" name="spinning-kick">1.0</label>
							</div>
						</td>
					</tr>
				</table>
				<table id="mandatory-foot-technique-4">
					<tr>
						<th rowspan=2>Consecutive sparring kicks</th>
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
							<div id="sparring-kick-performance" class="btn-group" data-toggle="buttons">
								<label class="btn btn-danger" ><input type="radio" name="sparring-kicks">0.0</label>
								<label class="btn btn-warning"><input type="radio" name="sparring-kicks">0.1</label>
								<label class="btn btn-warning"><input type="radio" name="sparring-kicks">0.2</label>
								<label class="btn btn-warning"><input type="radio" name="sparring-kicks">0.3</label>
								<label class="btn btn-success"><input type="radio" name="sparring-kicks">0.4</label>
								<label class="btn btn-success"><input type="radio" name="sparring-kicks">0.5</label>
								<label class="btn btn-success"><input type="radio" name="sparring-kicks">0.6</label>
								<label class="btn btn-primary"><input type="radio" name="sparring-kicks">0.7</label>
								<label class="btn btn-primary"><input type="radio" name="sparring-kicks">0.8</label>
								<label class="btn btn-primary"><input type="radio" name="sparring-kicks">0.9</label>
								<label class="btn btn-default"><input type="radio" name="sparring-kicks">1.0</label>
							</div>
						</td>
					</tr>
				</table>
				<table id="mandatory-foot-technique-5">
					<tr>
						<th rowspan=2>Acrobatic actions</th>
						<td>
							<div class="performance-description">
								<div class="poor">No TKD kick</div>
								<div class="good">Low difficulty</div>
								<div class="very-good">Middle difficulty</div>
								<div class="excellent">High difficulty</div>
								<div class="perfect"></div>
							</div>
						</td>
					</tr><tr>
						<td class="button-group">
							<div id="acrobatic-difficulty" class="btn-group" data-toggle="buttons">
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
								<label class="btn btn-default"><input type="radio" name="acrobatic-kicks">1.0</label>
							</div>
						</td>
					</tr>
				</table>
				<table id="basic-movements-and-practicality">
					<tr>
						<th>Technique &amp; practicality</th>
						<td class="button-group">
							<div id="basic-movements-and-practicality" class="btn-group" data-toggle="buttons">
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

				<div class="technical-component jumping-side-kick">
					<div class="component-label">Jumping side kick</div>
					<div class="component-score">0.0</div>
				</div>

				<div class="technical-component jumping-front-kicks">
					<div class="component-label">Jumping front kicks</div>
					<div class="component-score">0.0</div>
				</div>

				<div class="technical-component jumping-spin-kick">
					<div class="component-label">Jumping spin kick</div>
					<div class="component-score">0.0</div>
				</div>

				<div class="technical-component consecutive-kicks">
					<div class="component-label">Consecutive kicks</div>
					<div class="component-score">0.0</div>
				</div>

				<div class="technical-component acrobatic-kick">
					<div class="component-label">Acrobatic kick</div>
					<div class="component-score">0.0</div>
				</div>
			</div>

			<div id="presentation">
				<div class="alert alert-default" role="alert"><strong>Presentation</strong>
					<div id="presentation-score" class="pull-right subtotal">0.0</div>
				</div>

				<table>
					<tr>
						<th>Creativity</th>
						<td class="button-group">
							<div id="creativity-score" class="btn-group" data-toggle="buttons">
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
							<div id="harmony-score" class="btn-group" data-toggle="buttons">
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
							<div id="energy-score" class="btn-group" data-toggle="buttons">
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
							<div id="choreography-score" class="btn-group" data-toggle="buttons">
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
			<div class="controls">
				<img class="mandatory-foot-technique-icon" src="../../images/icons/freestyle/jumping-side-kick.png">

				<div id="major-deductions"></div>
				<div id="minor-deductions"></div>
			</div>

		</div>

		<script>
			var score = { technical: {}, presentation: {}, deduction: {} };

			$( '#minor-deductions' ).deductions({ value: 0.1 });
			$( '#major-deductions' ).deductions({ value: 0.3 });

			// ===== MANDATORY STANCES BUTTON BEHAVIOR
			$( '#stances' ).find( '.btn' ).off( 'click' ).click(( b ) => {
				var clicked = $( b.target );
				if( clicked.hasClass( 'btn-warning' )) {
					clicked.removeClass( 'btn-warning' ).addClass( 'btn-success' );
				} else {
					clicked.removeClass( 'btn-success active' ).addClass( 'btn-warning' );
				}
				setTimeout( function() { clicked.removeClass( 'active' ) }, 20 );
			});

			// ===== TECHNICAL SKILLS BUTTON BEHAVIOR
			var display = { order : {
				'mandatory-foot-technique-1'       : 'mandatory-foot-technique-2',
				'mandatory-foot-technique-2'       : 'mandatory-foot-technique-3',
				'mandatory-foot-technique-3'       : 'mandatory-foot-technique-4',
				'mandatory-foot-technique-4'       : 'mandatory-foot-technique-5',
				'mandatory-foot-technique-5'       : 'basic-movements-and-practicality',
				'basic-movements-and-practicality' : false
			}};

			$( '#technical-skills' ).find( 'table' ).hide();
			$( '#presentation' ).hide();
			$( '#technical-skills' ).find( '#mandatory-foot-technique-1' ).show();
			$( '#technical-skills' ).find( 'label' ).click(( ev ) => {
				var name    = $( ev.target ).parent().attr( 'id' );
				var value   = parseFloat( $( ev.target ).text());
				var current = $( ev.target ).parents( 'table' ).attr( 'id' );
				var next    = display.order[ current ];

				score.technical[ name ] = value;

				var sum = Object.keys( score.technical ).reduce(( sum, key ) => { sum += score.technical[ key ]; return sum; }, 0.0 );
				$( '#technical-score' ).html( sum.toFixed( 1 ));

				if( next ) {
					$( '#' + current ).fadeOut( 400, function() { $( '#' + next ).fadeIn(); });
				} else {
					$( '#' + current ).fadeOut( 400, function() { $( '#presentation' ).fadeIn(); });
				}
			});

			// ===== PRESENTATION BUTTON BEHAVIOR
			$( '#presentation' ).find( 'label' ).click(( ev ) => {
				var name  = $( ev.target ).parent().attr( 'id' );
				var value = parseFloat( $( ev.target ).text());

				score.presentation[ name ] = value;

				var sum = Object.keys( score.presentation ).reduce(( sum, key ) => { sum += score.presentation[ key ]; return sum; }, 0.0 );
				$( '#presentation-score' ).html( sum.toFixed( 1 ));
			});

		</script>
	</body>
</html>
