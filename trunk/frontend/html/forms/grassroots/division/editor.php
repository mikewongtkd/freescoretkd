<?php
	include( "../../../include/php/config.php" );
	$file       = '/usr/local/freescore/data/' . $_GET[ 'file' ];
	$url        = preg_split( '/\//', $_GET[ 'file' ] );
	$db         = array_shift( $url );
	$grassroots = array_shift( $url );
	$ring_name  = array_shift( $url );
	$file_name  = array_shift( $url );
	$ring       = intval( preg_replace( '/ring/', '', $ring_name ));
	$id         = $_GET[ 'file' ]; $id = preg_replace( '/\w*\/forms-grassroots\/ring\d+\/div\./', '', $id ); $id = preg_replace( '/\.txt/', '', $id );
	$setting    = [];
	$athletes   = [];

	if( file_exists( $file )) {
		$lines      = file( $file );
		$header     = preg_grep( "/^#/", $lines );
		$lines      = preg_grep( "/^\s*$/", $lines, true );  # Ignore empty lines
		foreach( $header as $line ) {
			$line = rtrim( $line );
			$line = preg_replace( '/^#\s*/', '', $line );
			$keyvalue = preg_split( "/=/", $line, 2 );
			$setting[ $keyvalue[0] ] = $keyvalue[1];
		}
		$header   = join( "", $header );
		$athletes = array_filter( array_map( function( $n ) { $n = preg_replace( '/\t.*/', '', $n ); $n = preg_replace( '/\n/', '', $n ); return $n; }, preg_grep( "/^#/", $lines, true ))); 
		$list     = join( "\n", $athletes );
	}

	if( $setting[ mode ] == 'single-elimination' ) {
		$mode     = 'Single Elimination';
		$modeicon = 'fa fa-thumbs-up';
	} else {
		$mode     = 'Numeric Score';
		$modeicon = 'fa fa-list-ol';
	}
?>
<html>
	<head>
		<title>Grassroots Division</title>
		<link href="../../../include/jquery/css/smoothness/jquery-ui.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/css/bootstrap-theme.min.css" rel="stylesheet" />
		<link href="../../../include/opt/codemirror/lib/codemirror.css" rel="stylesheet" />
		<link href="../../../include/fontawesome/css/font-awesome.min.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../../include/jquery/js/jquery.howler.min.js"></script>
		<script src="../../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootbox.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-select.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-switch.min.js"></script>
		<script src="../../../include/opt/codemirror/lib/codemirror.js"></script>
		<script src="../../../include/opt/codemirror/mode/freescore/freescore.js"></script>
		<script src="../../../include/js/freescore.js"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1"></meta>

		<script>

			var sound    = {
				send      : new Howl({ urls: [ "../../../sounds/upload.mp3",   "../../../sounds/upload.ogg"   ]}),
				confirmed : new Howl({ urls: [ "../../../sounds/received.mp3", "../../../sounds/received.ogg" ]}),
				error     : new Howl({ urls: [ "../../../sounds/quack.mp3",    "../../../sounds/quack.ogg"    ]}),
				next      : new Howl({ urls: [ "../../../sounds/next.mp3",     "../../../sounds/next.ogg"   ]}),
				prev      : new Howl({ urls: [ "../../../sounds/prev.mp3",     "../../../sounds/prev.ogg"   ]}),
			};

			var athletes = {};
			$( function() {
				athletes = { textarea : document.getElementById( 'athletes' ) };
				athletes.editor = CodeMirror.fromTextArea( athletes.textarea, { lineNumbers: true, mode : 'freescore' });
				athletes.editor.setSize( '100%', '480' );
				$( '.CodeMirror' ).css({ 'border-radius': '6px' });
				athletes.list = function() { return this.editor.getDoc().getValue() };
				athletes.doc  = athletes.editor.getDoc();
			});
		</script>
		<style>
