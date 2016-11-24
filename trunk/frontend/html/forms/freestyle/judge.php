<?php 
	include( "../../include/php/config.php" ); 
?>
<html>
	<head>
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/bootstrap/css/freescore-theme.min.css" rel="stylesheet" />
		<link href="../../include/bootstrap/add-ons/bootstrap-timeline.css" rel="stylesheet" />
		<link href="../../include/css/forms/freestyle/judgeController.css" rel="stylesheet" />
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery.tappy.js"></script>
		<script src="../../include/jquery/js/jquery.horizontal-timeline.js"></script>
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
				</div>

				<button id="start" class="btn btn-lg btn-success">Start</button>

				<table class="mandatory-foot-technique-1">
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
				<table class="performance-and-music-timing">
					<tr>
						<th>End of Performance</th>
						<td class="button-group">
							<button id="music-stop"   class="btn btn-lg btn-danger  stop" type="button">Music Stops</button>
							<button id="athlete-stop" class="btn btn-lg btn-warning stop" type="button">Athlete Stops</button>
							<button id="both-stop"    class="btn btn-lg btn-success stop" type="button">Athlete and Music Stop Together</button>
						</td>
					</tr>
				</table>
				<table class="basic-movements">
					<tr>
						<th>Technique &amp; practicality</th>
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

				<div class="technical-component" id="mandatory-foot-technique-1-score">
					<div class="component-label">Jumping side kick</div>
					<div class="component-score">0.0</div>
				</div>

				<div class="technical-component" id="mandatory-foot-technique-2-score">
					<div class="component-label">Jumping front kicks</div>
					<div class="component-score">0.0</div>
				</div>

				<div class="technical-component" id="mandatory-foot-technique-3-score">
					<div class="component-label">Jumping spin kick</div>
					<div class="component-score">0.0</div>
				</div>

				<div class="technical-component" id="mandatory-foot-technique-4-score">
					<div class="component-label">Consecutive kicks</div>
					<div class="component-score">0.0</div>
				</div>

				<div class="technical-component" id="mandatory-foot-technique-5-score">
					<div class="component-label">Acrobatic kick</div>
					<div class="component-score">0.0</div>
				</div>

				<div class="technical-component" id="basic-movements-score">
					<div class="component-label">Basic movements</div>
					<div class="component-score">0.0</div>
				</div>
			</div>

			<div id="controls">
				<img class="mandatory-foot-technique-icon mandatory-foot-technique-1"   src="../../images/icons/freestyle/jumping-side-kick.png">
				<img class="mandatory-foot-technique-icon mandatory-foot-technique-2"   src="../../images/icons/freestyle/jumping-front-kick.png">
				<img class="mandatory-foot-technique-icon mandatory-foot-technique-3"   src="../../images/icons/freestyle/jumping-spin-kick.png">
				<img class="mandatory-foot-technique-icon mandatory-foot-technique-4"   src="../../images/icons/freestyle/consecutive-kicks.png">
				<img class="mandatory-foot-technique-icon mandatory-foot-technique-5"   src="../../images/icons/freestyle/acrobatic-kick.png">
				<img class="mandatory-foot-technique-icon performance-and-music-timing" src="../../images/icons/freestyle/music.png">
				<img class="mandatory-foot-technique-icon basic-movements"              src="../../images/icons/freestyle/basic-movements.png">

				<div id="major-deductions"></div>
				<div id="stances">
					<div class="mandatory-stances" id="hakdari-seogi"><img src="../../images/icons/freestyle/hakdari-seogi.png"><br>Hakdari Seogi</div>
					<div class="mandatory-stances" id="beom-seogi"><img src="../../images/icons/freestyle/beom-seogi.png"><br>Beom Seogi</div>
					<div class="mandatory-stances" id="dwigubi"><img src="../../images/icons/freestyle/dwigubi.png"><br>Dwigubi</div>
				</div>
				<div id="minor-deductions"></div>
			</div>

			<div id="presentation">
				<div class="alert alert-default" role="alert"><strong>Presentation</strong>
					<div id="presentation-score" class="pull-right subtotal">0.0</div>
				</div>

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

			<div id="deductions">
				<div class="alert alert-default" role="alert"><strong>Deductions</strong>
					<div id="presentation-score" class="pull-right negative">0.0</div>
				</div>

				<div id="timeline">
					<ul class="timeline timeline-horizontal">
					</ul>
				</div>
			</div>
		</div>

		<script>
			var score = { technical: {}, presentation: {}, deductions: { stances: {}, timing: { start: undefined, 'athlete-stop': undefined, 'music-stop': undefined }, minor: [], major: [] }, timeline: [] };

			$( '#minor-deductions' ).deductions({ value: 0.1 });
			$( '#major-deductions' ).deductions({ value: 0.3 });

			// ===== MANDATORY STANCES BUTTON BEHAVIOR
			$( '.mandatory-stances' ).find( 'img' ).removeClass( 'done' );
			$( '.mandatory-stances' ).off( 'click' ).click(( b ) => {
				var clicked = $( b.target );
				if( clicked.is( 'img' )) { clicked = clicked.parent(); }
				if( clicked.hasClass( 'done' )) { clicked.removeClass( 'done' ); }
				else                            { clicked.addClass( 'done' ); }
			});

			// ===== SET INITIAL STATE: MOST EVERYTHING IS HIDDEN
			$( '#technical-skills' ).find( 'table' ).hide();
			$( '.technical-component' ).css({ opacity: 0.2 });
			$( '.mandatory-foot-technique-icon' ).hide();
			$( '#presentation' ).hide();
			$( '.presentation-component' ).hide();
			$( '#deductions' ).hide();

			// ===== WHEN USER CLICKS ON START, LET THE FUN BEGIN
			$( '#start' ).click(( ev ) => { 
				$( '#start' ).hide();
				$( '.mandatory-foot-technique-1' ).fadeIn( 200 );
				var t_event = { time: Date.now(), name: 'start' };
				score.timeline.push( t_event );
				score.deductions.timing.start = t_event;
			});

			// ============================================================
			// SCORE SET AND DISPLAY FUNCTIONS
			// ============================================================
			var set = {
				// ----------------------------------------
				technical : { score: function( ev ) {
				// ----------------------------------------
					var name    = $( ev.target ).attr( 'id' ); name = defined( name ) ? name : $( ev.target ).parent().attr( 'id' );
					var value   = parseFloat( $( ev.target ).text());
					var current = $( ev.target ).parents( 'table' ).attr( 'class' );
					var results = go[ current ].score;
					var next    = go[ current ].next;
					var t_event = { time: Date.now(), name: name };

					if( results ) {
						score.technical[ name ] = value;
						t_event.value = value;
						if( results ) { $( '#' + results ).find( '.component-score' ).html( value.toFixed( 1 ) ); }

						var sum = Object.keys( score.technical ).reduce(( sum, key ) => { sum += score.technical[ key ]; return sum; }, 0.0 );
						$( '#technical-score' ).html( sum.toFixed( 1 ));
					}

					return { name : name, buttons: current, next : next, results: results, value: value, t_event: t_event };
				}}
			};

			var show = {
				// ----------------------------------------
				technical : function( current ) {
				// ----------------------------------------
					$( '#presentation' ).find( 'table, .alert, .presentation-component' ).fadeOut( 200 );
					$( '.technical-component' ).animate({ top: '154px' }).off( 'click' );
					$( '.technical-component' ).css({ opacity: 0.5 });
					$( '#' + current + '-score' ).css({ opacity: 1.0 });
					$( '.' + current ).fadeIn( 200 );
					$( '#controls' ).fadeIn( 200 );
					$( '#deductions' ).fadeOut( 200 );
				},
				// ----------------------------------------
				presentation : function( current ) {
				// ----------------------------------------
					var done = Object.keys( score.presentation ).length == 4;
					$( '.' + current ).fadeOut( 200 );
					$( '#controls' ).fadeOut( 200 );
					$( '.technical-component' ).animate({ top: '65px', opacity: 1.0 }); 
					if( done ) { $( '.presentation-component, .alert' ).fadeIn( 200 ); }
					else       { $( '#presentation' ).show().find( 'table, .alert' ).fadeIn( 200 ); }
					$( '#deductions' ).fadeOut( 200 );

					// In the presentation phase, user can change technical 
					// scores by tapping the score they want to change
					$( '.technical-component' ).off( 'click' ).click(( ev ) => {
						var clicked = $( ev.target );
						if( ! clicked.hasClass( 'technical-component' )) { clicked = clicked.parent(); }
						var current = clicked.attr( 'id' ).replace( /\-score$/, '' );
						show.technical( current );
					});
				},
				// ----------------------------------------
				deductions: function() {
				// ----------------------------------------
					$( '#deductions' ).fadeIn( 200 );
				}
			};

			var html = FreeScore.html;
			var timeline = {
				widget: $( '.timeline' ),
				add: ( i, ev ) => {
					console.log( ev.time, score.deductions.timing.start.time );
					var seconds = parseFloat( Math.abs( ev.time - score.deductions.timing.start.time ))/1000;
					var min     = (seconds / 60).toFixed( 0 );
					var sec     = (seconds % 60).toFixed( 1 );
					var time    = min + ':' + (sec < 10 ? '0' + sec : sec);
					var does    = undefined;
					if( defined( ev.value )) {
						if( ev.name == 'jumping-front-kicks-count' || ev.name == 'consecutive-kicks' ) {
							if( ev.value >= 0.6 ) { does = ' performed excellent '; } else
							if( ev.value >= 0.3 ) { does = ' performed good ';      } else
							if( ev.value >= 0.1 ) { does = ' performed poor ';      } else
							if( ev.value == 0.0 ) { does = ' did not perform ';     } 
						} else {
							if( ev.value >= 0.6 ) { does = ' performed an excellent '; } else
							if( ev.value >= 0.3 ) { does = ' performed a good ';       } else
							if( ev.value >= 0.1 ) { does = ' performed a poor ';       } else
							if( ev.value == 0.0 ) { does = ' did not perform a ';      }
						}
					}
					var settings = {
						'start':               { context: 'success', icon: 'glyphicon-time',         heading: 'Start',               text: 'Music and performance start' },
						'jumping-side-kick':   { context: 'info',    icon: 'jumping-side-kick.png',  heading: 'Jumping Side Kick',   text: 'Athlete' + does + 'jumping side kick' },
						'jumping-front-kicks': { context: 'info',    icon: 'jumping-front-kick.png', heading: 'Jumping Front Kicks', text: 'Athlete' + does + 'jumping front kicks' },
						'jumping-spin-kick':   { context: 'info',    icon: 'jumping-spin-kick.png',  heading: 'Jumping Spin Kick',   text: 'Athlete' + does + 'jumping spin kick' },
						'consecutive-kicks':   { context: 'info',    icon: 'consecutive-kicks.png',  heading: 'Consecutive Kicks',   text: 'Athlete' + does + 'sparring kicks' },
						'acrobatic-kick':      { context: 'info',    icon: 'acrobatic-kick.png',     heading: 'Acrobatic Movements', text: 'Athlete' + does + 'acrobatic kick' },
						'music-stop':          { context: 'danger',  icon: 'music.png',              heading: 'Music Stops',         text: 'Athlete' + does + 'acrobatic kick' },
						'athlete-stop':        { context: 'danger',  icon: 'music.png',              heading: 'Athlete Stops',       text: 'Athlete' + does + 'acrobatic kick' },
						'both-stop':           { context: 'danger',  icon: 'glyphicon-time',         heading: 'Finish',              text: 'Athlete finishes performance in time with the music' },
						
					}[ ev.name ];
					settings.time = time;
					var item    = html.li.clone().addClass( 'timeline-item' );
					var badge   = html.div.clone().addClass( 'timeline-badge ' + settings.context );
					var panel   = html.div.clone().addClass( 'timeline-panel' );
					var heading = html.div.clone().addClass( 'timeline-heading' );
					var body    = html.div.clone().addClass( 'timeline-body' ).append( html.p.clone().text( settings.text ) );
					var notes   = html.p.clone().append( html.small.clone().addClass( 'text-muted' ), html.span.clone().addClass( 'glyphicon glyphicon-time' ), '&nbsp;', settings.time )

					if( defined( ev.value )) {
						if( ev.value >= 0 ) { notes.append( html.span.clone().addClass( 'points pull-right' ).text( '+' + ev.value.toFixed( 1 ) + ' points')); }
						else                { notes.append( html.span.clone().addClass( 'deduction pull-right' ).text( ev.value.toFixed( 1 ) + ' points')); }
					}

					heading.append( html.h4.clone().addClass( 'timeline-title' ).text( settings.heading ), notes );

					item.append( badge, panel.append( heading, body ));
					$( '#deductions .timeline' ).append( item );
				},
			};

			// ===== WHEN USER CLICKS ON A TECHNICAL SKILL, PROGRESS THROUGH THE SKILLS
			var go = {
				'mandatory-foot-technique-1'   : { score: 'mandatory-foot-technique-1-score', next: 'mandatory-foot-technique-2'   },
				'mandatory-foot-technique-2'   : { score: 'mandatory-foot-technique-2-score', next: 'mandatory-foot-technique-3'   },
				'mandatory-foot-technique-3'   : { score: 'mandatory-foot-technique-3-score', next: 'mandatory-foot-technique-4'   },
				'mandatory-foot-technique-4'   : { score: 'mandatory-foot-technique-4-score', next: 'mandatory-foot-technique-5'   },
				'mandatory-foot-technique-5'   : { score: 'mandatory-foot-technique-5-score', next: 'performance-and-music-timing' },
				'performance-and-music-timing' : { score: false,                              next: 'basic-movements'              },
				'basic-movements'              : { score: 'basic-movements-score',            next: false                          },
			};

			// ===== TECHNICAL SKILLS BUTTON BEHAVIOR
			$( '#technical-skills' ).find( 'label, .stop' ).off( 'click' ).click(( ev ) => {
				var s  = set.technical.score( ev );

				// ===== HANDLE MUSIC AND ATHLETE TIMING
				if( s.name == 'athlete-stop' || s.name == 'music-stop' ) {
					var other = s.name == 'athlete-stop' ? 'music-stop' : 'athlete-stop';
					$( '#both-stop, #' + s.name ).off( 'click' );
					$( '#both-stop, #' + s.name ).css({ opacity: 0.2 });
					score.deductions.timing[ s.name ] = s.t_event;
					if( ! defined( score.deductions.timing[ other ] ) ) { score.timeline.push( s.t_event ); return; }
				}

				// ===== NEXT SKILL
				if( s.next ) { 
					$( '.' + s.buttons ).fadeOut( 200, function() { $( '.' + s.next ).fadeIn( 200 ); });

				// ===== WHEN DONE, SHOW PRESENTATION
				} else { 
					show.presentation( s.buttons );

					$( '#technical-skills' ).find( 'label, .stop' ).off( 'click' ).click(( ev ) => {
						var s = set.technical.score( ev );
						show.presentation( s.buttons );
					});
				}
				$( '#' + s.results ).animate({ opacity: 1.0 });
				if( s.buttons != 'basic-movements' ) { score.timeline.push( s.t_event ); }
			});

			// ===== PRESENTATION BUTTON BEHAVIOR
			$( '#presentation' ).find( 'label' ).click(( ev ) => {
				var name  = $( ev.target ).parent().attr( 'id' );
				var value = parseFloat( $( ev.target ).text());

				score.presentation[ name ] = value;
				$( '#' + name + '-score' ).find( '.component-score' ).html( value.toFixed( 1 ));

				var sum = Object.keys( score.presentation ).reduce(( sum, key ) => { sum += score.presentation[ key ]; return sum; }, 0.0 );
				$( '#presentation-score' ).html( sum.toFixed( 1 ));

				// ===== WHEN DONE, SHOW DEDUCTIONS
				if( Object.keys( score.presentation ).length == 4 ) {
					$( '#presentation' ).find( 'table' ).fadeOut( 200, () => {
						$( '.presentation-component' ).fadeIn().animate({ top: '65px' });
						$.each( score.timeline, timeline.add );
						$( '#deductions' ).fadeIn( 200 );
					});
				}
			});

		</script>
	</body>
</html>
