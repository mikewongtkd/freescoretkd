<script>
	$( ".poomsae-selector" ).find( "a" ).click( function() {
		var poomsae  = $( this ).html();
		var dropdown = $( this ).parents( ".dropdown-menu" ).attr( 'id' );
		var button   = dropdown.replace( /-select/, '' );
		var ordinal  = undefined;
		if( button.match( /1$/ )) { ordinal = '1st form: '; } else if( button.match( /2$/ )) { ordinal = '2nd form: '; }
		$( '#' + button ).html( ordinal + poomsae );
	});
</script>
