<?php
	$t = json_decode( $tournament );
	if( ! file_exists( "/usr/local/freescore/data/" . $t->db . "/forms-worldclass/draws.json" )):
?>
	<script>
		alertify.dialog( 'drawPoomsae', function() {
			return {
				main: function( message ) {
					this.message = message;
				},
				build: function() {
					$( this.elements.header ).css({ 'background-color':'#dc3545', 'color':'white' });
				},
				setup: function() {
					return {
						buttons: [ { text: "Draw Poomsae", key: 13 /* Enter */ }, { text: "Continue Import" }],
						focus: { element: 0 },
						options: {
							title: 'Warning: Designated Poomsae Have Not Been Drawn',
						},
					};
				},
				prepare: function() {
					this.setContent( this.message );
				},
				callback: function( closeEvent ) {
					switch( closeEvent.index ) {
						case 0:
							window.location = 'forms/worldclass/draws.php';
							break;
						case 1:
							alertify.error( 'After importing, please remember to edit each division to include the proper poomsae' );
							break;
					}
				}
			}
		});
		alertify.drawPoomsae(
			'Designated Poomsae have not yet been drawn. If you proceed without drawing the designated poomsae, you will have to edit each division. Drawing poomsae first is highly recommended.',
		);
	</script>
<?php
	endif
?>
<div class="container">
	<div class="page-header"> Import USAT Registration </div>
	<h1>Drag &amp; Drop USAT Weight Divisions Below</h1>

	<div class="drop-zones">
		<div class="file-drop-zone" id="female" action="#"><span class="fa fa-female">&nbsp;</span><br>Female<br>Division File Here</div>
		<div class="file-drop-zone" id="male" action="#"><span class="fa fa-male">&nbsp;</span><br>Male<br>Division File Here</div>
	</div>
</div>
<script>
	var registration = { male: '', female: '' };
	var imported     = { poomsae: false, sparring: false };
	var dropzone     = { 
		disable: ( target ) => {
			$( '#' + target ).html( '<span class="fa fa-' + target + '">&nbsp;</span><br>' + target.capitalize() + '<br>Division Uploaded' ).css({ 'border-color': '#ccc', 'color': '#999' });
		},
		enable: ( target ) => {
			$( '#' + target ).html( '<span class="fa fa-' + target + '">&nbsp;</span><br>' + target.capitalize() + '<br>Division File Here' ).css({ 'border-color': '#17a2b8', 'color': 'black' });
		}
	};
</script>
