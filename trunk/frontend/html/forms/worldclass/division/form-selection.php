<?php
function formsList( $round, $id ) {
	$list = <<<EOD
<select class="selectpicker $round" id="$round$id">
	<option>None</option>
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
<div class="panel panel-primary">
	<div class="panel-heading">
		<div class="panel-title" data-toggle="collapse" class="collapsed" href="#form-selection" id="form-selection-title">Form Selection</div>
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
							<tr><th colspan=2>Preliminary Round</th><th colspan=2>Semi-Final Round</th><th colspan=2>Final Round</th></tr>
						</thead>
						<tbody>
							<tr>
								<td>First form</td><td>Second form</td>
								<td>First form</td><td>Second form</td>
								<td>First form</td><td>Second form</td>
							</tr>
							<tr>
								<td><?php formsList( "prelim", 1 ) ?></td><td><?php formsList( "prelim", 2 ) ?></td>
								<td><?php formsList( "semfin", 1 ) ?></td><td><?php formsList( "semfin", 2 ) ?></td>
								<td><?php formsList( "finals", 1 ) ?></td><td><?php formsList( "finals", 2 ) ?></td>
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
	// ===== FORM SELECTION BEHAVIOR
	var selected = { method: '', forms : { prelim : [], semfin : [], finals : [] }, text: '', description: '', update : function() { 
		selected.text = 
			(selected.forms.prelim.length > 0 ? 'prelim:' + selected.forms.prelim.join( ',' ) + ';' : '') +
			(selected.forms.semfin.length > 0 ? 'semfin:' + selected.forms.semfin.join( ',' ) + ';' : '') +
			(selected.forms.finals.length > 0 ? 'finals:' + selected.forms.finals.join( ',' )       : '');
		selected.description =
			(selected.forms.prelim.length > 0 ? '[Preliminary Round] ' + selected.forms.prelim.join( ', ' ) + '; ' : '') +
			(selected.forms.semfin.length > 0 ? '[Semi-Final Round] '  + selected.forms.semfin.join( ', ' ) + '; ' : '') +
			(selected.forms.finals.length > 0 ? '[Final Round] '       + selected.forms.finals.join( ', ' )        : '');
		selected.text = selected.text.trim();
		selected.text = selected.text.replace( /\s+/, ' ' );
		$( "#form-selection-title" ).html( "Form Selection: <span class=\"setting\">" + selected.description + "</span>" );
		console.log( selected.text );
	}};
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
</script>

