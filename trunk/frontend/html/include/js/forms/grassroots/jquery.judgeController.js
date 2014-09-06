$.widget( "freescore.judgeController", {
	options: { autoShow: true },
	_create: function() {
		var widget  = this.element;
		var o       = this.options;
		var e       = this.options.elements = {};
		var html    = { div : $( "<div />" ), a : $( "<a />" ), select : $( "<select />" ), option : $( "<option />" ) };

		o.ring  = $.cookie( "ring" );
		o.judge = Number($.cookie( "judge" )) - 1;

		widget.nodoubletapzoom();
		widget.addClass( 'judgeController' );
		var controller  = e.controller  = html.div.clone() .addClass( "controller" );
		var navigation  = e.navigation  = html.div.clone() .addClass( "button-row" );
		var controls    = e.controls    = html.div.clone() .addClass( "control-group" );
		var notes       = e.notes       = html.div.clone();
		var score       = e.score       = html.div.clone();

		// ============================================================
		// THE NAVIGATION BUTTONS
		// ============================================================
		o.app = "forms/grassroots/rest";
		var prevAthlete = e.prevAthlete = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, type : 'athlete',  app : o.app, command : 'athlete/previous',  label : 'Previous Athlete'  });
		var prevDiv     = e.prevDiv     = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, type : 'division', app : o.app, command : 'division/previous', label : 'Previous Division' });
		var nextDiv     = e.nextDiv     = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, type : 'division', app : o.app, command : 'division/next',     label : 'Next Division'     });
		var nextAthlete = e.nextAthlete = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, type : 'athlete',  app : o.app, command : 'athlete/next',      label : 'Next Athlete'     });
		e.navigation.append( prevAthlete, prevDiv, nextDiv, nextAthlete );

		// ============================================================
		// THE MODE BUTTONS
		// ============================================================
		var displayMode = e.displayMode = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, type : 'mode',  app : o.app, command : 'display', label : 'Flip Display' });

		// ============================================================
		// THE SCORE DROP-DOWN
		// ============================================================
		score.spinwheel({ controller : this });

		// ============================================================
		// THE ACTION BUTTONS
		// ============================================================
		var clearButton = e.clearButton = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, type : 'action clear',  app : o.app, command : o.judge + '/-10', label : 'Clear' });
		var sendButton  = e.sendButton  = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, type : 'action send',  app : o.app, command : o.judge + '/80', label : 'Send'  });

		// ============================================================
		// UPDATE BEHAVIOR
		// ============================================================
		widget.on( "updateRequest", function() {
			// ===== UPDATE ACTION BUTTON
			var score = (e.score.spinwheel( 'option', 'selected' ) * 10) .toFixed( 0 );
			e.clearButton .ajaxbutton( { command : o.judge + '/-10' } );
			e.sendButton  .ajaxbutton( { command : o.judge + '/' + score });
		});

		controller.append( navigation, controls, notes );
		controls.append( score, displayMode, clearButton, sendButton );
		widget.append( controller );

	},
	_init: function( ) {
		var e       = this.options.elements;
		var o       = this.options;
		var widget  = this.element;
		var html    = { div : $( "<div />" ), a : $( "<a />" ), select : $( "<select />" ), option : $( "<option />" ) };

		function refresh( update ) {
			var forms    = JSON.parse( update.data );
			var division = forms.divisions[ forms.current ];
			var athletes = division.athletes;
			e.notes.judgeNotes({ num : o.judge, athletes : athletes, current : division.current, name : division.name, description : division.description });

			// ===== UPDATE ACTION BUTTON
			var score = (e.score.spinwheel( 'option', 'selected' ) * 10) .toFixed( 0 );
			e.clearButton .ajaxbutton( { command : o.judge + '/-10' } );
			e.sendButton  .ajaxbutton( { command : o.judge + '/' + score });
		};

		e.source = new EventSource( '/cgi-bin/freescore/forms/grassroots/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	}
});
