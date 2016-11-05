<?php
	include( "../../../include/php/config.php" );
	$file       = '/usr/local/freescore/data/' . $_GET[ 'file' ];
	$url        = preg_split( '/\//', $_GET[ 'file' ] );
	$db         = array_shift( $url );
	$grassroots = array_shift( $url );
	$ring_name  = array_shift( $url );
	$file_name  = array_shift( $url );
	$ring       = intval( preg_replace( '/ring/', '', $ring_name ));
	$lines      = file( $file );
	$header     = preg_grep( "/^#/", $lines );
	$lines      = preg_grep( "/^\s*$/", $lines, true );  # Ignore empty lines
	$id         = $_GET[ 'file' ]; $id = preg_replace( '/\w*\/forms-grassroots\/ring\d+\/div\./', '', $id ); $id = preg_replace( '/\.txt/', '', $id );
	$setting    = [];
	foreach( $header as $line ) {
		$line = rtrim( $line );
		$line = preg_replace( '/^#\s*/', '', $line );
		$keyvalue = preg_split( "/=/", $line, 2 );
		$setting[ $keyvalue[0] ] = $keyvalue[1];
	}
	$header   = join( "", $header );
	$athletes = array_filter( array_map( function( $n ) { $n = preg_replace( '/\t.*/', '', $n ); $n = preg_replace( '/\n/', '', $n ); return $n; }, preg_grep( "/^#/", $lines, true ))); 
	$list     = join( "\n", $athletes );
?>
<html>
	<head>
		<title>Grassroots Division</title>
		<link href="../../../include/jquery/css/smoothness/jquery-ui.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="../../../include/bootstrap/css/bootstrap-theme.min.css" rel="stylesheet" />
		<link href="../../../include/opt/codemirror/lib/codemirror.css" rel="stylesheet" />
		<script src="../../../include/jquery/js/jquery.js"></script>
		<script src="../../../include/jquery/js/jquery-ui.min.js"></script>
		<script src="../../../include/bootstrap/js/bootstrap.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootbox.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-select.min.js"></script>
		<script src="../../../include/bootstrap/add-ons/bootstrap-switch.min.js"></script>
		<script src="../../../include/opt/codemirror/lib/codemirror.js"></script>
		<script src="../../../include/opt/codemirror/mode/freescore/freescore.js"></script>
		<script src="../../../include/js/freescore.js"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1"></meta>

		<script>
			var athletes = {};
			$( function() {
				athletes = { textarea : document.getElementById( 'athletes' ) };
				athletes.editor = CodeMirror.fromTextArea( athletes.textarea, { lineNumbers: true, mode : 'freescore' });
				athletes.editor.setSize( '100%', '480' );
				$( '.CodeMirror' ).css({ 'border-radius': '6px' });
				athletes.list   = function() { return this.editor.getDoc().getValue() };

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
					<div class="clearfix"></div>
				</div>
				<div class="panel-body">
					<textarea id="athletes" class="panel-body"><?= $list?></textarea>
				</div>
				<div class="panel-footer panel-primary clearfix">
					<div id="user-message" class="text-muted pull-left" style="margin-top: 8px;">Please edit the list of athletes for this division</div>
					<button id="save-division" type="button" class="btn btn-success pull-right">Save Changes</button>
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
			var describe = function( division ) { return 'Divison ' + division.name.toUpperCase() + ' ' + division.header.description; }
			$( 'title' ).html( describe( division ));

			$( '#division-description' ).click( function( ev ) {
				bootbox.prompt({
					title : 'Division Description',
					callback: function( results ) {
						if( ! results ) { return; }
						division.description = results;
						$( '#panel-title' ).html( describe( division ) );
					}
				});
				$( 'input.bootbox-input' ).attr({ placeholder: '<?= $setting[ 'description' ] ?>' });
			});

			$( '#division-judges' ).click( function( ev ) {
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

			$( '#save-division' ).click( function( ev ) {
				var tournament = <?= $tournament ?>;
				var host       = '<?= $host ?>';
				$( '#user-message' ).html( "Saving " + describe( division ) );
				division.athletes = athletes.list().split( /\n/ ).reduce(( acc, cur ) => { if( cur ) { acc.push( cur ); }; return acc; }, [] );
				
				$.ajax({
					type: 'POST',
					url: 'http://' + host + ':3080/' + tournament.db + '/<?= $ring ?>/' + division.name,
					data: JSON.stringify( division ),
					success: function( response ) {
						$( '#user-message' ).html( describe( division ) + ' has been saved.' );
						setTimeout( () => { window.close(); }, 1000 );
					},
					error: function( response ) {
						$( '#user-message' ).html( response.error );
					},
				});
			});

		</script>
	</body>
</html>
