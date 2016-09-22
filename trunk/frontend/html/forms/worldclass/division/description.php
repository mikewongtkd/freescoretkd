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
						<label class="btn btn-default"><input type="radio" name="age" idx="00" value="4-5"     >4-5</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="01" value="6-7"     >6-7</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="02" value="8-9"     >8-9</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="03" value="youths"  >10-11</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="04" value="cadets"  >12-14</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="05" value="juniors" >15-17</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="06" value="under 30">18-29</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="07" value="under 40">30-39</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="08" value="under 50">40-49</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="09" value="under 60">50-59</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="10" value="under 65">60-65</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="11" value="over 65" >66+</label>
					</div>
					<div class="btn-group" data-toggle="buttons" style="margin-top: 4px;">
						<label class="btn btn-default"><input type="radio" name="rank" value="y">Yellow</label>
						<label class="btn btn-default"><input type="radio" name="rank" value="g">Green</label>
						<label class="btn btn-default"><input type="radio" name="rank" value="b">Blue</label>
						<label class="btn btn-default"><input type="radio" name="rank" value="r">Red</label>
						<label class="btn btn-default"><input type="radio" name="rank" value="k">Black</label>
					</div>
				</div>
				<div class="tab-pane" id="pair">
					<div class="btn-group" data-toggle="buttons">
						<label class="btn btn-default"><input type="radio" name="age" idx="00" value="4-5"     >4-5</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="01" value="6-9"     >6-9</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="02" value="youths"  >10-11</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="03" value="cadets"  >12-14</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="04" value="juniors" >15-17</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="05" value="under 30">18-29</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="06" value="under 40">30-39</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="07" value="over 40" >40+</label>
					</div>
					<div class="btn-group" data-toggle="buttons">
						<label class="btn btn-default"><input type="radio" name="rank" value="y">Yellow</label>
						<label class="btn btn-default"><input type="radio" name="rank" value="g">Green</label>
						<label class="btn btn-default"><input type="radio" name="rank" value="b">Blue</label>
						<label class="btn btn-default"><input type="radio" name="rank" value="r">Red</label>
						<label class="btn btn-default"><input type="radio" name="rank" value="k">Black</label>
					</div>
				</div>
				<div class="tab-pane" id="team">
					<div class="btn-group" data-toggle="buttons">
						<label class="btn btn-default"><input type="radio" name="gender" value="f">Female</label>
						<label class="btn btn-default"><input type="radio" name="gender" value="m">Male</label>
					</div>
					<div class="btn-group" data-toggle="buttons">
						<label class="btn btn-default"><input type="radio" name="age" idx="00" value="4-5"     >4-5</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="01" value="6-9"     >6-9</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="02" value="youths"  >10-11</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="03" value="cadets"  >12-14</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="04" value="juniors" >15-17</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="05" value="under 30">18-29</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="06" value="under 40">30-39</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="07" value="over 40" >40+</label>
					</div>
					<div class="btn-group" data-toggle="buttons">
						<label class="btn btn-default"><input type="radio" name="rank" value="y">Yellow</label>
						<label class="btn btn-default"><input type="radio" name="rank" value="g">Green</label>
						<label class="btn btn-default"><input type="radio" name="rank" value="b">Blue</label>
						<label class="btn btn-default"><input type="radio" name="rank" value="r">Red</label>
						<label class="btn btn-default"><input type="radio" name="rank" value="k">Black</label>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<script>
	// ============================================================
	// DESCRIPTION BEHAVIOR
	// ============================================================
	var description = { category: '', gender: '', age: '', rank : '', text: '', divid: 0, idx : 0, update : function() { 
		description.text   = { m:'Male', f:'Female', '':'' }[ description.gender ] + ' ' + description.category.capitalize() + ' ' + ({ y: 'Yellow Belt', g: 'Green Belt', b: 'Blue Belt', r: 'Red Belt', k: '', '':'' }[ description.rank ]) + ' ' + description.age.capitalize();
		description.text   = description.text.trim();
		description.text   = description.text.replace( /\s+/, ' ' );
		description.divid  = { individual : 3, pair : 43, team : 73 }[ description.category ];
		description.divid -= { f : 2, m : 1, '' : 0 }[ description.gender ];
		description.divid += description.idx * 3;
		description.divid += { k: 0, y: 400, g: 300, b: 200, r: 100, '': 0 }[ description.rank ]
		$( "#description-title" ).html( "Description: <span class=\"setting\">" + description.text + "</span>" );
		division.description = description.text;
		division.name        = 'p' + (description.divid < 100 ? '0' : '' ) + (description.divid < 10 ? '0' + description.divid : description.divid);
	}};

	// ============================================================
	//	SPORT POOMSAE EVENTS
	// ============================================================
	$( 'a[data-toggle=tab]' ).click( function( ev ) {
		var clicked = $( ev.target );
		description.category = clicked.html().toLowerCase();
		$( 'input[name=gender]' ) .parent().each( function( i, element ) { $( element ).removeClass( 'active' ); });
		$( 'input[name=age]' )    .parent().each( function( i, element ) { $( element ).removeClass( 'active' ); });
		$( 'input[name=rank]' )   .parent().each( function( i, element ) { $( element ).removeClass( 'active' ); });
		$( 'input[name=rank]' )   .each( function( i, element ) { if( $( element ).val() == 'k') { $( element ).parent().addClass( 'active' ); }});
		description.gender = '';
		description.age    = '';
		description.rank   = '';
		description.divid  = 0;
		description.idx    = 0;
		description.update();
	});

	// ============================================================
	//	ATHLETE GENDER
	// ============================================================
	$( 'input[name=gender]' ).parent().click( function( ev ) {
		var clicked = $( ev.target );
		description.gender = clicked.find( 'input' ).val();
		description.update();
		$( 'input[name=gender]' ).parent().each( function( i, element ) { if( ! $( element ).is( clicked )) { $( element ).removeClass( 'active' ); }});
	});

	// ============================================================
	//	ATHLETE AGE
	// ============================================================
	$( 'input[name=age]' ).parent().click( function( ev ) {
		var clicked = $( ev.target );
		description.age = clicked.find( 'input' ).val();
		description.idx = parseInt( clicked.find( 'input' ).attr( 'idx' ) );
		description.update();
		$( 'input[name=age]' ).parent().each( function( i, element ) { if( ! $( element ).is( clicked )) { $( element ).removeClass( 'active' ); }});
	});

	// ============================================================
	//	ATHLETE RANK
	// ============================================================
	$( 'input[name=rank]' ).parent().click( function( ev ) {
		var clicked = $( ev.target );
		description.rank = clicked.find( 'input' ).val();
		description.update();
		$( 'input[name=rank]' ).parent().each( function( i, element ) { if( ! $( element ).is( clicked )) { $( element ).removeClass( 'active' ); }});
	});

</script>

