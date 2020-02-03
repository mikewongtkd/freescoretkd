function freestyle_division_description( s, d ) {
	d = JSON.parse( d );
	d = d.gender + ' ' + d.age;
	var format = '';
	if     ( s.match( /pair/i )) { format = 'Pair' }
	else if( s.match( /team/i )) { format = 'Team' }
	else                         { format = 'Individual' }
	d = d.replace( /12-17/, 'Under 17' );
	d = d.replace( /18-99/, 'Over 17' );
	d = d.replace( /black all/, '' );
	d = d.replace( /coed/, format );
	d = d.replace( /female/, 'Female ' + format );
	d = d.replace( /\bmale/, 'Male ' + format );

	return d;
};

function display_freestyle_divisions( divisions ) {
	var map = {
		'world class freestyle poomsae'       : 'freestyle-individuals',
		'world class freestyle pairs poomsae' : 'freestyle-pairs',
		'world class freestyle team poomsae'  : 'freestyle-teams',
	};

	for( var subevent of Object.keys( map )) {
		if( !( subevent in divisions )) { continue; }
		var id    = '#' + map[ subevent ] + ' .panel-body table';
		var table = $( id );
		table.empty();
		var tr = html.tr.clone();
		tr.append( th.div( 'Division' ), th.count( 'Athletes' ));
		if     ( subevent.match( /pair/i )) { tr.append( th.count( 'Pairs' )); }
		else if( subevent.match( /team/i )) { tr.append( th.count( 'Teams' )); }
		table.append( tr );
		var sum = 0;
		for( var division in divisions[ subevent ] ) {
			var tr    = html.tr.clone();
			var count = divisions[ subevent ][ division ].length;

			if( subevent.match( /pair/i )) { count = Math.ceil( count/2 ); }
			if( subevent.match( /team/i )) { count = Math.ceil( count/5 ); }

			var row = {
				name : td.div( freestyle_division_description( subevent, division )),
				count: td.count( divisions[ subevent ][ division ].length ),
				group: td.count( count )
			};
			tr.append( row.name, row.count );
			if( subevent.match( /(?:pair|team)/i )) { tr.append( row.group ); }
			table.append( tr );
			sum += count;
		}

		tr = html.tr.clone();
		tr.append( th.div( 'Total' ), th.count( sum ).attr({ 'colspan': subevent.match( /(?:pair|team)/i ) ? 2 : 1 }) );
		tr.children( 'th' ).css({ 'padding-top': '8px' });
		table.append( tr );
	}
}

