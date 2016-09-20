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
						<label class="btn btn-default"><input type="radio" name="age" idx="02" value="6-7"     >6-7</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="03" value="8-9"     >8-9</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="04" value="youths"  >10-11</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="05" value="cadets"  >12-14</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="06" value="juniors" >15-17</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="07" value="under 30">18-29</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="08" value="under 40">30-39</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="09" value="under 50">40-49</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="10" value="under 60">50-59</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="11" value="under 65">60-65</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="12" value="over 65" >66+</label>
					</div>
				</div>
				<div class="tab-pane" id="pair">
					<div class="btn-group" data-toggle="buttons">
						<label class="btn btn-default"><input type="radio" name="age" idx="02" value="6-9"     >6-9</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="03" value="youths"  >10-11</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="04" value="cadets"  >12-14</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="05" value="juniors" >15-17</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="06" value="under 30">18-29</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="07" value="under 40">30-39</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="08" value="over 40" >40+</label>
					</div>
				</div>
				<div class="tab-pane" id="team">
					<div class="btn-group" data-toggle="buttons">
						<label class="btn btn-default"><input type="radio" name="gender" value="f">Female</label>
						<label class="btn btn-default"><input type="radio" name="gender" value="m">Male</label>
					</div>
					<div class="btn-group" data-toggle="buttons">
						<label class="btn btn-default"><input type="radio" name="age" idx="02" value="6-9"     >6-9</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="03" value="youths"  >10-11</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="04" value="cadets"  >12-14</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="05" value="juniors" >15-17</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="06" value="under 30">18-29</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="07" value="under 40">30-39</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="08" value="over 40" >40+</label>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<script>
	// ===== DESCRIPTION BEHAVIOR
	// Individuals: p01-p50
	// Pairs:       p51-p60
	// Team:        p61-p80
	// id = gen==f ? 2 x idx -1 : 2 x idx; indv += 0; pair += 50; team += 60
	var description = { category: '', gender: '', age: '', text: '', divid: 0, update : function() { 
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

