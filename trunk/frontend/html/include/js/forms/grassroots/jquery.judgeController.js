$.widget( "freescore.judgeController", {
	options: { autoShow: true },
	_create: function() {
		var widget  = this.element;
		var o       = this.options;
		var e       = this.options.elements = {};
		var html    = { div : $( "<div />" ), a : $( "<a />" ), select : $( "<select />" ), option : $( "<option />" ) };

		o.ring  = parseInt($.cookie( "ring" ));
		o.judge = parseInt($.cookie( "judge" )) - 1;

		console.log( 'RING: ', o.ring, 'JUDGE: ', o.judge );

		widget.nodoubletapzoom();
		widget.addClass( 'judgeController' );
		var controller  = e.controller  = html.div.clone() .addClass( "controller" );
		var navigation  = e.navigation  = html.div.clone() .addClass( "button-row" );
		var controls    = e.controls    = html.div.clone() .addClass( "control-group" );
		var notes       = e.notes       = html.div.clone();
		var score       = e.score       = html.div.clone();
		var vote        = e.vote        = html.div.clone();

		// ============================================================
		// THE NAVIGATION BUTTONS
		// ============================================================
		var port = ':3080/';
		var prevAthlete = e.prevAthlete = html.div.clone() .ajaxbutton({ server : o.server, port : port, tournament : o.tournament.db, ring : o.ring, type : 'athlete',  command : 'athlete/previous',  label : 'Previous Athlete'  });
		var prevDiv     = e.prevDiv     = html.div.clone() .ajaxbutton({ server : o.server, port : port, tournament : o.tournament.db, ring : o.ring, type : 'division', command : 'division/previous', label : 'Previous Division' });
		var nextDiv     = e.nextDiv     = html.div.clone() .ajaxbutton({ server : o.server, port : port, tournament : o.tournament.db, ring : o.ring, type : 'division', command : 'division/next',     label : 'Next Division'     });
		var nextAthlete = e.nextAthlete = html.div.clone() .ajaxbutton({ server : o.server, port : port, tournament : o.tournament.db, ring : o.ring, type : 'athlete',  command : 'athlete/next',      label : 'Next Athlete'     });
		e.navigation.append( prevAthlete, prevDiv, nextDiv, nextAthlete );

		// ============================================================
		// THE MODE BUTTONS
		// ============================================================
		var displayMode = e.displayMode = html.div.clone() .ajaxbutton({ server : o.server, port : port, tournament : o.tournament.db, ring : o.ring, type : 'mode',  command : 'display', label : 'Flip Display' });

		// ============================================================
		// THE SCORE DROP-DOWN AND VOTE
		// ============================================================
		score.spinwheel() .show();
		vote.tiebreaker() .hide();

		// ============================================================
		// THE ACTION BUTTONS
		// ============================================================
		var clearButton = e.clearButton = html.div.clone() .ajaxbutton({ server : o.server, port : port, tournament : o.tournament.db, ring : o.ring, type : 'action clear', command : o.judge + '/-10', label : 'Clear' });
		var sendButton  = e.sendButton  = html.div.clone() .ajaxbutton({ server : o.server, port : port, tournament : o.tournament.db, ring : o.ring, type : 'action send',  command : o.judge + '/80', label : 'Send'  });

		o.vote  = e.vote.tiebreaker( 'option', 'vote' );
		o.score = (e.score.spinwheel( 'option', 'selected' ) * 10) .toFixed( 0 );

		// ============================================================
		// UPDATE BEHAVIOR
		// ============================================================
		widget.on( "updateRequest", function() {
			// ===== UPDATE ACTION BUTTON
			o.vote  = e.vote.tiebreaker( 'option', 'vote' );
			o.score = (e.score.spinwheel( 'option', 'selected' ) * 10) .toFixed( 0 );
			if( defined( o.vote )) {
				console.log( o.command + '/' + o.vote );
				e.clearButton .ajaxbutton( { command : o.command + '/-10' } );
				e.sendButton  .ajaxbutton( { command : o.command + '/' + o.vote });
			} else {
				console.log( o.command + '/' + o.score );
				e.clearButton .ajaxbutton( { command : o.command + '/-10' } );
				e.sendButton  .ajaxbutton( { command : o.command + '/' + o.score });
			}
		});

		controller.append( navigation, controls, notes );
		controls.append( score, vote, displayMode, clearButton, sendButton );
		widget.append( controller );

	},
	_init: function( ) {
		var e       = this.options.elements;
		var o       = this.options;
		var widget  = this.element;
		var html    = { div : $( "<div />" ), a : $( "<a />" ), select : $( "<select />" ), option : $( "<option />" ) };

		function refresh( update ) {
			var progress = JSON.parse( update.data ); if( ! defined( progress )) { return; } if( ! defined( progress.divisions )) { return; }
			var division = progress.divisions.find((d) => { return d.name == progress.current; });
			if( typeof( division ) === 'undefined' ) { return; }
			division = new Division( division );

			// ------------------------------------------------------------
			// UI TO RESOLVE DIVISION TIES
			// ------------------------------------------------------------
			if( division.is.tied()) {
				o.command = o.judge + '/tb';
				var resolve  = division.tied[ 0 ]; // Resolve the first tie
				var athletes = resolve.tied.map( function( i ) { return division.athletes[ i ]; } );

				// ===== TWO-WAY TIE-BREAKER BY VOTE
				if( resolve.tied.length == 2 ) {
					e.notes.judgeNotes({ num : o.judge, athletes : athletes, current : null, blue : 0, red : 1, name : division.name(), description : 'Tiebreaker' });
					e.score.hide();
					e.vote.show();
					e.clearButton .ajaxbutton( { command : o.command + '/-10' } );
					e.sendButton  .ajaxbutton( { command : o.command + '/' + o.vote });

				// ===== THREE OR MORE TIE-BREAKER BY SCORE
				} else {
					e.notes.judgeNotes({ num : o.judge, athletes : athletes, current : division.current, blue: null, red: null, name : division.name(), description : 'Tiebreaker' });
					e.score.show();
					e.vote.hide();
					e.clearButton .ajaxbutton( { command : o.command + '/-10' } );
					e.sendButton  .ajaxbutton( { command : o.command + '/' + o.score });
				}

			// ------------------------------------------------------------
			// UI FOR SINGLE-ELIMINATION
			// ------------------------------------------------------------
			} else if( division.is.single.elimination()) {
				e.prevAthlete.find( '.label' ).html( 'Previous Match' );
				e.nextAthlete.find( '.label' ).html( 'Next Match' );
				o.command = o.judge + '/vote';
				console.log( division );
				var bracket  = division.current.bracket();
				var athletes = division.current.athletes();

				e.notes.judgeNotes({ num : o.judge, athletes : athletes, current : null, blue : bracket.blue.athlete, red : bracket.red.athlete, name : division.name(), description : 'Single Elimination', bracket : bracket });
				e.score.hide();
				e.vote.show();
				e.clearButton .ajaxbutton( { command : o.command + '/clear' } );
				e.sendButton  .ajaxbutton( { command : o.command + '/' + o.vote });

			// ------------------------------------------------------------
			// UI FOR NORMAL SCORING
			// ------------------------------------------------------------
			}  else {
				e.prevAthlete.find( '.label' ).html( 'Previous Athlete' );
				e.nextAthlete.find( '.label' ).html( 'Next Athlete' );
				o.command = o.judge;
				var athletes = division.athletes();
				e.notes.judgeNotes({ num : o.judge, athletes : athletes, current : division.current.athleteId(), blue: null, red: null, name : division.name(), description : division.description() });
				var score = (e.score.spinwheel( 'option', 'selected' ) * 10) .toFixed( 0 );
				e.score.show();
				e.vote.hide();
				e.clearButton .ajaxbutton( { command : o.command + '/-10' } );
				e.sendButton  .ajaxbutton( { command : o.command + '/' + score });
			}
		};

		e.source = new EventSource( '/cgi-bin/freescore/forms/grassroots/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	}
});
