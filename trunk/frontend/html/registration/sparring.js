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
	tr.append( html.th.clone().html( 'Events' ), html.th.clone().addClass( 'weight-class-distribution' ).html( 'Weight Class Distribution' ), html.th.clone().addClass( 'count' ).html( 'Wt Classes' ), html.th.clone().addClass( 'count' ).html( 'Matches' ), html.th.clone().addClass( 'count' ).html( 'Athletes' ));
	var table = $( '.sparring .panel-body table' );
	table.empty();
	table.append( tr );

	var subevents = { 'worldclass-sparring' : {}, 'black-belt-sparring' : {}, 'red-belt-sparring' : {}, 'blue-belt-sparring' : {}, 'green-belt-sparring' : {}, 'yellow-belt-sparring' : {}, 'white-belt-sparring' : {}};
	for( var subevent in divisions ) {
		for( var json in divisions[ subevent ] ) {
			var d = JSON.parse( json );
			var subev = sparring_division_description( subevent, d.gender, json );
			if( subevent.match( /world class/i ) && ! subevent.match( /non-/i )) { 
				var name = 'worldclass-sparring';
				if( ! defined( subevents[ name ][ subev ])) { subevents[ name ][ subev ] = {}; }
				if( ! defined( subevents[ name ][ subev ][ d.gender ])) { subevents[ name ][ subev ][ d.gender ] = {}; }
				subevents[ name ][ subev ][ d.gender ][ json ] = divisions[ subevent ][ json ];
				continue;
			}
			var name = `${d.belt}-belt-sparring`;
			var subev = sparring_division_description( subevent, d.gender, json );
			if( ! defined( subevents[ name ][ subev ])) { subevents[ name ][ subev ] = {}; }
			if( ! defined( subevents[ name ][ subev ][ d.gender ])) { subevents[ name ][ subev ][ d.gender ] = {}; }
			subevents[ name ][ subev ][ d.gender ][ json ] = divisions[ subevent ][ json ];
		}
	}

	for( var name in subevents ) {
		var id         = '#' + name + ' .panel-body table';
		var table      = $( id );
		var count      = { divisions: 0, matches: 0, athletes: 0 };
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
				var athletes    = Object.values( subevents[ name ][ subevent ][ gender ]).map(( i ) => { return i.length; }).reduce(( acc, cur ) => { return acc + cur; });
				var tr          = html.tr.clone();
				var d           = Object.keys( subevents[ name ][ subevent ][ gender ])[ 0 ];
				var evnt        = subevent;
				var matches     = 0;
				var divisions   = Object.keys( subevents[ name ][ subevent ][ gender ]);
				var exhibitions = 0;
				divisions.forEach(( division ) => {
					var athletes = subevents[ name ][ subevent ][ gender ][ division ];
					var n        = athletes.length;
					if( n == 1 ) { exhibitions++; }
					matches     += (n - 1);
				});
				exhibitions = Math.ceil( exhibitions / 2 );
				matches     += exhibitions;
				var classes = display_weight_classes( name, subevents[ name ][ subevent ][ gender ]);
				var row  = {
					name      : html.td.clone().html( evnt ),
					divisions : html.td.clone().append( classes ),
					divcount  : html.td.clone().addClass( 'count' ).html( `${divisions.length}/${classes.length}` ),
					matches   : html.td.clone().addClass( 'count' ).html( matches > exhibitions ? matches : `<span class="exhibition">${exhibitions}</span>` ),
					count     : html.td.clone().addClass( 'count' ).html( athletes )
				};
				tr.append( row.name, row.divisions, row.divcount, row.matches, row.count );
				table.append( tr );
				count.divisions += divisions.length;
				count.matches   += (matches ? matches : exhibitions);
				count.athletes  += athletes;
			}
		}
		tr = html.tr.clone();
		tr.append( html.th.clone().attr({ colspan: 2 }).html( 'Total' ), html.th.clone().addClass( 'count' ).html( count.divisions ), html.th.clone().addClass( 'count' ).html( count.matches ), html.th.clone().addClass( 'count' ).html( count.athletes ));
		table.append( tr );
	}
}

function by_weight( a, b ) {
	a = parseFloat( JSON.parse( a ).weight );
	b = parseFloat( JSON.parse( b ).weight );
	return a - b;
}

function display_weight_classes( subevent, divisions ) {
	var display = [];
	var div     = JSON.parse( Object.keys( divisions )[ 0 ]);
	var age     = div.age;
	var gender  = div.gender;
	var classes = FreeScore.rulesUSAT.sparring.weight_classes( age, gender );

	classes.forEach( c => {
		var division = Object.keys( divisions ).find( d => { var div = JSON.parse( d ); return div.weight == c.range; });
		var weight   = html.div.clone().addClass( 'weight-class' ).attr({ 'data-weight-class' : c.name, 'data-weight-range' : c.range });
		if( division ) { 
			var n = divisions[ division ].length;
			weight.html( n ); 
		} else {
			weight.html( '&nbsp;' );
		}
		display.push( weight );
	});
	return display;
}
