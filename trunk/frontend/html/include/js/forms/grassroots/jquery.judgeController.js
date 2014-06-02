$.widget( "freescore.judgeController", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var widget  = this.element;
		var o       = this.options;
		var e       = this.options.elements = {};
		var html    = { div : $( "<div />" ), a : $( "<a />" ), select : $( "<select />" ), option : $( "<option />" ) };
		var login   = e.login = html.div.clone() .prop( 'id', 'login' );
		
		login.prop( 'title', 'Login' );
		login.html( 'Please choose a role' );
		login.dialog( { 
			autoOpen: true, resizeable: false, modal: true, width: '400px', 
			buttons: {
				'Judge 1'    : function() { o.num = 0; $( this ).dialog( "close" ); },
				'Center Ref' : function() { o.num = 1; $( this ).dialog( "close" ); },
				'Judge 3'    : function() { o.num = 2; $( this ).dialog( "close" ); },
			}
		} );

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
		var prevAthlete = e.prevAthlete = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament, type : 'athlete',  app : 'forms/grassroots', command : 'athlete/previous',  label : 'Previous Athlete'  });
		var prevDiv     = e.prevDiv     = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament, type : 'division', app : 'forms/grassroots', command : 'division/previous', label : 'Previous Division' });
		var nextDiv     = e.nextDiv     = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament, type : 'division', app : 'forms/grassroots', command : 'division/next',     label : 'Next Division'     });
		var nextAthlete = e.nextAthlete = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament, type : 'athlete',  app : 'forms/grassroots', command : 'athlete/next',      label : 'Next Athlete'     });
		e.navigation.append( prevAthlete, prevDiv, nextDiv, nextAthlete );

		// ============================================================
		// THE MODE BUTTONS
		// ============================================================
		var scoreMode   = e.scoreMode   = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament, type : 'mode',  app : 'forms/grassroots', command : 'score',   label : 'Score'   });
		var displayMode = e.displayMode = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament, type : 'mode',  app : 'forms/grassroots', command : 'display', label : 'Display' });
		e.mode.append( scoreMode, displayMode );

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
		var clearButton = e.clearButton = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament, type : 'action',  app : 'forms/grassroots', command : o.num + '/-10', label : 'Clear' });
		var scoreButton = e.scoreButton = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament, type : 'action',  app : 'forms/grassroots', command : o.num + '/8.0', label : 'Send'  });
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
			e.notes.judgeNotes({ num : o.num, athletes : division.athletes, current : division.current });

			// ===== UPDATE ACTION BUTTON
			e.clearButton.ajaxbutton( { command : o.num + '/-10' } );
			e.scoreButton.ajaxbutton( { command : o.num + '/' + e.score.val() } );
		};
		e.source = new EventSource( 'update.php' );
		e.source.addEventListener( 'message', refresh, false );
	}
});
