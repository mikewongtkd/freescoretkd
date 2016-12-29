<div class="panel panel-primary division-header">
	<div class="panel-heading">
		<div class="panel-title" data-toggle="collapse" class="collapsed" href="#settings" id="settings-title"><span class="title">Settings</span></div>
	</div>
	<div class="division-setting collapse" id="settings">
		<div class="settings-content row">
			<div class="col-md-6">
				<label for="division-name">Division File Name</label><br>
				<input type="text" id="division-name" class="form-control">
			</div>
			<div class="col-md-6">
				<label for="number-of-judges">Judges in Ring</label><br>
				<div class="btn-group" data-toggle="buttons" id="number-of-judges">
					<label class="btn btn-default"       ><input type="radio" name="judges" value="3"        >3 Judges</label>
					<label class="btn btn-default active"><input type="radio" name="judges" value="5" checked>5 Judges</label>
					<label class="btn btn-default"       ><input type="radio" name="judges" value="7"        >7 Judges</label>
				</div>
			</div>
		</div>
	</div>
</div>

<script>
	$( "input[type=checkbox]" ).bootstrapSwitch({ size : 'small' });

	// ============================================================
	// SETTINGS BEHAVIOR
	// ============================================================

	settings = { 
		update: function( judges ) {
			var divname = $( '#division-name' ).val() ? $( '#division-name' ).val() : $( '#division-name' ).attr( 'placeholder' );
			divname  = defined( divname ) ? divname : '';
			divname  = divname.toUpperCase();
			judges   = defined( judges ) ? judges : $( '#number-of-judges' ).find( 'label.active' ).text();
			var list = [];
			if( divname ) { list.push( divname ); }
			list.push( judges );
			$( '#settings-title' ).html( '<span class="title">Settings</span><span class="setting">' + list.join( ', ' ) + '</span>' );
	}};

	// ============================================================
	// AUTODETECT ROUND SETTINGS
	// ============================================================
	$( '#division-name' ).change( function() { description.update(); settings.update(); } );

	// ============================================================
	// SETTINGS INITIALIZATION
	// ============================================================
	init.settings = ( division ) => {
		// Set number of judges
		$.each( $( 'input[name=judges]' ), ( i, j ) => {
			var judges = $( j );
			var button = judges.parent();
			if( judges.val() == division.judges ) { button.click(); }
		});

		// Set division name
		$( '#division-name' ).val( division.name );
		description.update();
		settings.update();
	};

	// ============================================================
	// FIRST ROUND DETECTION
	// ============================================================
	$( 'input[name=round]' ).parent().click( function( ev ) {
		var clicked   = $( ev.target );
		var selected  = clicked.find( 'input' ).val();
	});

	// ============================================================
	// JUDGES
	// ============================================================
	$( 'input[name=judges]' ).parent().click( function( ev ) {
		var clicked = $( ev.target );
		var judges = parseInt( clicked.find( 'input' ).val() );
		division.judges = judges
		settings.update( judges + ' Judges' );
	});

</script>
