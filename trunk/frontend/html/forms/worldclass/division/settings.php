<div class="panel panel-primary division-header">
	<div class="panel-heading">
		<div class="panel-title" data-toggle="collapse" class="collapsed" href="#settings" id="settings-title"><span class="title">Settings</span></div>
	</div>
	<div class="division-setting collapse" id="settings">
		<div class="settings-content row">
			<div class="col-md-2">
				<label for="division-name">Division File Name</label><br>
				<input type="text" id="division-name" class="form-control">
			</div>
			<div class="col-md-2">
				<label for="number-of-judges">Judges in Ring</label><br>
				<div class="btn-group" data-toggle="buttons" id="number-of-judges">
					<label class="btn btn-default"><input type="radio" name="judges" value="3">3</label>
					<label class="btn btn-default"><input type="radio" name="judges" value="5">5</label>
					<label class="btn btn-default"><input type="radio" name="judges" value="7">7</label>
				</div>
			</div>
			<div class="col-md-4">
				<label for="method">Competition Method</label><br>
				<div class="btn-group" data-toggle="buttons" id="method">
					<label class="btn btn-default"><input type="radio" name="method">Cutoff</label>
					<label class="btn btn-default"><input type="radio" name="method">Single Elimination</label>
					<label class="btn btn-default"><input type="radio" name="method">Side-by-Side</label>
				</div>
			</div>
			<div class="col-md-4">
				<label for="start-round">First round</label><br>
				<div class="btn-group" data-toggle="buttons" id="start-round">
					<label class="btn btn-default active"><input type="radio" name="round" value="auto"   checked>Autodetect</label>
					<label class="btn btn-default"       ><input type="radio" name="round" value="prelim"        >Preliminary</label>
					<label class="btn btn-default       "><input type="radio" name="round" value="semfin"        >Semi-Finals</label>
					<label class="btn btn-default"       ><input type="radio" name="round" value="finals"        >Finals</label>
				</div>
			</div>
		</div>
		<input type="hidden" id="flight"></input>
	</div>
</div>

