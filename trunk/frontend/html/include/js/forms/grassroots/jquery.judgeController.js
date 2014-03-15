$.widget( "freescore.judgeController", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var options = this.options;
		var e       = this.options.elements = {};
		var html    = { div : $( "<div />" ), select : $( "<select />" ), option : $( "<option />" ) };
		var login   = e.login = html.div.clone() .prop( 'id', 'login' );
		
		login.prop( 'title', 'Login' );
		login.html( 'Please choose a role' );
		login.dialog( { 
			autoOpen: true, resizeable: false, modal: true, width: '400px', 
			buttons: {
				'Judge 1'    : function() { options.num = 0; $( this ).dialog( "close" ); },
				'Center Ref' : function() { options.num = 1; $( this ).dialog( "close" ); },
				'Judge 3'    : function() { options.num = 2; $( this ).dialog( "close" ); },
			}
		} );

		this.element.addClass( 'judgeController' );
		var navigation  = e.navigation  = html.div.clone() .addClass( "controller" );
		var mode        = e.mode        = html.div.clone() .addClass( "controller" );
		var scoreSelect = e.scoreSelect = html.div.clone() .addClass( "select" );
		var scoring     = e.scoring     = html.div.clone() .addClass( "controller" );
		var athlete     = e.athlete     = html.div.clone() .addClass( "name" );

		// ============================================================
		// THE SCORE DROP-DOWN
		// ============================================================
		var score = e.score = html.select.clone();
		for( var i = 75; i < 100; i++ ) {
			var j = i / 10.0;
			var option = html.option.clone() .prop( 'value', i ) .append( j.toFixed( 1 ) );
			if( i == 85 ) { option.prop( 'selected', 'true' ); }
			score.append( option );
		}

		scoreSelect.append( score );
		this.element.append( navigation, mode, scoreSelect, scoring, athlete );

	},
	_init: function( ) {
		var o       = this.options;
		var e       = this.options.elements;
		var widget  = this.element;
		var html    = { div : $( "<div />" ), select : $( "<select />" ), option : $( "<option />" ) };

		var refresh = function() {
		$.getJSON(
			'http://' + o.server + '/cgi-bin/freescore/forms/grassroots/' + o.tournament,
			function( division ) { 
				e.navigation.empty();
				e.mode.empty();
				e.athlete.empty();
				e.scoring.empty();
				if( o.num == 1 ) {
					// ============================================================
					// THE NAVIGATION BUTTONS
					// ============================================================
					var prevAthlete = html.div.clone() .addClass( "button athlete"  ) .html( "<span class=\"label\">Previous Athlete</span>" );
					var prevDiv     = html.div.clone() .addClass( "button division" ) .html( "<span class=\"label\">Previous Division</span>" );
					var nextDiv     = html.div.clone() .addClass( "button division" ) .html( "<span class=\"label\">Next Division</span>" );
					var nextAthlete = html.div.clone() .addClass( "button athlete"  ) .html( "<span class=\"label\">Next Athlete</span>" );

					prevAthlete.click( function() { $.getJSON( 'http://' + o.server + '/cgi-bin/freescore/forms/grassroots/' + o.tournament + '/' + division.id + '/previous', function( division ) {})});
					nextAthlete.click( function() { $.getJSON( 'http://' + o.server + '/cgi-bin/freescore/forms/grassroots/' + o.tournament + '/' + division.id + '/next', function( division ) {})});
					prevDiv.click( function() { $.getJSON( 'http://' + o.server + '/cgi-bin/freescore/forms/grassroots/' + o.tournament + '/previous', function( division ) {})});
					nextDiv.click( function() { $.getJSON( 'http://' + o.server + '/cgi-bin/freescore/forms/grassroots/' + o.tournament + '/next', function( division ) {})});

					e.navigation.append( prevAthlete, prevDiv, nextDiv, nextAthlete );

					// ============================================================
					// THE MODE BUTTONS
					// ============================================================
					var scoreMode   = html.div.clone() .addClass( "button mode"  ) .html( "<span class=\"label\">Score</span>" );
					var displayMode = html.div.clone() .addClass( "button mode"  ) .html( "<span class=\"label\">Display</span>" );

					scoreMode   .click( function() { $.getJSON( 'http://' + o.server + '/cgi-bin/freescore/forms/grassroots/' + o.tournament + '/' + division.id + '/score', function( division ) {})});
					displayMode .click( function() { $.getJSON( 'http://' + o.server + '/cgi-bin/freescore/forms/grassroots/' + o.tournament + '/' + division.id + '/display', function( division ) {})});

					e.mode.append( scoreMode, displayMode );

				}
				// ============================================================
				// THE ACTION BUTTONS
				// ============================================================
				var clearButton = html.div.clone() .addClass( "button action"  ) .html( "<span class=\"label\">Clear</span>" );
				var scoreButton = html.div.clone() .addClass( "button action"  ) .html( "<span class=\"label\">Send</span>" );
				clearButton .click( function() { $.getJSON( 'http://' + o.server + '/cgi-bin/freescore/forms/grassroots/' + o.tournament + '/' + division.id + '/' + division.current + '/' + o.num + '/-10', function( division ) {})});
				scoreButton .click( function() { $.getJSON( 'http://' + o.server + '/cgi-bin/freescore/forms/grassroots/' + o.tournament + '/' + division.id + '/' + division.current + '/' + o.num + '/' + e.score.val(), function( division ) {})});
				e.scoring.append( clearButton, scoreButton );

				// ============================================================
				// THE ATHLETE
				// ============================================================
				var athlete = division.athletes[ division.current ];
				e.athlete.append( "<h2>" + athlete.name + "</h2>" );

			});
		};

		refresh();
		window.setInterval( refresh, 2000 );
	}
});
