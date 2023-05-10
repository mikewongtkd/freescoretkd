app.network.on
	.response( 'division' )
	.handle( 'inspection' )
	.by( update => {
		let request  = update.request;
		let divid    = request.athlete.split( /\|/ )[ 0 ];
		let aid      = parseInt( request.athlete.split( /\|/ )[ 1 ] );
		let boards   = parseInt( request.boards );
		$( `#page-inspection a[data-id="${divid}|${aid}"]` ).attr({ 'data-boards' : boards });
		$( `#page-inspection a[data-id="${divid}|${aid}"] .badge` ).html( boards );
		let current  = { divid : app.state.current.divid == divid, aid : app.state.current.athleteid == aid };
		let division = new Division( update.division );
		if( current.divid && current.aid ) { app.refresh.page.deductions( division ); }
		app.sound.ok.play();
	})
	.handle( 'navigate' )
	.by( update => {
		let divid       = update.ring.current;
		let division    = update.ring.divisions.find( division => { return division.name == divid; });
		update.division = division;
		app.state.current.divid = divid;
		app.state.current.athleteid = division.current.athleteid();
		app.refresh.on.read( update ); 
		return; 
	})
	.handle( 'read' )
	.by( update => {
		let division = new Division( update.division );
		app.state.reset();
		app.state.current.divid     = division.name();
		app.state.current.athleteid = division.current.athleteid();
		app.refresh.page.deductions( division );
		app.refresh.page.scoring( division );
		app.refresh.page.help( division );
	})
	.handle( 'score' )
	.by( update => {
		let request   = update.request
		let division  = new Division( update.division );
		let athlete   = division.current.athlete();
		let athleteid = division.current.athleteid();
		if( athleteid == app.state.current.athleteid && request.judge == app.state.judge ) {
			if( request.score == 'clear' ) {
				setTimeout( () => { alertify.notify( `Score for ${athlete.name()} cleared by computer operator` ); app.sound.ok.play(); }, 500 );
			} else {
				setTimeout( () => { alertify.success( `Score for ${athlete.name()} successfully received by server` ); app.sound.ok.play(); }, 500 );
			}
		}
	})
	.response( 'ring' )
	.handle( 'read' )
	.by( update => {
		let ring     = update.ring;
		let division = ring.divisions.find( division => division.name == ring.current );
		if( ! division ) { console.log( `Current division ${ring.current} not found`, update ); return; }
		app.refresh.page.inspection( ring );
		update.division = division;
		update.type = update.request.type = 'division';
		update.action = 'update';
		app.network.handle( update );
	});

function correct_board( division ) {
	let summary = division.summary();
	let agegroup = {
		'6-7'        : 'ages-6-9', // Ages 6-9 use 1/4 inch board
		'7 & under'  : 'ages-6-9',
		'dragon'     : 'ages-6-9',
		'u7'         : 'ages-6-9',
		'8-9'        : 'ages-6-9',
		'9 & under'  : 'ages-6-9',
		'tiger'      : 'ages-6-9',
		'u9'         : 'ages-6-9',
		'6-9'        : 'ages-6-9',
		'10-11'      : 'ages-10-14', // Ages 10-14 use 1/2 inch board
		'11 & under' : 'ages-10-14',
		'youth'      : 'ages-10-14',
		'u11'        : 'ages-10-14',
		'12-14'      : 'ages-10-14',
		'14 & under' : 'ages-10-14',
		'cadet'      : 'ages-10-14',
		'u14'        : 'ages-10-14',
		'10-14'      : 'ages-10-14',
		'15-17'      : 'ages-15-up', // Ages 15+ use 1 inch board
		'junior'     : 'ages-15-up',
		'u17'        : 'ages-15-up',
		'o15'        : 'ages-15-up',
		'15+'        : 'ages-15-up',
		'18+'        : 'ages-15-up',
		'18-30'      : 'ages-15-up',
		'senior'     : 'ages-15-up',
		'18-29'      : 'ages-15-up', // Breaking rules are inconsistent with poomsae
		'29 & under' : 'ages-15-up',
		'u29'        : 'ages-15-up',
		'u30'        : 'ages-15-up',
		'31-40'      : 'ages-15-up',
		'ultra'      : 'ages-15-up',
		'u40'        : 'ages-15-up',
		'30-39'      : 'ages-15-up',
		'39 & under' : 'ages-15-up',
		'u39'        : 'ages-15-up',
		'41-50'      : 'ages-15-up',
		'u50'        : 'ages-15-up',
		'40-49'      : 'ages-15-up',
		'49 & under' : 'ages-15-up',
		'u49'        : 'ages-15-up',
		'51-60'      : 'ages-15-up',
		'u60'        : 'ages-15-up',
		'50-59'      : 'ages-15-up',
		'59 & under' : 'ages-15-up',
		'u59'        : 'ages-15-up',
		'60+'        : 'ages-15-up',
		'61+'        : 'ages-15-up',
		'o59'        : 'ages-15-up',
		'o60'        : 'ages-15-up',
		'o61'        : 'ages-15-up',
		'Over 59'    : 'ages-15-up'
	};
	let board = {
		'ages-6-9'   : '&frac14; &times; 10 &times; 12-inch pine board',
		'ages-10-14' : '&frac12; &times; 10 &times; 12-inch pine board',
		'ages-15-up' : '1 &times; 10 &times; 12-inch pine board',
	}

	let match = Object.keys( agegroup ).find( key => { let regex = new RegExp( key, 'i' ); return summary.match( regex ); });
	let age   = agegroup[ match ];
	if( ! (age in board)) { return 'Can\'t determine division age'; }

	return board[ age ];
}

