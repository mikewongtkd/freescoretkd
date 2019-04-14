<?php
function formsList( $round, $id ) {
	$list = <<<EOD
<select class="selectpicker $round" id="$round$id">
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
	<option>Taebaek</option>
	<option>Pyongwon</option>
	<option>Sipjin</option>
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
		<div class="form-selection-content">
			<ul class="nav nav-pills nav-stacked">
				<li><a href="#cutoff"      data-toggle="tab">Cutoff</a></li>
				<li class="disabled"><a href="#combination" data-toggle="tab">Combination</a></li>
				<li class="disabled"><a href="#teamtrials"  data-toggle="tab">Team Trials</a></li>
			</ul>
			<div class="tab-content">
				<div class="tab-pane" id="cutoff">
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
				<div class="tab-pane" id="combination">
				</div>
				<div class="tab-pane" id="teamtrials">
				</div>
			</div>
		</div>
	</div>
</div>
<script>
	// ============================================================
	// FORM SELECTION BEHAVIOR
	// ============================================================
	var selected = { method: 'cutoff', forms : { prelim : [], semfin : [], finals : [] }, description: '', update : function() { 
		var forms = [ 'Open', 'Taegeuk 1', 'Taegeuk 2', 'Taegeuk 3', 'Taegeuk 4', 'Taegeuk 5', 'Taegeuk 6', 'Taegeuk 7', 'Taegeuk 8', 'Koryo', 'Keumgang', 'Taebaek', 'Pyongwon', 'Sipjin', 'Jitae', 'Chonkwon', 'Hansu' ];
		var all   = [].concat( selected.forms.prelim, selected.forms.semfin, selected.forms.finals );

		// ===== IF THE DRAWS ARE DEFINED, USE THE DRAWS
		if( defined( draws )) {
			draws.select( description, division, selected.forms );

		// ===== IF ANY FORM IS ALLOWED, SHOW ALL FORMS
		} else if( $( '#allow-any-form' ).bootstrapSwitch( 'state' )) {
			$.each( forms,   function( i, form ) { $( 'option:contains("' + form + '")' ).show(); });

		// ===== OTHERWISE, APPLY RULES
		} else {
			var allowed = FreeScore.rulesUSAT.recognizedPoomsae( description.category, description.years, description.rank );
			$.each( forms,   function( i, form ) { $( 'option:contains("' + form + '")' ).hide(); });
			$.each( allowed, function( i, form ) { $( 'option:contains("' + form + '")' ).show(); });
			$.each( all,     function( i, form ) { $( 'option:contains("' + form + '")' ).hide(); });
		}
		$('.selectpicker').selectpicker( 'refresh' );

		// ===== CREATE FORM SELECTION DESCRIPTION FROM SELECTIONS
		selected.description =
			('prelim' in selected.forms ? '<span class="meta">Preliminary Round</span><span class="forms">' + selected.forms.prelim.join( ', ' ) + '</span>' : '') +
			('semfin' in selected.forms ? '<span class="meta">Semi-Final Round</span><span class="forms">'  + selected.forms.semfin.join( ', ' ) + '</span>' : '') +
			('finals' in selected.forms ? '<span class="meta">Final Round</span><span class="forms">'       + selected.forms.finals.join( ', ' ) + '</span>' : '');

		validate.input();

		$( "#form-selection-title" ).html( "<span class=\"title\">Forms</span><span class=\"setting\">" + selected.description + "</span>" );

		division.forms = selected.forms;
	}};

	// ============================================================
	// FORM SELECTION INITIALIZATION
	// ============================================================
	init.forms = ( division ) => {
		var forms  = division.forms();
		var n      = division.athletes().length;
		var flight = division.is.flight();

		$( 'a[href="#cutoff"]' ).click();
		for( round in forms ) {
			selected.forms[ round ] = [];
			for( var i = 0; i < forms[ round ].length; i++ ) {
				var form = forms[ round ][ i ];
				selected.forms[ round ].push( form );
				$( "#" + round + (i+1) ).selectpicker( 'val',  form );
			}
		}

		if( n <  20 && ! flight ) { delete selected.forms.prelim; }
		if( n <=  8 && ! flight ) { delete selected.forms.semfin; }
	};

	// ============================================================
	// FORM SELECTION
	// ============================================================
	$( 'a[data-toggle=tab]' ).click( function( ev ) {
		var clicked = $( ev.target );
		selected.method = clicked.html().toLowerCase();
		selected.update();
	});

	var getForms = function( obj ) { var form = $( obj ).html(); if( form == 'None' ) { return; } else { return form; } };
	$( '.selectpicker' ).on( 'changed.bs.select', function( ev, i, current, previous ) {
		var form  = $( ev.target[ i ] ).val();
		var round = $( ev.target[ i ] ).parent( '.selectpicker' );
		if      ( round.hasClass( 'prelim' )) { selected.forms.prelim = $.map( $( '.prelim .filter-option' ), getForms ); }
		else if ( round.hasClass( 'semfin' )) { selected.forms.semfin = $.map( $( '.semfin .filter-option' ), getForms ); }
		else if ( round.hasClass( 'finals' )) { selected.forms.finals = $.map( $( '.finals .filter-option' ), getForms ); }
		selected.update();
	});

	validate.selection = function() {
		var rounds  = [];
		var roundOK = ( round ) => { return ((round in selected.forms) && (selected.forms[ round ].length > 0)); };
		var n       = division.athletes.length;
		var flight  = defined( division.flight );
		if( n >= 20 || flight ) { rounds.unshift( 'prelim' ); }
		if( n >   8           ) { rounds.unshift( 'semfin' ); }
		rounds.push( 'finals' );

		return rounds.map( roundOK ).reduce( ( acc, cur ) => { return acc && cur; }); // All rounds have at least one form
	};

	// ===== FORM SELECTOR MODIFICATION BY DESCRIPTION
</script>

