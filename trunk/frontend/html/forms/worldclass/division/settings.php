<div class="panel panel-primary">
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
			<div class="col-md-4">
				<label for="number-of-judges">Judges in Ring</label><br>
				<div class="btn-group" data-toggle="buttons" id="number-of-judges">
					<label class="btn btn-default"       ><input type="radio" name="judges" value="3"        >3 Judges</label>
					<label class="btn btn-default active"><input type="radio" name="judges" value="5" checked>5 Judges</label>
					<label class="btn btn-default"       ><input type="radio" name="judges" value="7"        >7 Judges</label>
				</div>
			</div>
			<div class="col-md-2">
				<label>Allow any form</label><br>
				<input type="checkbox" id="allow-any-form" checked>
			</div>
			<div class="col-md-2">
				<label for="allow-any-age">Allow any age</label><br>
				<input type="checkbox" id="allow-any-age">
			</div>
		</div>
	</div>
</div>

<script>
	$( "input[type=checkbox]" ).bootstrapSwitch({ size : 'small' });

	// ===== DIVISION DATA STORAGE
	var division = { athletes : [] };

</script>