<script>
	$( "input[type=checkbox]" ).bootstrapSwitch({ size : 'small' });

	// ============================================================
	// SETTINGS BEHAVIOR
	// ============================================================
	$( '.prelim-header, .prelim-form, .prelim-list' ).hide();
	$( '.semfin-header, .semfin-form, .semfin-list' ).hide();

	settings = { round : { select : {
		autodetect : function() {
			var n      = division.athletes.length;
			var flight = (defined( division.flight ) && division.flight) || $( '#flight' ).val().length > 0;

			if( flight ) { settings.round.select.flight(); } else
			if( n <= 8 ) { settings.round.select.finals(); } else 
			if( n < 20 ) { settings.round.select.semfin(); } else 
			             { settings.round.select.prelim(); }
		},
		flight : () => {
			$( '.prelim-header, .prelim-form, .prelim-list' ).show();
			$( '.semfin-header, .semfin-form, .semfin-list' ).hide();
			$( '.finals-header, .finals-form, .finals-list' ).hide();
			$( '.ro8-header, .ro8-form, .ro8-list' ).hide();
			$( '.r04-header, .ro4-form, .ro4-list' ).hide();
			$( '.r02-header, .r02-form, .r02-list' ).hide();
			division.round = 'prelim';
		},
		prelim : () => {
			$( '.prelim-header, .prelim-form, .prelim-list' ).show();
			$( '.semfin-header, .semfin-form, .semfin-list' ).show();
			$( '.finals-header, .finals-form, .finals-list' ).show();
			$( '.ro8-header, .ro8-form, .ro8-list' ).hide();
			$( '.r04-header, .ro4-form, .ro4-list' ).hide();
			$( '.r02-header, .r02-form, .r02-list' ).hide();
			division.round = 'prelim';
		},
		semfin : () => {
			$( '.prelim-header, .prelim-form, .prelim-list' ).hide();
			$( '.semfin-header, .semfin-form, .semfin-list' ).show();
			$( '.finals-header, .finals-form, .finals-list' ).show();
			$( '.ro8-header, .ro8-form, .ro8-list' ).hide();
			$( '.r04-header, .ro4-form, .ro4-list' ).hide();
			$( '.r02-header, .r02-form, .r02-list' ).hide();
			division.round = 'semfin';
		},
		finals : () => {
			$( '.prelim-header, .prelim-form, .prelim-list' ).hide();
			$( '.semfin-header, .semfin-form, .semfin-list' ).hide();
			$( '.finals-header, .finals-form, .finals-list' ).show();
			$( '.ro8-header, .ro8-form, .ro8-list' ).hide();
			$( '.r04-header, .ro4-form, .ro4-list' ).hide();
			$( '.r02-header, .r02-form, .r02-list' ).hide();
			division.round = 'finals';
		},
		ro8 : () => {
			$( '.prelim-header, .prelim-form, .prelim-list' ).hide();
			$( '.semfin-header, .semfin-form, .semfin-list' ).hide();
			$( '.finals-header, .finals-form, .finals-list' ).hide();
			$( '.ro8-header, .ro8-form, .ro8-list' ).show();
			$( '.r04-header, .ro4-form, .ro4-list' ).show();
			$( '.r02-header, .r02-form, .r02-list' ).show();
			division.round = 'ro8';
		},
		ro4 : () => {
			$( '.prelim-header, .prelim-form, .prelim-list' ).hide();
			$( '.semfin-header, .semfin-form, .semfin-list' ).hide();
			$( '.finals-header, .finals-form, .finals-list' ).hide();
			$( '.ro8-header, .ro8-form, .ro8-list' ).hide();
			$( '.r04-header, .ro4-form, .ro4-list' ).show();
			$( '.r02-header, .r02-form, .r02-list' ).show();
			division.round = 'ro4';
		},
		ro2 : () => {
			$( '.prelim-header, .prelim-form, .prelim-list' ).hide();
			$( '.semfin-header, .semfin-form, .semfin-list' ).hide();
			$( '.finals-header, .finals-form, .finals-list' ).hide();
			$( '.ro8-header, .ro8-form, .ro8-list' ).hide();
			$( '.r04-header, .ro4-form, .ro4-list' ).hide();
			$( '.r02-header, .r02-form, .r02-list' ).show();
			division.round = 'ro2';
		},
	}},
		update: judges => {
			var divname = $( '#division-name' ).val() ? $( '#division-name' ).val() : $( '#division-name' ).attr( 'placeholder' );
			divname  = defined( divname ) ? divname : '';
			divname  = divname.toUpperCase();
			judges   = defined( judges ) ? judges : $( '#number-of-judges' ).find( 'label.active' ).text() + ' Judges';
			var list = [];
			if( divname ) { list.push( divname ); }
			list.push( judges );
			$( '#settings-title' ).html( '<span class="title">Settings</span><span class="setting">' + list.join( ', ' ) + '</span>' );
	}};

	// ============================================================
	// AUTODETECT ROUND SETTINGS
	// ============================================================
	$( settings.round.select.autodetect );

	$( '#division-name' ).change( function() { description.update(); settings.update(); } );

	// ============================================================
	// SETTINGS INITIALIZATION
	// ============================================================
	init.settings = ( division ) => {
		// Set number of judges
		$.each( $( 'input[name=judges]' ), ( i, j ) => {
			var judges = $( j );
			var button = judges.parent();
			var k      = division.judges();
			var n      = $.cookie( 'judges', judges );

			if( judges.val() == n && k != n ) {
				alertify.confirm(
					'Set division for ' + n + ' judges?',
					'This division is configured for ' + k + ' judges; the default is ' + n + '. Configure this ring for ' + n + ' judges?',
					() => { 
						division.judges( n );
						button.click(); 
						var request  = { data : { type : 'division', action : 'write', overwrite: true, division : division.data() }};
						request.json = JSON.stringify( request.data );
						ws.send( request.json );
						sound.send.play();
					},
					() => {}
				);
			} else if( judges.val() == k ) { button.click(); }
		});

		// Set division name
		$( '#division-name' ).val( division.name() );
		description.update();
		settings.update();

		// Set flight information
		$( '#flight' ).val( JSON.stringify( division.flight()));

		// Set the starting round
		var flight   = division.is.flight();
		var athletes = division.athletes();
		var n        = athletes.length;
		var shouldbe = { prelim: (flight || (n >= 20)), semfin: n > 8 && n < 20 && ! flight, finals: n <= 8 };
		var round    = { is: division.round.is };
		$( '#start-round label' ).removeClass( 'active' );
		$( '#start-round input' ).removeAttr( 'checked' );
		if( round.is.prelim() && ! shouldbe.prelim ) { round.button = $( '#start-round input[value="prelim"]' ); } else
		if( round.is.semfin() && ! shouldbe.semfin ) { round.button = $( '#start-round input[value="semfin"]' ); } else
		if( round.is.finals() && ! shouldbe.finals ) { round.button = $( '#start-round input[value="finals"]' ); } else
		                                             { round.button = $( '#start-round input[value="auto"]'   ); }
		round.label = round.button.parent();
		round.button.attr({ checked: 'checked' });
		round.label.addClass( 'active' );
	};

	// ============================================================
	// FIRST ROUND DETECTION
	// ============================================================
	$( 'input[name=round]' ).parent().click( function( ev ) {
		var clicked   = $( ev.target );
		var selected  = clicked.find( 'input' ).val();

		// ===== HIDE FORM SELECTORS FOR UNNEEDED ROUNDS
		if ( selected == 'auto'   ) { settings.round.select.autodetect(); } else
		if ( selected == 'prelim' ) { settings.round.select.prelim();     } else
		if ( selected == 'semfin' ) { settings.round.select.semfin();     } else
		if ( selected == 'finals' ) { settings.round.select.finals();     }
	});

	// ============================================================
	// JUDGES
	// ============================================================
	$( 'input[name=judges]' ).parent().click( function( ev ) {
		var clicked = $( ev.target );
		var judges  = parseInt( clicked.find( 'input' ).val() );
		if( division.judges != judges ) {
			alertify.confirm( 
				'Shall ' + judges + ' be the default number of judges?',
				'<b>OK:</b> The editor will default to ' + judges + ' judges today.<br><b>Cancel:</b> The editor will default to <?= $default_n ?> judges.',
				() => { $.cookie( 'judges', judges ); },
				() => {},
			);
		}
		division.judges = judges
		settings.update( judges + ' Judges' );
	});

</script>
