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
		<link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/page-transitions/css/animations.css" rel="stylesheet" type="text/css" />
		<link href="../../include/css/brackets-bootstrap.css" rel="stylesheet" type="text/css" />
		<link href="../../include/fontawesome/css/font-awesome.css" rel="stylesheet" type="text/css" />
		<link href="../../include/css/forms/grassroots/repechage.css" rel="stylesheet" type="text/css" />
		<script src="../../include/opt/svg/svg.min.js"></script>
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/jquery/js/jquery.totemticker.min.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootstrap-list-filter.min.js"></script>
		<script src="../../include/svg/js/svg.js"></script>
		<script src="../../include/svg/js/pan-zoom.js"></script>
		<script src="../../include/alertify/alertify.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
	</head>
	<body>
		<div id="pt-main" class="pt-perspective">
			<!-- ============================================================ -->
			<!-- RING DIVISIONS -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-1">
				<div class="container">
					<div class="page-header"><span id="ring-header">Ring <?= $i ?></span></div>
					<button type="button" class="btn btn-primary new-bracket" data-size=4>4-person bracket</button>
					<button type="button" class="btn btn-primary new-bracket" data-size=8>8-person bracket</button>
				</div>
			</div>
			<!-- ============================================================ -->
			<!-- DIVISION ATHLETES -->
			<!-- ============================================================ -->
			<div class="pt-page pt-page-2">
				<div class="container">
				<div class="page-header"><a class="btn btn-warning back-to-new-bracket"><span class="glyphicon glyphicon-menu-left"></span> Ring <?= $i ?></a> <span id="division-header"></span></div>
				<div class="brackets-svg"   id="bracket"></div>
				<div class="brackets-input" id="controls">
					<h2>Match Not Selected</h2>
					<form>
						<div class="row">
							<div class="col-sm-6">
								<table class="controls">
									<tr class="blue"><td>Blue Athlete</td><td><input type="text" class="name-input disabled" disabled></td><td>Score</td><td><input type="text" class="score-input disabled" disabled></td></tr>
									<tr class="red" ><td>Red Athlete </td><td><input type="text" class="name-input disabled" disabled></td><td>Score</td><td><input type="text" class="score-input disabled" disabled></td></tr>
								</table>
							</div>
							<div class="col-sm-6">
								<button type="button" class="btn btn-primary" id="zoom-in"><span class="fa fa-search-plus"></span> Zoom In</button>
								<button type="button" class="btn btn-primary" id="zoom-out"><span class="fa fa-search-minus"></span> Zoom Out</button>
							</div>
						</div>
					</form>
				</div>
				</div>
			</div>
		</div>
		<script src="../../include/page-transitions/js/pagetransitions.js"></script>
		<script>
			alertify.defaults.theme.ok     = "btn btn-danger";
			alertify.defaults.theme.cancel = "btn btn-warning";

			var host       = '<?= $host ?>';
			var tournament = <?= $tournament ?>;
			var ring       = { num: <?= $i ?> };
			var html       = FreeScore.html;
			
			var sound = {
				ok    : new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg" ]}),
				error : new Howl({ urls: [ "../../sounds/quack.mp3",    "../../sounds/quack.ogg"  ]}),
				next  : new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"   ]}),
				prev  : new Howl({ urls: [ "../../sounds/prev.mp3",     "../../sounds/prev.ogg"   ]}),
			};

			var page = {
				num : 1,
				transition: ( to, dir ) => { page.num = to; PageTransitions.nextPage({ showPage: (to-1), animation: page.animation( dir )}); },
				animation:  ( dir )     => { var animation = { left: 59, right: 58 }; return animation[ dir ]; }
			};

			var sendRequest = ( request ) => {
				var url = 'http://' + host + ':3080/' + tournament.db + '/' + ring.num + '/coordinator'
				var data = JSON.stringify( request.data );
				console.log( url, data );
				$.post( url, data );
			};

			$( '.new-bracket' ).off( 'click' ).click(( ev ) => {
				var target = $( ev.target );
				var size   = target.attr( 'data-size' );
				if( size == 4 ) {
					draw.remove();
					draw = SVG( 'bracket' ).size( '100%', '100%' );
					matches = [
						[
							new Match( 5, draw, { x:   0, y:  50 }),
							new Match( 6, draw, { x:   0, y: 250 })
						],
						[
							new Match( 7, draw, { x: 240, y: 150 })
						]
					]
				} else if( size == 8 ) {
					draw.remove();
					draw = SVG( 'bracket' ).size( '100%', '100%' );
					matches = [
						new Match(  1, 1, draw, { win:  5, lose:  8 }, { x: 120, y:   0 }),
						new Match(  2, 1, draw, { win:  5, lose:  8 }, { x: 120, y: 100 }),
						new Match(  3, 1, draw, { win:  6, lose:  9 }, { x: 120, y: 200 }),
						new Match(  4, 1, draw, { win:  6, lose:  9 }, { x: 120, y: 300 }),

						new Match(  5, 2, draw, { win:  7, lose:  0 }, { x: 360, y:  50 }),
						new Match(  6, 2, draw, { win:  7, lose:  0 }, { x: 360, y: 250 }),

						new Match(  7, 3, draw, { win:  0, lose: 11 }, { x: 600, y: 150 }),

						new Match(  8, 4, draw, { win: 10, lose:  0 }, { x:   0, y: 400 }),
						new Match(  9, 4, draw, { win: 10, lose:  0 }, { x:   0, y: 500 }),

						new Match( 10, 5, draw, { win: 11, lose:  0 }, { x: 240, y: 450 }),

						new Match( 11, 5, draw, { win:  0, lose:  0 }, { x: 480, y: 450 })
					]
				}
				sound.next.play();
				page.transition( 2, 'right' );
			});

			$( '.back-to-new-bracket' ).off( 'click' ).click(( ev ) => { 
				sound.prev.play();
				page.transition( 1, 'left' ); 
			});

			$( '#zoom-in' ).off( 'click' ).click(( ev ) => {
				if( ! defined( selected )) { return; }
				position = { x: selected.x, y : selected.y };
				if( selected.round == 2 ) { position.x += 90; }
				if( selected.round == 3 ) { position.x += 120; }
				if( selected.round >= 4 ) { position.y += 120; }
				if( selected.round == 5 ) { position.x += 120; }
				selected.draw
					.animate({ easing: '<>' })
					.zoom( 4, position );
			});

			$( '.blue .name-input' ).on( 'change', ( ev ) => {
				var target = $( ev.target );
				if( ! defined( selected ) ) { return; }
				selected.blue.setName( target.val() );
				selected.advancePlayers();
			});
			$( '.blue .score-input' ).on( 'change', ( ev ) => {
				var target = $( ev.target );
				if( ! defined( selected ) ) { return; }
				selected.blue.setScore( target.val() );
				selected.advancePlayers();
			});
			$( '.red .name-input' ).on( 'change', ( ev ) => {
				var target = $( ev.target );
				if( ! defined( selected ) ) { return; }
				selected.red.setName( target.val() );
				selected.advancePlayers();
			});
			$( '.red .score-input' ).on( 'change', ( ev ) => {
				var target = $( ev.target );
				if( ! defined( selected ) ) { return; }
				selected.red.setScore( target.val() );
				selected.advancePlayers();
			});

			$( '#zoom-out' ).off( 'click' ).click(( ev ) => {
				if( ! defined( selected )) { return; }
				selected.draw
					.animate({ ease: '<>' })
					.zoom( 1 );
				$( '#bracket svg' ).removeAttr( 'viewBox' );
			});

			class Athlete {
				constructor( svg, match, color, position ) {
					this.draw      = svg;
					this.match     = match;
					this.x         = position.x;
					this.y         = position.y;
					this.width     = 200;
					this.height    = 32;
					this.name      = { value: undefined, box: undefined, text: undefined };
					this.score     = { value: undefined, box: undefined, text: undefined };
					this.group     = svg.group();

					this.name .box  = svg.rect( this.width, this.height ).attr({ fill: '#ccc', x: position.x, y: position.y  });
					this.score.box  = svg.rect( this.height - 4, this.height - 4 ) .attr({ fill: '#ddd', x: position.x + (this.width + 2 - this.height), y: position.y + 2 });

					this.group.add( this.name.box );
					this.group.add( this.score.box );

				}

				setName( name ) {
					if( defined( this.name.text )) { this.name.text.remove(); }
					if( name.length > 0 ) {
						this.name.text  = this.draw.text( name ).attr({ x: this.x + 10, y: this.y + 2, height: this.height - 4, width: this.width - 80 });
						this.name.value = name;
						this.group.add( this.name.text );
					} else {
						this.name.value = undefined;
					}
				}

				setScore( score ) {
					if( defined( this.score.text )) { this.score.text.remove(); }
					if( score.length > 0 ) { 
						this.score.text  = this.draw.text( score ).attr({ x: this.x + this.width - (4 + this.height/2), y: this.y, height: this.height - 4, width: this.height - 4 });
						this.score.value = score;
						this.group.add( this.score.text );
					} else {
						this.score.value = undefined;
					}
				}
			};

			class Match {
				constructor( id, round, svg, advance, position ) {
					this.id      = id;
					this.round   = round;
					this.draw    = svg;
					this.advance = advance;
					this.x       = position.x;
					this.y       = position.y;

					this.blue    = new Athlete( svg, id, 'blue', position );
					this.red     = new Athlete( svg, id, 'red', { x: position.x, y: position.y + this.blue.height + 2 });

					this.width   = this.blue.width;
					this.height  = this.blue.height + this.red.height + 2;

					let handle_click = ( ev ) => {
						$( '#controls h2' ).html( `Match ${this.id} Selected` );
						$( '.name-input,.score-input' ).removeProp( 'disabled' ).removeClass( 'disabled' );
						$( '.blue .name-input' ).val( this.blue.name.value );
						$( '.red  .name-input' ).val( this.red.name.value );
						$( '.blue .score-input' ).val( this.blue.score.value );
						$( '.red  .score-input' ).val( this.red.score.value );
						$( '.blue .name-input' ).focus();
						sound.next.play();
						selected = this;
					};

					this.blue.group.click( handle_click );
					this.red .group.click( handle_click );
				}

				advancePlayers() {
					if( this.advance.win ) {
						let win = (matches.filter(( m ) => { return m.id == this.advance.win; }))[ 0 ];
						let blueBye  = defined( this.blue.name.value ) ? this.blue.name.value.match( /bye/i ) : 0;
						let redBye   = defined( this.red.name .value ) ? this.red .name.value.match( /bye/i ) : 0;
						let blueWins = redBye  || this.blue.score.value > this.red.score.value;
						let redWins  = blueBye || this.blue.score.value < this.red.score.value;

						if( blueWins ) {
							if( ! defined( win.blue.name.value )) {
								win.blue.setName( this.blue.name.value );
							} else {
								win.red.setName( this.blue.name.value );
							}
						} else if( redWins ) {
							if( ! defined( win.blue.name.value )) {
								win.blue.setName( this.red.name.value );
							} else {
								win.red.setName( this.red.name.value );
							}
						}
					}
					if( this.advance.lose ) {
						let lost = (matches.filter(( m ) => { return m.id == this.advance.lose; }))[ 0 ];
						let blueLoses = this.blue.score.value < this.red.score.value;
						let redLoses  = this.blue.score.value > this.red.score.value;

						if( blueLoses ) {
							if( ! defined( lost.blue.name.value )) {
								lost.blue.setName( this.blue.name.value );
							} else {
								lost.red.setName( this.blue.name.value );
							}
						} else if( redLoses ) {
							if( ! defined( lost.blue.name.value )) {
								lost.blue.setName( this.red.name.value );
							} else {
								lost.red.setName( this.red.name.value );
							}
						}
					}
				}
			};

			var draw     = SVG( 'bracket' ).size( '100%', '100%' );
			var selected = undefined;
			var matches  = [];
		</script>
	</body>
</html>
