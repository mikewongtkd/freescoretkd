$.widget( "freescore.judgeController", {
	options: { autoShow: true },
	_create: function() {
		var widget  = this.element;
		var o       = this.options;
		var e       = this.options.elements = {};
		var html    = { div : $( "<div />" ), a : $( "<a />" ), select : $( "<select />" ), option : $( "<option />" ) };

		o.ring  = $.cookie( "ring" );
		o.judge = Number($.cookie( "judge" )) - 1;

		widget.addClass( 'judgeController' );
		var controller  = e.controller  = html.div.clone() .addClass( "controller" );
		var navigation  = e.navigation  = html.div.clone() .addClass( "button-row" );
		var controls    = e.controls    = html.div.clone() .addClass( "control-group" );
		var notes       = e.notes       = html.div.clone();
		var mode        = e.mode        = html.div.clone() .addClass( "button-row" );
		var scoreSelect = e.scoreSelect = html.div.clone() .addClass( "select" );
		var scoring     = e.scoring     = html.div.clone() .addClass( "button-row" );

		// ============================================================
		// THE NAVIGATION BUTTONS
		// ============================================================
		var prevAthlete = e.prevAthlete = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, type : 'athlete',  app : 'forms/grassroots', command : 'athlete/previous',  label : 'Previous Athlete'  });
		var prevDiv     = e.prevDiv     = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, type : 'division', app : 'forms/grassroots', command : 'division/previous', label : 'Previous Division' });
		var nextDiv     = e.nextDiv     = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, type : 'division', app : 'forms/grassroots', command : 'division/next',     label : 'Next Division'     });
		var nextAthlete = e.nextAthlete = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, type : 'athlete',  app : 'forms/grassroots', command : 'athlete/next',      label : 'Next Athlete'     });
		e.navigation.append( prevAthlete, prevDiv, nextDiv, nextAthlete );

		// ============================================================
		// THE MODE BUTTONS
		// ============================================================
		var displayMode = e.displayMode = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, type : 'mode',  app : 'forms/grassroots', command : 'display', label : 'Flip Display' });
		e.mode.append( displayMode );

		// ============================================================
		// THE SCORE DROP-DOWN
		// ============================================================
		var score = e.score = html.select.clone() .addClass( 'chosen-select' );
		for( var i = 75; i < 100; i++ ) {
			var j = i / 10.0;
			var option = html.option.clone() .prop( 'value', i ) .append( j.toFixed( 1 ) );
			if( i == 85 ) { option.prop( 'selected', 'true' ); }
			score.append( option );
		}
		scoreSelect.append( score );

		// ============================================================
		// THE ACTION BUTTONS
		// ============================================================
		var clearButton = e.clearButton = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, type : 'action',  app : 'forms/grassroots', command : o.judge + '/-10', label : 'Clear' });
		var scoreButton = e.scoreButton = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, type : 'action',  app : 'forms/grassroots', command : o.judge + '/8.0', label : 'Send'  });
		e.scoring.append( clearButton, scoreButton );

		controller.append( navigation, controls, notes );
		controls.append( mode, scoreSelect, scoring );
		widget.append( controller );

	},
	_init: function( ) {
		var e       = this.options.elements;
		var o       = this.options;
		var widget  = this.element;
		var html    = { div : $( "<div />" ), a : $( "<a />" ), select : $( "<select />" ), option : $( "<option />" ) };

		function refresh( update ) {
			var division = JSON.parse( update.data );
			e.notes.judgeNotes({ num : o.judge, athletes : division.athletes, current : division.current });

			// ===== UPDATE ACTION BUTTON
			e.clearButton.ajaxbutton( { command : o.judge + '/-10' } );
			e.scoreButton.ajaxbutton( { command : o.judge + '/' + e.score.val() } );
		};
		e.source = new EventSource( 'update.php?ring=' + o.ring );
		e.source.addEventListener( 'message', refresh, false );
	}
});
