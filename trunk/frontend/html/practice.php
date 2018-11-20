<?php
	include "./include/php/version.php";
	include "./include/php/config.php";
?>
<html>
	<head>
		<title>FreeScore TKD v<?=$freescore[ 'version' ] ?></title>
		<link href="./include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="./include/bootstrap/css/freescore-theme.min.css" rel="stylesheet" />
		<link href="./include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="./include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="./include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="./include/jquery/js/jquery.js"></script>
		<script src="./include/jquery/js/jquery.howler.min.js"></script>
		<script src="./include/bootstrap/js/bootstrap.min.js"></script>
		<script src="./include/alertify/alertify.min.js"></script>
		<script src="./include/js/freescore.js"></script>

		<meta name="viewport" content="width=device-width, initial-scale=1">
		<style type="text/css">
			.register { margin-top: 18px; }
			.page-footer { text-align: center; }

			.btn {
				position: absolute;
				color: white;
				width: 120px;
				margin: 12px;
			}

			.head  { top: 12px; }
			.tech  { top: 80px; }
			.punch { top: 148px; }

			.red   { background-color: #d9534f; border: 1px solid #d43f3a; }
			.blue  { background-color: #337ab7; border: 1px solid #2e6da4; }
			.green { background-color: #5cb85c; border: 1px solid #4cae4c; }
			.grey  { background-color: #dddddd; border: 1px solid #cccccc; }
			.dark  { background-color: #404040; border: 1px solid #333333; }


			.red.btn  { left: 12px; }
			.blue.btn { right: 12px; }

			.message {
				position: absolute;
				left: 160px;
				top: 40px;
				width: 248px;
				height: 80px;
				border-radius: 8px;
				padding: 2px;
				font-size: 36pt;
				color: white;
				text-align: center;
			}

			.result {
				position: absolute;
				left: 160px;
				top: 140px;
				width: 248px;
				height: 40px;
				border-radius: 8px;
				text-align: center;
				color: white;
				font-size: 18pt;
				padding: 6px;
			}


		</style>
	</head>
	<body>
		<div class="container">
			<button class="btn btn-lg head  red">H</button><br>
			<button class="btn btn-lg tech  red">T</button><br>
			<button class="btn btn-lg punch red">P</button>
			<div class="message green">Start</div>
			<div class="result dark"></div>
			<button class="btn btn-lg head  blue">H</button><br>
			<button class="btn btn-lg tech  blue">T</button><br>
			<button class="btn btn-lg punch blue">P</button>
		</div>
		<script>

var sound = {
	send      : new Howl({ urls: [ "./sounds/upload.mp3",   "./sounds/upload.ogg"   ]}),
	confirmed : new Howl({ urls: [ "./sounds/received.mp3", "./sounds/received.ogg" ]}),
	next      : new Howl({ urls: [ "./sounds/next.mp3",     "./sounds/next.ogg"     ]}),
	error     : new Howl({ urls: [ "./sounds/quack.mp3",    "./sounds/quack.ogg"   ]}),
};

var target = {};
var score  = { i: 0, question: [], total: 0 };
var enable = ( ev ) => {
	let button = $( ev.target );
	let color  = button.hasClass( 'red' ) ? 'Red' : 'Blue';
	let type   = undefined;
	if( button.hasClass( 'head'  )) { type = 'Head'; }
	if( button.hasClass( 'tech'  )) { type = 'Technical'; }
	if( button.hasClass( 'punch' )) { type = 'Punch'; }

	sound.next.play();

	let pressed = color + ' ' + type;
	let wanted  = target.color + ' ' + target.button;
	console.log( color + ' ' + type );
	if( pressed == wanted && target.open ) {
		score.question[ score.i ] = { wanted : wanted, pressed : pressed, correct: true };
		$( '.result' ).removeClass( 'dark' ).addClass( 'green' );
		setTimeout(() => { 
				$( '.result' ).removeClass( 'green' ).addClass( 'dark' ); 
				$( '.message' ).empty();
			}, 1000);
	} else {
		score.question[ score.i ] = { wanted : wanted, pressed : pressed, correct: false };
		$( '.result' ).removeClass( 'dark' ).addClass( 'red' );
		if( pressed == wanted & ! target.open ) { $( '.result' ).html( '<span class="fa fa-clock-o"></span>' ); }
		setTimeout(() => { 
				$( '.result' ).removeClass( 'red' ).addClass( 'dark' ); 
				$( '.result' ).empty();
				$( '.message' ).empty();
			}, 1000);
	}
	clearTimeout( target.timeout );
	score.i++;
	$( '.btn' ).off( 'click' );
	setTimeout( video, 1000 );
};

var countdown = function( i ) {
	return function() {
		if( i > 0 ) {
			$( '.message' ).css({ 'font-size' : '36pt', 'padding-top' : 0 }).text( i );
			setTimeout( countdown( i - 1 ), 1000 );
		} else {
			$( '.message' ).empty();
			setTimeout( video(), 1000 );
		}
	}
};

var display = {
	target : function( ) {
		let choices = [ 'Head', 'Technical', 'Punch' ];
		let color = Math.random() > 0.5 ? 'Red' : 'Blue';
		target.color = color;
		let button = choices[ Math.round( Math.random() * 2)];
		target.button = button;
		target.color  = color;
		target.open   = true;
		$( '.message' ).css({ 'font-size' : '18pt', 'padding-top' : '22px' }).text( target.color + ' ' + target.button );
		target.timeout = setTimeout(() => { target.open = false; }, 1000 );
	},
};

var video = function() {
	$( '.btn' ).off( 'click' ).click( enable );
	let delay = Math.round( Math.random() * 3000 );
	setTimeout( display.target, delay );
};

$( '.message' ).off( 'click' ).click(( ev ) => {
	$( '.message' ).off( 'click' );
	let i = 0;

	console.log( "Start" );
	$( '.message' ).removeClass( 'green' ).addClass( 'dark' ).text( 3 );
	countdown( 3 )();
});
		</script>
	</body>
</html>
