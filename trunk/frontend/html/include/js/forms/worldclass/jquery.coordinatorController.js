$.widget( "freescore.coordinatorController", {
	options: { autoShow: true },
	_create: function() {
		var o       = this.options;
		var e       = this.options.elements = {};
		var widget  = this.element;
		var html    = e.html  = FreeScore.html;
		var ordinal = [ '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th' ];

		o.ring      = parseInt( $.cookie( "ring" ));
		o.port      = ':3088/';
		o.current   = {};
		var ring    = o.ring == 'staging' ? 'Staging' : 'Ring ' + o.ring;

		var sound    = e.sound = {
			ok        : new Howl({ urls: [ "/freescore/sounds/upload.mp3",   "/freescore/sounds/upload.ogg"   ]}),
			confirmed : new Howl({ urls: [ "/freescore/sounds/received.mp3", "/freescore/sounds/received.ogg" ]}),
			error     : new Howl({ urls: [ "/freescore/sounds/quack.mp3",    "/freescore/sounds/quack.ogg"    ]}),
		};

		var button = html.a.clone() .addClass( 'ui-btn ui-corner-all ui-btn-icon-left' ) .css({ height: '24px' });

		var divisions = e.divisions = {
			page    : html.div.clone() .attr({ 'data-role': 'page', id: 'divisions' }),
			header  : html.div.clone() .attr({ 'data-role': 'header', 'data-theme': 'b', 'data-position' : 'fixed' }) .html( "<h1>Divisions for " + ring + "</h1>" ),
			main    : html.div.clone() .attr({ 'role': 'main' }),
			list    : html.ul.clone()  .attr({ 'role': 'listview', 'data-filter' : true, 'data-filter-placeholder' : 'Search for division description or athlete name...' }) .addClass( 'divisions' ),
		};

		var athletes  = e.athletes = {
			page    : html.div   .clone() .attr({ 'data-role' : 'page', id: 'athletes' }),
			header  : html.div   .clone() .attr({ 'data-role' : 'header', 'data-theme': 'b', 'data-position' : 'fixed' }) .html( "<a href=\"#divisions\" data-transition=\"slide\" data-direction=\"reverse\" data-icon=\"carat-l\">Divisions for Ring " + o.ring + " </a><h1>Athletes</h1>" ),
			main    : html.div   .clone() .attr({ 'role': 'main' }),
			table   : html.table .clone() .addClass( 'athletes' ) .attr({ 'cellpadding' : 0, 'cellspacing' : 0 }),
			tbody   : html.tbody .clone(),
			actions : html.div   .clone(),
			rounds  : html.div   .clone() .addClass( 'rounds' ),
		};

		var dialog = e.dialog = $( '#popupDialog' );

		var actions = e.actions = {
			panel : html.div.clone() .addClass( "actions" ),

			changes : {
				panel      : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend     : html.legend.clone() .html( "Changes" ),
				save       : button.clone() .addClass( 'navigation ui-icon-check'  ) .html( "Save Changes"    ),
				revert     : button.clone() .addClass( 'navigation ui-icon-back'   ) .html( "Revert Changes"  ),
			},

			clock : {
				panel      : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend     : html.legend.clone() .html( "Timer" ),
				face       : button.clone() .removeClass( 'ui-btn-icon-left' ) .addClass( 'timer' ) .html( "00:00.00" ),
				toggle     : button.clone() .addClass( 'start ui-icon-forward' ) .html( "Start Timer" ),
				settings   : { increment : 70, started : false },
				timer      : undefined,
				time       : 0,
				realtime   : 0,
			},

			penalties : {
				panel      : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend     : html.legend.clone() .html( "Penalties" ),
				timelimit  : button.clone() .addClass( 'penalty ui-icon-clock'  ) .html( "Time Limit"      ),
				bounds     : button.clone() .addClass( 'penalty ui-icon-action' ) .html( "Out-of-Bounds"   ),
				clear      : button.clone() .addClass( 'penalty ui-icon-delete' ) .html( "Clear Penalties" ),
			},

			punitive : {
				panel      : html.fieldset.clone() .attr({ 'data-role' : 'controlgroup' }),
				legend     : html.legend.clone() .html( "Punitive Decision" ),
				withdraw   : button.clone() .addClass( 'punitive ui-icon-user'   ) .html( "Withdraw"        ),
				disqualify : button.clone() .addClass( 'punitive ui-icon-alert'  ) .html( "Disqualify"      ),
			}
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
				e.actions.clock.toggle.removeClass( "stop" );
				e.actions.clock.toggle.removeClass( "ui-icon-delete" );
				e.actions.clock.toggle.addClass( "start" );
				e.actions.clock.toggle.addClass( "ui-icon-forward" );
				e.actions.clock.toggle.html( "Start Timer" );
			},
			start : function() {
				e.actions.clock.timer = $.timer( actions.clock.update, actions.clock.settings.increment, true );
				e.actions.clock.settings.started = true;
				e.actions.clock.toggle.removeClass( "start" );
				e.actions.clock.toggle.removeClass( "ui-icon-forward" );
				e.actions.clock.toggle.addClass( "stop" );
				e.actions.clock.toggle.addClass( "ui-icon-delete" );
				e.actions.clock.toggle.html( "Stop Timer" );
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

		o.penalties = { bounds : 0, timelimit : 0, misconduct : 0 };

		actions.changes    .panel.append( actions.changes.legend, actions.changes.save, actions.changes.revert );
		actions.clock      .panel.append( actions.clock.legend, actions.clock.face, actions.clock.toggle );
		actions.penalties  .panel.append( actions.penalties.legend, actions.penalties.timelimit, actions.penalties.bounds, actions.penalties.clear );
		actions.punitive   .panel.append( actions.punitive.legend, actions.punitive.withdraw, actions.punitive.disqualify );

		actions.panel.append( actions.clock.panel, actions.penalties.panel, actions.punitive.panel, actions.changes.panel );
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

		athletes.main.append( athletes.rounds, athletes.table, athletes.actions );
		athletes.page.append( athletes.header, athletes.main );

		widget.nodoubletapzoom();
		widget.addClass( "coordinator-controller" );
		widget.append( divisions.page, athletes.page );

		// ============================================================
		// Behavior
		// ============================================================

		// ============================================================
		var awardPenaltyBounds = function() {
		// ============================================================
			o.penalties.bounds += 0.3;

			var penalties = (o.penalties.bounds * 10) + '/' + (o.penalties.timelimit * 10) + '/' + (o.penalties.misconduct * 10) + '/' + (e.actions.clock.time / 10);
			(sendCommand( "coordinator/" + penalties )());
		};

		// ============================================================
		var awardPenaltyTimeLimit = function() {
		// ============================================================
			o.penalties.timelimit = 0.3;

			var penalties = (o.penalties.bounds * 10) + '/' + (o.penalties.timelimit * 10) + '/' + (o.penalties.misconduct * 10) + '/' + (e.actions.clock.time / 10);
			(sendCommand( "coordinator/" + penalties )());
		};

		// ============================================================
		var withdrawAthlete = function() {
		// ============================================================
			var division = o.progress.divisions[ o.progress.current ];
			var athlete  = division.athletes[ division.current ];
			e.dialog.popupdialog({
				title:    'Withdraw Athlete?',
				subtitle: 'Withdraw ' + athlete.name + ' from this division?',
				message:  'Once confirmed, this operation cannot be undone.',
				afterclose: function( ev, ui ) {},
				buttons:  [
					{ text : 'Cancel',   style : 'cancel', click : function( ev ) { $('#popupDialog').popup('close'); } },
					{ text : 'Withdraw', style : 'important', click : function( ev ) { (sendCommand( "coordinator/withdrawn" )()); $('#popupDialog').popup('close'); } },
				]
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
		};

		// ============================================================
		var disqualifyAthlete = function() {
		// ============================================================
			var division = o.progress.divisions[ o.progress.current ];
			var athlete  = division.athletes[ division.current ];
			e.dialog.popupdialog({
				title:    'Disqualify Athlete?',
				subtitle: 'Disqualify ' + athlete.name + ' from this division by punitive decision?',
				message:  'Once confirmed, this operation cannot be undone.',
				afterclose: function( ev, ui ) {},
				buttons:  [
					{ text : 'Cancel',     style : 'cancel', click : function( ev ) { $('#popupDialog').popup('close'); } },
					{ text : 'Disqualify', style : 'important', click : function( ev ) { (sendCommand( "coordinator/disqualified" )()); $('#popupDialog').popup('close'); } },
				]
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
		};

		// ============================================================
		var clearPenalties = function() {
		// ============================================================
			o.penalties.bounds    = 0.0;
			o.penalties.timelimit = 0.0;

			var penalties = (o.penalties.bounds * 10) + '/' + (o.penalties.timelimit * 10) + '/' + (o.penalties.misconduct * 10) + '/' + (e.actions.clock.time / 10);
			(sendCommand( "coordinator/" + penalties )());
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
		var removeDivision = function( ev ) {
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
					afterclose: function( ev, ui ) {},
					buttons:  [
						{ text : 'Cancel', style : 'cancel',    click : function( ev ) { $('#popupDialog').popup('close'); removeButton.animate({ 'background-color' : 'transparent' }, 250); o.removedivision = undefined; } },
						{ text : 'Remove', style : 'important', click : function( ev ) { (sendRequest( request, parameters ))(); removeButton.animate({ 'background-color' : 'transparent' }, 250); o.removedivision = undefined; } },
					]
				}).popup( 'open', { transition : 'pop', positionTo : 'window' });
			}
			o.removedivision = name;
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
				message:  'Please wait while the server completes the update.',
				afterclose: function( ev, ui ) { e.sound.confirmed.play(); },
				buttons:  'none',
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
			o.changes = undefined;
			e.sound.ok.play();
			setTimeout( function() { e.refresh( update ); }, 1000 );
		};

		// ============================================================
		var saveChanges = function() {
		// ============================================================
			(sendRequest( 'coordinator', o.changes )());
			e.dialog.popupdialog({
				title:    'Saving Changes',
				subtitle: 'Sending Changes to Server',
				message:  'Please wait while the server completes the update.',
				afterclose: function( ev, ui ) { e.sound.confirmed.play(); },
				buttons:  'none',
			}).popup( 'open', { transition : 'pop', positionTo : 'window' });
			o.changes = undefined;
		};

		// ============================================================
		var sendCommand = function( command, callback ) {
		// ============================================================
			return function() {
				console.log( command );
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
				console.log( request );
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
		var updateDivisions = e.updateDivisions = function( divisions, current ) {
		// ============================================================
			e.divisions.list.empty();
			e.divisions.list.attr({ 'data-split-icon' : 'minus' });
			if( ! defined( divisions )) { return; }
			var divider = html.li.clone() .attr({ 'data-role' : 'list-divider' });
			e.divisions.list.append( divider.clone() .html( 'Ring ' + o.ring ));
			for( var i = 0; i < divisions.length; i++ ) {
				var divdata = divisions[ i ];
				var count     = divdata.athletes.length > 1 ? divdata.athletes.length + ' Athletes' : '1 Athlete';
				var list      = divdata.athletes.map( function( item ) { return item.name; } ).join( ", " );

				var division = {
					data    : divdata,
					item    : html.li.clone(),
					edit    : html.a.clone(),
					ring    : html.div.clone() .addClass( 'ring' ) .html( 'Ring ' + o.ring ),
					title   : html.h3.clone() .html( divdata.name.toUpperCase() + ' ' + divdata.description ),
					details : html.p.clone() .append( '<b>' + count + '</b>:&nbsp;', list ),
					remove  : html.a.clone() .addClass( 'remove' ).attr({ index : i, name : divdata.name, count : count, description : divdata.description }),
				}

				division.edit.empty();
				division.edit.append( division.ring, division.title, division.details );
				division.edit.attr({ 'data-transition' : 'slide', 'divid' : division.data.name });

				// ===== BEHAVIOR
				division.edit.click( function( ev ) { var divid = $( this ).attr( 'divid' ); 
					$( ':mobile-pagecontainer' ).pagecontainer( 'change', '#athletes?ring=' + o.ring + '&divid=' + divid, { transition : 'slide' } )
				});
				division.remove.click( removeDivision );

				if( i == current ) { division.edit.addClass( 'current' ); } else { division.edit.removeClass( 'current' ); }
				division.item.append( division.edit, division.remove );
				e.divisions.list.append( division.item );
			}
			e.divisions.list.append( divider.clone() .html( 'Staging' ));
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
					tab.button.click( function() { o.round = $( this ).attr( 'round' ); e.updateAthletes( division, current ); });
					tab.button.removeClass( 'ui-btn-active' );
					if( defined( o.round ) && o.round == round || division.round == round ) { tab.button.addClass( 'ui-btn-active' ); }
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
			if( o.progress.current == current ) { 
				e.actions.clock     .panel .show();
				e.actions.penalties .panel .show();
				e.actions.punitive  .panel .show();
				e.actions.changes   .panel .hide();
			} else {
				e.actions.clock     .panel .hide();
				e.actions.penalties .panel .hide();
				e.actions.punitive  .panel .hide();
				e.actions.changes   .panel .hide();
			}

			// Update Page Header
			e.athletes.header .find( 'h1' ) .text( division.name.toUpperCase() + ' ' + division.description );

			// Update Athlete Table
			var round = defined( o.round ) ? o.round : division.round;
			var forms = division.forms[ round ];
			e.athletes.table.empty();
			e.athletes.tbody.empty();
			var header = {
				row   : html.tr .clone(),
				order : html.th .clone() .html( 'Num.' ),
				name  : html.th .clone() .html( 'Athlete' ),
				form1 : html.th .clone() .html( forms[ 0 ].name ),
				form2 : html.th .clone() .html( defined( forms[ 1 ] ) ? forms[ 1 ].name : '' ),
			};

			header.row.append( header.order, header.name, header.form1 );
			if( forms.length == 2 ) { header.row.append( header.form2 ); }
			e.athletes.table.append( header.row );
			e.athletes.table.append( e.athletes.tbody );
			e.athletes.tbody.sortable({
				// Prevent reordering of athletes who have completed their form
				items: '> tr:not(complete)', 

				// Notify user of reordering change and enable user to save changes
				stop: function( ev ) { 
					var reorder = [];
					var rows = $(this).context.children; // tbody children are tr elements, i.e. athlete names and scores
					for( i = 0; i < rows.length; i++ ) {
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
			});
			// Handle 'Enter' key (focus on next input and select text)
			e.athletes.tbody.keypress( function( ev ) {
				if( ev.keyCode == 13 ) {
					$( ev.target ).blur();
					var row  = $(ev.target).parents( 'tr' );
					var next = row.next().find( 'input' );
					next.focus();
					next.select();
				}
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
					var formComplete = athlete.data.scores[ round ][ k ].complete;
					complete &= formComplete;
				}
				
				// Populate data
				if( complete ) {
					athlete.name.append( athlete.data.name );
					athlete.row.addClass( 'complete' );
				} else {
					var input = html.text.clone();
					input.val( athlete.data.name );
					input.change( function( ev ) { 
						var rename = [];
						var rows   = $( this ).parents( 'tbody' ).children(); // tbody children are tr elements, i.e. athlete names and scores
						for( i = 0; i < rows.length; i++ ) {
							var row    = $( rows[ i ] );
							var column = { order : $( row.find( '.order' )[ 0 ] ), name : $( row.find( '.name' )[ 0 ] ) };
							var j      = column.order.attr( 'order' );
							var name   = column.name.find( 'input' ).length > 0 ? $( column.name.find( 'input' )[ 0 ] ).val() : column.name.html();
							if( defined( j ) ) { rename.push({ order : parseInt( j ), name : name }); }
						}
						o.changes = { divid : division.name, athletes: rename, round : round };
						e.actions.changes.panel.fadeIn(); 

					});
					athlete.name.append( input );
				}
				athlete.order.attr({ order : (i + 1) });
				athlete.order.append( (i + 1) + '.' );
				athlete.row.append( athlete.order, athlete.name, athlete.form1 );
				if( forms.length == 2 ) { athlete.row.append( athlete.form2 ); athlete.form1 .removeClass( 'oneform' ) .addClass( 'twoforms' ); }

				// Highlight current athlete
				var currentDivision = o.progress.current == current;
				var currentRound    = o.round == division.round;
				var currentAthlete  = j == division.current;
				if( currentDivision && currentRound && currentAthlete ) { athlete.row.addClass( 'current' ); }
				else                                                    { athlete.row.removeClass( 'current' ) }

				// Append score
				var score = athlete.data.scores[ round ][ 0 ].adjusted_mean;
				var form1 = {
					name  : division.forms[ round ][ 0 ].name,
					score : defined( score ) && defined( score.total ) ? score.total.toFixed( 2 ) : '&mdash;'
				};
				athlete.form1.append( "<strong>" + form1.score + "</strong>" );
				if( division.forms[ round ].length > 1 ) { 
					var score = athlete.data.scores[ round ][ 1 ].adjusted_mean;
					var form2 = {
						name  : division.forms[ round ][ 1 ].name,
						score : defined( score ) && defined( score.total ) ? score.total.toFixed( 2 ) : '&mdash;'
					};
					athlete.form2.append( "<strong>" + form2.score + "</strong>" );
				}
				e.athletes.tbody.append( athlete.row );

				if( complete              ) { athlete.row.addClass( 'complete' ); } else { athlete.row.removeClass( 'complete' ); }
			}

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

			if      ( option.id == "divisions" ) { e.updateDivisions( divisions, o.progress.current ); }
			else if ( option.id == "athletes"  ) { o.round = division.round; var current = parseInt( $.cookie( 'divindex' )); e.updateRounds( division, current ); e.updateAthletes( division, current ); }
		});

		// ============================================================
		e.refresh = function( update ) {
		// ============================================================
			var progress = JSON.parse( update.data ); 
			if( ! defined( progress.divisions )) { return; }
			var i = defined( $.cookie( 'divindex' )) ? parseInt( $.cookie( 'divindex' )) : progress.current;
			if( defined( o.changes )) { return; } // Do not refresh if there are pending changes
			o.progress = progress;
			e.updateDivisions( progress.divisions, i );
			e.updateAthletes( progress.divisions[ i ], i );

			e.dialog.popup( 'close' );
		};
		actions.changes    .save       .click( saveChanges );
		actions.changes    .revert     .click( revertChanges );

		actions.penalties  .timelimit  .click( awardPenaltyTimeLimit );
		actions.penalties  .bounds     .click( awardPenaltyBounds );
		actions.penalties  .clear      .click( clearPenalties );

		actions.punitive   .withdraw   .click( withdrawAthlete );
		actions.punitive   .disqualify .click( disqualifyAthlete );

		dialog.popupdialog();
	},
	_init: function( ) {
		var widget      = this.element;
		var e           = this.options.elements;
		var o           = this.options;
		var html        = e.html;
		var ordinal     = [ '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th' ];

		e.source = new EventSource( '/cgi-bin/freescore/forms/worldclass/update?tournament=' + o.tournament.db );
		e.source.addEventListener( 'message', e.refresh, false );
	}
});
