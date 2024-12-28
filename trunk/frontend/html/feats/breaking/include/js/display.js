app.display.leaderboard = {
	rankings : $( '.leaderboard .leaderboard-rankings' )
};

app.display.scoreboard = {
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
};

app.refresh.display = division => {
	if( division.scoreboard()) { app.refresh.scoreboard( division ); }
	else                       { app.refresh.leaderboard( division ); }
	if(( division.scoreboard() && page.num == page.leaderboard ) || ( division.leaderboard() && page.num == page.scoreboard )) { page.transition(); }
};

app.refresh.judges = ( names, athlete ) => {
	let scoreboard = app.display.scoreboard;
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
};

app.refresh.leaderboard = division => {
	let rankings = app.display.leaderboard.rankings;
	rankings.empty();
	let placements = division.placements();
	let athletes   = division.athletes();
	let justwent   = division.current.athleteid();

	let row     = $( `<div class="placement"><div class="place">#</div><div class="name">Name</div><div class="score">Score</div><div class="tb1">TB1</div><div class="tb2">TB2</div></div>` );
	rankings.append( row );
	placements.forEach( placement => {
		placement.athletes.forEach( aid => {
			let current = aid == justwent ? ' current' : '';
			let athlete = athletes[ aid ];
			let tb1     = placement.show.includes( 'tb1' ) ? athlete.tb1() : '';
			let tb2     = placement.show.includes( 'tb2' ) ? athlete.tb2() : '';
			let row     = $( `<div class="placement${current}"><div class="place">${placement.place}</div><div class="name">${athlete.name()}</div><div class="score">${athlete.score()}</div><div class="tb1">${tb1}</div><div class="tb2">${tb2}</div></div>` );
			rankings.append( row );
		});
	});
};

app.refresh.scoreboard = division => {
	let athlete    = division.current.athlete();
	let scoreboard = app.display.scoreboard;
	let noc        = athlete.noc();
	let flag       = noc ? `<img src="../../images/flags/${noc.toLowerCase()}.png">` : '';
	let boards     = athlete.boards() ? `${athlete.boards()} board${athlete.boards() == 1 ? '' : 's'}` : 'Pending inspection';
	scoreboard.athlete.name.html( athlete.name() );
	scoreboard.athlete.noc.html( flag );
	scoreboard.athlete.boards.html( boards );
	scoreboard.division.summary.html( division.summary());

	let judges     = division.judges();
	scoreboard.judges.all.hide();
	scoreboard.judges.all.removeClass( 'judges3' );
	scoreboard.judges.all.removeClass( 'judges5' );

	if      ( judges == 3 ) { app.refresh.judges( [ 'r', 'j1', 'j2' ], athlete ); }
	else if ( judges == 5 ) { app.refresh.judges( [ 'r', 'j1', 'j2', 'j3', 'j4', 'j5' ], athlete ); }

	scoreboard.score.subtotal.html( athlete.mean.total());
	scoreboard.deductions.technical.html( athlete.deductions.technical());
	scoreboard.deductions.procedural.html( athlete.deductions.procedural());
	scoreboard.score.total.html( athlete.score());
};

app.refresh.time = {
	reset : division => {
		state.time.elapsed = 0;
		app.display.scoreboard.timer.removeClass( 'overtime' ); 
		app.display.scoreboard.timer.html( '0:00' );
	},
	start : division => {
		state.time.timer = setInterval( app.refresh.time.tick, 500 );
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
			app.display.scoreboard.timer.addClass( 'overtime' ); 
		}
		seconds %= 60;

		app.display.scoreboard.timer.html( `${minutes}:${seconds < 10 ? 0 : ''}${seconds}` );			
	}
};

app.network.on
	// ========================================
	.heard( 'autopilot' )
	// ========================================
	.command( 'decision' )    .pass()
	.command( 'leaderboard' ) .respond( update => { app.refresh.display( new Division( update.division )); })
	.command( 'next' )        .respond( update => { app.refresh.display( new Division( update.division )); })
	.command( 'score' )       .pass()
	.command( 'scoreboard' )  .respond( update => { app.refresh.display( new Division( update.division )); })

	// ========================================
	.heard( 'division' )
	// ========================================
	.command( 'decision' )    .respond( update => { app.refresh.display( new Division( update.division )); })
	.command( 'leaderboard' ) .respond( update => { app.refresh.display( new Division( update.division )); })
	.command( 'inspection' )  .respond( update => { app.refresh.display( new Division( update.division )); })
	.command( 'navigate' )    .respond( update => { app.refresh.display( new Division( update.division )); })
	.command( 'read' )        .respond( update => {
		let division = new Division( update.division );
		$( '.pt-page-2' ).hide();
		app.refresh.display( division );
	})
	.command( 'score' )       .respond( update => { app.refresh.display( new Division( update.division )); })
	.command( 'scoreboard' )  .respond( update => { app.refresh.display( new Division( update.division )); })
	.command( 'time reset' )  .respond( update => {
		let division = new Division( update.division );
		app.refresh.time.reset( division );
	})
	.command( 'time start' )  .respond( update => {
		let division = new Division( update.division );
		app.refresh.time.start( division );
	})
	.command( 'time stop' )   .respond( update => {
		let division = new Division( update.division );
		app.refresh.time.stop( division );
	})

	// ========================================
	.heard( 'users' )
	// ========================================
	.command( 'update' ).pass();

var page = {
	leaderboard : 2,
	num : 1,
	scoreboard : 1,
	transition: () => { 
		let current = page.num;
		let other   = current == 1 ? 2 : 1;
		$( `.pt-page-${current}` ).hide()
		$( `.pt-page-${other}` ).show();
		page.num = other;
	}
};

