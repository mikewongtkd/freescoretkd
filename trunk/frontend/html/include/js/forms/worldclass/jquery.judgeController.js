$.widget( "freescore.judgeController", {
	options: { autoShow: true },
	_create: function() {
		var o      = this.options;
		var e      = this.options.elements = {};
		var widget = this.element;
		var html   = e.html  = { div : $( "<div />" ), a : $( "<a />" ), select : $( "<select />" ), option : $( "<option />" ) };

		widget.nodoubletapzoom();

		o.num  = parseInt( $.cookie( "judge" )) - 1;
		o.ring = parseInt( $.cookie( "ring" ));

		widget.addClass( 'judgeController flippable' );

		var card         = e.card         = html.div.clone() .addClass( "card" );
		var front        = e.front        = html.div.clone() .addClass( "front" );
		var views        = e.views        = html.div.clone() .addClass( "view control-group" );
		var controllers  = e.controllers  = html.div.clone() .addClass( "controller control-group" );

		var flipToBack   = e.fliptoBlack  = html.div.clone() .addClass( "flip" ) .html( "Division" );
		var athlete      = e.athlete      = html.div.clone() .addClass( "athlete" );
		var score        = e.score        = html.div.clone() .addClass( "score" );
		var accuracy     = e.accuracy     = html.div.clone() .addClass( "accuracy" );
		var presentation = e.presentation = html.div.clone() .addClass( "presentation" );
		var matPosition  = e.matPosition  = html.div.clone() .matposition();

		var major        = e.major        = html.div.clone() .deductions({ value : 0.3, controller : this });
		var minor        = e.minor        = html.div.clone() .deductions({ value : 0.1, controller : this });
		var controls     = e.controls     = html.div.clone() .addClass( "controls" );

		var label        = e.label        = html.div.clone() .addClass( "label" ) .html( "Presentation Score" );
		var rhythm       = e.rhythm       = html.div.clone() .presentationBar({ label : 'Rhythm and Tempo', controller: this });
		var power        = e.power        = html.div.clone() .presentationBar({ label : 'Power and Speed',  controller: this });
		var ki           = e.ki           = html.div.clone() .presentationBar({ label : 'Expression of Ki', controller: this });
		var send         = e.send         = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, app : "forms/worldclass/rest", label : "Send", type : "send" })

		var command      = o.command      = function( judge, score ) {
			var major  = (e.major  .deductions( 'option', 'count' ) * e.major .deductions( 'option', 'value' ) * 10) .toFixed( 0 );
			var minor  = (e.minor  .deductions( 'option', 'count' ) * e.minor .deductions( 'option', 'value' ) * 10) .toFixed( 0 );
			var rhythm = (e.rhythm .presentationBar( 'option', 'value' ) * 10) .toFixed( 0 );
			var power  = (e.power  .presentationBar( 'option', 'value' ) * 10) .toFixed( 0 );
			var ki     = (e.ki     .presentationBar( 'option', 'value' ) * 10) .toFixed( 0 );

			return judge + "/" + major + "/" + minor + "/" + rhythm + "/" + power + "/" + ki;
		}

		// ===== UPDATE BEHAVIOR
		widget.on( "updateRequest", function( ev ) {
			var o = ev.score;
			var e = ev.score.elements;
			o.accuracy     = 4.0 -
			                 e.major .deductions( 'option', 'count' ) * e.major .deductions( 'option', 'value' ) -
			                 e.minor .deductions( 'option', 'count' ) * e.minor .deductions( 'option', 'value' );
			o.accuracy     = o.accuracy < 0 ? 0 : o.accuracy; // The accuracy score cannot be lower than 0

			o.presentation = e.rhythm .presentationBar( 'option', 'value' ) +
			                 e.power  .presentationBar( 'option', 'value' ) +
			                 e.ki     .presentationBar( 'option', 'value' );

			e.accuracy     .html( o.accuracy     .toFixed( 1 ) + "<br /><span>Accuracy</span>" );
			e.presentation .html( o.presentation .toFixed( 1 ) + "<br /><span>Presentation</span>" );
			e.send .ajaxbutton({ command : o.command( o.num, o ) }); // Update "send" button callback
		} );


		score.append( accuracy, presentation, athlete );
		views.append( flipToBack, score, matPosition );
		controls.append( label, rhythm, power, ki, send );

		controllers.append( major, controls, minor );

		front.append( views, controllers );

		o.app = "forms/worldclass/rest";
		var back         = e.back         = html.div.clone() .addClass( "back" );
		var notes        = e.notes        = html.div.clone() .judgeNotes({ athletes : [], current : 0, num : o.num });
		var flipToFront  = e.fliptoFront  = html.div.clone() .addClass( "flip" ) .html( "Score" );
		var prevAthlete  = e.prevAthlete  = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, app : o.app, command : "athlete/previous",  label : "Prev Athlete",  type : "navigate prev athlete"  });
		var nextAthlete  = e.nextAthlete  = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, app : o.app, command : "athlete/next",      label : "Next Athlete",  type : "navigate next athlete"  });
		var prevDivision = e.prevDivision = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, app : o.app, command : "division/previous", label : "Prev Division", type : "navigate prev division" });
		var nextDivision = e.nextDivision = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, app : o.app, command : "division/next",     label : "Next Division", type : "navigate next division" });
		var flipDisplay  = e.flipDisplay  = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament.db, ring : o.ring, app : o.app, command : "display",           label : "Flip Display",  type : "navigate mode"          });

		back.append( prevAthlete, nextAthlete, prevDivision, nextDivision, flipDisplay, notes, flipToFront );

		card.append( front, back );

		widget.append( card );
		widget.trigger( { type : "updateRequest", score : o } );

		// ============================================================
		// BEHAVIOR
		// ============================================================
		flipToBack.click( function() {
			flipToBack.fadeTo( 50, 0.75, function() { flipToBack.fadeTo( 100, 1.0 ); } );
			card.toggleClass( 'flipped' );
		});
		flipToFront.click( function() {
			flipToFront.fadeTo( 50, 0.75, function() { flipToFront.fadeTo( 100, 1.0 ); } );
			card.toggleClass( 'flipped' );
		});

	},
	_init: function( ) {
		var widget  = this.element;
		var e       = this.options.elements;
		var o       = this.options;
		var html    = e.html;

		function refresh( update ) {
			var forms     = JSON.parse( update.data );
			var division  = forms.divisions[ forms.current ];
			if( typeof( division.athletes ) !== 'undefined' ) {
				var athlete  = division.athletes[ parseInt( division.current ) ];
				e.athlete .html( athlete.name );

				// ===== RESTORE PREVIOUS SCORE IF RESCORING AN ATHLETE
				if( division.current != o.currentAthlete ) {
					var major  = { previous : parseFloat( athlete .scores[ o.num ] .major  ) / e.major.deductions( 'option', 'value' ), current : e.major.deductions( 'option', 'count' ) };
					var minor  = { previous : parseFloat( athlete .scores[ o.num ] .minor  ) / e.minor.deductions( 'option', 'value' ), current : e.minor.deductions( 'option', 'count' ) };
					var rhythm = { previous : parseFloat( athlete .scores[ o.num ] .rhythm ),                                           current : e.rhythm .presentationBar( 'option', 'value' ) };
					var power  = { previous : parseFloat( athlete .scores[ o.num ] .power  ),                                           current : e.power  .presentationBar( 'option', 'value' ) };
					var ki     = { previous : parseFloat( athlete .scores[ o.num ] .ki     ),                                           current : e.ki     .presentationBar( 'option', 'value' ) };
					if( major.previous  != major.current  && major.previous  > 0) { o.major  = major.previous;  e.major.deductions( { count : Math.round( major.previous )}); }
					if( minor.previous  != minor.current  && minor.previous  > 0) { o.minor  = minor.previous;  e.minor.deductions( { count : Math.round( minor.previous )}); }
					if( rhythm.previous != rhythm.current && rhythm.previous > 0) { o.rhythm = rhythm.previous; e.rhythm .presentationBar( { value : rhythm.previous }); }
					if( power.previous  != power.current  && power.previous  > 0) { o.power  = power.previous;  e.power  .presentationBar( { value : power.previous }); }
					if( ki.previous     != ki.current     && ki.previous     > 0) { o.ki     = ki.previous;     e.ki     .presentationBar( { value : ki.previous }); }
					widget.trigger({ type : "updateRequest", score : o });
				}
			}
			e.notes .judgeNotes({ athletes : division.athletes, current : division.current });


			o.currentDivision = forms.current;
			o.currentAthlete  = division.current;
		};
		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	}
});
