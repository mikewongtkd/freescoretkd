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
<div class="container" id="upload">
	<div class="page-header"> Import USAT Registration </div>
	<h1>Drag &amp; Drop USAT Registration Files Below</h1>

	<div class="drop-zones">
		<div class="file-drop-zone" id="female" action="#"><span class="fa fa-female">&nbsp;</span><br>Female<br>Registration File Here</div>
		<div class="file-drop-zone" id="male"   action="#"><span class="fa fa-male"  >&nbsp;</span><br>Male<br>Registration File Here</div>
	</div>
	<div class="clearfix">
		<button type="button" class="accept btn btn-success pull-right disabled">Accept</button> 
		<button type="button" class="cancel btn btn-danger  pull-right" style="margin-right: 40px;">Cancel</button> 
	</div>
	<p>&nbsp;</p>
</div>
<script>
	var registration = { male: '', female: '' };
	var imported     = { poomsae: false, sparring: false };
	var dropzone     = { 
		disable: ( target ) => {
			$( '#' + target ).addClass( 'file-uploaded' ).removeClass( 'file-drop-zone' ).html( '<span class="fa fa-' + target + '">&nbsp;</span>' + target.capitalize() + '<br>File Uploaded' );
		},
		enable: ( target ) => {
			$( '#' + target ).addClass( 'file-drop-zone' ).removeClass( 'file-uploaded' ).html( '<span class="fa fa-' + target + '">&nbsp;</span>' + target.capitalize() + '<br>Division File Here' ).css({ 'border-color': '#17a2b8', 'color': 'black' });
		}
	};

	$( '.file-drop-zone' )
	.on( 'dragover', ( ev ) => {
		ev.preventDefault();
		ev.stopPropagation();
	})
	.on( 'dragenter', ( ev ) => {
		ev.preventDefault();
		ev.stopPropagation();
	})
	.on( 'drop', ( ev ) => {
		ev.preventDefault();
		ev.stopPropagation();
		var target = $( ev.target ).attr( 'id' );
		if( registration[ target ] ) { sound.next.play(); return; }

		var upload = ev.originalEvent;
		var reader = new FileReader();

		if( ! defined( upload )) { return; }
		upload = upload.dataTransfer;
		if( ! defined( upload )) { return; }

		var data = '';
		for( file of upload.files ) {
			reader.onload = (( f ) => {
				return ( e ) => { 
					if( e.target.result == registration.female || e.target.result == registration.male ) {
						alertify.error( 'Same file uploaded twice; possible user error?' );
						return;
					}
					dropzone.disable( target );

					registration[ target ] = e.target.result;
					sound.send.play();
					alertify.success( target.capitalize() + ' divisions uploaded' );

					$( '#upload' ).css({ 'padding-top' : '64px' }).html( 'Uploading Registrations...' );
					var request;
					request = { data : { type : 'registration', action : 'upload', gender: target, data: registration[ target ] }};
					request.json = JSON.stringify( request.data );
					ws.worldclass.send( request.json );
					ws.sparring.send( request.json );
				};
			})( file );

			data = reader.readAsText( file );
		}
	});

	$( '#upload .accept' ).off( 'click' ).click(( ev ) => {
		sound.next.play();
		page.transition( 3 );
	});

	$( '#upload .cancel' ).off( 'click' ).click(( ev ) => {
		page.transition( 1 )
		request = { data : { type : 'registration', action : 'remove' }};
		request.json = JSON.stringify( request.data );
		ws.worldclass.send( request.json );
		dropzone.enable( 'male'   );
		dropzone.enable( 'female' );
		sound.prev.play();
	});

</script>
