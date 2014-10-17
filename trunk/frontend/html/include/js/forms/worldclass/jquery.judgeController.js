$.widget( "freescore.judgeController", {
	options: { autoShow: true },
	_create: function() {
		var o      = this.options;
		var e      = this.options.elements = {};
		var widget = this.element;
		var html   = e.html  = { div : $( "<div />" ), ul : $( "<ul />" ), li : $( "<li />" ), a : $( "<a />" ), select : $( "<select />" ), option : $( "<option />" ) };

		widget.nodoubletapzoom();

		o.num     = parseInt( $.cookie( "judge" )) - 1;
		o.ring    = parseInt( $.cookie( "ring" ));
		o.current = {};

		widget.addClass( 'judgeController flippable' );

		var card         = e.card         = html.div.clone() .addClass( "card" );
		var front        = e.front        = html.div.clone() .addClass( "front" );
		var views        = e.views        = html.div.clone() .addClass( "view control-group" );
		var controllers  = e.controllers  = html.div.clone() .addClass( "controller control-group" );

		var flipToBack   = e.fliptoBlack  = html.div.clone() .addClass( "flip" ) .html( "Division" );
		var athlete      = e.athlete      = html.ul .clone() .addClass( "athlete" ) .totemticker({ row_height : '32px', interval : 2500 });
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

			o.presentation = parseFloat( e.rhythm .presentationBar( 'option', 'value' )) +
			                 parseFloat( e.power  .presentationBar( 'option', 'value' )) +
			                 parseFloat( e.ki     .presentationBar( 'option', 'value' ));

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
		var notes        = e.notes        = html.div.clone() .judgeNotes({ current : 0, num : o.num });
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
		var ordinal = [ '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th' ];

		function refresh( update ) {
			var forms      = JSON.parse( update.data );
			var division   = forms.divisions[ 0 ];
			if( typeof( division ) === 'undefined' ) { return; }

			var form       = ordinal[ division.form ];
			var form_names = division.forms[ division.round ];
			if( typeof( form_names ) === 'undefined' ) { return; }
			var form_name  = form_names[ division.form ];

			if( form_names.length > 1 ) {
				if( division.form < (form_names.length - 1)) {
					e.prevAthlete.ajaxbutton({ label : "Prev Athlete" });
					e.nextAthlete.ajaxbutton({ label : "Next Form" });
				} else {
					e.prevAthlete.ajaxbutton({ label : "Prev Form" });
					e.nextAthlete.ajaxbutton({ label : "Next Athlete" });
				}
			}

			// ===== RESET DEFAULTS FOR A NEW ATHLETE
			if( division.current != o.current.athlete || division.form != o.current.form ) {
				var athlete  = division.athletes[ parseInt( division.current ) ];
				var items    = [ 'Judge ' + (o.num + 1), division.name.toUpperCase().replace( ".", " " ), division.description, athlete.name, form + ' form', form_name ].map( function( item ) { return e.html.li.clone() .html( item ); });
				e.athlete .empty();
				e.athlete .append( items );

				o.major  = 0.0; e.major  .deductions( { count : 0 });
				o.minor  = 0.0; e.minor  .deductions( { count : 0 });
				o.rhythm = 1.2; e.rhythm .presentationBar( { value : 1.2 });
				o.power  = 1.2; e.power  .presentationBar( { value : 1.2 });
				o.ki     = 1.2; e.ki     .presentationBar( { value : 1.2 });

				widget.trigger({ type : "updateRequest", score : o });
			}
			e.notes .judgeNotes({ athletes : division.athletes, judges : division.judges, current : division.current });


			o.current.division = forms.current;
			o.current.athlete  = division.current;
			o.current.form     = division.form;
		};
		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', refresh, false );
	}
});