.btn-no-border {
	border: 0px; 
	background: transparent; 
	-webkit-appearance: none; 
	-webkit-box-shadow: none; 
	outline: none;
}
		</style>
	</head>
	<body>
		<p>&nbsp;</p>
		<div class="container">
			<div class="panel panel-primary">
				<div class="panel-heading">
					<button id="division-description" type="button" class="btn btn-primary btn-no-border pull-left"><span class="glyphicon glyphicon-pencil"></span></button>
					<h4 class="panel-title pull-left" id="panel-title" style="margin-top: 4px; margin-left: 8px;">
						Division <?= strtoupper( $id ) ?> <?= $setting[ 'description' ] ?>
					</h4>
					<button id="division-judges" class="btn btn-primary btn-no-border btn-sm pull-right"><span class="glyphicon glyphicon-user"></span>&nbsp;<span id="judges"><?= $setting[ 'judges' ] ?></span> Judges</button>
					<button id="division-mode" class="btn btn-primary btn-no-border btn-sm pull-right"><span id="mode-icon" class="<?= $modeicon ?>"></span>&nbsp;<span id="mode"><?= $mode ?></span></button>
					<div class="clearfix"></div>
				</div>
				<div class="panel-body">
					<textarea id="athletes" class="panel-body"><?= $list?></textarea>
				</div>
				<div class="panel-footer panel-primary clearfix">
					<div id="user-message" class="text-muted pull-left" style="margin-top: 8px;">Please edit the list of athletes for this division</div>
					<button id="save-division" type="button" class="btn btn-success pull-right">Save Changes</button>
					<button type="button" id="randomize-button" class="btn btn-primary pull-right" style="margin-right: 30px;">Randomize Order</button>
				</div>
			</div>


		</div>
		<script>
			var division = {
				name : '<?= $id ?>',
				header : {
<?php
foreach ($setting as $key => $value) {
	echo "					$key: '$value',\n";
}
?>
				},
				athletes: [ <?php echo join( ", ", array_map( function( $n ) { return "'$n'"; }, $athletes ));  ?> ]
			};
			division.header.judges = defined( division.header.judges ) ? division.header.judges : 3;
			$( '#judges' ).html( division.header.judges );

			var describe = function( division ) { return 'Division ' + division.name.toUpperCase() + ' ' + division.header.description; }
			$( 'title' ).html( describe( division ));

			$( '#division-description' ).click( function( ev ) {
				bootbox.prompt({
					title : 'Division Description',
					callback: function( results ) {
						if( ! results ) { return; }
						division.header.description = results;
						$( '#panel-title' ).html( describe( division ) );
					}
				});
				$( 'input.bootbox-input' ).attr({ placeholder: '<?= $setting[ 'description' ] ?>' });
			});

			$( '#division-judges' ).off( 'click' ).click( function( ev ) {
				var judges = division.judges;
				bootbox.prompt({
					title: "Number of Judges for this Division ",
					inputType: 'select',
					inputOptions: [
						{ text: '3 judges', value: '3', },
						{ text: '5 judges', value: '5', },
						{ text: '7 judges', value: '7', },
					],
					callback: function ( results ) {
						if( ! results ) { return; }
						division.header.judges = results; 
						$( '#judges' ).html( division.header.judges );
					}
				});
				$( 'option' ).prop( 'selected', false );
				$( 'option[value=' + division.header.judges + ']' ).prop( 'selected', true );
			});

			$( '#division-mode' ).off( 'click' ).click( function( ev ) {
				if( division.header.mode == 'single-elimination' ) {
					delete division.header.mode;
					$( '#mode' ).html( 'Numeric Score' );
					$( '#mode-icon' ).removeClass( 'fa-thumbs-up' );
					$( '#mode-icon' ).addClass( 'fa-list-ol' );
				} else {
					division.header.mode = 'single-elimination';
					$( '#mode' ).html( 'Single Elimination' );
					$( '#mode-icon' ).removeClass( 'fa-list-ol' );
					$( '#mode-icon' ).addClass( 'fa-thumbs-up' );
				}
			});

			$( '#randomize-button' ).off( 'click' ).click( function() {
				var list = athletes.doc.getValue().split( '\n' );
				for( var i = list.length - 1; i >= 0; i-- ) {
					var j    = Math.floor( Math.random() * (i + 1));
					var swap = list[ i ];
					list[ i ] = list[ j ];
					list[ j ] = swap;
				}
				var text = list.join( '\n' );
				athletes.doc.setValue( text );
			});

			$( '#save-division' ).off( 'click' ).click( function( ev ) {
				var tournament = <?= $tournament ?>;
				var host       = '<?= $config->data['host'] ?>';
				$( '#user-message' ).html( "Saving " + describe( division ) );
				division.athletes = athletes.list().split( /\n/ ).reduce(( acc, cur ) => { if( cur ) { acc.push( cur ); }; return acc; }, [] );
				
				function save( division ) {
					$.ajax({
						type: 'POST',
						url: 'http://' + host + ':3080/' + tournament.db + '/<?= $ring ?>/' + division.name,
						data: JSON.stringify( division ),
						success: function( response ) {
							if( response.status == 'saved' ) {
								sound.send.play();
								$( '#user-message' ).html( describe( division ) + ' has been saved.' );
								setTimeout( () => { window.close(); }, 5000 );
							} else if( response.status == 'exists' ) {
								bootbox.dialog({
									title : "Division " + division.name.toUpperCase() + " already exists!",
									message: "Do you want to overwrite the existing division " + division.name.toUpperCase() + "?",
									buttons: {
										cancel : {
											label: 'Cancel',
											className: 'btn-danger',
											callback: () => { sound.prev.play(); }
										},
										confirm : {
											label: 'Overwrite',
											className: 'btn-primary',
											callback: () => {
												sound.next.play();
												division.overwrite = true;
												save( division );
											}
										},
										rename : {
											label: 'Save As...',
											className: 'btn-success',
											callback: () => {
												sound.next.play();
												bootbox.prompt({
													title: 'Save Division As...',
													value: division.name.toUpperCase(),
													callback: ( name ) => {
														if( name === null ) { sound.prev.play(); return; }
														sound.next.play();
														division.name = name.toLowerCase();
														save( division );
													}
												});
											}
										},
									},
									closeButton : false,
								});
							}
						},
						error: function( response ) {
							if( defined( response.statusText ) ) { response.error = 'ERROR Unable to connect to FreeScore server.'; }
							$( '#user-message' ).html( response.error );
						},
					});
				}

				save( division );
			});

		</script>
	</body>
</html>
