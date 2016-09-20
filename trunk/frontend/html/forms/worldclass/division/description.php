<div class="panel panel-primary">
	<div class="panel-heading">
		<div class="panel-title" data-toggle="collapse" class="collapsed" href="#description" id="description-title">Description</div>
	</div>
	<div class="division-setting collapse" id="description">
		<div class="description-content">
			<ul class="nav nav-pills nav-stacked">
				<li><a href="#individual" data-toggle="tab">Individual</a></li>
				<li><a href="#pair"       data-toggle="tab">Pair</a></li>
				<li><a href="#team"       data-toggle="tab">Team</a></li>
			</ul>
			<div class="tab-content">
				<div class="tab-pane" id="individual">
					<div class="btn-group" data-toggle="buttons">
						<label class="btn btn-default"><input type="radio" name="gender" value="f">Female</label>
						<label class="btn btn-default"><input type="radio" name="gender" value="m">Male</label>
					</div>
					<div class="btn-group" data-toggle="buttons">
						<label class="btn btn-default"><input type="radio" name="age" value="6-7"     >6-7</label>
						<label class="btn btn-default"><input type="radio" name="age" value="8-9"     >8-9</label>
						<label class="btn btn-default"><input type="radio" name="age" value="youths"  >10-11</label>
						<label class="btn btn-default"><input type="radio" name="age" value="cadets"  >12-14</label>
						<label class="btn btn-default"><input type="radio" name="age" value="juniors" >15-17</label>
						<label class="btn btn-default"><input type="radio" name="age" value="under 30">18-29</label>
						<label class="btn btn-default"><input type="radio" name="age" value="under 40">30-39</label>
						<label class="btn btn-default"><input type="radio" name="age" value="under 50">40-49</label>
						<label class="btn btn-default"><input type="radio" name="age" value="under 60">50-59</label>
						<label class="btn btn-default"><input type="radio" name="age" value="under 65">60-65</label>
						<label class="btn btn-default"><input type="radio" name="age" value="over 65" >66+</label>
					</div>
				</div>
				<div class="tab-pane" id="pair">
					<div class="btn-group" data-toggle="buttons">
						<label class="btn btn-default"><input type="radio" name="age" value="6-9"     >6-9</label>
						<label class="btn btn-default"><input type="radio" name="age" value="youths"  >10-11</label>
						<label class="btn btn-default"><input type="radio" name="age" value="cadets"  >12-14</label>
						<label class="btn btn-default"><input type="radio" name="age" value="juniors" >15-17</label>
						<label class="btn btn-default"><input type="radio" name="age" value="under 30">18-29</label>
						<label class="btn btn-default"><input type="radio" name="age" value="under 40">30-39</label>
						<label class="btn btn-default"><input type="radio" name="age" value="over 40" >40+</label>
					</div>
				</div>
				<div class="tab-pane" id="team">
					<div class="btn-group" data-toggle="buttons">
						<label class="btn btn-default"><input type="radio" name="gender" value="f">Female</label>
						<label class="btn btn-default"><input type="radio" name="gender" value="m">Male</label>
					</div>
					<div class="btn-group" data-toggle="buttons">
						<label class="btn btn-default"><input type="radio" name="age" value="6-9"     >6-9</label>
						<label class="btn btn-default"><input type="radio" name="age" value="youths"  >10-11</label>
						<label class="btn btn-default"><input type="radio" name="age" value="cadets"  >12-14</label>
						<label class="btn btn-default"><input type="radio" name="age" value="juniors" >15-17</label>
						<label class="btn btn-default"><input type="radio" name="age" value="under 30">18-29</label>
						<label class="btn btn-default"><input type="radio" name="age" value="under 40">30-39</label>
						<label class="btn btn-default"><input type="radio" name="age" value="over 40" >40+</label>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<script>
	// ===== DESCRIPTION BEHAVIOR
	var description = { category: '', gender: '', age: '', text: '', update : function() { 
		description.text = { m:'Male', f:'Female', '':'' }[ description.gender ] + ' ' + description.category.capitalize() + ' ' + description.age.capitalize();
		description.text = description.text.trim();
		description.text = description.text.replace( /\s+/, ' ' );
		$( "#description-title" ).html( "Description: <span class=\"setting\">" + description.text + "</span>" );
	}};
	$( 'a[data-toggle=tab]' ).click( function( ev ) {
		var clicked = $( ev.target );
		description.category = clicked.html().toLowerCase();
		$( 'input[name=gender]' ) .parent().each( function( i, element ) { $( element ).removeClass( 'active' ); });
		$( 'input[name=age]' )    .parent().each( function( i, element ) { $( element ).removeClass( 'active' ); });
		description.gender = '';
		description.age    = '';
		description.update();
	});
	$( 'input[name=gender]' ).parent().click( function( ev ) {
		var clicked = $( ev.target );
		description.gender = clicked.find( 'input' ).val();
		description.update();
		$( 'input[name=gender]' ).parent().each( function( i, element ) { if( ! $( element ).is( clicked )) { $( element ).removeClass( 'active' ); }});
	});
	$( 'input[name=age]' ).parent().click( function( ev ) {
		var clicked = $( ev.target );
		description.age  = clicked.find( 'input' ).val();
		description.update();
		$( 'input[name=age]' ).parent().each( function( i, element ) { if( ! $( element ).is( clicked )) { $( element ).removeClass( 'active' ); }});
	});
</script>

