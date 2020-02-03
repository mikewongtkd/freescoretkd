function grassroots_division_description( d ) {
	d = JSON.parse( d );
	d = d.age;
	d = d.replace( /10-11/, 'Youth' );
	d = d.replace( /12-14/, 'Cadet' );
	d = d.replace( /15-17/, 'Junior' );
	d = d.replace( /18-30/, 'Under 30' );
	d = d.replace( /31-40/, 'Under 40' );
	d = d.replace( /41-50/, 'Under 50' );
	d = d.replace( /51-60/, 'Under 60' );
	d = d.replace( /61-65/, 'Under 65' );
	d = d.replace( /66-99/, 'Over 65' );
	d = d.replace( /31-99/, 'Over 30' );

	return d;
};

function display_grassroots_divisions( divisions ) {
	for( var belt of [ 'yellow', 'green', 'blue', 'red', 'black' ]) {
		var id       = `#${belt}-belt-individuals .panel-body table`;
		var table    = $( id );
		table.empty();
		var tr = html.tr.clone();
		tr.append( th.div( 'Division' ).attr({ 'valign': 'bottom' }));
		tr.append( th.count( 'Female<br>Athletes' ), th.count( 'Male<br>Athletes' ),);
		table.append( tr );

		var sum    = {};
		var groups = {};
		for( var division in divisions.poomsae ) {
			var d     = JSON.parse( division ); if( d.belt != belt ) { continue; }
			var count = divisions.poomsae[ division ].length;
			var name  = grassroots_division_description( division );
			if( d.age in groups ) { groups[ d.age ][ d.gender ] = count; }
			else                  { groups[ d.age ] = { name: name }; groups[ d.age ][ d.gender ] = count; }

			if( d.gender in sum ) { sum[ d.gender ] += count; }
			else                  { sum[ d.gender ]  = count; }
		}

		// ===== ADD EACH GROUP TO THE TABLE
		Object.keys( groups ).sort(( a, b ) => { return parseInt( a ) < parseInt( b ) ? -1 : parseInt( a ) > parseInt( b ) ? 1 : 0; }).forEach(( age ) => {
			var group = groups[ age ];
			var tr    = html.tr.clone();

			tr.append( td.div( group.name ));
			tr.append( td.count( group.female ), td.count( group.male ));
			table.append( tr );
		});

		tr = html.tr.clone();
		tr.append( th.div( 'Subtotal' ));
		tr.append( html.th.clone().addClass( 'count' ).html( sum.female ), html.th.clone().addClass( 'count' ).html( sum.male ),);
		tr.children( 'th' ).css({ 'padding-top': '8px' });
		table.append( tr );

		tr = html.tr.clone();
		tr.append( th.div( 'Total' ));
		tr.append( th.count( sum.male + sum.female ).attr({ colspan : 2 }));
		tr.children( 'th' ).css({ 'padding-top': '8px' });
		table.append( tr );
	}
}

