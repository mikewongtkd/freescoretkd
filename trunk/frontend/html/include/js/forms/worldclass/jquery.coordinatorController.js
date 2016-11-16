$.widget( "freescore.coordinatorController", {
	options: { autoShow: true },
	_create: function() {
		var o       = this.options;
		var e       = this.options.elements = {};
		var widget  = this.element;
		var html    = e.html  = FreeScore.html;

		o.ring      = parseInt( $.cookie( "ring" ));
		o.current   = {};
		o.forms     = {};
		o.method    = 'cutoff';
		var ring    = o.ring == 'staging' ? 'Staging' : 'Ring ' + o.ring;

		var sound    = e.sound = {
			send      : new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg"   ]}),
			confirmed : new Howl({ urls: [ "../../sounds/received.mp3", "../../sounds/received.ogg" ]}),
			error     : new Howl({ urls: [ "../../sounds/quack.mp3",    "../../sounds/quack.ogg"    ]}),
			next      : new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"   ]}),
			prev      : new Howl({ urls: [ "../../sounds/prev.mp3",     "../../sounds/prev.ogg"   ]}),
		};

		var button = html.a.clone() .addClass( 'ui-btn ui-corner-all' ) .css({ height: '42px', 'text-align' : 'left' });
		$.fn.extend({ iconlabel : function( icon, label ) { $( this ).html( "<span class=\"glyphicon glyphicon-" + icon + "\">&nbsp;</span>&nbsp;" + label ); return $( this ); }});

		// ============================================================
		// PAGE LAYOUTS
		// ============================================================

		// ===== RING COORDINATOR UI FRAMEWORK
		var divisions = e.divisions = {
			page    : html.div.clone() .attr({ 'data-role': 'page', id: 'divisions' }),
			header  : html.div.clone() .attr({ 'data-role': 'header', 'data-theme': 'b', 'data-position' : 'fixed' }) .html( "<h1>" + ring + " Divisions</h1>" ),
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
				setup : html.a     .clone() .attr({ 'data-icon' : 'edit', 'data-iconpos' : 'right', 'data-rel' : 'popup', 'href' : '#division-setup' }) .html( 'Edit Division' ),
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
				bounds     : button.clone() .addClass( 'penalty' ) .iconlabel( "log-out",   "Out-of-Bounds"   ),
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

		actions.clock      .panel.append( actions.clock.legend, actions.clock.face, actions.clock.toggle );
		actions.navigate   .panel.append( actions.navigate.legend, actions.navigate.division );
		actions.penalties  .panel.append( actions.penalties.legend, actions.penalties.timelimit, actions.penalties.bounds, actions.penalties.restart, actions.penalties.misconduct, actions.penalties.clear );
		actions.admin      .panel.append( actions.admin.legend, actions.admin.display, actions.admin.print );
		actions.punitive   .panel.append( actions.punitive.legend, actions.punitive.remove );

		actions.panel.append( actions.navigate.panel, actions.clock.panel, actions.penalties.panel, actions.punitive.panel, actions.admin.panel );
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
		athletes.header.panel.append( athletes.header.back, athletes.header.title, athletes.header.setup );
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
					editAthletes( division, round ) ();
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
			window.open( "./division/editor.php?file=" + o.tournament.db + "/" + o.ring + "/new", "_blank" );
		};

		// ============================================================
		var deleteAthlete = function() {
		// ============================================================
			var division = new Division( o.progress.divisions.find(( d ) => { return d.name == o.progress.current; }) );
			var athlete  = division.current.athlete();
			e.dialog.popupdialog({
				title:    'Delete Athlete?',
				subtitle: 'Delete ' + athlete.name() + ' from this division?',
				message:  'This removes an athlete that doesn\'t belong in the division. Once confirmed, this operation cannot be undone.',
				buttons:  [
					{ text : 'Cancel', style : 'cancel',    click : function( ev ) { e.sound.prev.play();      removeAthleteDialog(); } },
					{ text : 'Delete', style : 'important', click : function( ev ) { e.sound.confirmed.play(); $('#popupDialog').popup( 'close' ); (sendRequest({ type: 'division', action: 'delete athlete', athlete_id: division.current.athleteId() })()); } },
				]
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
		};

		// ============================================================
		var disqualifyAthlete = function() {
		// ============================================================
			var index    = $(this).attr( 'index' );
			var division = new Division( o.progress.divisions.find(( d ) => { return d.name == o.progress.current; }) );
			var athlete  = division.current.athlete();
			e.dialog.popupdialog({
				title:    'Disqualify Athlete?',
				subtitle: 'Disqualify ' + athlete.name() + ' from this division?',
				message:  'This is a punitive decision. Once confirmed, this operation cannot be undone.',
				buttons:  [
					{ text : 'Cancel',     style : 'cancel',    click : function( ev ) { e.sound.prev.play();      removeAthleteDialog(); } },
					{ text : 'Disqualify', style : 'important', click : function( ev ) { e.sound.confirmed.play(); $('#popupDialog').popup( 'close' ); (sendRequest({ type: 'division', action: 'award punitive', decision: 'disqualified', athlete_id: division.current.athleteId() })()); } },
				]
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
		};
		
		// ============================================================
		var editDivision = function( division ) {
		// ============================================================
			return function() {
				e.sound.prev.play();
				window.open( "./division/editor.php?file=" + o.tournament.db + "/" + o.ring + "/" + division.name(), "_blank" );
			}
		};

		// ============================================================
		var goToDivision = function() {
		// ============================================================
			var divid = $.cookie( 'divid' );
			var division = new Division( o.progress.divisions.find((d) => { return d.name == divid }));
			e.dialog.popupdialog({
				title:    'Start Scoring Division ' + division.name().toUpperCase() + '?',
				subtitle: 'Start scoring Division ' + division.summary() + '?',
				message:  'Redirects FreeScore to start scoring Division ' + division.name().toUpperCase() + '. Check that no referees are currently scoring before changing the current division.',
				afterclose: function() { e.sound.confirmed.play(); },
				buttons:  [
					{ text : 'Cancel', style : 'cancel', click : function() { $('#popupDialog').popup('close'); }},
					{ text : 'Start',  style : 'ok',     click : function() { (sendRequest({ type: 'division', action: 'navigate', target : { destination: 'division', divid : division.name() }}))(); $('#popupDialog').popup('close');}},
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
				var url     = '/cgi-bin/freescore/forms/worldclass/results?ring=' + division.ring() + '&divid=' + division.name() ;
				var results = window.open( url, '_blank', 'toolbar=no,status=no,scrollbars=yes,resizable=yes' );
				results.print();
			}
		};

		// ============================================================
		var removeAthlete = function() {
		// ============================================================
			e.sound.next.play();
			removeAthleteDialog();
		};

		// ============================================================
		var removeAthleteDialog = function() {
		// ============================================================
			var division = new Division( o.progress.divisions.find(( d ) => { return d.name == o.progress.current; }) );
			var athlete  = division.current.athlete();
			var round    = division.current.roundId();
			e.dialog.popupdialog({
				title:    'Remove ' + athlete.name(),
				subtitle: 'Choose a reason to remove ' + athlete.name() + ' from this division.',
				message:  '',
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
		var editAthletes = function( division, round ) {
		// ============================================================
			return function() {
				var reorder = [];
				var rows   = $( 'tbody.athlete-list' ).children(); // tbody children are tr elements, i.e. athlete names and scores
				for( i = 0; i < rows.length - 1; i++ ) {
					var row    = $( rows[ i ] );
					var column = { order : $( row.find( '.order' )[ 0 ] ), name : $( row.find( '.name' )[ 0 ] ) };
					var j      = column.order.attr( 'order' );
					var name   = column.name.find( 'input' ).length > 0 ? $( column.name.find( 'input' )[ 0 ] ).val() : column.name.html();
					if( i == division.current.athleteId() ) { row.addClass( 'current' ); } else { row.removeClass( 'current' ); }
					if( defined( j ) ) { reorder.push({ order : parseInt( j ), name : name }); }
					column.order.html( (i + 1) + '.' );
				}
				sendRequest( { type: 'division', action: 'edit athletes', divid : division.name(), athletes: reorder, round : round } )();
			}
		};

		// ============================================================
		var runDivision = function() {
		// ============================================================
			var divid = $( this ).attr( 'divid' ); 
			$( ':mobile-pagecontainer' ).pagecontainer( 'change', '#athletes?ring=' + o.ring + '&divid=' + divid, { transition : 'slide' } )
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
			var request     = $( this ).attr( 'index' ) + '/edit';
			var name        = $( this ).attr( 'name' );
			var sendTo      = $( this ).attr( 'sendTo' );
			var count       = $( this ).attr( 'count' );
			var description = $( this ).attr( 'description' );
			var parameters  = { type: 'division', action: 'transfer', transfer : sendTo };
			var division    = { name : name.toUpperCase(), description : description, summary : name.toUpperCase() + ' ' + description };
			var dialog      = { message : undefined, title: undefined, subtitle: undefined };

			if( sendTo == 'staging' ) {
				dialog.title    = 'Send to Staging?';
				dialog.subtitle = 'Send ' + division.summary + ' (' + count + ') to staging?';
				dialog.message  = 'If you send division ' + division.name + ' back to staging, it can be reclaimed later.';
			} else {
				dialog.title    = 'Accept Division ' + division.name;
				dialog.subtitle = 'Accept Division ' + division.name + ' to Ring ' + sendTo;
				dialog.message  = 'If you take division ' + division.name + ' into ring ' + sendTo + ', it can be sent back to staging later.';
			}

			e.dialog.popupdialog({
				title:    dialog.title,
				subtitle: dialog.subtitle,
				message:  dialog.message,
				afterclose: function() {},
				buttons:  [
					{ text : 'Cancel',   style : 'cancel',  click : function() { $('#popupDialog').popup('close'); } },
					{ text : 'Transfer', style : 'default', click : function() { $('#popupDialog').popup('close'); (sendRequest({ type : 'ring', action : 'transfer', name : name, transfer : sendTo }))(); } },
				]
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
		};

		// ============================================================
		var withdrawAthlete = function() {
		// ============================================================
			var division = new Division( o.progress.divisions.find(( d ) => { return d.name == o.progress.current; }) );
			var athlete  = division.current.athlete();
			e.dialog.popupdialog({
				title:    'Withdraw Athlete?',
				subtitle: 'Withdraw ' + athlete.name() + ' from this division?',
				message:  'Once confirmed, this operation cannot be undone.',
				afterclose: function( ev, ui ) {},
				buttons:  [
					{ text : 'Cancel',   style : 'cancel',    click : function( ev ) { e.sound.prev.play();      removeAthleteDialog(); }},
					{ text : 'Withdraw', style : 'important', click : function( ev ) { e.sound.confirmed.play(); $('#popupDialog').popup('close'); (sendRequest({ type: 'division', action: 'award punitive', decision: 'withdrawn', athlete_id: division.current.athleteId() })()); }},
				]
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
		};

		// ============================================================
		var updateDivisions = e.updateDivisions = function( divisions, current ) {
		// ============================================================
			e.divisions.list.empty();
			e.divisions.list.attr({ 'data-split-icon' : 'home' });
			if( ! defined( divisions )) { return; }

			var divider = html.li.clone() .addClass( 'divider' ) .attr({ 'data-role' : 'list-divider', 'data-theme' : 'b' });

			// ===== DISPLAY RING DIVISIONS
			e.divisions.list.append( divider.clone() .html( 'Ring ' + o.ring ));
			for( var i = 0; i < divisions.length; i++ ) {
				if( divisions[ i ].ring == 'staging' ) { continue; }

				var divdata = new Division( divisions[ i ] );
				var count   = divdata.athletes().length > 1 ? divdata.athletes().length + ' Athletes' : '1 Athlete';
				var list    = divdata.athletes().map( function( item ) { return item.name(); } ).join( ", " );
				var title   = (divdata.name() == current ? 'Currently Scoring:<span class="title"> ' : '<span>') + divdata.summary() + '</span>';

				var division = {
					data     : divdata,
					item     : html.li  .clone(),
					run      : html.a   .clone(),
					ring     : html.div .clone() .addClass( 'ring' ) .html( 'Ring ' + o.ring ),
					title    : html.h3  .clone() .html( title ),
					details  : html.p   .clone() .append( '<b>' + count + '</b>:&nbsp;', list ),
					transfer : html.a   .clone() .addClass( 'transfer-to-staging' ).attr({ name : divdata.name, count : count, description : divdata.description, sendTo : 'staging' }).css({ 'background-color': '#d9534f;' }),
				};

				division.run.empty();
				division.run.append( division.ring, division.title, division.details );
				division.run.attr({ 'data-transition' : 'slide', 'divid' : division.data.name() });

				division.run      .click( runDivision );
				division.transfer .click( transferDivision );

				if( divdata.name() == current ) { division.run.addClass( 'current' ); } else { division.run.removeClass( 'current' ); }

				// Composition
				division.item.append( division.run, division.transfer );
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
			for( var i = 0; i < divisions.length; i++ ) {
				if( divisions[ i ].ring != 'staging' ) { continue; }

				var divdata = divisions[ i ];
				var count   = divdata.athletes.length > 1 ? divdata.athletes.length + ' Athletes' : '1 Athlete';
				var list    = divdata.athletes.map( function( item ) { return item.name; } ).join( ", " );

				var division = {
					data     : divdata,
					item     : html.li  .clone(),
					ring     : html.div .clone() .addClass( 'ring' ) .html( 'Staging' ),
					title    : html.h3  .clone() .html( divdata.name.toUpperCase() + ' ' + divdata.description ),
					details  : html.p   .clone() .append( '<b>' + count + '</b>:&nbsp;', list ),
					transfer : html.a   .clone() .addClass( 'transfer ui-icon-plus' ).attr({ name : divdata.name, count : count, description : divdata.description, sendTo : o.ring }),
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
			$.cookie( 'divid', division.name() ); // Store the current divid in case we need to reload

			if( division.name() == current ) { 
				e.actions.navigate  .panel .hide();
				e.actions.clock     .panel .show();
				e.actions.penalties .panel .show();
				e.actions.punitive  .panel .show();

				// Clear context for navigation button
				e.actions.navigate.division.attr({ divid : undefined });

			} else {
				e.actions.navigate  .panel .show();
				e.actions.clock     .panel .hide();
				e.actions.penalties .panel .hide();
				e.actions.punitive  .panel .hide();

				// Set context for navigation button
				var divid = division.name();
				e.actions.navigate.division.attr({ divid : divid });
			}

			// Update Page Header
			e.athletes.header.title .html( division.summary() );
			e.athletes.header.setup .off( 'click' ).click( editDivision( division ));

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
				stop: editAthletes( division, round ), // Reorder athletes as requested
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
					input.change( editAthletes( division, round ) );
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
				division = new Division( o.progress.divisions.find((d) => { return d.name == option.divid && d.ring == option.ring; }));
			}

			if      ( option.id == "divisions" ) { e.updateDivisions( divisions, o.progress.current ); }
			else if ( option.id == "athletes"  ) { o.round = division.current.roundId(); e.updateRounds( division, o.progress.current ); e.updateAthletes( division, o.progress.current ); }
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
			o.progress = progress;

			var div = {};
			div.id   = defined( $.cookie( 'divid' )) ? $.cookie( 'divid' ) : progress.current;
			div.data = progress.divisions.find((d) => { return d.name == div.id; });
			if( ! defined( div.data )) {
				$.removeCookie( 'divid' );
				div.id   = progress.current;
				div.data = progress.divisions.find((d) => { return d.name == div.id; });
			}

			var division = new Division( div.data );
			e.updateDivisions( progress.divisions, progress.current );
			e.updateRounds( division, progress.current );
			e.updateAthletes( division, progress.current );

			// ===== UPDATE BEHAVIOR
			e .actions .admin .print .click( printResults( division ));
		};

		actions .admin      .display    .click( showDisplay );

		actions .navigate   .division   .click( goToDivision );

		actions .penalties  .timelimit  .click( awardPenaltyTimeLimit );
		actions .penalties  .bounds     .click( awardPenaltyBounds );
		actions .penalties  .restart    .click( awardPenaltyRestart );
		actions .penalties  .misconduct .click( awardPenaltyMisconduct );
		actions .penalties  .clear      .click( clearPenalties );

		actions .punitive   .remove     .click( removeAthlete );

		dialog.popupdialog();
	},
	_init: function( ) {
		var o  = this.options;
		var w  = this.element;
		var e  = this.options.elements;
		var ws = e.ws = new WebSocket( 'ws://' + o.server + '/worldclass/request/' + o.tournament.db + '/' + o.ring );

		ws.onopen = function() {
			var request  = { data : { type : 'ring', action : 'read' }};
			request.json = JSON.stringify( request.data );
			ws.send( request.json );
		};

		ws.onmessage = e.refresh;

		ws.onclose = function( reason ) {
			ws = e.ws = new WebSocket( 'ws://' + o.server + '/worldclass/request/' + o.tournament.db + '/' + o.ring ); 
			if( reason.code > 1001 ) {
				e.dialog.popupdialog({
					title:    'Network Error',
					subtitle: 'An error occurred while attempting to connect to the server.',
					message:  'Error ' + reason.code + ' ' + FreeScore.websocket.errorDescription( reason ),
					buttons:  [
						{ text : 'OK', style : 'important', click : function( ev ) { $('#popupDialog').popup( 'close' ); } },
					]
				}).popup( 'open', { transition : 'pop', positionTo : 'window' });

				e.dialog.popupdialog().popup( 'open' );
			}
		};
	}
});
