<div class="pt-page pt-page-2">
	<div class="container">
		<div class="page-header"> Sport Poomsae Schedule Builder </div>
		<div>
			<div id="schedule">
			</div>
		</div>
	</div>
</div>

<script>
handler.configure = () => {
	var n = tournament.rings.length;
	var w = n >= 6 ? 6 : n;
	var h = Math.ceil( n/6 );
	var width = Math.floor( 12 / w );
	for( var y = 0; y < h; y++ ) {
		var row = html.div.clone().addClass( 'row' );
		for( var x = 0; x < w; x++ ) {
			var i = (y * 6) + (x + 1);
			var ring = html.div.clone().addClass( `ring panel panel-primary col-xs-${width}` ).attr({ id : `ring${i}` });
			ring.append( html.h1.clone().addClass( 'panel-heading' ).html( `Ring ${i}` )).css({ 'margin-top' : 0 });
			ring.append( html.div.clone().addClass( 'panel-body' ));
			row.append( ring );
		}
		$( '#schedule' ).append( row );
	}
}
</script>