app.refresh.scoring = {
	component : {
		score : athlete => {
			let boards  = athlete.boards();
			let score   = { "technical" : { "boards" : (boards * 0.2).toFixed( 1 )}, "presentation" : {}};
			let count   = boards == 0 ? 'Pending inspection' : `${boards} Board${boards > 1 ? 's' : ''} &rarr; +${score.technical.boards} pts`;
			let display = {
				athlete : {
					technical : { 
						score : $( '#page-scoring .score-info .technical span' ),
					},
					presentation : {
						score : $( '#page-scoring .score-info .presentation span' ),
					},
					score : $( '#page-scoring .score-info .total-score .score' )
				}
			};
			let presentation = { 'categories' : [ 'technique', 'rhythm', 'style', 'creativity' ]};

			score.technical.difficulty = app.state.score.technical.difficulty;
			score.technical.summary    = score.technical.difficulty == 0 ? '&mdash;' : (parseFloat( score.technical.boards ) + parseFloat( score.technical.difficulty )).toFixed( 1 );
			score.presentation.summary = presentation.categories.some( x => app.state.score.presentation[ x ] == 0 ) ? '&mdash;' : (presentation.categories.reduce(( a, b ) => { return parseFloat( a ) + parseFloat( app.state.score.presentation[ b ]); }, 0.0 ).toFixed( 1 ));
			score.summary              = score.technical.summary == '&mdash;' || score.presentation.summary == '&mdash;' ? '&mdash;' : (parseFloat( score.technical.summary ) + parseFloat( score.presentation.summary )).toFixed( 1 );

			display.athlete.technical.score.html( score.technical.summary );
			display.athlete.presentation.score.html( score.presentation.summary );
			display.athlete.score.html( score.summary );

			let button = {
				send : $( '#page-scoring .btn-send' )
			};

			button.send.off( 'click' ).click( ev => { 
				let copy = JSON.parse( JSON.stringify( app.state.score ));
				// Only the referee needs to send in technical and procedural deductions
				if( app.state.judge != 0 ) {
					delete copy.technical.deductions;
					delete copy.procedural;
				}
				app.network.send({ type : 'division', action : 'score', judge : app.state.judge, score : copy });
				app.sound.next.play();
				alertify.notify( `Sending score for ${athlete.name()}` );
			});
		}
	}
};

