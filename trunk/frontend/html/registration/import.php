<div class="container" id="import">
	<div class="page-header">
		<a id="back-to-upload" class="btn btn-warning"><span class="glyphicon glyphicon-menu-left"></span> Back to Upload</a>
		<span id="page-2-title">Imported Divisions</span>
	</div>

	<ul class="nav nav-tabs">
		<li class="active"><a data-toggle="tab" href="#sport-poomsae-divisions">Sport Poomsae Divisions</a></li>
		<li><a data-toggle="tab" href="#sparring-divisions">Sparring Divisions</a></li>
	</ul>

	<div class="tab-content">
		<div class="tab-pane fade in active" id="sport-poomsae-divisions">
			<div class="panel panel-primary poomsae" id="worldclass-individuals">
				<div class="panel-heading">
					<div class="panel-title">Sport Poomsae World Class Individuals</div>
				</div>
				<div class="panel-body">
					<table>
					</table>
				</div>
			</div>

			<div class="panel panel-primary poomsae" id="worldclass-pairs">
				<div class="panel-heading">
					<div class="panel-title">Sport Poomsae World Class Pairs</div>
				</div>
				<div class="panel-body">
					<table>
					</table>
				</div>
			</div>

			<div class="panel panel-primary poomsae" id="worldclass-teams">
				<div class="panel-heading">
					<div class="panel-title">Sport Poomsae World Class Teams</div>
				</div>
				<div class="panel-body">
					<table>
					</table>
				</div>
			</div>
		</div>
		<div class="tab-pane fade in" id="sparring-divisions">
			<div class="panel panel-primary sparring" id="worldclass-sparring">
				<div class="panel-heading">
					<div class="panel-title">World Class Olympic Sparring</div>
				</div>
				<div class="panel-body">
					<table>
					</table>
				</div>
			</div>

			<div class="panel panel-primary sparring" id="blackbelt-sparring">
				<div class="panel-heading">
					<div class="panel-title">Black Belt Olympic Sparring</div>
				</div>
				<div class="panel-body">
					<table>
					</table>
				</div>
			</div>

			<div class="panel panel-primary sparring" id="colorbelt-sparring">
				<div class="panel-heading">
					<div class="panel-title">Color Belt Olympic Sparring</div>
				</div>
				<div class="panel-body">
					<table>
					</table>
				</div>
			</div>
		</div>
	</div>
	<div class="clearfix">
		<button type="button" class="accept btn btn-success pull-right">Accept</button> 
		<button type="button" class="cancel btn btn-danger  pull-right" style="margin-right: 40px;">Cancel</button> 
	</div>
	<p>&nbsp;</p>

</div>
<script>
$( '#back-to-upload' ).off( 'click' ).click( ( ev ) => {
	sound.prev.play();
	page.transition( 2 );
});

$( '#import .accept' ).off( 'click' ).click(( ev ) => {
	var request;
	request = { data : { type : 'registration', action : 'import', settings: settings }};
	request.json = JSON.stringify( request.data );
	ws.worldclass.send( request.json );
	ws.sparring.send( request.json );
});

$( '#import .cancel' ).off( 'click' ).click(( ev ) => {
	sound.prev.play();
	page.transition( 2 );
});

function sport_poomsae_division_description( s, d ) {
	d = JSON.parse( d );
	d = d.gender + ' ' + d.age;
	var format = '';
	if( s.match( /pair/i ))      { format = 'Pair' }
	else if( s.match( /team/i )) { format = 'Team' }
	else                         { format = 'Individual' }
	d = d.replace( /10-11/, 'Youths' );
	d = d.replace( /12-14/, 'Cadets' );
	d = d.replace( /15-17/, 'Juniors' );
	d = d.replace( /18-30/, 'Seniors' );
	d = d.replace( /31-40/, 'Under 40' );
	d = d.replace( /41-50/, 'Under 50' );
	d = d.replace( /51-60/, 'Under 60' );
	d = d.replace( /61-65/, 'Under 65' );
	d = d.replace( /66-99/, 'Over 65' );
	d = d.replace( /31-99/, 'Over 30' );
	d = d.replace( /black all/, '' );
	d = d.replace( /coed/, format );
	d = d.replace( /female/, 'Female ' + format );
	d = d.replace( /\bmale/, 'Male ' + format );

	return d;
};

function display_sport_poomsae_divisions( divisions ) {
	var map = {
		'world class poomsae'       : 'worldclass-individuals',
		'world class pairs poomsae' : 'worldclass-pairs',
		'world class team poomsae'  : 'worldclass-teams',
	};

	var events = [ 'world class poomsae', 'world class pairs poomsae', 'world class team poomsae' ];

	for( var subevent of events) {
		if( !( subevent in divisions )) { continue; }
		var id    = '#' + map[ subevent ] + ' .panel-body table';
		var table = $( id );
		table.empty();
		var tr = html.tr.clone();
		tr.append( html.th.clone().html( 'Division' ), html.th.clone().html( 'Athletes' ));
		table.append( tr );
		var sum = 0;
		for( var division in divisions[ subevent ] ) {
			var tr    = html.tr.clone();
			var count = divisions[ subevent ][ division ].length;

			if( subevent.match( /pair/i )) { count = Math.ceil( count/2 ); }
			if( subevent.match( /team/i )) { count = Math.ceil( count/3 ); }

			var row = {
				name : html.td.clone().html( sport_poomsae_division_description( subevent, division )),
				count: html.td.clone().html( divisions[ subevent ][ division ].length )
			};
			tr.append( row.name, row.count );
			table.append( tr );
			sum += count;
		}

		tr = html.tr.clone();
		tr.append( html.th.clone().html( 'Total' ), html.th.clone().html( sum ));
		table.append( tr );
	}
}

