$.widget( "freescore.coordinatorController", {
	options: { autoShow: true },
	_create: function() {
		var o       = this.options;
		var e       = this.options.elements = {};
		var widget  = this.element;
		var html    = e.html  = FreeScore.html;

		o.ring      = parseInt( $.cookie( "ring" ));
		o.port      = ':3088/';
		o.current   = {};
		o.forms     = {};
		o.method    = 'cutoff';
		var ring    = o.ring == 'staging' ? 'Staging' : 'Ring ' + o.ring;

		var sound    = e.sound = {
			send      : new Howl({ urls: [ "/freescore/sounds/upload.mp3",   "/freescore/sounds/upload.ogg"   ]}),
			confirmed : new Howl({ urls: [ "/freescore/sounds/received.mp3", "/freescore/sounds/received.ogg" ]}),
			error     : new Howl({ urls: [ "/freescore/sounds/quack.mp3",    "/freescore/sounds/quack.ogg"    ]}),
			next      : new Howl({ urls: [ "/freescore/sounds/next.mp3",     "/freescore/sounds/next.ogg"   ]}),
			prev      : new Howl({ urls: [ "/freescore/sounds/prev.mp3",     "/freescore/sounds/prev.ogg"   ]}),
		};

		var button = html.a.clone() .addClass( 'ui-btn ui-corner-all' ) .css({ height: '42px', 'text-align' : 'left' });
		$.fn.extend({ iconlabel : function( icon, label ) { $( this ).html( "<span class=\"glyphicon glyphicon-" + icon + "\">&nbsp;</span>&nbsp;" + label ); return $( this ); }});

		// ============================================================
		// PAGE LAYOUTS
		// ============================================================

		// ===== RING COORDINATOR UI FRAMEWORK
		var divisions = e.divisions = {
			page    : html.div.clone() .attr({ 'data-role': 'page', id: 'divisions' }),
			header  : html.div.clone() .attr({ 'data-role': 'header', 'data-theme': 'b', 'data-position' : 'fixed' }) .html( "<h1>Divisions for " + ring + "</h1>" ),
			main    : html.div.clone() .attr({ 'role': 'main' }),
			list    : html.ul.clone()  .attr({ 'role': 'listview', 'data-filter' : true, 'data-filter-placeholder' : 'Search for division description or athlete name...' }) .addClass( 'divisions' ),
		};

		// ===== DIVISION COORDINATOR UI FRAMEWORK
		var athletes  = e.athletes = {
			page    : html.div   .clone() .attr({ 'data-role' : 'page', id: 'athletes' }),
			header  : { 
				panel : html.div   .clone() .attr({ 'data-role' : 'header', 'data-theme': 'b', 'data-position' : 'fixed' }),
				back  : html.a     .clone() .attr({ 'href' : '#divisions', 'data-transition' : 'slide', 'data-direction' : 'reverse', 'data-icon' : 'carat-l' }) .html( 'Divisions for Ring ' + o.ring ),
				title : html.h1    .clone() .html( 'Athletes' ),
				setup : html.a     .clone() .attr({ 'data-icon' : 'gear', 'data-iconpos' : 'right', 'data-rel' : 'popup', 'href' : '#division-setup' }) .html( 'Division Setup' ),
				menu  : {
					panel       : html.div .clone() .attr({ 'data-role' : 'popup', 'id' : 'division-setup', 'data-theme' : 'b' }),
					list        : html.ul  .clone() .attr({ 'data-role' : 'listview', 'data-inset' : true }),
					description : html.li  .clone() .attr({ 'data-icon' : 'edit' }) .append( html.a.clone() .html( 'Edit Description' )),
					forms       : html.li  .clone() .attr({ 'data-icon' : 'edit' }) .append( html.a.clone() .html( 'Edit Forms' )),
					judges      : html.li  .clone() .attr({ 'data-icon' : 'edit' }) .append( html.a.clone() .html( 'Change Number of Judges' )),
					method      : html.li  .clone() .attr({ 'data-icon' : 'edit' }) .append( html.a.clone() .html( 'Change Competition Method' )),
				},
				editor : {
					description : html.div.clone() .divisionDescriptor( o ),
					forms       : html.div.clone() .formSelector( o ),
					judges      : html.div.clone() .judgeCount( o ),
					method      : html.div.clone() .method( o ),
				},
			},
			main    : html.div   .clone() .attr({ 'role': 'main' }),
			table   : html.table .clone() .addClass( 'athletes' ) .attr({ 'cellpadding' : 0, 'cellspacing' : 0 }),
			thead   : html.thead .clone(),
			tbody   : html.tbody .clone() .addClass( 'athlete-list' ),
			actions : html.div   .clone(),
			rounds  : html.div   .clone() .addClass( 'rounds' ),
		};

		// ===== DIALOG FRAMEWORK
		var dialog = e.dialog = $( '#popupDialog' );

		// ============================================================
		// BUTTONS FOR DIVISION COORDINATOR UI
		// ============================================================
		var actions = e.actions = {
			panel : html.div.clone() .addClass( "actions" ),
			admin : {
				panel      : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend     : html.legend.clone() .html( "Administration" ),
				display    : button.clone() .addClass( 'navigation' ) .iconlabel( "eye-open",     "Show Display"   ),
				print      : button.clone() .addClass( 'navigation' ) .iconlabel( "print",        "Print Results"  ),
				split      : button.clone() .addClass( 'navigation' ) .iconlabel( "resize-full",  "Split Flights"  ),
				merge      : button.clone() .addClass( 'navigation' ) .iconlabel( "resize-small", "Merge Flights"  ),
			},

			changes : {
				panel      : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend     : html.legend.clone() .html( "Changes" ),
				save       : button.clone() .addClass( 'navigation' ) .iconlabel( "floppy-disk",   "Save"            ),
				revert     : button.clone() .addClass( 'navigation' ) .iconlabel( "floppy-remove", "Revert Changes"  ),
			},

			clock : {
				panel      : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend     : html.legend.clone() .html( "Timer" ),
				face       : button.clone() .addClass( 'timer' ) .css({ 'text-align' : 'center' }) .html( "0:00.0" ),
				toggle     : button.clone() .addClass( 'start' ) .iconlabel( "time",  "Start Timer" ),
				settings   : { increment : 70, started : false },
				timer      : undefined,
				time       : 0,
				realtime   : 0,
			},

			navigate : {
				panel      : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend     : html.legend.clone() .html( "Go To This Division" ),
				division   : button.clone() .addClass( 'navigation'  ) .iconlabel( "play", "Start Scoring" ),
			},

			penalties : {
				panel      : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend     : html.legend.clone() .html( "Penalties" ),
				timelimit  : button.clone() .addClass( 'penalty' ) .iconlabel( "hourglass", "Time Limit"      ),
				bounds     : button.clone() .addClass( 'penalty' ) .iconlabel( "share",     "Out-of-Bounds"   ),
				restart    : button.clone() .addClass( 'penalty' ) .iconlabel( "retweet",   "Restart Form"    ),
				misconduct : button.clone() .addClass( 'penalty' ) .iconlabel( "comment",   "Misconduct"      ),
				clear      : button.clone() .addClass( 'penalty' ) .iconlabel( "trash",     "Clear Penalties" ),
			},

			punitive : {
				panel      : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend     : html.legend.clone() .html( "Remove Athlete" ),
				remove     : button.clone() .addClass( 'punitive' ) .iconlabel( "remove",   "Remove Athlete"  ),
			}
		};

		var time = e.time = {
			pad : function(number, length) {
				var str = '' + number;
				while (str.length < length) {str = '0' + str;}
				return str;
			},
			format : function( time ) {
				var min    = parseInt(time / 60000),
					sec    = parseInt(time / 1000) - (min * 60),
					tenths = parseInt((time % 1000)/100) % 10;
				return min + ":" + e.time.pad(sec, 2) + '.' + tenths;
			},
			stop : function() {
				if( defined( actions.clock.timer )) { actions.clock.timer.stop(); }
				e.actions.clock.face.html( time.format( actions.clock.time )); 
				e.actions.clock.settings.started = false;
				e.actions.clock.realtime = 0;
				e.actions.clock.toggle.removeClass( "stop" );
				e.actions.clock.toggle.addClass( "start" );
				e.actions.clock.toggle.iconlabel( "play", "Start Timer" );
				o.penalties.time = (e.actions.clock.time/1000).toFixed( 1 );
				if( o.penalties.time > 0 ) { awardPenalty(); }
			},
			start : function() {
				e.actions.clock.timer = $.timer( actions.clock.update, actions.clock.settings.increment, true );
				e.actions.clock.settings.started = true;
				e.actions.clock.toggle.removeClass( "start" );
				e.actions.clock.toggle.addClass( "stop" );
				e.actions.clock.toggle.iconlabel( "pause", "Pause Timer" );
			},
			clear : function() {
				e.actions.clock.settings.started = false;
				e.actions.clock.timer    = $.timer( actions.clock.update, actions.clock.settings.increment, true );
				e.actions.clock.time     = 0;
				e.actions.clock.realtime = 0;
				e.actions.clock.face.html( "0:00.0" );
			}
		};

		actions.clock.update = function() { 
			actions.clock.face.html( time.format( actions.clock.time )); 
			if( actions.clock.settings.started ) { 
				if( actions.clock.realtime > 0 ) {
					var now     = parseInt((new Date()).getTime()); // Use system clock time to adjust time deltas for improved accuracy
					var elapsed = parseInt(now - actions.clock.realtime);
					actions.clock.time += elapsed;
				}
				actions.clock.realtime = parseInt((new Date()).getTime());
			}
		};

		o.penalties = { bounds : 0, timelimit : 0, restart : 0, misconduct : 0, time : 0 };

		actions.changes    .panel.append( actions.changes.legend, actions.changes.save, actions.changes.revert );
		actions.clock      .panel.append( actions.clock.legend, actions.clock.face, actions.clock.toggle );
		actions.navigate   .panel.append( actions.navigate.legend, actions.navigate.division );
		actions.penalties  .panel.append( actions.penalties.legend, actions.penalties.timelimit, actions.penalties.bounds, actions.penalties.restart, actions.penalties.misconduct, actions.penalties.clear );
		actions.admin      .panel.append( actions.admin.legend, actions.admin.display, actions.admin.print );
		actions.punitive   .panel.append( actions.punitive.legend, actions.punitive.remove );

		actions.panel.append( actions.navigate.panel, actions.clock.panel, actions.penalties.panel, actions.punitive.panel, actions.admin.panel, actions.changes.panel );
		actions.panel.attr({ 'data-position-fixed' : true });
		athletes.actions.append( actions.panel );

		actions.clock.toggle.click( function( ev ) {
			if( actions.clock.settings.started ) { e.time.stop(); }
			else { time.start(); }
		});
		actions.clock.face.click( function( ev ) {
			if( actions.clock.time > 0 && ! actions.clock.settings.started ) { e.time.clear(); }
		});

		// ===== ASSEMBLE ELEMENTS FOR RING COORDINATOR UI
		divisions.main.append( divisions.list );
		divisions.page.append( divisions.header, divisions.main );

		// ===== ASSEMBLE ELEMENTS FOR DIVISION COORDINATOR UI
		athletes.header.menu.panel.append( athletes.header.menu.list );
		athletes.header.menu.list.append( athletes.header.menu.description, athletes.header.menu.forms, athletes.header.menu.judges, athletes.header.menu.method );

		athletes.header.panel.append( athletes.header.back, athletes.header.title, athletes.header.setup, athletes.header.menu.panel );
		athletes.main.append( athletes.rounds, athletes.table, athletes.actions );
		athletes.page.append( athletes.header.panel, athletes.main );

		// ===== ASSEMBLE ALL PAGES INTO APPLICATION
		widget.nodoubletapzoom();
		widget.addClass( "coordinator-controller" );
		widget.append( divisions.page, athletes.page );

		// ============================================================
		// BUTTON BEHAVIOR
		// ============================================================

		// ============================================================
		var addNewAthlete = function( division, round ) {
		// ============================================================
			return function() {
				var add = {
					row   : html.tr   .clone() .addClass( "add" ),
					order : html.td   .clone() .addClass( "order ui-btn-icon-notext ui-icon-plus" ) .css({ position: 'relative' }),
					name  : html.td   .clone() .addClass( "name" ) .attr({ colspan: division.form.count( round ) + 1 }),
					input : html.text .clone() .attr({ placeholder: 'Add a new athlete' }),
				};

				add.input.change( function() {
					var rows = $( 'tbody.athlete-list' ).children();
					var j    = rows.length;
					add.row.removeClass( "add" );
					add.order.html( j + '.' ) .attr({ order : j }) .removeClass( "ui-btn-icon-notext ui-icon-plus" );
					renameAthletes( division, round ) ();
					var next = (addNewAthlete( division, round ))();
					e.athletes.tbody.append( next.row );
				});

				add.input.focus( function() { 
					$( this ).parents( '.athletes' ).find( '.athlete-actions' ).css({ 'display' : 'none' });
				});
				add.row.append( add.order, add.name );
				add.name.append( add.input );
				return add;
			}
		}

		// ============================================================
		// Award Penalties
		// ============================================================
		var awardPenalty           = function() {                                e.sound.next.play(); (sendRequest({ type: 'division', action: 'award penalty', penalties: o.penalties })()); };
		var awardPenaltyBounds     = function() { o.penalties.bounds     += 0.3; e.sound.next.play(); (sendRequest({ type: 'division', action: 'award penalty', penalties: o.penalties })()); };
		var awardPenaltyMisconduct = function() { o.penalties.misconduct += 1  ; e.sound.next.play(); (sendRequest({ type: 'division', action: 'award penalty', penalties: o.penalties })()); if( o.penalties.misconduct > 1 ) { disqualifyAthlete(); } };
		var awardPenaltyRestart    = function() { o.penalties.restart    += 0.6; e.sound.next.play(); (sendRequest({ type: 'division', action: 'award penalty', penalties: o.penalties })()); if( o.penalties.restart > 0.6 ) { disqualifyAthlete(); } };
		var awardPenaltyTimeLimit  = function() { o.penalties.timelimit   = 0.3; e.sound.next.play(); (sendRequest({ type: 'division', action: 'award penalty', penalties: o.penalties })()); };

		// ============================================================
		var clearPenalties = function() {
		// ============================================================
			o.penalties.bounds     = 0.0;
			o.penalties.timelimit  = 0.0;
			o.penalties.restart    = 0.0;
			o.penalties.misconduct = 0.0;
			o.penalties.time       = 0;

			e.sound.send.play();
			(sendRequest({ type: 'division', action: 'award penalty', penalties : o.penalties })());
		};

		// ============================================================
		var createDivision = function() {
		// ============================================================
			e.sound.prev.play();
			window.open( "./division/new.php", "_blank" );
		};

		// ============================================================
		var deleteAthlete = function() {
		// ============================================================
			var division = new Division( o.progress.divisions[ o.progress.current ] );
			var athlete  = division.current.athlete();
			e.sound.next.play();
			e.dialog.popupdialog({
				title:    'Delete Athlete?',
				subtitle: 'Delete ' + athlete.name() + ' from this division?',
				message:  'This removes an athlete that doesn\'t belong in the division. Once confirmed, this operation cannot be undone.',
				afterclose: function( ev, ui ) {},
				buttons:  [
					{ text : 'Cancel', style : 'cancel',    click : function( ev ) { e.sound.prev.play();      $('#popupDialog').popup( 'close' ); } },
					{ text : 'Delete', style : 'important', click : function( ev ) { e.sound.confirmed.play(); $('#popupDialog').popup( 'close' ); (sendRequest({ type: 'division', action: 'delete athlete', athlete_id: division.current.athleteId() })()); } },
				]
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
		};

		// ============================================================
		var disqualifyAthlete = function() {
		// ============================================================
			var index    = $(this).attr( 'index' );
			var division = new Division( o.progress.divisions[ o.progress.current ] );
			var athlete  = division.current.athlete();
			e.sound.next.play();
			e.dialog.popupdialog({
				title:    'Disqualify Athlete?',
				subtitle: 'Disqualify ' + athlete.name() + ' from this division?',
				message:  'This is a punitive decision. Once confirmed, this operation cannot be undone.',
				afterclose: function( ev, ui ) {},
				buttons:  [
					{ text : 'Cancel',     style : 'cancel',    click : function( ev ) { e.sound.prev.play();      $('#popupDialog').popup( 'close' ); } },
					{ text : 'Disqualify', style : 'important', click : function( ev ) { e.sound.confirmed.play(); $('#popupDialog').popup( 'close' ); (sendRequest({ type: 'division', action: 'award punitive', decision: 'disqualified', athlete_id: division.current.athleteId() })()); } },
				]
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
		};

		// ============================================================
		var editDivision = function() {
		// ============================================================
			var divid = $( this ).attr( 'divid' ); 
			$( ':mobile-pagecontainer' ).pagecontainer( 'change', '#athletes?ring=' + o.ring + '&divid=' + divid, { transition : 'slide' } )
		};

		// ============================================================
		var editDivisionDescription = function() {
		// ============================================================
			e.athletes.header.menu.panel.popup('close'); 
			o.changes = true;
			setTimeout( function() {
				var i        = parseInt( $.cookie( 'divindex' ));
				var division = new Division( o.progress.divisions[ i ] );
				var editor   = e.athletes.header.editor.description;
				var request  = i + '/edit';
				editor.divisionDescriptor().divisionDescriptor({ text : division.description() });
				editor.trigger( 'create' );
				e.dialog.popupdialog({
					title:    'Edit Division Description',
					subtitle: 'Division Description',
					message:  editor,
					buttons:  [
						{ text : 'Cancel', style : 'cancel', click : function( ev ) { o.changes = undefined; e.sound.prev.play(); $('#popupDialog').popup('close'); } },
						{ text : 'Accept', style : 'ok',     click : function( ev ) { 
								o.changes = undefined;
								e.sound.confirmed.play();
								$(this).parent().children().hide(); 
								var parameters = { header: { description : o.description.text }};
								(sendRequest( request, parameters ))(); 
							} 
						},
					]
				})

				e.dialog.trigger( 'create' );
				e.dialog.popup( 'open', { transition : 'pop', positionTo : 'window' });
			}, 100 );
		};

		// ============================================================
		var editDivisionForms = function() {
		// ============================================================
			e.athletes.header.menu.panel.popup('close'); 
			o.changes = true;
			setTimeout( function() {
				var i         = parseInt( $.cookie( 'divindex' ));
				var division  = o.progress.divisions[ i ];
				var parse     = e.athletes.header.editor.description; parse.divisionDescriptor({ text : division.description }); // Parse division.description
				var request   = i + '/edit';
				var options   = parse.divisionDescriptor().divisionDescriptor( 'option', 'description' );
				o.description = options;
				var editor    = e.athletes.header.editor.forms;
				options.forms = division.forms;
				editor.formSelector( options );
				e.dialog.popupdialog({
					title:    'Select Forms for Division',
					subtitle: 'Division Form Selection',
					message:  editor,
					afterclose: function() { e.sound.confirmed.play(); },
					buttons:  [
						{ text : 'Cancel', style : 'cancel', click : function( ev ) { o.changes = undefined; $('#popupDialog').popup('close'); } },
						{ text : 'Accept', style : 'ok',     click : function( ev ) { 
								o.changes = undefined;
								$(this).parent().children().hide(); 
								var parameters = { header: { forms : o.forms.text }};
								(sendRequest( request, parameters ))(); 
							} 
						},
					]
				})

				e.dialog.trigger( 'create' );
				e.dialog.popup( 'open', { transition : 'pop', positionTo : 'window' });
			}, 100 );
		};

		// ============================================================
		var editDivisionJudges = function() {
		// ============================================================
			e.athletes.header.menu.panel.popup('close'); 
			o.changes = true;
			setTimeout( function() {
				var i         = parseInt( $.cookie( 'divindex' ));
				var division  = o.progress.divisions[ i ];
				var request   = i + '/edit';
				var editor    = e.athletes.header.editor.judges; editor.judgeCount({ num : division.judges });
				e.dialog.popupdialog({
					title:    'Number of Judges',
					subtitle: 'Set Number of Judges for Division',
					message:  editor,
					afterclose: function() { e.sound.confirmed.play(); },
					buttons:  [
						{ text : 'Cancel', style : 'cancel', click : function( ev ) { o.changes = undefined; $('#popupDialog').popup('close'); } },
						{ text : 'Accept', style : 'ok',     click : function( ev ) { 
								o.num = e.athletes.header.editor.judges.judgeCount().judgeCount( 'option', 'num' );
								o.changes = undefined;
								$(this).parent().children().hide(); 
								var parameters = { header: { judges : o.num }};
								(sendRequest( request, parameters ))(); 
							} 
						},
					]
				})

				e.dialog.trigger( 'create' );
				e.dialog.popup( 'open', { transition : 'pop', positionTo : 'window' });
			}, 100 );
		};

		// ============================================================
		var editDivisionMethod = function() {
		// ============================================================
			e.athletes.header.menu.panel.popup('close'); 
			o.changes = true;
			setTimeout( function() {
				var i         = parseInt( $.cookie( 'divindex' ));
				var division  = o.progress.divisions[ i ];
				var request   = i + '/edit';
				var opts      = { method : division.method };
				var editor    = e.athletes.header.editor.method; editor.method( opts );
				e.dialog.popupdialog({
					title:    'Competition Method',
					subtitle: 'Select a Competition Method',
					message:  editor,
					afterclose: function() { e.sound.confirmed.play(); },
					buttons:  [
						{ text : 'Cancel', style : 'cancel', click : function( ev ) { o.changes = undefined; $('#popupDialog').popup('close'); } },
						{ text : 'Accept', style : 'ok',     click : function( ev ) { 
								o.method = e.athletes.header.editor.method.method().method( 'option', 'method' );
								o.changes = undefined;
								$(this).parent().children().hide(); 
								var parameters = { header: { method : o.method }};
								(sendRequest( request, parameters ))(); 
							} 
						},
					]
				})

				e.dialog.trigger( 'create' );
				e.dialog.popup( 'open', { transition : 'pop', positionTo : 'window' });
			}, 100 );
		};


		// ============================================================
		var goToDivision = function() {
		// ============================================================
			var command = 'division/' + $( this ).attr( 'index' );
			e.dialog.popupdialog({
				title:    'Start Scoring Division?',
				subtitle: 'Start scoring division?',
				message:  'Check that no referees are currently scoring before changing the current division.',
				afterclose: function() { e.sound.confirmed.play(); },
				buttons:  [
					{ text : 'Cancel', style : 'cancel', click : function() { $('#popupDialog').popup('close'); }},
					{ text : 'Start',  style : 'ok',     click : function() { $(this).parent().children().hide(); (sendCommand( command ))(); }},
				]
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
		};

		// ============================================================
		var parsePageUrl = function( pageUrl ) {
		// ============================================================
			var anchor = $.url( pageUrl ).attr( "anchor" );
			var args   = anchor.split( '?' );
			var option = $.url( anchor ).param();

			option[ 'id' ] = args[ 0 ];

			return option;
		};

		// ============================================================
		var printResults = function( division ) {
		// ============================================================
			return function() {
				var url     = '/cgi-bin/freescore/forms/worldclass/results?ring=' + division.ring + '&divid=' + division.name ;
				var results = window.open( url, '_blank', 'toolbar=no,status=no,scrollbars=yes,resizable=yes' );
				results.print();
			}
		};

		// ============================================================
		var removeAthlete = function() {
		// ============================================================
			var division = new Division( o.progress.divisions[ o.progress.current ] );
			var athlete  = division.current.athlete();
			var round    = division.current.roundId();
			e.sound.next.play();
			e.dialog.popupdialog({
				title:    'Remove ' + athlete.name(),
				subtitle: 'Choose a reason to remove ' + athlete.name() + ' from this division.',
				message:  '<ul>' +
					'<li><b>Delete</b> to remove an athlete that was accidentally added to the division</li>' + 
					'<li><b>Withdraw</b> to remove an athlete that doesn\'t show up after 3rd call, cannot perform due to injury, or voluntarily withdraws</li>' + 
					'<li><b>Disqualify</b> to remove an athlete that is no longer qualified to compete.</li></ul>',
				afterclose: function( ev, ui ) {},
				buttons:  [
					{ text : 'Cancel',     style : 'cancel',    click : function( ev ) { e.sound.prev.play(); $('#popupDialog').popup('close'); } },
					{ text : 'Delete',     style : 'important', click : function( ev ) { e.sound.next.play(); deleteAthlete(); } },
					{ text : 'Withdraw',   style : 'important', click : function( ev ) { e.sound.next.play(); withdrawAthlete(); } },
					{ text : 'Disqualify', style : 'important', click : function( ev ) { e.sound.next.play(); disqualifyAthlete(); } },
				]
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
			if((! athlete.score( round ).is.complete()) && (! division.round.is.first())) { $( '#dialog-button-delete' ).button( 'disable' ); } // Cannot delete an athlete once they have been scored in the first round.
		};

		// ============================================================
		var renameAthletes = function( division, round ) {
		// ============================================================
			return function() {
				var rename = [];
				var rows   = $( 'tbody.athlete-list' ).children( 'tr' ); // tbody children are tr elements, i.e. athlete names and scores
				for( i = 0; i < rows.length; i++ ) {
					var row    = $( rows[ i ] );
					var column = { order : $( row.find( '.order' )[ 0 ] ), name : $( row.find( '.name' )[ 0 ] ) };
					var j      = column.order.attr( 'order' );
					var name   = column.name.find( 'input' ).length > 0 ? $( column.name.find( 'input' )[ 0 ] ).val() : column.name.html();
					if( defined( j ) ) { rename.push({ order : parseInt( j ), name : name }); }
				}
				o.changes = { divid : division.name, athletes: rename, round : round };
				e.actions.changes.panel.fadeIn(); 
			}
		};

		// ============================================================
		var reorderAthletes = function( division, round ) {
		// ============================================================
			return function() {
				var reorder = [];
				var rows   = $( 'tbody.athlete-list' ).children(); // tbody children are tr elements, i.e. athlete names and scores
				for( i = 0; i < rows.length - 1; i++ ) {
					var row    = $( rows[ i ] );
					var column = { order : $( row.find( '.order' )[ 0 ] ), name : $( row.find( '.name' )[ 0 ] ) };
					var j      = column.order.attr( 'order' );
					var name   = column.name.find( 'input' ).length > 0 ? $( column.name.find( 'input' )[ 0 ] ).val() : column.name.html();
					if( i == division.current ) { row.addClass( 'current' ); } else { row.removeClass( 'current' ); }
					if( defined( j ) ) { reorder.push({ order : parseInt( j ), name : name }); }
					column.order.html( (i + 1) + '.' );
				}
				o.changes = { divid : division.name, athletes: reorder, round : round };
				e.actions.changes.panel.fadeIn(); 
			}
		};

		// ============================================================
		var revertChanges = function() {
		// ============================================================
			if( ! defined( o.progress )) { return; }
			var progress = JSON.stringify( o.progress );
			var update   = { data : progress };
			e.dialog.popupdialog({
				title:    'Reverting Changes',
				subtitle: 'Restoring previous division configuration',
				message:  'Please wait while the server completes the restoration update.',
				afterclose: function() { e.sound.confirmed.play(); },
				buttons:  'none',
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
			o.changes = undefined;
			e.sound.prev.play();
			setTimeout( function() { e.refresh( update ); e.actions.changes.panel.fadeOut(); }, 1000 );
				 
		};

		// ============================================================
		var saveChanges = function() {
		// ============================================================
			(sendRequest( 'coordinator', o.changes )());
			e.dialog.popupdialog({
				title:    'Saving Changes',
				subtitle: 'Sending Changes to Server',
				message:  'Please wait while the server completes the update.',
				afterclose: function() { e.sound.confirmed.play(); },
				buttons:  'none',
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
			o.changes = undefined;
		};

		// ============================================================
		var sendRequest = function( requestData ) {
		// ============================================================
			return function() {
				var request = { data : requestData };
				request.json = JSON.stringify( request.data );
				e.ws.send( request.json );
			}
		};

		// ============================================================
		var showDisplay = function() {
		// ============================================================
			var url     = 'index.php';
			var display = window.open( url, '_blank', 'toolbar=no,status=no,scrollbars=yes,resizable=yes' );
			e.display = display;
			e.actions.admin.display.button();
			e.actions.admin.display.button( 'disable' );
			display.onbeforeunload = function() {
				e.actions.admin.display.button( 'enable' );
			};
		};

		// ============================================================
		var transferDivision = function() {
		// ============================================================
			var transferButton = $( this );
			var request        = $( this ).attr( 'index' ) + '/edit';
			var name           = $( this ).attr( 'name' );
			var sendTo         = $( this ).attr( 'sendTo' );
			var count          = $( this ).attr( 'count' );
			var description    = $( this ).attr( 'description' );
			var parameters     = { transfer : sendTo };
			var message        = sendTo == 'staging' ? 
				'If you send this division back to staging, it can be reclaimed later.' :
				'If you take this division into ring ' + sendTo + ', it can be sent back to staging later.';

			e.dialog.popupdialog({
				title:    sendTo == 'staging' ? 'Send to Staging?' : 'Send to Ring ' + sendTo,
				subtitle: 'Send ' + name.toUpperCase() + ' ' + description + ' (' + count + ') to ' + (sendTo == 'staging' ? 'Staging' : 'Ring ' + sendTo) + '?',
				message:  message,
				afterclose: function() {},
				buttons:  [
					{ text : 'Cancel',   style : 'cancel',  click : function() { $('#popupDialog').popup('close'); } },
					{ text : 'Transfer', style : 'default', click : function() { $(this).parent().children().hide(); (sendRequest( request, parameters ))(); } },
				]
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
		};

		// ============================================================
		var withdrawAthlete = function() {
		// ============================================================
			var division = new Division( o.progress.divisions[ o.progress.current ] );
			var athlete  = division.current.athlete();
			e.dialog.popupdialog({
				title:    'Withdraw Athlete?',
				subtitle: 'Withdraw ' + athlete.name() + ' from this division?',
				message:  'Once confirmed, this operation cannot be undone.',
				afterclose: function( ev, ui ) {},
				buttons:  [
					{ text : 'Cancel',   style : 'cancel',    click : function( ev ) { e.sound.prev.play();      $('#popupDialog').popup('close'); }},
					{ text : 'Withdraw', style : 'important', click : function( ev ) { e.sound.confirmed.play(); $('#popupDialog').popup('close'); (sendRequest({ type: 'division', action: 'award punitive', decision: 'withdrawn', athlete_id: division.current.athleteId() })()); }},
				]
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
		};

		// ============================================================
		var updateDivisions = e.updateDivisions = function( divisions, staging, current ) {
		// ============================================================
			e.divisions.list.empty();
			e.divisions.list.attr({ 'data-split-icon' : 'arrow-u-l' });
			if( ! defined( divisions )) { return; }

			var divider = html.li.clone() .addClass( 'divider' ) .attr({ 'data-role' : 'list-divider', 'data-theme' : 'b' });

			// ===== DISPLAY RING DIVISIONS
			e.divisions.list.append( divider.clone() .html( 'Ring ' + o.ring ));
			for( var i = 0; i < divisions.length; i++ ) {
				var divdata = new Division( divisions[ i ] );
				var count   = divdata.athletes().length > 1 ? divdata.athletes().length + ' Athletes' : '1 Athlete';
				var list    = divdata.athletes().map( function( item ) { return item.name(); } ).join( ", " );
				var title   = (i == current ? 'Currently Scoring:<span class="title"> ' : '<span>') + divdata.summary() + '</span>';

				var division = {
					data     : divdata,
					item     : html.li  .clone(),
					edit     : html.a   .clone(),
					ring     : html.div .clone() .addClass( 'ring' ) .html( 'Ring ' + o.ring ),
					title    : html.h3  .clone() .html( title ),
					details  : html.p   .clone() .append( '<b>' + count + '</b>:&nbsp;', list ),
					transfer : html.a   .clone() .addClass( 'transfer' ).attr({ index : i, name : divdata.name, count : count, description : divdata.description, sendTo : 'staging' }),
				};

				division.edit.empty();
				division.edit.append( division.ring, division.title, division.details );
				division.edit.attr({ 'data-transition' : 'slide', 'divid' : division.data.name() });

				division.edit     .click( editDivision );
				division.transfer .click( transferDivision );

				if( i == current ) { division.edit.addClass( 'current' ); } else { division.edit.removeClass( 'current' ); }

				// Composition
				division.item.append( division.edit, division.transfer );
				e.divisions.list.append( division.item );
			}

			// ===== NEW DIVISION
			e.divisions.list.append( divider.clone() .html( 'New Division' ));
			{
				var division = {
					item     : html.li  .clone(),
					edit     : html.a   .clone() .addClass( 'create ui-icon-plus' ),
					ring     : html.div .clone() .addClass( 'ring' ) .html( 'Ring ' + o.ring ),
					title    : html.h3  .clone() .html( 'Create a new division at Ring ' + o.ring ),
				};

				division.edit.empty();
				division.edit.append( division.ring, division.title );

				division.edit.attr({ 'data-transition' : 'slideup' });
				division.edit .click( createDivision );

				division.item.append( division.edit );
				e.divisions.list.append( division.item );
			}

			// ===== DISPLAY STAGING DIVISIONS
			e.divisions.list.append( divider.clone() .html( 'Staging' ));
			for( var i = 0; i < staging.divisions.length; i++ ) {
				var divdata = staging.divisions[ i ];
				var count   = divdata.athletes.length > 1 ? divdata.athletes.length + ' Athletes' : '1 Athlete';
				var list    = divdata.athletes.map( function( item ) { return item.name; } ).join( ", " );

				var division = {
					data     : divdata,
					item     : html.li  .clone(),
					ring     : html.div .clone() .addClass( 'ring' ) .html( 'Staging' ),
					title    : html.h3  .clone() .html( divdata.name.toUpperCase() + ' ' + divdata.description ),
					details  : html.p   .clone() .append( '<b>' + count + '</b>:&nbsp;', list ),
					transfer : html.a   .clone() .addClass( 'transfer ui-icon-plus' ).attr({ index : i, name : divdata.name, count : count, description : divdata.description, sendTo : o.ring }),
				};

				division.transfer.click( transferDivision );

				division.transfer.append( division.ring, division.title, division.details );
				division.item.append( division.transfer );
				e.divisions.list.append( division.item );
			}

			e.divisions.list.listview().listview( 'refresh' );
		};

		// ============================================================
		var updateRounds = e.updateRounds = function( division, current ) {
		// ============================================================
			e.athletes.rounds.empty();

			// ===== SELECT ROUND
			var tabs = e.html.ul.clone();
			var rounds = division.current.rounds();
			for( var i = 0; i < rounds.length; i++ ) {
				var round = rounds[ i ];
				var tab = {
					item   : e.html.li.clone(),
					button : e.html.a.clone(),
					name   : FreeScore.round.name[ round ]
				};
				tab.button.attr({ 'round' : round });
				tab.button.html( tab.name );
				tab.button.click( function() { 
					$( this ).parents( 'ul' ).find( 'a' ).removeClass( 'ui-btn-active' );
					o.round = $( this ).attr( 'round' ); 
					e.updateAthletes( division, current ); 
				});
				tab.button.removeClass( 'ui-btn-active' );
				if( defined( o.round ) && o.round == round || division.round.matches( round ) ) { 
					tabs.find( 'a' ).removeClass( 'ui-btn-active' );
					tab.button.addClass( 'ui-btn-active' ); 
				}
				tab.item.append( tab.button );
				tabs.append( tab.item );
			}

			e.athletes.rounds.append( tabs );
			e.athletes.rounds.navbar().navbar( "destroy" );
			e.athletes.rounds.navbar();
		};

		// ============================================================
		var updateAthletes = e.updateAthletes = function( division, current ) {
		// ============================================================
			if( ! defined( division )) { return; }
			if( ! defined( o.round  )) { o.round = division.current.roundId(); }
			if( o.progress.current == current ) { 
				e.actions.navigate  .panel .hide();
				e.actions.clock     .panel .show();
				e.actions.penalties .panel .show();
				e.actions.punitive  .panel .show();
				e.actions.changes   .panel .hide();

				// Clear context for navigation button
				e.actions.navigate.division.attr({ index : undefined });

			} else {
				e.actions.navigate  .panel .show();
				e.actions.clock     .panel .hide();
				e.actions.penalties .panel .hide();
				e.actions.punitive  .panel .hide();
				e.actions.changes   .panel .hide();

				// Set context for navigation button
				var index = undefined;
				for( var i = 0; i < o.progress.divisions.length; i++ ) {
					var div = o.progress.divisions[ i ]
					if( div.name == division.name ) { index = i; break; }
				}

				e.actions.navigate.division.attr({ index : index });
			}

			// Update Page Header
			e.athletes.header.title .html( division.summary() );

			// Update Athlete Table
			var round = defined( o.round ) ? o.round : division.current.roundId();
			var forms = division.form.list( round );
			e.athletes.table.empty();
			e.athletes.thead.empty();
			e.athletes.tbody.empty();
			var header = {
				row   : html.tr .clone(),
				order : html.th .clone() .html( 'Num.' ),
				name  : html.th .clone() .html( 'Athlete' ),
				form  : [ html.th .clone() .html( forms[ 0 ] ), html.th .clone() .html( forms.length > 1 ? forms[ 1 ] : '' ) ],
			};

			header.row.append( header.order, header.name, header.form[ 0 ] );
			if( forms.length > 1 ) { header.row.append( header.form[ 1 ] ); }
			e.athletes.thead.append( header.row );
			e.athletes.table.append( e.athletes.thead, e.athletes.tbody );
			e.athletes.tbody.sortable({
				items: '> tr:not(.add, .complete)',       // Prevent reordering of athletes who have completed their form
				stop: reorderAthletes( division, round ), // Notify user of reordering change and enable user to save changes
			});

			$.each( division.current.athletes( round ), function( i, athleteData ) {
				var athlete = {
					data  : athleteData,
					is    : {},
					row   : html.tr   .clone(),
					order : html.td   .clone() .addClass( "order" ),
					name  : html.td   .clone() .addClass( "name" ),
					form  : [ html.td   .clone() .addClass( "oneform" ), html.td   .clone() .addClass( "twoforms" ) ],
				};

				// ===== SHOW ATHLETE DATA (ORDER, NAME, AND SCORE(S))
				// If the athlete has completed their forms, show the name as unchangeable
				if( athlete.data.score( round ).is.complete() ) {
					athlete.name.append( athlete.data.name() );
					athlete.row.addClass( 'complete' );

				// Otherwise show the name as an editable input
				} else {
					var input   = html.text.clone();
					input.val( athlete.data.name() );
					input.change( renameAthletes( division, round ) );
					athlete.name.append( input );
				}

				athlete.order.attr({ order : (i + 1) });
				athlete.order.append( (i + 1) + '.' );
				athlete.row.append( athlete.order, athlete.name, athlete.form[ 0 ] ).removeClass( 'complete' );
				if( forms.length > 1 ) { athlete.row.append( athlete.form[ 1 ] ); athlete.form[ 0 ] .removeClass( 'oneform' ) .addClass( 'twoforms' ); }

				// Highlight current athlete
				var is = { current : {}, up : false };
				is.current.division = o.progress.current  == current;
				is.current.round    = o.round             == division.current.roundId();
				is.current.athlete  = athlete.data.name() == division.current.athlete().name();
				athlete.is.up       = is.current.division && is.current.round && is.current.athlete;

				if( athlete.is.up ) { athlete.row.addClass( 'current' ); } else { athlete.row.removeClass( 'current' ); }

				// Append score
				$.each( forms, function( i, formName ) {
					var form  = { data : athlete.data.score( round ).form( i ), name : formName, score : '&mdash;' };
					if( form.data.is.complete() ) {
						if     ( form.data.decision.is.withdrawn())    { form.score = 'WD'; }
						else if( form.data.decision.is.disqualified()) { form.score = 'DQ'; }
						else if( form.data.adjusted().total )          { form.score = form.data.adjusted().total.toFixed( 2 ); }
					} else { score = '&mdash;'; }

					athlete.form[ i ].append( "<strong>" + form.score + "</strong>" );
				});

				e.athletes.tbody.append( athlete.row );

			});

			// Handle 'Enter' key (focus on next input and select text)
			e.athletes.tbody.keydown( function( ev ) {
				var key = { enter : 13, tab : 40, shift : { tab : 38 }};
				if( ev.which == key.enter ) {
					$( ev.target ).blur();
					var row  = $(ev.target).parents( 'tr' );
					var next = row.next().find( 'input' );
					next.focus();
					next.select();

				} else if( ev.which == key.shift.tab ) { 
					var row  = $(ev.target).parents( 'tr' );
					var prev = row.prev().find( 'input' );
					if( defined( prev.val() )) {
						$( ev.target ).blur();
						prev.focus();
						prev.select();
					}
					ev.preventDefault();

				} else if( ev.which == key.tab ) { 
					var row  = $(ev.target).parents( 'tr' );
					var next = row.next().find( 'input' );
					if( defined( next.val() )) {
						$( ev.target ).blur();
						next.focus();
						next.select();
					}
					ev.preventDefault();
				}
			});


			// ===== ADD NEW ATHLETE
			var add = (addNewAthlete( division, round ))();
			e.athletes.tbody.append( add.row );

			var different = {
				division : division.name()              != o.current.divname,
				athlete  : division.current.athleteId() != o.current.athlete,
				form     : division.current.formId()    != o.current.form,
			};

			if( different.division || different.round || different.athlete || different.form ) {
				e.time.stop();
				e.time.clear();
			}

			o.current.divname = division.name();
			o.current.round   = division.current.roundId();
			o.current.athlete = division.current.athleteId();
			o.current.form    = division.current.formId();

		};

		// ============================================================
		this.element.on( "pagebeforetransition", function( ev, transition ) {
		// ============================================================
			if( ! defined( transition.absUrl )) { return; }
			if( ! defined( o.progress        )) { return; }
			var option        = parsePageUrl( transition.absUrl );
			var divisions     = o.progress.divisions;
			var divisionData  = undefined;
			var division      = undefined;
			if( defined( option.ring ) && defined( option.divid )) {
				for( var i = 0; i < divisions.length; i++ ) {
					divisionData = divisions[ i ];
					if( divisionData.name == option.divid && divisionData.ring == option.ring ) { $.cookie( 'divindex', i ); division = new Division( divisionData ); break; }
					divisionData = undefined;
				}
			}

			if      ( option.id == "divisions" ) { e.updateDivisions( divisions, o.progress.staging, o.progress.current ); }
			else if ( option.id == "athletes"  ) { o.round = division.current.roundId(); var current = parseInt( $.cookie( 'divindex' )); e.updateRounds( division, current ); e.updateAthletes( division, current ); }
			else if ( option.id == "create"    ) {  }
		});

		// ============================================================
		e.refresh = function( response ) {
		// ============================================================
			var update = JSON.parse( response.data ); 

			// ===== IF THE UPDATE IS NOT A RING UPDATE, THEN SOMETHING HAS CHANGED; GET FRESH DATA
			if( update.type != 'ring' ) {
				var request  = { data : { type : 'ring', action : 'read' }};
				request.json = JSON.stringify( request.data );
				e.ws.send( request.json );
				return;
			}

			var progress = update.ring;
			if( ! defined( progress.divisions )) { return; }
			var i = defined( $.cookie( 'divindex' )) ? parseInt( $.cookie( 'divindex' )) : progress.current;
			o.progress = progress;
			var division = new Division( progress.divisions[ i ] );
			e.updateDivisions( progress.divisions, progress.staging, progress.current );
			e.updateRounds( division, i );
			e.updateAthletes( division, i );

			// ===== UPDATE BEHAVIOR
			e .actions .admin .print .click( printResults( progress.divisions[ i ] ));
		};

		actions .admin      .display    .click( showDisplay );

		actions .navigate   .division   .click( goToDivision );

		actions .changes    .save       .click( saveChanges );
		actions .changes    .revert     .click( revertChanges );

		actions .penalties  .timelimit  .click( awardPenaltyTimeLimit );
		actions .penalties  .bounds     .click( awardPenaltyBounds );
		actions .penalties  .restart    .click( awardPenaltyRestart );
		actions .penalties  .misconduct .click( awardPenaltyMisconduct );
		actions .penalties  .clear      .click( clearPenalties );

		actions .punitive   .remove     .click( removeAthlete );

		athletes.header.menu.description .find( 'a' ).click( editDivisionDescription );
		athletes.header.menu.forms       .find( 'a' ).click( editDivisionForms );
		athletes.header.menu.judges      .find( 'a' ).click( editDivisionJudges );
		athletes.header.menu.method      .find( 'a' ).click( editDivisionMethod );

		dialog.popupdialog();
	},
	_init: function( ) {
		var o  = this.options;
		var w  = this.element;
		var e  = this.options.elements;
		var ws = e.ws = new WebSocket( 'ws://' + o.server + ':3088/worldclass/' + o.tournament.db + '/' + o.ring );

		ws.onopen = function() {
			var request  = { data : { type : 'ring', action : 'read' }};
			request.json = JSON.stringify( request.data );
			ws.send( request.json );
		}

		ws.onmessage = e.refresh;

		ws.onclose = function() {
			ws = e.ws = new WebSocket( 'ws://' + o.server + ':3088/worldclass/' + o.tournament.db + '/' + o.ring ); 
		}
	}
});
