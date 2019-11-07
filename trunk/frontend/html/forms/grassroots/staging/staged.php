<div class="pt-page pt-page-2 page-recall">
	<div class="page-header">
		<div class="page-header-content">Division Recall <div class="clock pull-right"></div> <div id="checkin-actions" class="btn-group pull-right"><a id="show-holding" class="btn btn-xs btn-primary"><span class="fas fa-hand-paper"></span> Go to Holding</a></div></div>
	</div>
	<h2>Divisions in Staging</h2>
	<table class="divisions-view">
	</table>
</div>
<script>

$( '#show-holding' ).off( 'click' ).click(( ev ) => { page.transition( 1 ); });
</script>
