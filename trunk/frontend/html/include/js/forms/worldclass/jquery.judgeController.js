$.widget( "freescore.judgeController", {
	options: { autoShow: true, num: 0 },
	_create: function() {
		var o      = this.options;
		var e      = this.options.elements = {};
		var widget = this.element;
		var html   = e.html  = { div : $( "<div />" ), a : $( "<a />" ), select : $( "<select />" ), option : $( "<option />" ) };
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

		this.element.addClass( 'judgeController' );

		var front        = e.front        = html.div.clone() .addClass( "front" );
		var views        = e.views        = html.div.clone() .addClass( "view control-group" );
		var controllers  = e.controllers  = html.div.clone() .addClass( "controller control-group" );

		var flipToBack   = e.fliptoBlack  = html.div.clone() .addClass( "flip" ) .html( "Division" );
		var athlete      = e.athlete      = html.div.clone() .addClass( "athlete" );
		var score        = e.score        = html.div.clone() .addClass( "score" );
		var accuracy     = e.accuracy     = html.div.clone() .addClass( "accuracy" );
		var presentation = e.presentation = html.div.clone() .addClass( "presentation" );
		var matPosition  = e.matPosition  = html.div.clone() .matposition();

		var major        = e.major        = html.div.clone() .deductions({ value : 0.3 });
		var minor        = e.minor        = html.div.clone() .deductions({ value : 0.1 });
		var controls     = e.controls     = html.div.clone() .addClass( "controls" );

		var label        = e.label        = html.div.clone() .addClass( "label" ) .html( "Presentation Score" );
		var rhythm       = e.rhythm       = html.div.clone() .presentationBar({ label : 'Rhythm and Tempo' });
		var power        = e.power        = html.div.clone() .presentationBar({ label : 'Power and Speed' });
		var ki           = e.ki           = html.div.clone() .presentationBar({ label : 'Expression of Ki' });
		var send         = e.send         = html.div.clone() .ajaxbutton({ server : o.server, tournament : o.tournament, command : "forms/worldclass", label : "Send", type : "send" })

		score.append( accuracy, presentation, athlete );
		views.append( flipToBack, score, matPosition );
		controls.append( label, rhythm, power, ki, send );

		controllers.append( major, controls, minor );

		front.append( views, controllers );
		var notes        = e.notes        = html.div.clone() .judgeNotes({ athletes : [], current : 0 });

		widget.append( front );

		// ============================================================
		// BEHAVIOR
		// ============================================================
		flipToBack.click( function() {
			flipToBack.fadeTo( 50, 0.75, function() { flipToBack.fadeTo( 100, 1.0 ); } );
			// Do flippy thing
		});

	},
	_init: function( ) {
		var widget  = this.element;
		var e       = this.options.elements;
		var o       = this.options;
		var html    = e.html;

		function refresh( update ) {
			var division = JSON.parse( update.data );
			var command  = function( judge, score ) {

				score.accuracy     = 4.0 -
				                     e.major  .deductions( 'option', 'count' ) * e.major .deductions( 'option', 'value' ) -
								     e.minor  .deductions( 'option', 'count' ) * e.minor .deductions( 'option', 'value' );

				score.presentation = e.rhythm .presentationBar( 'option', 'value' ) +
								     e.power  .presentationBar( 'option', 'value' ) +
								     e.ki     .presentationBar( 'option', 'value' );

				e.accuracy.html( score.accuracy.toFixed( 1 ) + "<br /><span>Accuracy</span>" );
				e.presentation.html( score.presentation.toFixed( 1 ) + "<br /><span>Presentation</span>" );

				return "forms/worldclass/" + judge + "/" + score.presentation.toFixed( 1 ) + "/" + score.accuracy.toFixed( 1 );
			}
			e.send .ajaxbutton({ command : command( o.num, o ) });
			e.notes .judgeNotes({ athletes : division.athletes, current : division.current });
			e.athlete .html( "Athlete Name" );

		};
		e.source = new EventSource( 'update.php' );
		e.source.addEventListener( 'message', refresh, false );
	}
});