function sparring_division_description( s, g, d ) {
	d = JSON.parse( d );
	age = d.age; age = age.replace( /\-99/, '+' );
	s = s.split( /\s/ ).map(( i ) => { return i.capitalize(); }).join( ' ' );
	if( s.match( /(?:cadet|junior|senior)/i )) {
		s = s.replace( /(cadet|junior|senior)/i, g.capitalize() + ' $&' );
		s = s.replace( /\s*sparring/i, '' );
		s = s + ' (' + age + ')';
		return s;
	}
	s = s.replace( /\s*sparring/i, ' ' + g.capitalize() );
	s = s + ' (' + age + ')';
	return s;
}

function display_sparring_divisions( divisions ) {
	var sum = 0;
	var tr = html.tr.clone();
	tr.append( html.th.clone().html( 'Events' ), html.th.clone().html( 'Divisions' ), html.th.clone().html( 'Athletes' ));
	var table = $( '.sparring .panel-body table' );
	table.empty();
	table.append( tr );

	var subevents = { 'worldclass-sparring' : {}, 'blackbelt-sparring' : {}, 'colorbelt-sparring' : {}};
	for( var subevent in divisions ) {
		for( var json in divisions[ subevent ] ) {
			var d = JSON.parse( json );
			if( subevent.match( /world class/i )) { 
				var name = 'worldclass-sparring';
				if( ! defined( subevents[ name ][ subevent ])) { subevents[ name ][ subevent ] = {}; }
				if( ! defined( subevents[ name ][ subevent ][ d.gender ])) { subevents[ name ][ subevent ][ d.gender ] = {}; }
				subevents[ name ][ subevent ][ d.gender ][ json ] = divisions[ subevent ][ json ];
				continue;
			}
			if( d.belt.match( /black/i )) {
				var name = 'blackbelt-sparring';
				if( ! defined( subevents[ name ][ subevent ])) { subevents[ name ][ subevent ] = {}; }
				if( ! defined( subevents[ name ][ subevent ][ d.gender ])) { subevents[ name ][ subevent ][ d.gender ] = {}; }
				subevents[ name ][ subevent ][ d.gender ][ json ] = divisions[ subevent ][ json ];
				continue;
			}
			var name = 'colorbelt-sparring';
			if( ! defined( subevents[ name ][ subevent ])) { subevents[ name ][ subevent ] = {}; }
			if( ! defined( subevents[ name ][ subevent ][ d.gender ])) { subevents[ name ][ subevent ][ d.gender ] = {}; }
			subevents[ name ][ subevent ][ d.gender ][ json ] = divisions[ subevent ][ json ];
		}
	}
	console.log( subevents );

	for( var name in subevents ) {
		var id         = '#' + name + ' .panel-body table';
		var table      = $( id );
		var divcount   = 0;
		var count      = 0;
		for( var subevent of Object.keys( subevents[ name ]).sort(( a, b ) => {
			// Sort by age, regardless of gender
			var i = subevents[ name ][ a ];
			var j = subevents[ name ][ b ];
			if( 'male' in i ) { i = i[ 'male' ]; } else if( 'female' in i ) { i = i[ 'female' ]; } else { return -1; }
			if( 'male' in j ) { j = j[ 'male' ]; } else if( 'female' in j ) { j = j[ 'female' ]; } else { return  1; }
			i = Object.keys( i )[ 0 ];
			j = Object.keys( j )[ 0 ];
			i = JSON.parse( i );
			j = JSON.parse( j );
			i = parseInt( i.age );
			j = parseInt( j.age );
			if( i == j ) { return  0; }
			if( i  > j ) { return  1; }
			if( i <  j ) { return -1; }
		})) {
			for( var gender in subevents[ name ][ subevent ] ) {
				var count = Object.values( subevents[ name ][ subevent ][ gender ]).map(( i ) => { return i.length; }).reduce(( acc, cur ) => { return acc + cur; });
				var tr   = html.tr.clone();
				var d    = Object.keys( subevents[ name ][ subevent ][ gender ])[ 0 ];
				var evnt = sparring_division_description( subevent, gender, d );
				var divs = Object.keys( subevents[ name ][ subevent ][ gender ]).length;
				var row  = {
					name       : html.td.clone().html( evnt ),
					categories : html.td.clone().html( divs ),
					count      : html.td.clone().html( count )
				};
				tr.append( row.name, row.categories, row.count );
				table.append( tr );
				divcount += divs;
				sum += count;
			}
		}
		tr = html.tr.clone();
		tr.append( html.th.clone().html( 'Total' ), html.th.clone().html( divcount ), html.th.clone().html( sum ));
		table.append( tr );
	}
}
</script>