app.refresh.page = {
	// ============================================================
	deductions : division => {
	// ============================================================
		let athlete = division.current.athlete();
		let display = {
			"athlete" : {
				"boards" : $( '#page-deductions .score-info .board-count' ),
				"name" : $( '#page-deductions .athlete-info' ),
				"technical" : { 
					"score" : $( '#page-deductions .score-info .technical-score .score' ),
					"deductions" : $( '#page-deductions .score-info .technical-deductions span' ),
					"explanation" : $( '#page-deductions .score-info .technical-explanation' )
				},
				"procedural" : { "deductions" : $( '#page-deductions .score-info .procedural-deductions span' )}
			},
			"division" : {
				"progress" : $( '#page-deductions .division-info .division-progress' ),
				"summary" : $( '#page-deductions .division-info .division-summary' )
			}
		};
		display.athlete.name.html( athlete.name());
		display.division.summary.html( division.summary());
		display.division.progress.html( division.progress());

		let boards     = athlete.boards();
		let count      = boards == 0 ? 'Boards pending inspection' : `${boards} Board${boards > 1 ? 's' : ''} at inspection`;
		let score      = (boards * 0.2).toFixed( 1 );
		let deductions = {
			technical  : ( app.state.score.technical.deductions.major + app.state.score.technical.deductions.minor ).toFixed( 1 ),
			procedural : app.state.score.procedural.deductions.toFixed( 1 )
		};
		display.athlete.boards.html( count );
		display.athlete.technical.deductions.html( deductions.technical );
		display.athlete.procedural.deductions.html( deductions.procedural );
		display.athlete.technical.explanation.html( `(${boards} boards &times; 0.2 points) - ${deductions.technical} tech. deduction =` );
		display.athlete.technical.score.html(( score - deductions.technical ).toFixed( 1 ));

		// ============================================================
		// DEDUCTIONS UI BEHAVIOR
		// ============================================================
		let button = {
			"procedural" : {
				"give" : $( '#page-deductions .procedural-deductions a.give-procedural-deductions' ),
				"undo" : $( '#page-deductions .procedural-deductions a.undo-procedural-deductions' )
			},
			"technical" : {
				"give" : {
					"major" : $( '#page-deductions .major-technical-deductions a.give-technical-deductions' ),
					"minor" : $( '#page-deductions .minor-technical-deductions a.give-technical-deductions' )
				},
				"undo" : {
					"major" : $( '#page-deductions .major-technical-deductions a.undo-technical-deductions' ),
					"minor" : $( '#page-deductions .minor-technical-deductions a.undo-technical-deductions' )
				}
			},
			"next" : $( '#page-deductions .btn-next' )
		};

		function fixJsMath() {
			let fix = x => { return parseFloat( x.toFixed( 1 )); };
			app.state.score.procedural.deductions = fix( app.state.score.procedural.deductions );
			app.state.score.technical.deductions.major = fix( app.state.score.technical.deductions.major );
			app.state.score.technical.deductions.minor = fix( app.state.score.technical.deductions.minor );
		}

		button.procedural.give.off( 'click' ).click( ev => {
			app.state.score.procedural.deductions += 0.3;
			display.athlete.procedural.deductions.html( app.state.score.procedural.deductions.toFixed( 1 ));
		});
		button.procedural.undo.off( 'click' ).click( ev => {
			if( app.state.score.procedural.deductions <= 0 ) { return; }
			app.state.score.procedural.deductions -= 0.3; fixJsMath();
			display.athlete.procedural.deductions.html( app.state.score.procedural.deductions.toFixed( 1 ));
		});
		button.technical.give.major.off( 'click' ).click( ev => {
			app.state.score.technical.deductions.major += 0.3; fixJsMath();
			let sum = app.state.score.technical.deductions.major + app.state.score.technical.deductions.minor;
			display.athlete.technical.deductions.html( sum.toFixed( 1 ));
			display.athlete.technical.explanation.html( `(${boards} boards &times; 0.2 points) - ${sum.toFixed( 1 )} tech. deduction =` );
			display.athlete.technical.score.html(( score - sum ).toFixed( 1 ));
		});
		button.technical.undo.major.off( 'click' ).click( ev => {
			if( app.state.score.technical.deductions.major <= 0 ) { 
				if( app.state.score.technical.deductions.minor < 0.3 ) {
					app.state.score.technical.deductions.major = 0; 
					return; 
				}

				// Take from minors if no majors
				app.state.score.technical.deductions.minor -= 0.3; fixJsMath();
				app.state.score.technical.deductions.major += 0.3; fixJsMath();
			}

			app.state.score.technical.deductions.major -= 0.3;fixJsMath();
			let sum = app.state.score.technical.deductions.major + app.state.score.technical.deductions.minor;
			display.athlete.technical.deductions.html( sum.toFixed( 1 ));
			display.athlete.technical.explanation.html( `(${boards} boards &times; 0.2 points) - ${sum.toFixed( 1 )} tech. deduction =` );
			display.athlete.technical.score.html(( score - sum ).toFixed( 1 ));
		});
		button.technical.give.minor.off( 'click' ).click( ev => {
			app.state.score.technical.deductions.minor += 0.1;
			let sum = app.state.score.technical.deductions.major + app.state.score.technical.deductions.minor;
			display.athlete.technical.deductions.html( sum.toFixed( 1 ));
			display.athlete.technical.explanation.html( `(${boards} boards &times; 0.2 points) - ${sum.toFixed( 1 )} tech. deduction =` );
			display.athlete.technical.score.html(( score - sum ).toFixed( 1 ));
		});
		button.technical.undo.minor.off( 'click' ).click( ev => {
			if( app.state.score.technical.deductions.minor <= 0 ) { 
				if( app.state.score.technical.deductions.major < 0.3 ) {
					app.state.score.technical.deductions.minor = 0; 
					return; 
				}

				// Take from majors if no minors
				app.state.score.technical.deductions.major -= 0.3; fixJsMath();
				app.state.score.technical.deductions.minor += 0.3; fixJsMath();
			}
			app.state.score.technical.deductions.minor -= 0.1; fixJsMath();
			let sum = app.state.score.technical.deductions.major + app.state.score.technical.deductions.minor;
			display.athlete.technical.deductions.html( sum.toFixed( 1 ));
			display.athlete.technical.explanation.html( `(${boards} boards &times; 0.2 points) - ${sum.toFixed( 1 )} tech. deduction =` );
			display.athlete.technical.score.html(( score - sum ).toFixed( 1 ));
		});

		button.next.off( 'click' ).click( ev => {
			app.sound.next.play();
			$( '#nav-scoring' ).click();
		});
	},
	// ============================================================
	scoring : division => {
	// ============================================================
		let athlete = division.current.athlete();
		let boards  = athlete.boards();
		let score   = { "technical" : { "boards" : (boards * 0.2).toFixed( 1 )}, "presentation" : {}};
		let count   = boards == 0 ? 'Pending inspection' : `${boards} Board${boards > 1 ? 's' : ''} &rarr; +${score.technical.boards} pts`;
		let display = {
			"athlete" : {
				"boards" : $( '#page-scoring .athlete-boards' ),
				"name" : $( '#page-scoring .athlete-info' ),
			},
			"division" : {
				"progress" : $( '#page-scoring .division-info .division-progress' ),
				"summary" : $( '#page-scoring .division-info .division-summary' )
			}
		};
		display.athlete.name.html( athlete.name());
		display.division.summary.html( division.summary());
		display.division.progress.html( division.progress());
		display.athlete.boards.html( count );
		app.refresh.scoring.component.score( athlete );

		// ============================================================
		// SCORING UI BEHAVIOR
		// ============================================================
		let button = {
			"technical" : {
				"difficulty" : $( '#page-scoring .scores .technical .difficulty button' ),
			},
			"presentation" : {
				"technique"  : $( '#page-scoring .scores .presentation .technique button' ),
				"rhythm"     : $( '#page-scoring .scores .presentation .rhythm button' ),
				"style"      : $( '#page-scoring .scores .presentation .style button' ),
				"creativity" : $( '#page-scoring .scores .presentation .creativity button' ),
			}
		};
		button.technical.difficulty.off( 'click' ).click( ev => {
			button.technical.difficulty.removeClass( 'active' );
			let target = $( ev.target );
			let value  = parseFloat( target.text());
			target.addClass( 'active' );
			app.state.score.technical.difficulty = value;
			app.refresh.scoring.component.score( athlete );
		});

		button.presentation.technique.off( 'click' ).click( ev => {
			button.presentation.technique.removeClass( 'active' );
			let target = $( ev.target );
			let value  = parseFloat( target.text());
			target.addClass( 'active' );
			app.state.score.presentation.technique = value;
			app.refresh.scoring.component.score( athlete );
		});

		button.presentation.rhythm.off( 'click' ).click( ev => {
			button.presentation.rhythm.removeClass( 'active' );
			let target = $( ev.target );
			let value  = parseFloat( target.text());
			target.addClass( 'active' );
			app.state.score.presentation.rhythm = value;
			app.refresh.scoring.component.score( athlete );
		});

		button.presentation.style.off( 'click' ).click( ev => {
			button.presentation.style.removeClass( 'active' );
			let target = $( ev.target );
			let value  = parseFloat( target.text());
			target.addClass( 'active' );
			app.state.score.presentation.style = value;
			app.refresh.scoring.component.score( athlete );
		});

		button.presentation.creativity.off( 'click' ).click( ev => {
			button.presentation.creativity.removeClass( 'active' );
			let target = $( ev.target );
			let value  = parseFloat( target.text());
			target.addClass( 'active' );
			app.state.score.presentation.creativity = value;
			app.refresh.scoring.component.score( athlete );
		});
	},
	// ============================================================
	inspection : ring => {
	// ============================================================
		const max    = 15;
		let page = $( '#page-inspection .inspection-lists' );
		page.empty();

		ring.divisions.forEach( divdata => {
			let division = new Division( divdata );
			let athletes = division.athletes();
			let divid    = division.name();
			let board    = correct_board( division );
			let header   = $( `<div class="inspection-list-header"><div class="division-header">${division.summary()}</div><div class="correct-board">Required board size: ${board}</div><label class="athlete-name">Athlete</label><label class="board-count">Board count</label></div>` );
			let list     = $( '<div class="inspection-list"></div>' );

			athletes.forEach(( athlete, id ) => {
				let boards = athlete.boards();
				let name   = athlete.name();
				list.append( `<a class="list-group-item" data-athlete="${name}" data-id="${divid}|${id}" data-boards="${boards}">${name} <span class="badge">${boards == 0 ? '&mdash;' : boards}</span></a>` );
			});

			list.children( 'a' ).off( 'click' ).click( ev => {
				let target = $( ev.target );
				if( ! target.hasClass( 'list-group-item' )) { target = target.parent(); }
				let name    = target.attr( 'data-athlete' );
				let id      = target.attr( 'data-id' );
				let boards  = target.attr( 'data-boards' );

				$( '#board-number-pad .athlete-name' ).html( name );
				$( '#board-number-pad' ).modal( 'show' );
				$( '#board-number-pad .board-input' ).html( boards );
				$( '#board-number-pad .btn-confirm' ).attr({ 'data-id' : id });
				$( '#board-number-pad .btn-confirm' ).attr({ 'data-athlete' : name });
			});

			page.append( header, list );
		})
		$( '#board-number-pad button' ).off( 'click' ).click( ev => {
			let input   = $( '#board-number-pad .board-input' );
			let send    = $( '#board-number-pad .btn-confirm' );
			let target  = $( ev.target );
			let value   = target.attr( 'data-value' );
			let boards  = input.text() == '' ? 0 : parseInt( input.text());

			if( value == 'clear' ) {
				boards = 0;
				input.empty();
				send.addClass( 'disabled' );
				return;
			}

			if( value == 'max' ) {
				boards = max;
				input.html( boards );
				send.removeClass( 'disabled' );
				return;
			}

			let update = parseInt( `${boards}${value}` );
			input.html( boards );
			if( update <= max ) { boards = update; input.html( boards ); send.removeClass( 'disabled' ); }
			if( update == 0 ) { boards = 0; send.addClass( 'disabled' ); }

		});

		$( '#board-number-pad .btn-confirm' ).off( 'click' ).click( ev => {
			let target  = $( ev.target );
			let input   = $( '#board-number-pad .board-input' );
			let send    = $( '#board-number-pad .btn-confirm' );
			let boards  = parseInt( input.text());
			let id      = target.attr( 'data-id' );
			let name    = target.attr( 'data-athlete' );

			app.network.send({ type : 'division', action : 'inspection', athlete : id, boards });
			alertify.notify( `Sending inspection confirmation to server. ${name} has ${boards} board${boards == 1 ? '' : 's'}` );
			$( '#board-number-pad' ).modal( 'hide' );
		});
	},
	// ============================================================
	help : division => {}
	// ============================================================
};
