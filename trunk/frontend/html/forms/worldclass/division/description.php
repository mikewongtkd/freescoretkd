<div class="panel panel-primary division-header">
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
	description = { category: '', gender: '', age: '', years: '', rank : '', text: '', divid: 0, idx : 0, update : function() { 
		description.text   = { m:'Male', f:'Female', '':'' }[ description.gender ] + ' ' + description.category.capitalize() + ' ' + ({ y: 'Yellow Belt', g: 'Green Belt', b: 'Blue Belt', r: 'Red Belt', k: '', '':'' }[ description.rank ]) + ' ' + description.age.capitalize();
		description.text   = description.text.trim();
		description.text   = description.text.replace( /\s+/g, ' ' );
		description.divid  = { individual : 3, pair : 43, team : 73 }[ description.category ];
		description.divid -= { f : 2, m : 1, '' : 0 }[ description.gender ];
		description.divid += description.idx * 3;
		description.divid += { k: 0, y: 400, g: 300, b: 200, r: 100, '': 0 }[ description.rank ]
		var text = FreeScore.html.span.clone().addClass( "setting" ).append( description.text );
		$( "#description-title" ).empty().append( "Description: ", text );
		division.description = description.text;

		// ===== UPDATE DIVISION NAME, IF NOT ALREADY DEFINED
		var name      = $( '#division-name' ).val().toLowerCase();
		division.name = name ? name : 'p' + (description.divid < 100 ? '0' : '' ) + (description.divid < 10 ? '0' + description.divid : description.divid);
		$( '#division-name' ).attr({ placeholder: division.name.toUpperCase() });

		// ===== UPDATE TITLE AND HEADER
		$( 'title' ).html( division.summary() );
		$( 'h1' ).html( division.summary() );

		// ===== UPDATE FORM SELECTION LISTS
		selected.update();
	}};
	// ============================================================
	// DESCRIPTION INITIALIZATION
	// ============================================================
	init.description = ( division ) => {
		var text = FreeScore.html.span.clone().addClass( "setting" ).append( division.description() );
		$( "#description-title" ).empty().append( "Description: ", text );
		$( 'title' ).html( division.summary() );
		$( 'h1' ).html( division.summary() );
		var desc = division.description();
		var gender = desc.match( /\b(Fem|M)ale/i ); gender = gender ? gender[ 0 ].substr( 0, 1 ).toLowerCase() : '';
		var ev     = desc.match( /Individual|Pair|Team/i); ev = ev ? ev[ 0 ].toLowerCase() : '';
		var rank   = desc.match( /Yellow|Green|Blue|Red/i ); rank = rank ? rank[ 0 ].substr( 0, 1 ).toLowerCase() : '';
		var age    = desc.match( /4-5|6-7|8-9|10-11|Youth|12-14|Cadet|15-17|Junior|18-29|Under 30|Under 40|Under 50|Under 60|Under 65|Over 66/i ); age = age ? age[ 0 ].toLowerCase() : '';
		var map    = { '10-11' : 'youths', 'youth' : 'youths', '12-14' : 'cadets', 'cadet' : 'cadets', '15-17' : 'juniors', 'junior' : 'juniors' }; age = map[ age ] ? map[ age ] : age;
		if((gender == 'm' && desc.match( /female/i )) || (gender == 'f' && desc.match( /\bmale/i ))) { gender = ''; }
		console.log( division.description() );
		if( ev && age ) {
			$( 'a[href="#' + ev + '"]' ).click();
			if( gender ) {
				description.gender = gender;
				$.each( $( '#' + ev + ' input[name=gender]' ), ( i, elem ) => {
					var g = { value : $( elem ).val(), button : $( elem ).parent() };
					if( g.value == gender ) { g.button.click(); }
				});
			}
			description.age = age;
			$.each( $( '#' + ev + ' input[name=age]' ), ( i, elem ) => {
				var a = { value : $( elem ).val(), button : $( elem ).parent() };
				if( a.value == age ) { a.button.click(); }
			});

			description.update();
		}
	};

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
		description.age   = clicked.find( 'input' ).val();
		description.years = clicked.text(); 
		description.idx   = parseInt( clicked.find( 'input' ).attr( 'idx' ) );
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

