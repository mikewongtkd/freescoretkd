var display = {
	scoreboard : {
		athlete  : {
			name   : $( '.scoreboard .athlete-info .athlete-name' ),
			noc    : $( '.scoreboard .athlete-info .athlete-noc' ),
			boards : $( '.scoreboard .athlete-info .athlete-boards' )
		},
		deductions : {
			technical  : $( '.score-display .deductions .tech span' ),
			procedural : $( '.score-display .deductions .proc span' )
		},
		division : { summary : $( '.scoreboard .division-summary' ) },
		judges   : {
			all  : $( '.scoreboard .judge-scores .judge' ),
			r    : { row : $( '.scoreboard .judge-scores .r ' ), technical : $( '.scoreboard .judge-scores .r  .tech' ), presentation : $( '.scoreboard .judge-scores .r  .pres' ), received : $( '.scoreboard .judge-scores .r  .received' )},
			j1   : { row : $( '.scoreboard .judge-scores .j1' ), technical : $( '.scoreboard .judge-scores .j1 .tech' ), presentation : $( '.scoreboard .judge-scores .j1 .pres' ), received : $( '.scoreboard .judge-scores .j1 .received' )},
			j2   : { row : $( '.scoreboard .judge-scores .j2' ), technical : $( '.scoreboard .judge-scores .j2 .tech' ), presentation : $( '.scoreboard .judge-scores .j2 .pres' ), received : $( '.scoreboard .judge-scores .j2 .received' )},
			j3   : { row : $( '.scoreboard .judge-scores .j3' ), technical : $( '.scoreboard .judge-scores .j3 .tech' ), presentation : $( '.scoreboard .judge-scores .j3 .pres' ), received : $( '.scoreboard .judge-scores .j3 .received' )},
			j4   : { row : $( '.scoreboard .judge-scores .j4' ), technical : $( '.scoreboard .judge-scores .j4 .tech' ), presentation : $( '.scoreboard .judge-scores .j4 .pres' ), received : $( '.scoreboard .judge-scores .j4 .received' )},
			tech : $( '.scoreboard .judge-scores .judge .tech' ),
			pres : $( '.scoreboard .judge-scores .judge .pres' )
		},
		mean     : { row : $( '.scoreboard .judge-scores .mean' ), technical : $( '.scoreboard .judge-scores .mean .tech' ), presentation : $( '.scoreboard .judge-scores .mean .pres' )},
		score   : {
			subtotal : $( '.scoreboard .score-display .subtotal span' ),
			total    : $( '.scoreboard .score-display .total span' )
		},
		timer    : $( '.scoreboard .timer-display .time' )
	}
};
var refresh = {
	judges : ( names, athlete ) => {
		let scoreboard = display.scoreboard;
		let n          = names.length;
		let scores     = athlete.scores();
		let complete   = athlete.complete();
		let decision   = athlete.decision();
		let count      = `judges${n}`;

		names.forEach(( judge, i ) => { 
			scoreboard.judges[ judge ].row.addClass( count );
			scoreboard.judges[ judge ].row.children().addClass( count );
			scoreboard.judges[ judge ].row.show(); 
			scoreboard.judges[ judge ].received.empty();
			scoreboard.judges[ judge ].technical.empty();
			scoreboard.judges[ judge ].presentation.empty();

			let score = scores[ i ];
			if( complete ) {
				scoreboard.judges[ judge ].received.hide().empty();
				scoreboard.judges[ judge ].technical.show().html((( athlete.boards() * 0.2) + parseFloat( score.technical())).toFixed( 1 ));
				scoreboard.judges[ judge ].presentation.show().html( score.presentation());
			} else {
				if( score.complete()) { scoreboard.judges[ judge ].received.show().html( '&check;' ); } 
				else                  { scoreboard.judges[ judge ].received.show().empty(); }
				scoreboard.judges[ judge ].technical.hide().empty();
				scoreboard.judges[ judge ].presentation.hide().empty();
			}
		});
		scoreboard.mean.row.addClass( count );
		scoreboard.mean.row.children().addClass( count );
		scoreboard.mean.technical.empty();
		scoreboard.mean.presentation.empty();
		if( complete && ! decision ) {
			let mean = {
				technical    : athlete.mean.technical(),
				presentation : athlete.mean.presentation()
			};
			scoreboard.mean.row.show();
			scoreboard.mean.technical.html( mean.technical );
			scoreboard.mean.presentation.html( mean.presentation );
		}
	},
	leaderboard : division => {
	},
	scoreboard : division => {
		let athlete    = division.current.athlete();
		let scoreboard = display.scoreboard;
		let noc        = athlete.noc();
		let flag       = noc ? `<img src="../../images/flags/${noc}.png">` : '';
		let boards     = athlete.boards() ? `${athlete.boards()} board${athlete.boards() == 1 ? '' : 's'}` : 'Pending inspection';
		scoreboard.athlete.name.html( athlete.name() );
		scoreboard.athlete.noc.html( flag );
		scoreboard.athlete.boards.html( boards );
		scoreboard.division.summary.html( division.summary());

		let judges     = division.judges();
		scoreboard.judges.all.hide();
		scoreboard.judges.all.removeClass( 'judges3' );
		scoreboard.judges.all.removeClass( 'judges5' );

		if      ( judges == 3 ) { refresh.judges( [ 'r', 'j1', 'j2' ], athlete ); }
		else if ( judges == 5 ) { refresh.judges( [ 'r', 'j1', 'j2', 'j3', 'j4', 'j5' ], athlete ); }

		scoreboard.score.subtotal.html( athlete.mean.total());
		scoreboard.deductions.technical.html( athlete.deductions.technical());
		scoreboard.deductions.procedural.html( athlete.deductions.procedural());
		scoreboard.score.total.html( athlete.score());
	},
	time : {
		reset : division => {
			state.time.elapsed = 0;
			display.scoreboard.timer.removeClass( 'overtime' ); 
			display.scoreboard.timer.html( '0:00' );
		},
		start : division => {
			state.time.timer = setInterval( refresh.time.tick, 500 );
			state.time.start = Date.now();
		},
		stop  : division => {
			clearInterval( state.time.timer );
			state.time.stop    = Date.now();
			state.time.elapsed = Math.floor(( state.time.stop - state.time.start ) / 1000 ) + state.time.elapsed;
		},
		tick  : () => {
			let seconds = Math.round(( Date.now() - state.time.start)/1000) + state.time.elapsed;
			let minutes = Math.floor( seconds / 60 );
			if( seconds > state.time.limit  ) { 
				display.scoreboard.timer.addClass( 'overtime' ); 
			}
			seconds %= 60;

			display.scoreboard.timer.html( `${minutes}:${seconds < 10 ? 0 : ''}${seconds}` );			
		}
	}
};
var handle = {
	autopilot : {
		leaderboard : update => {
			let request = update.request;
			let division = new Division( update.division );
			page.transition();
			refresh.leaderboard( division );

		},
		next : update => {
			let request = update.request;
			let division = new Division( update.division );
			refresh.scoreboard( division );
		},
		scoreboard : update => {
			let request  = update.request;
			let division = new Division( update.division );
			refresh.scoreboard( division );
		},
		update : update => {
			let request = update.request;
			if( ! request || ! request.action ) { return; }
			handle.autopilot[ request.action ]( update );
		}
	},
	division : {
		decision: update => {
			let division = new Division( update.division );
			refresh.display( division );
			refresh.leaderboard( division );
		},
		leaderboard: update => {
			let division = new Division( update.division );
			page.transition();
			refresh.leaderboard( division );
		},
		read: update => {
			let division = new Division( update.division );
			$( '.pt-page-2' ).hide();
			refresh.scoreboard( division );
		},
		score: update => {
			let division = new Division( update.division );
			if( division.leaderboard()) { page.transition(); }
			refresh.scoreboard( division );
		},
		scoreboard: update => {
			let division = new Division( update.division );
			if( division.leaderboard()) { page.transition(); }
			refresh.scoreboard( division );
		},
		'time reset' : update => {
			let division = new Division( update.division );
			refresh.time.reset( division );
		},
		'time start' : update => {
			let division = new Division( update.division );
			refresh.time.start( division );
		},
		'time stop' : update => {
			let division = new Division( update.division );
			refresh.time.stop( division );
		},
		update: update => {
			let request = update.request;
			if( ! request || ! request.action ) { return; }
			handle.division[ request.action ]( update );
		}
	}
};

