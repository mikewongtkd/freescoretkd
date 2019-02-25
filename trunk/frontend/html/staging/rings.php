<div class="pt-page pt-page-4 page-rings">
	<div class="rings-view">
	</div>
</div>
<script>
$(() => {
	refresh.rings();
});
refresh.rings = ( schedule ) => {
	$( '.page-rings .rings-view' ).empty();

	var n   = tournament.rings.length;
	var w   = n < 3 ? n : 3;
	var h   = Math.ceil( n / w );
	var col = Math.ceil( 12 / w );
	var i   = 0;
	for( var y = 0; y < h; y++ ) {
		var row = html.div.clone().addClass( 'row' );
		for( var x = 0; x < w; x++ ) {
			i = (y * 3) + x;
			if( i >= n ) { continue; }
			var num  = tournament.rings[ i ];
			var ring = html.div.clone().addClass( `col-xs-${col}` ).html( `<h2>Ring ${i+1}</h2>` );
			row.append( ring );
		}
		$( '#rings-view' ).append( row );
	}
}

</script>
