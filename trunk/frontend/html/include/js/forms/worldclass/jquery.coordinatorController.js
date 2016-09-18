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
			ok        : new Howl({ urls: [ "/freescore/sounds/upload.mp3",   "/freescore/sounds/upload.ogg"   ]}),
			confirmed : new Howl({ urls: [ "/freescore/sounds/received.mp3", "/freescore/sounds/received.ogg" ]}),
			error     : new Howl({ urls: [ "/freescore/sounds/quack.mp3",    "/freescore/sounds/quack.ogg"    ]}),
		};

		var button = html.a.clone() .addClass( 'ui-btn ui-corner-all' ) .css({ height: '42px', 'text-align' : 'left' });
		$.fn.extend({ iconlabel : function( icon, label ) { $( this ).html( "<span class=\"glyphicon glyphicon-" + icon + "\">&nbsp;</span>&nbsp;" + label ); return $( this ); }});

		var divisions = e.divisions = {
			page    : html.div.clone() .attr({ 'data-role': 'page', id: 'divisions' }),
			header  : html.div.clone() .attr({ 'data-role': 'header', 'data-theme': 'b', 'data-position' : 'fixed' }) .html( "<h1>Divisions for " + ring + "</h1>" ),
			main    : html.div.clone() .attr({ 'role': 'main' }),
			list    : html.ul.clone()  .attr({ 'role': 'listview', 'data-filter' : true, 'data-filter-placeholder' : 'Search for division description or athlete name...' }) .addClass( 'divisions' ),
		};

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

		var dialog = e.dialog = $( '#popupDialog' );

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
				face       : button.clone() .addClass( 'timer' ) .css({ 'text-align' : 'center' }) .html( "00:00.00" ),
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
				timelimit  : button.clone() .addClass( 'penalty' ) .iconlabel( "hourglass",     "Time Limit"      ),
				bounds     : button.clone() .addClass( 'penalty' ) .iconlabel( "share",         "Out-of-Bounds"   ),
				restart    : button.clone() .addClass( 'penalty' ) .iconlabel( "retweet",       "Restart"         ),
				misconduct : button.clone() .addClass( 'penalty' ) .iconlabel( "comment",       "Misconduct"      ),
				clear      : button.clone() .addClass( 'penalty' ) .iconlabel( "remove-circle", "Clear Penalties" ),
			},

		};

		var time = e.time = {
			pad : function(number, length) {
				var str = '' + number;
				while (str.length < length) {str = '0' + str;}
				return str;
			},
			format : function(time) {
				time = Math.floor( time / 10 );
				var min = parseInt(time / 6000),
					sec = parseInt(time / 100) - (min * 60),
					hundredths = e.time.pad(time - (sec * 100) - (min * 6000), 2);
				return (min > 0 ? e.time.pad(min, 2) : "00") + ":" + e.time.pad(sec, 2) + "." + hundredths;
			},
			stop : function() {
				if( defined( actions.clock.timer )) { actions.clock.timer.stop(); }
				e.actions.clock.face.html( time.format( actions.clock.time )); 
				e.actions.clock.settings.started = false;
				e.actions.clock.realtime = 0;
				e.actions.clock.toggle.removeClass( "stop" );
				e.actions.clock.toggle.addClass( "start" );
				e.actions.clock.toggle.iconlabel( "play", "Start Timer" );
			},
			start : function() {
				e.actions.clock.timer = $.timer( actions.clock.update, actions.clock.settings.increment, true );
				e.actions.clock.settings.started = true;
				e.actions.clock.toggle.removeClass( "start" );
				e.actions.clock.toggle.addClass( "stop" );
				e.actions.clock.toggle.iconlabel( "pause", "Stop Timer" );
			},
			clear : function() {
				e.actions.clock.settings.started = false;
				e.actions.clock.timer    = $.timer( actions.clock.update, actions.clock.settings.increment, true );
				e.actions.clock.time     = 0;
				e.actions.clock.realtime = 0;
				e.actions.clock.face.html( "00:00.00" );
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

		o.penalties = { bounds : 0, timelimit : 0, restart : 0, misconduct : 0 };

		actions.changes    .panel.append( actions.changes.legend, actions.changes.save, actions.changes.revert );
		actions.clock      .panel.append( actions.clock.legend, actions.clock.face, actions.clock.toggle );
		actions.navigate   .panel.append( actions.navigate.legend, actions.navigate.division );
		actions.penalties  .panel.append( actions.penalties.legend, actions.penalties.timelimit, actions.penalties.bounds, actions.penalties.restart, actions.penalties.misconduct, actions.penalties.clear );
		actions.admin      .panel.append( actions.admin.legend, actions.admin.display, actions.admin.print, actions.admin.split, actions.admin.merge );

		actions.panel.append( actions.navigate.panel, actions.clock.panel, actions.penalties.panel, actions.admin.panel, actions.changes.panel );
		actions.panel.attr({ 'data-position-fixed' : true });
		athletes.actions.append( actions.panel );

		actions.clock.toggle.click( function( ev ) {
			if( actions.clock.settings.started ) { e.time.stop(); }
			else { time.start(); }
		});
		actions.clock.face.click( function( ev ) {
			if( actions.clock.time > 0 && ! actions.clock.settings.started ) { e.time.clear(); }
		});
		divisions.main.append( divisions.list );
		divisions.page.append( divisions.header, divisions.main );

		athletes.header.menu.panel.append( athletes.header.menu.list );
		athletes.header.menu.list.append( athletes.header.menu.description, athletes.header.menu.forms, athletes.header.menu.judges, athletes.header.menu.method );

		athletes.header.panel.append( athletes.header.back, athletes.header.title, athletes.header.setup, athletes.header.menu.panel );
		athletes.main.append( athletes.rounds, athletes.table, athletes.actions );
		athletes.page.append( athletes.header.panel, athletes.main );

		widget.nodoubletapzoom();
		widget.addClass( "coordinator-controller" );
		widget.append( divisions.page, athletes.page );

		// ============================================================
		// Behavior
		// ============================================================

		// ============================================================
		var addNewAthlete = function( division, round ) {
		// ============================================================
			return function() {
				var add = {
					row   : html.tr   .clone() .addClass( "add" ),
					order : html.td   .clone() .addClass( "order ui-btn-icon-notext ui-icon-plus" ) .css({ position: 'relative' }),
					name  : html.td   .clone() .addClass( "name" ),
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
		var awardPenaltyBounds = function() {
		// ============================================================
			o.penalties.bounds += 0.3;

			var penalties = (o.penalties.bounds * 10) + '/' + (o.penalties.timelimit * 10) + '/' + (o.penalties.restart * 10) + '/' + (o.penalties.misconduct * 10) + '/' + (e.actions.clock.time / 10);
			(sendCommand( "coordinator/penalty/" + penalties )());
		};

		// ============================================================
		var awardPenaltyMisconduct = function() {
		// ============================================================
			o.penalties.misconduct += 0.3;

			var penalties = (o.penalties.bounds * 10) + '/' + (o.penalties.timelimit * 10) + '/' + (o.penalties.restart * 10) + '/' + (o.penalties.misconduct * 10) + '/' + (e.actions.clock.time / 10);
			(sendCommand( "coordinator/penalty/" + penalties )());
		};

		// ============================================================
		var awardPenaltyRestart = function() {
		// ============================================================
			o.penalties.restart += 0.6;

			var penalties = (o.penalties.bounds * 10) + '/' + (o.penalties.timelimit * 10) + '/' + (o.penalties.restart * 10) + '/' + (o.penalties.misconduct * 10) + '/' + (e.actions.clock.time / 10);
			(sendCommand( "coordinator/penalty/" + penalties )());
		};

		// ============================================================
		var awardPenaltyTimeLimit = function() {
		// ============================================================
			o.penalties.timelimit = 0.3;

			var penalties = (o.penalties.bounds * 10) + '/' + (o.penalties.timelimit * 10) + '/' + (o.penalties.restart * 10) + '/' + (o.penalties.misconduct * 10) + '/' + (e.actions.clock.time / 10);
			(sendCommand( "coordinator/penalty/" + penalties )());
		};

		// ============================================================
		var clearPenalties = function() {
		// ============================================================
			o.penalties.bounds     = 0.0;
			o.penalties.timelimit  = 0.0;
			o.penalties.restart    = 0.0;
			o.penalties.misconduct = 0.0;

			var penalties = (o.penalties.bounds * 10) + '/' + (o.penalties.timelimit * 10) + '/' + (o.penalties.restart * 10) + '/' + (o.penalties.misconduct * 10) + '/' + (e.actions.clock.time / 10);
			(sendCommand( "coordinator/penalty/" + penalties )());
		};

		// ============================================================
		var createDivision = function() {
		// ============================================================
			var request        = $( this ).attr( 'index' ) + '/edit';
			var parameters     = { create : true };
			e.dialog.popupdialog({
				title:    'Create Division?',
				subtitle: 'Create a new division at ring ' + o.ring + '?',
				message:  'Once created, the division can be edited',
				afterclose: function() {},
				buttons:  [
					{ text : 'Cancel', style : 'cancel', click : function() { $('#popupDialog').popup('close'); } },
					{ text : 'Create', style : 'ok',     click : function() { $(this).parent().children().hide(); (sendRequest( request, parameters ))(); } },
				]
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
		};

		// ============================================================
		var disqualifyAthlete = function() {
		// ============================================================
			var index    = $(this).attr( 'index' );
			var division = o.progress.divisions[ o.progress.current ];
			var athlete  = division.athletes[ index ];
			e.dialog.popupdialog({
				title:    'Disqualify Athlete?',
				subtitle: 'Disqualify ' + athlete.name + ' from this division by punitive decision?',
				message:  'Once confirmed, this operation cannot be undone.',
				afterclose: function( ev, ui ) {},
				buttons:  [
					{ text : 'Cancel',     style : 'cancel', click : function( ev ) { $('#popupDialog').popup('close'); } },
					{ text : 'Disqualify', style : 'important', click : function( ev ) { $( this ).parent().children().hide(); (sendCommand( "coordinator/punitive/disqualified/" + index )()); } },
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
				var division = o.progress.divisions[ i ];
				var editor   = e.athletes.header.editor.description;
				var request  = i + '/edit';
				editor.divisionDescriptor().divisionDescriptor({ text : division.description });
				editor.trigger( 'create' );
				e.dialog.popupdialog({
					title:    'Edit Division Description',
					subtitle: 'Division Description',
					message:  editor,
					afterclose: function() { e.sound.confirmed.play(); },
					buttons:  [
						{ text : 'Cancel', style : 'cancel', click : function( ev ) { o.changes = undefined; $('#popupDialog').popup('close'); } },
						{ text : 'Accept', style : 'ok',     click : function( ev ) { 
								o.changes = undefined;
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
		}

		// ============================================================
		var removeAthlete = function( division, round ) {
		// ============================================================
			return function() {
				var text = $(this).parent().find( 'input:text' );
				text.val( '' );
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
		}

		// ============================================================
		var removeDivision = function() {
		// ============================================================
			var removeButton = $( this );
			var request      = $( this ).attr( 'index' ) + '/edit';
			var name         = $( this ).attr( 'name' );
			var count        = $( this ).attr( 'count' );
			var description  = $( this ).attr( 'description' );
			if( o.removedivision != name ) {
				$( this ).animate({ 'background-color' : 'red' }, 500 );
				$( this ).parents( 'li' ).siblings().find( 'a.remove' ).animate({ 'background-color' : 'transparent' }, 250);

			} else {
				var parameters = { delete : true };
				e.dialog.popupdialog({
					title:    'Remove Division?',
					subtitle: 'Remove ' + name.toUpperCase() + ' ' + description + ' (' + count + ')?',
					message:  'Once confirmed, this operation cannot be undone.',
					afterclose: function() {},
					buttons:  [
						{ text : 'Cancel', style : 'cancel',    click : function() { $('#popupDialog').popup('close'); removeButton.animate({ 'background-color' : 'transparent' }, 250); o.removedivision = undefined; } },
						{ text : 'Remove', style : 'important', click : function() { (sendRequest( request, parameters ))(); removeButton.animate({ 'background-color' : 'transparent' }, 250); o.removedivision = undefined; } },
					]
				}).popup( 'open', { transition : 'pop', positionTo : 'window' });
			}
			o.removedivision = name;
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
			e.sound.ok.play();
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
		var sendCommand = function( command, callback ) {
		// ============================================================
			return function() {
				var url = 'http://' + o.server + o.port + o.tournament.db + '/' + o.ring + '/' + command;
				$.ajax( {
					type:    'GET',
					crossDomain: true,
					url:     url,
					data:    {},
					success: function( response ) { 
						if( defined( response.error )) {
							sound.error.play();
							console.log( response );

						} else {
							sound.ok.play(); 
							console.log( url );
							console.log( response );
							if( defined( callback )) { callback( response ); }
						}
					},
					error:   function( response ) { sound.error.play(); console.log( "Network Error: Unknown network error." ); },
				});
			}
		};

		// ============================================================
		var sendRequest = function( request, data, callback ) {
		// ============================================================
			return function() {
				var url = 'http://' + o.server + o.port + o.tournament.db + '/' + o.ring + '/' + request;
				$.ajax( {
					type:        'POST',
					crossDomain: true,
					url:         url,
					dataType:    'json',
					data:        JSON.stringify( data ),
					success:     function( response ) { 
						if( defined( response.error )) {
							sound.error.play();
							console.log( response );

						} else {
							sound.ok.play(); 
							console.log( url );
							console.log( response );
							if( defined( callback )) { callback( response ); }
						}
					},
					error:       function( response ) { sound.error.play(); console.log( "Network Error: Unknown network error." ); },
				});
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
				title:    'Transfer Division?',
				subtitle: 'Transfer ' + name.toUpperCase() + ' ' + description + ' (' + count + ')?',
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
			var index    = $(this).attr( 'index' );
			var division = o.progress.divisions[ o.progress.current ];
			var athlete  = division.athletes[ index ];
			e.dialog.popupdialog({
				title:    'Withdraw Athlete?',
				subtitle: 'Withdraw ' + athlete.name + ' from this division?',
				message:  'Once confirmed, this operation cannot be undone.',
				afterclose: function( ev, ui ) {},
				buttons:  [
					{ text : 'Cancel',   style : 'cancel', click : function( ev ) { $('#popupDialog').popup('close'); } },
					{ text : 'Withdraw', style : 'important', click : function( ev ) { $(this).parent().children().hide(); (sendCommand( "coordinator/punitive/withdrawn/" + index )()); } },
				]
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
		};

		// ============================================================
		var updateDivisions = e.updateDivisions = function( divisions, staging, current ) {
		// ============================================================
			e.divisions.list.empty();
			e.divisions.list.attr({ 'data-split-icon' : 'minus' });
			if( ! defined( divisions )) { return; }

			var divider = html.li.clone() .addClass( 'divider' ) .attr({ 'data-role' : 'list-divider', 'data-theme' : 'b' });

			// ===== DISPLAY RING DIVISIONS
			e.divisions.list.append( divider.clone() .html( 'Ring ' + o.ring ));
			for( var i = 0; i < divisions.length; i++ ) {
				var divdata = divisions[ i ];
				var count   = divdata.athletes.length > 1 ? divdata.athletes.length + ' Athletes' : '1 Athlete';
				var list    = divdata.athletes.map( function( item ) { return item.name; } ).join( ", " );
				var title   = (i == current ? 'Currently Scoring:<span class="title"> ' : '<span>') + divdata.name.toUpperCase() + ' ' + divdata.description + '</span>';

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
				division.edit.attr({ 'data-transition' : 'slide', 'divid' : division.data.name });

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
					title    : html.h3  .clone() .html( 'Create a new division at ring ' + o.ring ),
				};

				division.edit.empty();
				division.edit.append( division.ring, division.title );

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
			var rounds = [];
			for( var round in division.order ) { rounds.push( round ); }
			for( var i = 0; i < FreeScore.round.order.length; i++ ) {
				var round = FreeScore.round.order[ i ];
				if( round in division.order ) {
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
					if( defined( o.round ) && o.round == round || division.round == round ) { 
						tabs.find( 'a' ).removeClass( 'ui-btn-active' );
						tab.button.addClass( 'ui-btn-active' ); 
					}
					tab.item.append( tab.button );
					tabs.append( tab.item );
				}
			}

			e.athletes.rounds.append( tabs );
			e.athletes.rounds.navbar().navbar( "destroy" );
			e.athletes.rounds.navbar();
		};

		// ============================================================
		var updateAthletes = e.updateAthletes = function( division, current ) {
		// ============================================================
			if( ! defined( division )) { return; }
			if( ! defined( o.round  )) { o.round = division.round; }
			if( o.progress.current == current ) { 
				e.actions.navigate  .panel .hide();
				e.actions.clock     .panel .show();
				e.actions.penalties .panel .show();
				e.actions.changes   .panel .hide();

				e.actions.navigate.division.attr({ index : undefined });

			} else {
				e.actions.navigate  .panel .show();
				e.actions.clock     .panel .hide();
				e.actions.penalties .panel .hide();
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
			e.athletes.header.title .html( division.name.toUpperCase() + ' ' + division.description );

			// Update Athlete Table
			var round = defined( o.round ) ? o.round : division.round;
			var forms = division.forms[ round ];
			e.athletes.table.empty();
			e.athletes.thead.empty();
			e.athletes.tbody.empty();
			var header = {
				row   : html.tr .clone(),
				order : html.th .clone() .html( 'Num.' ),
				name  : html.th .clone() .html( 'Athlete' ),
				form1 : html.th .clone() .html( forms[ 0 ] ),
				form2 : html.th .clone() .html( defined( forms[ 1 ] ) ? forms[ 1 ] : '' ),
			};

			header.row.append( header.order, header.name, header.form1 );
			if( forms.length == 2 ) { header.row.append( header.form2 ); }
			e.athletes.thead.append( header.row );
			e.athletes.table.append( e.athletes.thead, e.athletes.tbody );
			e.athletes.tbody.sortable({
				items: '> tr:not(.add, .complete)',       // Prevent reordering of athletes who have completed their form
				stop: reorderAthletes( division, round ), // Notify user of reordering change and enable user to save changes
			});

			for( var i = 0; i < division.order[ round ].length; i++ ) {
				var j = division.order[ round ][ i ];
				var athlete = {
					data  : division.athletes[ j ],
					row   : html.tr   .clone(),
					order : html.td   .clone() .addClass( "order" ),
					name  : html.td   .clone() .addClass( "name" ),
					form1 : html.td   .clone() .addClass( "oneform" ),
					form2 : html.td   .clone() .addClass( "twoforms" ),
				};

				// Is the athlete's score complete for this round
				var complete = true;
				for( k = 0; k < forms.length; k++ ) {
					var formComplete = athlete.data.scores[ round ].forms[ k ].complete;
					complete &= formComplete;
				}
				
				// ===== SHOW ATHLETE DATA (ORDER, NAME, AND SCORE(S))
				// If the athlete has completed their forms, show the name as unchangeable
				if( complete ) {
					athlete.name.append( athlete.data.name );
					athlete.row.addClass( 'complete' );

				// Otherwise show the name as an editable input
				} else {

					var input   = html.text.clone();
					var action = {
						withdraw   : html.a.clone().addClass( "athlete-actions ui-btn ui-nodisc-icon ui-shadow ui-corner-all ui-icon-user  ui-btn-icon-left ui-mini ui-btn-inline ui-nodisc-icon" ) .attr({ index : j }) .html( '&nbsp;&nbsp;&nbsp;WD' ),
						disqualify : html.a.clone().addClass( "athlete-actions ui-btn ui-nodisc-icon ui-shadow ui-corner-all ui-icon-info  ui-btn-icon-left ui-mini ui-btn-inline ui-nodisc-icon" ) .attr({ index : j }) .html( '&nbsp;&nbsp;&nbsp;DQ' ),
						remove     : html.a.clone().addClass( "athlete-actions ui-btn ui-nodisc-icon ui-shadow ui-corner-all ui-icon-minus ui-btn-icon-left ui-mini ui-btn-inline ui-nodisc-icon" ) .attr({ index : j }) .html( '&nbsp;&nbsp;&nbsp;RM' ),
					};

					action.withdraw   .click( withdrawAthlete );
					action.disqualify .click( disqualifyAthlete );
					action.remove     .click( removeAthlete( division, round ) );

					input.val( athlete.data.name );
					input.change( renameAthletes( division, round ) );
					input.focus( function() { 
						$( this ).parents( '.athletes' ).find( '.athlete-actions' ).css({ 'display' : 'none' });
						$( this ).parent().find( '.athlete-actions' ).css({ 'display' : 'inline' }); 
					});
					athlete.name.append( input, action.withdraw, action.disqualify, action.remove );
				}
				athlete.order.attr({ order : (i + 1) });
				athlete.order.append( (i + 1) + '.' );
				athlete.row.append( athlete.order, athlete.name, athlete.form1 );
				if( forms.length == 2 ) { athlete.row.append( athlete.form2 ); athlete.form1 .removeClass( 'oneform' ) .addClass( 'twoforms' ); }

				// Highlight current athlete
				var currentDivision = o.progress.current == current;
				var currentRound    = o.round == division.round;
				var currentAthlete  = j == division.current;
				if( currentDivision && currentRound && currentAthlete ) { athlete.row    .addClass( 'current' ); }
				else                                                    { athlete.row .removeClass( 'current' ); }

				// Append score
				{
					var form         = athlete.data.scores[ round ].forms[ 0 ];
					var score        = form.adjusted;
					var withdrawn    = defined( form.decision ) ? form.decision.withdrawn : undefined;
					var disqualified = defined( form.decision ) ? form.decision.disqualified : undefined;

					if( defined( score ) ) {
						if( defined( score.total ))  { score = score.total.toFixed( 2 ); } else { score = '&mdash;'; }
						if( defined( withdrawn ))    { score = 'WD'; }
						if( defined( disqualified )) { score = 'DQ'; }
					} else                           { score = '&mdash;'; }

					var form1 = {
						name  : division.forms[ round ][ 0 ].name,
						score : score
					};
					athlete.form1.append( "<strong>" + form1.score + "</strong>" );
				};

				if( division.forms[ round ].length > 1 ) { 
					var form         = athlete.data.scores[ round ].forms[ 1 ];
					var score        = form.adjusted;
					var withdrawn    = defined( form.decision ) ? form.decision.withdrawn : undefined;
					var disqualified = defined( form.decision ) ? form.decision.disqualified : undefined;
					if( defined( score ) ) {
						if( defined( score.total ))  { score = score.total.toFixed( 2 ); } else { score = '&mdash;'; }
						if( defined( withdrawn ))    { score = 'WD'; }
						if( defined( disqualified )) { score = 'DQ'; }
					}  else                          { score = '&mdash;'; }
					var form2 = {
						name  : division.forms[ round ][ 1 ].name,
						score : score
					};
					athlete.form2.append( "<strong>" + form2.score + "</strong>" );
				}
				e.athletes.tbody.append( athlete.row );

				if( complete ) { athlete.row.addClass( 'complete' ); } else { athlete.row.removeClass( 'complete' ); }
			}

			// Handle 'Enter' key (focus on next input and select text)
			e.athletes.tbody.keydown( function( ev ) {
				if( ev.which == 13 ) {
					$( ev.target ).blur();
					var row  = $(ev.target).parents( 'tr' );
					var next = row.next().find( 'input' );
					next.focus();
					next.select();

				} else if( ev.which == 38 ) { 
					var row  = $(ev.target).parents( 'tr' );
					var prev = row.prev().find( 'input' );
					if( defined( prev.val() )) {
						$( ev.target ).blur();
						prev.focus();
						prev.select();
					}
					ev.preventDefault();

				} else if( ev.which == 40 ) { 
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
				division : division.name      != o.current.divname,
				athlete  : division.current   != o.current.athlete,
				form     : division.form      != o.current.form,
			};

			if( different.division || different.round || different.athlete || different.form ) {
				e.time.stop();
				e.time.clear();
			}

			o.current.divname = division.name;
			o.current.round   = division.round;
			o.current.athlete = division.current;
			o.current.form    = division.form;

		};

		// ============================================================
		this.element.on( "pagebeforetransition", function( ev, transition ) {
		// ============================================================
			if( ! defined( transition.absUrl )) { return; }
			if( ! defined( o.progress        )) { return; }
			var option    = parsePageUrl( transition.absUrl );
			var divisions = o.progress.divisions;
			var division  = undefined;
			if( defined( option.ring ) && defined( option.divid )) {
				for( var i = 0; i < divisions.length; i++ ) {
					division = divisions[ i ];
					if( division.name == option.divid && division.ring == option.ring ) { $.cookie( 'divindex', i ); break; }
					division = undefined;
				}
			}

			if      ( option.id == "divisions" ) { e.updateDivisions( divisions, o.progress.staging, o.progress.current ); }
			else if ( option.id == "athletes"  ) { o.round = division.round; var current = parseInt( $.cookie( 'divindex' )); e.updateRounds( division, current ); e.updateAthletes( division, current ); }
		});

		// ============================================================
		// HANDLE HEADER EDITOR EVENTS
		// ============================================================
		athletes.header.editor.description .on( FreeScore.event.division.description, function( ev ) { o.description = { gender : ev.gender, age : ev.age, rank : ev.rank, text : ev.text }; console.log( "Updating", ev );} );
		athletes.header.editor.forms       .on( FreeScore.event.division.forms,       function( ev ) { o.forms.text  = ev.text; } );

		// ============================================================
		e.refresh = function( update ) {
		// ============================================================
			var progress = JSON.parse( update.data ); 
			if( ! defined( progress.divisions )) { return; }
			if( ! defined( progress.digest    )) { return; }
			var digest   = progress.digest;
			if( defined( o.progress ) && digest == o.progress.digest ) { if( ! e.dialog.hasClass( 'ui-popup-hidden' )) { e.dialog.popup( 'close' ); } return; }
			var i = defined( $.cookie( 'divindex' )) ? parseInt( $.cookie( 'divindex' )) : progress.current;
			if( defined( o.changes )) { console.log( 'Changes pending; skipping update.' ); return; } // Do not refresh if there are pending changes
			o.progress = progress;
			e.updateDivisions( progress.divisions, progress.staging, progress.current );
			e.updateRounds( progress.divisions[ i ], i );
			e.updateAthletes( progress.divisions[ i ], i );

			// ===== UPDATE BEHAVIOR
			e .actions .admin .print .click( printResults( progress.divisions[ i ] ));

			e.dialog.popup( 'close' );
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

		athletes.header.menu.description .find( 'a' ).click( editDivisionDescription );
		athletes.header.menu.forms       .find( 'a' ).click( editDivisionForms );
		athletes.header.menu.judges      .find( 'a' ).click( editDivisionJudges );
		athletes.header.menu.method      .find( 'a' ).click( editDivisionMethod );

		dialog.popupdialog();
	},
	_init: function( ) {
		var o = this.options;
		var w = this.element;
		var e = this.options.elements;

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', e.refresh, false );
	}
});