var network = {
	open: () => {
		let request = { data : { type : 'division', action : 'read' }};
		request.json = JSON.stringify( request.data );
		ws.send( request.json );
	},
	message: ( response ) => { 
		let update = JSON.parse( response.data );
		console.log( update );

		let type = update.type;
		if( ! (type in handle))           { alertify.error( `No handler for ${type} object` );   console.log( update ); return; }

		let action = update.action;
		if( ! (action in handle[ type ])) { alertify.error( `No handler for ${action} action` ); console.log( update ); return; }

		handle[ type ][ action ]( update );
	},
	send: request => {
		request.json = JSON.stringify( request.data ); 
		ws.send( request.json );
	}
};

var sound = {
	ok      : new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg"  ]}),
	warning : new Howl({ urls: [ "../../sounds/warning.mp3",  "../../sounds/warning.ogg" ]}),
	error   : new Howl({ urls: [ "../../sounds/quack.mp3",    "../../sounds/quack.ogg"   ]}),
	next    : new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"    ]}),
	prev    : new Howl({ urls: [ "../../sounds/prev.mp3",     "../../sounds/prev.ogg"    ]}),
};

var page = {
	num : 1,
	transition: () => { 
		let current = page.num;
		let other   = current == 1 ? 2 : 1;
		$( `.pt-page-${current}` ).hide()
		$( `.pt-page-${other}` ).show();
		page.num = other;
	}
/*	
 	transition: ( ev ) => { page.num = PageTransitions.nextPage({ animation: page.animation( page.num )}); },
	animation:  ( pn ) => { return 38 - pn; } // Newspaper and Fall animations 37 and 36 respectively
*/
};

