<div class="panel panel-primary division-header">
	<div class="panel-heading">
		<div class="panel-title" data-toggle="collapse" class="collapsed" href="#settings" id="settings-title">Settings</div>
	</div>
	<div class="division-setting collapse" id="settings">
		<div class="settings-content row">
			<div class="col-md-4">
				<label for="start-round">First round</label><br>
				<div class="btn-group" data-toggle="buttons" id="start-round">
					<label class="btn btn-default active"><input type="radio" name="round" value="auto"   checked>Autodetect</label>
					<label class="btn btn-default"       ><input type="radio" name="round" value="prelim"        >Preliminary</label>
					<label class="btn btn-default       "><input type="radio" name="round" value="semfin"        >Semi-Finals</label>
					<label class="btn btn-default"       ><input type="radio" name="round" value="finals"        >Finals</label>
				</div>
			</div>
			<div class="col-md-3">
				<label for="number-of-judges">Judges in Ring</label><br>
				<div class="btn-group" data-toggle="buttons" id="number-of-judges">
					<label class="btn btn-default"       ><input type="radio" name="judges" value="3"        >3 Judges</label>
					<label class="btn btn-default active"><input type="radio" name="judges" value="5" checked>5 Judges</label>
					<label class="btn btn-default"       ><input type="radio" name="judges" value="7"        >7 Judges</label>
				</div>
			</div>
			<div class="col-md-2">
				<label>Allow any form</label><br>
				<input type="checkbox" id="allow-any-form">
			</div>
			<div class="col-md-3">
				<label for="division-name">Division File Name</label><br>
				<input type="text" id="division-name" class="form-control">
			</div>

		</div>
	</div>
</div>

<script>
	$( "input[type=checkbox]" ).bootstrapSwitch({ size : 'small' });

	// ===== APPLICATION GLOBAL VARIABLES
	var division    = { athletes : [], judges : 5, init : {}, summary : function() { return this.name.toUpperCase() + ' ' + this.description; }};
	var athletes    = {};
	var description = {};

	// ===== HIDE FORM SELECTORS FOR ALL ROUNDS
	$( '.prelim-header, .prelim-form, .prelim-list' ).hide();
	$( '.semfin-header, .semfin-form, .semfin-list' ).hide();

	var first = { round : { select : {
		autodetect : function() {
			var n = ((athletes.doc.getValue().trim()).split( "\n" )).length;

			if( n <= 8 ) { first.round.select.finals(); } else 
			if( n < 20 ) { first.round.select.semfin(); } else 
			             { first.round.select.prelim(); }
		},
		prelim : function() {
			$( '.prelim-header, .prelim-form, .prelim-list' ).show();
			$( '.semfin-header, .semfin-form, .semfin-list' ).show();
			division.round = 'prelim';
		},
		semfin : function() {
			$( '.prelim-header, .prelim-form, .prelim-list' ).hide();
			$( '.semfin-header, .semfin-form, .semfin-list' ).show();
			division.round = 'semfin';
		},
		finals : function() {
			$( '.prelim-header, .prelim-form, .prelim-list' ).hide();
			$( '.semfin-header, .semfin-form, .semfin-list' ).hide();
			division.round = 'finals';
		},
	}}};

	// ===== DO AUTODETECTION
	$( first.round.select.autodetect );

	// ===== BEHAVIOR
	$( '#allow-any-form' ).on( 'switchChange.bootstrapSwitch', function( ev, state ) { selected.update(); });
	$( '#division-name' ).change( function() { description.update(); } );

	// ============================================================
	// FIRST ROUND DETECTION
	// ============================================================
	$( 'input[name=round]' ).parent().click( function( ev ) {
		var clicked   = $( ev.target );
		var selected  = clicked.find( 'input' ).val();

		// ===== HIDE FORM SELECTORS FOR UNNEEDED ROUNDS
		if ( selected == 'auto'   ) { first.round.select.autodetect(); } else
		if ( selected == 'prelim' ) { first.round.select.prelim();     } else
		if ( selected == 'semfin' ) { first.round.select.semfin();     } else
		if ( selected == 'finals' ) { first.round.select.finals();     }
	});

	// ============================================================
	// JUDGES
	// ============================================================
	$( 'input[name=judges]' ).parent().click( function( ev ) {
		var clicked = $( ev.target );
		division.judges = parseInt( clicked.find( 'input' ).val() );
	});

</script>
