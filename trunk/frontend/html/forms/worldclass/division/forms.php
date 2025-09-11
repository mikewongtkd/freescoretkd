<?php
function formsList( $round, $id ) {
	$list = <<<EOD
<select class="selectpicker $round" id="$round$id" data-round="$round" data-form="$id">
	<option>None</option>
	<option>Open</option>
	<option>Taegeuk 1</option>
	<option>Taegeuk 2</option>
	<option>Taegeuk 3</option>
	<option>Taegeuk 4</option>
	<option>Taegeuk 5</option>
	<option>Taegeuk 6</option>
	<option>Taegeuk 7</option>
	<option>Taegeuk 8</option>
	<option>Koryo</option>
	<option>Keumgang</option>
	<option>Taeback</option>
	<option>Pyongwon</option>
	<option>Shipjin</option>
	<option>Jitae</option>
	<option>Chonkwon</option>
	<option>Hansu</option>
</select>
EOD;
	echo $list;
}
?>
<div class="panel panel-danger">
	<div class="panel-heading">
		<div class="panel-title" data-toggle="collapse" class="collapsed" href="#form-selection" id="form-selection-title"><span class="title">Forms</span></div>
	</div>
	<div class="division-setting collapse" id="form-selection">
    <div class="forms-selection-method cutoff">
      <table class="table">
        <thead>
          <tr>
            <th colspan=2 class="prelim-header">Preliminary Round</th>
            <th colspan=2 class="semfin-header">Semi-Final Round</th>
            <th colspan=2 class="finals-header">Final Round</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="prelim-form">First form</td><td class="prelim-form">Second form</td>
            <td class="semfin-form">First form</td><td class="semfin-form">Second form</td>
            <td class="finals-form">First form</td><td class="finals-form">Second form</td>
          </tr>
          <tr>
            <td class="prelim-list"><?php formsList( "prelim", 1 ) ?></td><td class="prelim-list"><?php formsList( "prelim", 2 ) ?></td>
            <td class="semfin-list"><?php formsList( "semfin", 1 ) ?></td><td class="semfin-list"><?php formsList( "semfin", 2 ) ?></td>
            <td class="finals-list"><?php formsList( "finals", 1 ) ?></td><td class="finals-list"><?php formsList( "finals", 2 ) ?></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="forms-selection-method se">
      <table class="table">
        <thead>
          <tr>
            <th colspan=2 class="ro8-header">Round of 8</th>
            <th colspan=2 class="ro4-header">Round of 4</th>
            <th colspan=2 class="ro2-header">Round of 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="prelim-form">First form</td><td class="prelim-form">Second form</td>
            <td class="semfin-form">First form</td><td class="semfin-form">Second form</td>
            <td class="finals-form">First form</td><td class="finals-form">Second form</td>
          </tr>
          <tr>
            <td class="ro8-list"><?php formsList( "ro8", 1 ) ?></td><td class="ro8-list"><?php formsList( "ro8", 2 ) ?></td>
            <td class="ro4-list"><?php formsList( "ro4", 1 ) ?></td><td class="ro4-list"><?php formsList( "ro4", 2 ) ?></td>
            <td class="ro2-list"><?php formsList( "ro2", 1 ) ?></td><td class="ro2-list"><?php formsList( "ro2", 2 ) ?></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="forms-selection-method sbs">
      <div class="form-group">
        <label>Select a Draw Pool</label>
        <select class="form-control" name="age-group">
          <option value="">Select One...</option>
          <option disabled><hr></hr></option>
          <optgroup label="Color Belt Poomsae Pool">
            <option value="yellow">Yellow Belt (all ages)</option>
            <option value="green">Green Belt (all ages)</option>
            <option value="blue">Blue Belt (all ages)</option>
            <option value="red">Red Belt (all ages)</option>
          </optgroup>
          <option disabled><hr></hr></option>
          <optgroup label="Black Belt Poomsae Pool">
            <option value="dragon">Dragon (6-7)</option>
            <option value="tiger">Tiger (8-9)</option>
            <option value="youth">Youth (10-11)</option>
            <option value="cadet">Cadet (12-14)</option>
            <option value="junior">Junior (15-17)</option>
            <option value="u30">U30 (18-30)</option>
            <option value="u40">U40 (31-40)</option>
            <option value="u50">U50 (41-50)</option>
            <option value="u60">U60 (51-60)</option>
            <option value="u65">U65 (61-65)</option>
            <option value="o65">O65 (66+)</option>
          </optgroup>
          <option disabled><hr></hr></option>
          <optgroup label="Custom Pool">
            <option value="custom">Custom</option>
          </optgroup>
        </select>
      </div>
      <div class="form-group">
        <p><label>Customize the Draw Pool</label></p>
        <div class="btn-group">
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00001" data-poomsae="Taegeuk 1">T1</button>
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00002" data-poomsae="Taegeuk 2">T2</button>
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00004" data-poomsae="Taegeuk 3">T3</button>
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00008" data-poomsae="Taegeuk 4">T4</button>
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00016" data-poomsae="Taegeuk 5">T5</button>
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00032" data-poomsae="Taegeuk 6">T6</button>
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00064" data-poomsae="Taegeuk 7">T7</button>
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00128" data-poomsae="Taegeuk 8">T8</button>
        </div>
        <div class="btn-group">
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00256" data-poomsae="Koryo">KR</button>
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="00512" data-poomsae="Keumgang">KG</button>
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="01024" data-poomsae="Taeback">TB</button>
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="02048" data-poomsae="Pyongwon">PW</button>
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="04096" data-poomsae="Shipjin">SJ</button>
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="08192" data-poomsae="Jitae">JT</button>
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="16384" data-poomsae="Chonkwon">CK</button>
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="32768" data-poomsae="Hansu">HS</button>
          <button type="button" class="btn btn-default btn-poomsae" data-encoding="wt25" data-value="65536" data-poomsae="Ilyeo" disabled>IY</button>
        </div>
      </div>
    </div>
	</div>
