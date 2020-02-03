function grassroots_division_description( s, d ) {
	d = JSON.parse( d );
	d = d.gender + ' ' + d.age;
	var format = '';
	if( s.match( /pair/i ))      { format = 'Pair' }
	else if( s.match( /team/i )) { format = 'Team' }
	else                         { format = 'Individual' }
	d = d.replace( /10-11/, 'Youths' );
	d = d.replace( /12-14/, 'Cadets' );
	d = d.replace( /15-17/, 'Juniors' );
	d = d.replace( /18-30/, 'Under 30' );
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

function display_grassroots_divisions( divisions ) {
	console.log( 'GRASSROOTS', divisions );
	var map = {
		'world class poomsae'       : 'worldclass-individuals',
		'world class pairs poomsae' : 'worldclass-pairs',
		'world class team poomsae'  : 'worldclass-teams',
	};

	for( var subevent of Object.keys( map )) {
		if( !( subevent in divisions )) { continue; }
		var id    = '#' + map[ subevent ] + ' .panel-body table';
		var table = $( id );
		table.empty();
		var tr = html.tr.clone();
		tr.append( th.div( 'Division' ).attr({ 'valign': 'bottom' }));
		if( subevent.match( /pair/i)) {
			tr.append( th.count( 'Athletes' ), th.count( 'Pairs' ));

		} else if( subevent.match( /team/i )) {
			tr.append( th.count( 'Female<br>Athletes' ), th.count( 'Female<br>Teams' ), th.count( 'Male<br>Athletes' ), th.count( 'Male<br>Teams' ));

		} else {
			tr.append( th.count( 'Female<br>Athletes' ), th.count( 'Male<br>Athletes' ),);
		}
		table.append( tr );
		var sum    = {};
		var groups = {};
		var i      = 0;
		for( var division in divisions[ subevent ] ) {
			var count = divisions[ subevent ][ division ].length;
			var name  = sport_poomsae_division_description( subevent, division );
			var gid   = name.replace( /(?:fe)?male\s*/i, '' );
			var group = undefined;
			if( name.match( /female/i )) {
				if( gid in groups ) {
					group = groups[ gid ];
					group.females = count;
				} else {
					group = groups[ gid ] = { name: gid, females: count, i: i };
					i++;
				}
				sum.females = 'females' in sum ? sum.females + group.females : group.females;
				if( name.match( /team/i )) { group.female_teams = Math.ceil( count/3 ); sum.female_teams = 'female_teams' in sum ? sum.female_teams + group.female_teams : group.female_teams; }

			} else if( name.match( /\bmale/i )) {
				if( gid in groups ) {
					group = groups[ gid ];
					group.males = count;
				} else {
					group = groups[ gid ] = { name: gid, males: count, i: i };
					i++;
				}
				sum.males = 'males' in sum ? sum.males + group.males : group.males;
				if( name.match( /team/i )) { group.male_teams = Math.ceil( count/3 ); sum.male_teams = 'male_teams' in sum ? sum.male_teams + group.male_teams : group.male_teams; }

			} else {
				if( name.match( /pair/i )) {
					groups[ gid ] = { name: gid, athletes: count, pairs: Math.ceil( count/2 ) };
					sum.athletes = 'athletes' in sum ? sum.athletes + groups[ gid ].athletes : groups[ gid ].athletes;
					sum.pairs    = 'pairs' in sum ? sum.pairs + groups[ gid ].pairs : groups[ gid ].pairs;
				}
			}
		}

		// ===== ADD EACH GROUP TO THE TABLE
		Object.values( groups ).sort(( a, b ) => { return a.i < b.i ? -1 : a.i > b.i ? 1 : 0; }).forEach(( group ) => {
			var tr    = html.tr.clone();

			tr.append( td.div( group.name ));
			if( group.name.match( /pair/i )) {
				tr.append( td.count( group.athletes ), td.count( group.pairs ));
			} else if( group.name.match( /team/i )) {
				tr.append( td.count( group.females ), td.count( group.female_teams ), td.count( group.males ), td.count( group.male_teams ));
			} else {
				tr.append( td.count( group.females ), td.count( group.males ));
			}
			table.append( tr );
		});

		if       ( subevent.match( /pair/i )) {
			tr = html.tr.clone();
			tr.append( th.div( 'Total' ));
			tr.append( th.count( sum.athletes ), th.count( sum.pairs ),);
			tr.children( 'th' ).css({ 'padding-top': '8px' });
			table.append( tr );

		} else if( subevent.match( /team/i )) {
			tr = html.tr.clone();
			tr.append( th.div( 'Subtotal' ));
			tr.append( th.count( sum.females ), th.count( sum.female_teams ), th.count( sum.males ), th.count( sum.male_teams ),);
			tr.children( 'th' ).css({ 'padding-top': '8px' });
			table.append( tr );

			tr = html.tr.clone();
			tr.append( th.div( 'Total' ));
			tr.append( th.count( `Athletes: ${sum.males + sum.females}` ).attr({ colspan : 3 }), th.count( `Teams: ${sum.male_teams + sum.female_teams}` ));
			tr.children( 'th' ).css({ 'padding-top': '8px' });
			table.append( tr );

		} else {
			tr = html.tr.clone();
			tr.append( th.div( 'Subtotal' ));
			tr.append( html.th.clone().addClass( 'count' ).html( sum.females ), html.th.clone().addClass( 'count' ).html( sum.males ),);
			tr.children( 'th' ).css({ 'padding-top': '8px' });
			table.append( tr );

			tr = html.tr.clone();
			tr.append( th.div( 'Total' ));
			tr.append( th.count( sum.males + sum.females ).attr({ colspan : 2 }));
			tr.children( 'th' ).css({ 'padding-top': '8px' });
			table.append( tr );
		}
	}
}

