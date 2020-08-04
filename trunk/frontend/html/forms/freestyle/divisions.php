<?php 
	$an_hour_ago = time() - 3600;
	setcookie( 'judge', '', $an_hour_ago, '/' );
	setcookie( 'role',  'division manager', 0, '/' );
	setcookie( 'ring',  '', $an_hour_ago, '/' );
	include( "../../include/php/config.php" ); 

	$t = json_decode( $tournament );
?>
<html>
	<head>
		<title>Freestyle Divisions</title>
		<link href="../../include/jquery/css/smoothness/jquery-ui.css" rel="stylesheet" />
		<link href="../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/bootstrap/css/bootstrap-theme.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/alertify.min.css" rel="stylesheet" />
		<link href="../../include/alertify/css/themes/bootstrap.min.css" rel="stylesheet" />
		<link href="../../include/opt/elfinder/css/elfinder.min.css" rel="stylesheet" />
		<link href="../../include/opt/elfinder/css/theme.css" rel="stylesheet" />
		<link href="../../include/css/forms/freestyle/divisions.css" rel="stylesheet" />
		<link href="../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="../../include/opt/js-sha1/sha1.min.js"></script>
		<script src="../../include/jquery/js/jquery.js"></script>
		<script src="../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../include/jquery/js/jquery.purl.js"></script>
		<script src="../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../include/jquery/js/jquery.cookie.js"></script>
		<script src="../../include/opt/elfinder/js/elfinder.min.js"></script>
		<script src="../../include/bootstrap/add-ons/bootstrap-list-filter.min.js"></script>
		<script src="../../include/alertify/alertify.min.js"></script>
		<script src="../../include/js/freescore.js"></script>
		<script src="../../include/js/forms/freestyle/athlete.class.js"></script>
		<script src="../../include/js/forms/freestyle/division.class.js"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1"></meta>

	</head>
	<body>
		<div class="container">
			<div class="page-header">Freestyle Division Manager</div>

			<ul class="nav nav-tabs">
				<?php foreach( $t->rings as $i ): 
						$num = $i;
						if( $num < 10 ) { $num = '0' . $num; }
					?>
					<li><a data-toggle="tab" id="ring<?= $num ?>-tab" href="#ring<?= $num ?>">Ring <?= $i ?></a></li>
				<?php endforeach; ?>
				<li><a data-toggle="tab" id="staging-tab" href="#staging">Staging</a></li>
				<li><a data-toggle="tab" id="files-tab" href="#files">File Manager</a></li>
			</ul>
			<div class="tab-content">
				<?php foreach( $t->rings as $i ): 
						$num = $i;
						if( $num < 10 ) { $num = '0' . $num; }
				?>
				<div id="ring<?= $num ?>" class="tab-pane fade in">
					<div class="row">
						<div class="col-sm-10">
							<form role="form">
								<div class="form-group">
									<input id="ring<?= $num ?>-search" class="form-control" type="search" placeholder="Search Ring <?= $i ?>..." />
								</div>
								<div class="list-group" id="ring<?= $num ?>-divisions">
								</div>
							</form>
						</div>
						<div class="col-sm-2">
							<h4>Division</h4>
							<div class="btn-group-vertical btn-block">
								<a class="btn btn-success" href="division/editor.php?file=test/forms-freestyle/ring<?= $num ?>/new" target="_blank"><span class="glyphicon glyphicon-file"></span> New</a>
								<a class="btn btn-default disabled" id="ring<?= $num ?>-div-edit" target="_blank"><span class="glyphicon glyphicon-pencil"></span> Edit</a>
								<a class="btn btn-default disabled" id="ring<?= $num ?>-div-restage"><span class="glyphicon glyphicon-arrow-left"></span> Restage</a>
							</div>
							<div class="btn-group-vertical btn-block">
								<a class="btn btn-default disabled" id="ring<?= $num ?>-div-delete"><span class="glyphicon glyphicon-remove"></span> Delete</a>
							</div>
						</div>
					</div>
				</div>
				
				<?php endforeach; ?>
				<div id="staging" class="tab-pane fade in">
					<div class="row">
						<div class="col-sm-10">
							<form role="form">
								<div class="form-group">
									<input id="staging-search" class="form-control" type="search" placeholder="Search Staging..." />
								</div>
								<div class="list-group" id="staging-divisions">
								</div>
							</form>
						</div>
						<div class="col-sm-2">
							<h4>Division</h4>
							<div class="btn-group-vertical btn-block">
								<a class="btn btn-success" href="division/editor.php?file=test/staging/new" target="_blank"><span class="glyphicon glyphicon-file"></span> New</a>
								<a class="btn btn-default disabled" id="staging-div-edit" target="_blank"><span class="glyphicon glyphicon-pencil"></span> Edit</a>
								<a class="btn btn-default disabled" id="staging-div-send" target="_blank"><span class="glyphicon glyphicon-arrow-right"></span> Send to Ring</a>
								<a class="btn btn-default disabled" id="staging-div-delete"><span class="glyphicon glyphicon-remove"></span> Delete</a>
							</div>
						</div>
					</div>
				</div>
				<div id="files" class="tab-pane fade in">
					<p>You can drag-and-drop ring folders with divisions in them into
					the <code class="text-muted">forms-freestyle</code> directory, or drag-and-drop division
					files to one of the ring directories. You can also drag-and-drop
					ring folders and/or division files files to your computer.</p>

					<div id="elfinder" class="panel-body"></div>
				</div>
		</div>
		<script>
			alertify.defaults.theme.ok     = "btn btn-danger";
			alertify.defaults.theme.cancel = "btn btn-warning";

			var host       = '<?= $host ?>';
			var tournament = <?= $tournament ?>;
			var html       = FreeScore.html;
			var network    = { reconnect: 0 }
			var ws         = undefined;

			var sound = {
				ok    : new Howl({ urls: [ "../../sounds/upload.mp3",   "../../sounds/upload.ogg" ]}),
				error : new Howl({ urls: [ "../../sounds/quack.mp3",    "../../sounds/quack.ogg"  ]}),
				next  : new Howl({ urls: [ "../../sounds/next.mp3",     "../../sounds/next.ogg"   ]}),
				prev  : new Howl({ urls: [ "../../sounds/prev.mp3",     "../../sounds/prev.ogg"   ]}),
			};

			$( 'a[data-toggle="tab"]' ).on( 'shown.bs.tab', function( e ) {
				var target = $( e.target ).attr( "href" );
				target = target.replace( '#', '' );
				target = target.replace( 'ring', '' );

				if( target == 'files' ) {
					// ElFinder rendering height "patch"
					var height = $( '#elfinder .elfinder-workzone' ).height();
					if( $( '#elfinder' ).height() < height + 60 ) {
						$( '#elfinder' ).height( height + 60 );
					}
					return;
				}


				if( target != 'staging' ) { target = parseInt( target ); }

				if( defined( ws )) { ws.close(); }

				ws = new WebSocket( `ws://<?= $host ?>:3082/freestyle/${tournament.db}/${target}/computer+operator/${sha1.hex(Date.now())}` );

				ws.onerror = network.error = function() {
					setTimeout( function() { location.reload(); }, 15000 ); // Attempt to reconnect every 15 seconds
				};

				ws.onopen = network.connect = function() {
					var request;
					request      = { data : { type : 'ring', action : 'read' }};
					request.json = JSON.stringify( request.data );
					ws.send( request.json );
				};

				ws.onmessage = network.message = function( response ) {
					var update = JSON.parse( response.data );
					console.log( update );

					if( update.type == 'ring' && update.action == 'update' ) {
						if( ! defined( update.ring )) { return; }
						refresh.rings( update );

					} else if( update.type == 'division' && update.action == 'write ok' ) {
						var request;
						request      = { data : { type : 'ring', action : 'read' }};
						request.json = JSON.stringify( request.data );
						ws.send( request.json );
					}
				};
			});

			// ===== DEFINE THE STAGING SEND TARGET FACTORY
			alertify.dialog( 'stagingSendTarget', function() {
				return {
					main: function( title, message, callback ) {
						this.set( 'title', title );
						this.message  = message;
						this.callback = callback;
						return this;
					},
					setup: function() {
						var buttons = tournament.rings.map(( i ) => { 
							return { text: 'Ring ' + i, value: i, className: 'btn btn-info' };
						});
						buttons.push({ text: 'Cancel', value: 'cancel', className: 'btn btn-warning' });
						return {
							buttons: buttons,
							focus: { element: 0 },
							options: {
								closable: false,
								closableByDimmer: false,
								maximizable: false,
								modal: true,
								movable: false,
								resizeable: false,
							},
						};
					},
					build: function() {
						$( this.elements.header ).html( this.title );
					},
					prepare: function() {
						this.setContent( this.message );
					}
				};
			});

			var refresh = {
				rings : function( update ) {
					var ring = { num: update.ring.name, divisions : update.ring.divisions };
					if( ring.num == 'staging' ) { ring.name = 'staging'; ring.num = undefined; }
					else {
						if( ring.num < 10 ) { ring.name = 'ring0' + ring.num; } else { ring.name = 'ring' + ring.num; }
					}
					var list = $( '#' + ring.name + '-divisions' );
					list.empty();

					if( ring.divisions.length == 0 ) {
						list.append( '<a class="list-group-item disabled">No Divisions</a>' );
					}

					// ===== DISABLE DIVISION-SPECIFIC ACTION BUTTONS UNTIL A DIVISION IS SELECTED
					var action     = { button: { edit: $( '#' + ring.name + '-div-edit' ), restage: $( '#' + ring.name + '-div-restage' ), send: $( '#staging-div-send' ), delete: $( '#' + ring.name + '-div-delete' ) }};
					action.edit    = { disable: () => { action.button.edit.removeClass( 'btn-info' ).addClass( 'disabled' ); action.button.edit.attr({ 'href': '#' }); }, };
					action.restage = { disable: () => { action.button.restage.removeClass( 'btn-warning' ).addClass( 'disabled' ); action.button.restage.off( 'click' ); } };
					action.send    = { disable: () => { action.button.send.removeClass( 'btn-warning' ).addClass( 'disabled' ); action.button.send.off( 'click' ); } };
					action.delete  = { disable: () => { action.button.delete.removeClass( 'btn-danger' ).addClass( 'disabled' ); action.button.delete.off( 'click' ); } };

					action.edit.disable();
					action.restage.disable();
					action.send.disable();
					action.delete.disable();

					// ===== DISPLAY THE DIVISIONS
					ring.divisions.sort(( a, b ) => { return a.name < b.name ? -1 : a.name > b.name; });
					ring.divisions.forEach(( d ) => {
						var division = new Division( d );
						var button   = html.a.clone().addClass( "list-group-item" );
						var summary  = html.span.clone().html( division.summary() ).addClass( 'division-summary' );
						var count    = html.span.clone().html( division.athletes().length ).addClass( "badge" );
						var athletes = html.p.clone().append( division.athletes().map(( a ) => { return a.name(); }).join( ', ' )).addClass( 'athletes hidden' );

						// Don't display staging (unless you mean it)
						if( division.ring() == 'staging' && ring.name != 'staging' ) { return; } 

						button.empty();
						button.append( summary, count, athletes );
						button.attr({ divid: division.name() });
						button.off( 'click' ).click(( ev ) => {
							var clicked  = $( ev.target ); if( ! clicked.is( 'a' ) ) { clicked = clicked.parent(); }
							var divid    = clicked.attr( 'divid' );
							var division = ring.divisions.find(( d ) => { return d.name == divid; });

							$.cookie( 'divid', divid, { expires: 1, path: '/' });
							sound.next.play();

							if( button.hasClass( 'active' )) {
								$( 'a.list-group-item.active' ).removeClass( 'active' );
								button.find( 'p.athletes' ).addClass( 'hidden' );
								action.edit.disable();
								action.restage.disable();
								action.send.disable();
								action.delete.disable();

							} else {
								$( 'a.list-group-item.active' ).removeClass( 'active' );
								$( 'a.list-group-item p.athletes' ).addClass( 'hidden' );
								button.addClass( 'active' );
								button.find( 'p.athletes' ).removeClass( 'hidden' );

								// Edit button
								action.button.edit.addClass( 'btn-info' ).removeClass( 'disabled' );
								action.button.edit.attr({ 'href': 'division/editor.php?file=test/forms-freestyle/' + ring.name + '/div.' + divid + '.txt' });

								// Transfer button
								if( ring.name == 'staging' ) {
									action.button.send.addClass( 'btn-warning' ).removeClass( 'disabled' );
									action.button.send.off( 'click' ).click(() => {
										sound.next.play();
										var divname = divid.toUpperCase() + ' ' + division.description;
										var title    = 'Which Ring?';
										var message  = 'Click on one of the buttons below to send <b>' + divname + '</b> to that ring';
										var callback = function( ev ) {
											var target = ev.button.value;
											if( target == 'cancel' ) {
												sound.prev.play();
											} else {
												var request;
												request      = { data : { type : 'ring', action : 'transfer', name: divid, transfer: target }};
												request.json = JSON.stringify( request.data );
												ws.send( request.json );
												sound.ok.play();
												alertify.success( 'Division ' + divname + ' sent to Ring ' + target );
											}
										};
										sound.next.play();
										alertify.stagingSendTarget( title, message, callback );
									});

								// Restage button
								} else {
									action.button.restage.addClass( 'btn-warning' ).removeClass( 'disabled' );
									action.button.restage.off( 'click' ).click(() => {
										sound.next.play();
										var divname = divid.toUpperCase() + ' ' + division.description;
										var title   = 'Send Division <b>' + divname + '</b> back to Staging?';
										var message = 'Click <span class="txt-warning">OK</span> to send division <b>' + divname + '</b> back to staging, or <span class="txt-warning">Cancel</span> to do nothing.';
										var ok      = function() {
											var request;
											request      = { data : { type : 'ring', action : 'transfer', name: divid, transfer: 'staging' }};
											request.json = JSON.stringify( request.data );
											ws.send( request.json );
											sound.ok.play();
											alertify.success( 'Division ' + division.description + ' sent back to staging.' );
				
											action.edit.disable();
											action.restage.disable();
											action.send.disable();
											action.delete.disable();
										};
										var cancel = function() { sound.prev.play(); }

										alertify.confirm( title, message, ok, cancel );
									});
								}

								// Delete button
								action.button.delete.addClass( 'btn-danger' ).removeClass( 'disabled' );
								action.button.delete.off( 'click' ).click(() => {
									sound.next.play();
									var title   = 'Delete Division ' + division.description + '?';
									var message = 'Click <span class="txt-danger">OK</span> to delete division ' + division.description + ', or <span class="txt-warning">Cancel</span> to do nothing.';
									var ok      = function() {
										var request;
										request      = { data : { type : 'ring', action : 'division delete', divid : divid }};
										request.json = JSON.stringify( request.data );
										ws.send( request.json );
										sound.ok.play();
										alertify.success( 'Division ' + division.description + ' deleted.' );
			
										action.edit.disable();
										action.restage.disable();
										action.send.disable();
										action.delete.disable();
									};
									var cancel = function() { sound.prev.play(); }

									alertify.confirm( title, message, ok, cancel );
								});
							}
						});

						list.append( button );
					});
					var search = $( '#' + ring.name + '-search' );
					list.btsListFilter( search, { initial: false, resetOnBlur: false });
				}
			};

			$( function() {
				// ===== START WITH FIRST RING TAB
				if( tournament.rings.length > 0 ) {
					var first = tournament.rings[ 0 ];
					first = first < 10 ? 'ring0' + first : 'ring' + first;
					$( '#' + first + '-tab' ).click();
				} else {
					$( '#staging-tab' ).click();
				}
				
				// ===== PREVENT LIST FILTER FORM FROM SUBMITTING ON ENTER
				$( 'form' ).keydown(( ev ) => {
					if( ev.keyCode == 13 ) {
						ev.preventDefault();
						$( ev.target ).blur();
						return false;
					}
				});

				// ===== CONFIGURE ELFINDER
				$( '#elfinder' ).elfinder({
					url : '../../include/opt/elfinder/php/connector.freestyle.php',  // connector URL (REQUIRED)
					getFileCallback: function( files, fm ) { 
						files.url = files.url.replace( /ring0/, '' );
						files.url = files.url.replace( /\bdiv\./, '' );
						files.url = files.url.replace( /\.txt$/, '' );
						window.open( files.url ); 
					},
					commands : [ 'open', 'reload', 'home', 'up', 'back', 'forward', 'getfile', 'download', 'rm', 'duplicate', 'rename', 'upload', 'copy', 'cut', 'paste', 'edit', 'search', 'info', 'view', 'help', 'sort' ],
					contextmenu: {
						files : [
							'getfile', '|', 'download', '|', 'copy', 'cut', 'paste', 'duplicate', '|', 'edit', 'rename'
						]
					},
					soundPath: '../../include/opt/elfinder/sounds',
					height: '400px'
				});
			});
		</script>
	</body>
</html>
