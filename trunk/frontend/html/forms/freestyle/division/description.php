<div class="panel panel-primary division-header">
	<div class="panel-heading">
		<div class="panel-title" data-toggle="collapse" class="collapsed" href="#description" id="description-title"><span class="title">Description</span></div>
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
						<label class="btn btn-default"><input type="radio" name="age" idx="03" value="12-17">12-17</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="06" value="18+"  >18+</label>
					</div>
				</div>
				<div class="tab-pane" id="pair">
					<div class="btn-group" data-toggle="buttons">
						<label class="btn btn-default"><input type="radio" name="age" idx="01" value="12-17">12-17</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="02" value="18+"  >18+</label>
					</div>
				</div>
				<div class="tab-pane" id="team">
					<div class="btn-group" data-toggle="buttons">
						<label class="btn btn-default"><input type="radio" name="age" idx="01" value="12-17">12-17</label>
						<label class="btn btn-default"><input type="radio" name="age" idx="02" value="18+"  >18+</label>
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
	description = { category: '', gender: '', age: '', years: '', text: '', divid: 0, idx : 0, update : function() { 
		description.text   = 'Freestyle' + ' ' + { m:'Male', f:'Female', '':'' }[ description.gender ] + ' ' + description.category.capitalize() + ' ' + { '': '', '12-17' : 'Under 17', '18+' : 'Over 17' }[ description.age ].capitalize();
		description.text   = description.text.trim();
		description.text   = description.text.replace( /\s+/g, ' ' );
		description.divid  = { individual : 0, pair : 7, team : 10 }[ description.category ];
		description.divid += { f : 1, m : 2, '' : 3 }[ description.gender ];
		description.divid += description.idx;
		var title = FreeScore.html.span.clone().addClass( "title" ).html( "Description" );
		var text  = FreeScore.html.span.clone().addClass( "setting" ).append( description.text );
		$( "#description-title" ).empty().append( title, text );
		division.description = description.text;

		// ===== UPDATE DIVISION NAME, IF NOT ALREADY DEFINED
		var name      = $( '#division-name' ).val().toLowerCase();
		division.name = name ? name : 'fs' + (description.divid < 100 ? '0' : '' ) + (description.divid < 10 ? '0' + description.divid : description.divid);
		$( '#division-name' ).attr({ placeholder: division.name.toUpperCase() });

		// ===== UPDATE TITLE AND HEADER
		$( 'title' ).html( division.summary() );
		$( 'h1' ).html( division.summary() );

		// ===== UPDATE SETTING HEADER
		settings.update();
	}};
	// ============================================================
	// DESCRIPTION INITIALIZATION
	// ============================================================
	init.description = ( division ) => {
		var title = FreeScore.html.span.clone().addClass( "title" ).html( "Description" );
		var text  = FreeScore.html.span.clone().addClass( "setting" ).append( division.description );
		$( "#description-title" ).empty().append( title, text );
		$( 'title' ).html( division.summary() );
		$( 'h1' ).html( division.summary() );
		var desc   = defined( division.description ) ? division.description : '';
		var gender = desc.match( /\b(Fem|M)ale/i ); gender = gender ? gender[ 0 ].substr( 0, 1 ).toLowerCase() : '';
		var ev     = desc.match( /Individual|Pair|Team/i ); ev = ev ? ev[ 0 ].toLowerCase() : '';
		var age    = desc.match( /under\s*17|juniors?|seniors?|over\*17/i ); age = age ? age[ 0 ].toLowerCase() : '';
		var map    = { 'under17' : '12-17', 'under 17': '12-17', 'junior' : '12-17', 'juniors' : '12-17', 'over17': '18+', 'over 17': '18+', 'senior' : '18+', 'seniors' : '18+' }; age = map[ age ] ? map[ age ] : age;
		if((gender == 'm' && desc.match( /female/i )) || (gender == 'f' && desc.match( /\bmale/i ))) { gender = ''; }
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
	//	FREESTYLE EVENTS
	// ============================================================
	$( 'a[data-toggle=tab]' ).click( function( ev ) {
		var clicked = $( ev.target );
		description.category = clicked.html().toLowerCase();
		$( 'input[name=gender]' ) .parent().each( function( i, element ) { $( element ).removeClass( 'active' ); });
		$( 'input[name=age]' )    .parent().each( function( i, element ) { $( element ).removeClass( 'active' ); });
		description.gender = '';
		description.age    = '';
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
</script>

