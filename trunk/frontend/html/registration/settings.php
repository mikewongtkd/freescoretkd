<div class="container" id="settings">
	<div class="page-header"> Import Settings</div>
	<h1>Sport Poomsae</h1>
	<div class="row">
		<div class="col-md-3">
			<label>Score Youth with Sport Poomsae</label><br>
		</div>
		<div class="col-md-1">
			<input class="toggle" data-toggle="toggle" type="checkbox" id="youth-sport-poomsae" data-onstyle="success" data-offstyle="primary" data-on="Yes" data-off="No">
		</div>
		<div class="col-md-8">
			<p>Youth (10-11) athletes are just a few years before Cadet athletes. 
			Scoring them with Sport Poomsae rules will help them gain experience
			for higher levels of competition. This switch imports youth athletes
			as sport poomsae divisions.</p>
		</div>
	</div>

	<div class="clearfix">
		<button type="button" class="accept btn btn-success pull-right">Accept</button> 
		<button type="button" class="cancel btn btn-danger  pull-right" style="margin-right: 40px;">Cancel</button> 
	</div>
	<p>&nbsp;</p>
</div>
<script>
	var settings = {};
	$( 'input.toggle' ).bootstrapToggle();
	$( '#settings input' ).on( 'change', ( ev ) => {
		let input = $( ev.target );
		let id    = input.attr( 'id' );
		if( input.hasClass( 'toggle' )) {
			let val = ev.target.checked;
			settings[ id ] = val;
		}
	});
	$( '#settings .accept' ).off( 'click' ).click(( ev ) => {
		sound.next.play();
		page.transition( 2 );
	});
</script>
