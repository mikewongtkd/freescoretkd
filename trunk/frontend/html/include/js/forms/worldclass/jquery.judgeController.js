$.widget( "freescore.judgeController", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var o      = this.options;
		var e      = this.options.elements = {};
		var widget = this.element;
		var html   = e.html  = { div : $( "<div />" ), a : $( "<a />" ), select : $( "<select />" ), option : $( "<option />" ) };

		widget.nodoubletapzoom();

		/*
		var login  = e.login = html.div.clone() .prop( 'id', 'login' );
		
		login.prop( 'title', 'Login' );
		login.html( 'Please choose a role' );
		login.dialog( { 
			autoOpen: true, resizeable: false, modal: true, width: '400px', 
			buttons: {
				'Judge 1'  : function() { o.num =  0; $( this ).dialog( "close" ); },
				'Judge 2'  : function() { o.num =  1; $( this ).dialog( "close" ); },
				'Judge 3'  : function() { o.num =  2; $( this ).dialog( "close" ); },
				'Judge 4'  : function() { o.num =  3; $( this ).dialog( "close" ); },
				'Judge 5'  : function() { o.num =  4; $( this ).dialog( "close" ); },
				'Operator' : function() { o.num = -1; $( this ).dialog( "close" ); },
			}
		} );
		// Temporarily disabled for faster development
		*/ o.num = 2;

		// ===== UPDATE BEHAVIOR
		o.updateScore = function( judge, score ) {
			score.accuracy     = 4.0 -
								 e.major  .deductions( 'option', 'count' ) * e.major .deductions( 'option', 'value' ) -
								 e.minor  .deductions( 'option', 'count' ) * e.minor .deductions( 'option', 'value' );
			score.accuracy     = score.accuracy < 0 ? 0 : score.accuracy; // The accuracy score cannot be lower than 0

			score.presentation = e.rhythm .presentationBar( 'option', 'value' ) +
								 e.power  .presentationBar( 'option', 'value' ) +
								 e.ki     .presentationBar( 'option', 'value' );

			e.accuracy.html( score.accuracy.toFixed( 1 ) + "<br /><span>Accuracy</span>" );
			e.presentation.html( score.presentation.toFixed( 1 ) + "<br /><span>Presentation</span>" );
		}

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

		var major        = e.major        = html.div.clone() .deductions({ value : 0.3, controller : o });
		var minor        = e.minor        = html.div.clone() .deductions({ value : 0.1, controller : o });
		var controls     = e.controls     = html.div.clone() .addClass( "controls" );

		var label        = e.label        = html.div.clone() .addClass( "label" ) .html( "Presentation Score" );
		var rhythm       = e.rhythm       = html.div.clone() .presentationBar({ label : 'Rhythm and Tempo', controller: o });
		var power        = e.power        = html.div.clone() .presentationBar({ label : 'Power and Speed',  controller: o });
		var ki           = e.ki           = html.div.clone() .presentationBar({ label : 'Expression of Ki', controller: o });
		var send         = e.send         = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament, app : "forms/worldclass", label : "Send", type : "send" })

		score.append( accuracy, presentation, athlete );
		views.append( flipToBack, score, matPosition );
		controls.append( label, rhythm, power, ki, send );

		controllers.append( major, controls, minor );

		front.append( views, controllers );

		var back         = e.back         = html.div.clone() .addClass( "back" );
		var notes        = e.notes        = html.div.clone() .judgeNotes({ athletes : [], current : 0, num : o.num });
		var flipToFront  = e.fliptoFront  = html.div.clone() .addClass( "flip" ) .html( "Score" );
		var prevAthlete  = e.prevAthlete  = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament, app : "forms/worldclass", command : "athlete/previous",  label : "Prev Athlete",  type : "navigate prev athlete"  });
		var nextAthlete  = e.nextAthlete  = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament, app : "forms/worldclass", command : "athlete/next",      label : "Next Athlete",  type : "navigate next athlete"  });
		var prevDivision = e.prevDivision = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament, app : "forms/worldclass", command : "division/previous", label : "Prev Division", type : "navigate prev division" });
		var nextDivision = e.nextDivision = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament, app : "forms/worldclass", command : "division/next",     label : "Next Division", type : "navigate next division" });
		var flipDisplay  = e.flipDisplay  = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament, app : "forms/worldclass", command : "display",           label : "Flip Display",  type : "navigate mode"          });

		back.append( prevAthlete, nextAthlete, prevDivision, nextDivision, flipDisplay, notes, flipToFront );

		card.append( front, back );

		widget.append( card );
		o.updateScore( o.num, o );

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
			var division = JSON.parse( update.data );
			var athlete  = division.athletes[ division.current ];
			var command  = function( judge, score ) {
				var major  = (e.major  .deductions( 'option', 'count' ) * e.major .deductions( 'option', 'value' ) * 10) .toFixed( 0 );
				var minor  = (e.minor  .deductions( 'option', 'count' ) * e.minor .deductions( 'option', 'value' ) * 10) .toFixed( 0 );
				var rhythm = (e.rhythm .presentationBar( 'option', 'value' ) * 10) .toFixed( 0 );
				var power  = (e.power  .presentationBar( 'option', 'value' ) * 10) .toFixed( 0 );
				var ki     = (e.ki     .presentationBar( 'option', 'value' ) * 10) .toFixed( 0 );

				return judge + "/" + major + "/" + minor + "/" + rhythm + "/" + power + "/" + ki;
			}
			e.send .ajaxbutton({ command : command( o.num, o ) });
			e.notes .judgeNotes({ athletes : division.athletes, current : division.current });
			e.athlete .html( athlete.name );

		};
		e.source = new EventSource( 'update.php' );
		e.source.addEventListener( 'message', refresh, false );
	}
});