</div>
<script>
	// ============================================================
	// FORM SELECTION BEHAVIOR
	// ============================================================
	var selected = { 
		description: '', 
		manual: { prelim: false, semfin: false, finals: false }, 
		update : () => {
      $( '.forms-selection-method' ).hide();
      if( division.method == 'cutoff' ) {
        $( '.forms-selection-method.cutoff' ).show();
        selected.forms = { prelim : [], semfin : [], finals : [] };
				let forms = [ 'Open', 'Taegeuk 1', 'Taegeuk 2', 'Taegeuk 3', 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taeback', 'Pyongwon', 'Shipjin', 'Jitae', 'Chonkwon', 'Hansu' ];
				let all   = [].concat( selected.forms.prelim, selected.forms.semfin, selected.forms.finals );

				// ===== IF THE DRAWS ARE DEFINED, USE THE DRAWS
				if( defined( draws )) {
					draws.select( description, division, selected.forms );
				} 

				// ===== IF ANY FORM IS ALLOWED, SHOW ALL FORMS
				if( $( '#allow-any-form' ).bootstrapSwitch( 'state' )) {
					$.each( forms,   function( i, form ) { $( 'option:contains("' + form + '")' ).show(); });

				// ===== OTHERWISE, APPLY RULES
				} else {
					var allowed = FreeScore.rulesUSAT.recognizedPoomsae( description.category, description.years, description.rank );
					forms   .forEach(( form ) => { $( `option:contains("${form}")` ).hide(); });
					allowed .forEach(( form ) => { $( `option:contains("${form}")` ).show(); });
					all     .forEach(( form ) => { $( `option:contains("${form}")` ).hide(); });
				}
				$('.selectpicker').selectpicker( 'refresh' );

				// ===== CREATE FORM SELECTION DESCRIPTION FROM SELECTIONS
				selected.description = '';

				FreeScore.round.order.forEach(( round ) => {
					if( division.athletes.length <  20 && round == 'prelim' && ! division.flight ) { return; }
					if( division.athletes.length <= 8  && ! round.match( /^fin/ )) { return; }
					if( ! round in selected.forms ) { return; }
					if( ! defined( selected.forms[ round ])) { return; }
					if( selected.forms[ round ].length == 0 ) { return; }
					if( division.flight && round != 'prelim' ) { return; }
					var rname = FreeScore.round.name[ round ];
					selected.description += `<span class="meta">${rname} Round</span><span class="forms">${selected.forms[ round ].join( ', ' )}</span>`;
				});

				validate.input();

				$( "#form-selection-title" ).html( "<span class=\"title\">Forms</span><span class=\"setting\">" + selected.description + "</span>" );

				division.forms = selected.forms;

      } else if( division.method == 'se' ) {
      } else if( division.method == 'sbs' ) {
      }
		}
	};

	// ============================================================
	// FORM SELECTION INITIALIZATION
	// ============================================================
	init.cutoff = division => {
		let forms  = division.forms();
		let n      = division.athletes().length;
		let flight = division.is.flight();
		let method = division.current.method();

		for( round in forms ) {
			selected.forms[ round ] = [];
			forms[ round ].forEach(( form, i ) => {
				selected.forms[ round ].push( form );
				$( `#${round}${i+1}` ).selectpicker( 'val',  form );
			});
		}
		if( flight ) {
			[ 'semfin', 'finals' ].forEach( round => { 
				delete selected.forms[ round ]; 
			});

		} else {
			if( n <  20 ) { delete selected.forms.prelim; }
			if( n <=  8 ) { delete selected.forms.semfin; }
			
		}
	};
	init.se = division => {
		$( 'a[href="#se"]' ).click();
	};
	init.sbs = division => {
		$( 'a[href="#sbs"]' ).click();
	};

	init.forms = division => {
		let method = division.current.method();
		init?.[ method ]?.();
	};

	// ============================================================
	// FORM SELECTION
	// ============================================================
	var getForms = function( i, obj ) { var form = $( obj ).text(); if( form == 'None' ) { return; } else { return form; } };
	$( '.selectpicker' ).on( 'changed.bs.select', function( ev, i, manual, previous ) {
		var target = $( this );
		var form   = target.val();
		var round  = target.attr( 'data-round' );
		selected.forms[ round ] = $( `.${round} .filter-option` ).map( getForms ).toArray();
		selected.manual[ round ] = manual;
		selected.method = clicked.html().toLowerCase();
		selected.update();
	});

	validate.selection = function() {
		var rounds  = [];
		var roundOK = ( round ) => { return ((round in selected.forms) && (selected.forms[ round ].length > 0)); };
		var n       = division.athletes.length;
		var flight  = defined( division.flight ) && division.flight;
		if( n >= 20 || flight   ) { rounds.push( 'prelim' ); settings.round.select.prelim(); }
		if( n >   8 && ! flight ) { rounds.push( 'semfin' ); settings.round.select.semfin(); }
		if( ! flight            ) { rounds.push( 'finals' ); settings.round.select.finals(); }

		return rounds.map( roundOK ).reduce(( acc, cur ) => { return acc && cur; }, true ); // All rounds have at least one form
	};

	// ===== FORM SELECTOR MODIFICATION BY DESCRIPTION
</script>

