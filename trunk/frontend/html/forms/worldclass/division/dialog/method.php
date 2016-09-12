<div class="modal fade" id="modal-edit-forms" tabindex="-1" role="dialog" data-backdrop="static">
	<div class="modal-dialog">
		<div class="modal-content panel-primary">
			<div class="modal-header panel-heading">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title">Edit Poomsae Selection</h4>
			</div>
			<div class="modal-body">
				<h4>Select Competition Method</h4>
				<div class="btn-group" id="method-select" data-toggle="buttons">
					<label class="btn btn-success active">
						<input type="radio" name="method" id="cutoff" autocomplete="off" checked> Cutoff
					</label>
					<label class="btn btn-success">
						<input type="radio" name="method" id="modcut" autocomplete="off"> Extended Cutoff
					</label>
					<label class="btn btn-success">
						<input type="radio" name="method" id="cutsin" autocomplete="off"> Cutoff/Single Elimination
					</label>
				</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
				<button type="button" class="btn btn-primary">Save Changes</button>
			</div>
		</div>
	</div>
</div>
<script>
$( "#method-select" ).find( "radio" ).click( function() {
		console.log( this );
	});
	$( ".dropdown-menu" ).find( "a" ).click( function() {
		var poomsae  = $( this ).html();
		var dropdown = $( this ).parents( ".dropdown-menu" ).attr( 'id' );
		var button   = dropdown.replace( /-select/, '' );
		var ordinal  = undefined;
		if( button.match( /1$/ )) { ordinal = '1st form: '; } else if( button.match( /2$/ )) { ordinal = '2nd form: '; }
		$( '#' + button ).html( ordinal + poomsae );

	});
</script>
