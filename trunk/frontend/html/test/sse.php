<?php
	if( ! isset( $_COOKIE[ 'ring' ]) ) { header( 'Location: setup/register.php?referer=../sse.php' ); exit(); }
	include "include/php/config.php";
	$ring = $_COOKIE[ 'ring' ] ?: 'undefined';
?>
<html>
	<head>
		<title>Perl Server Sent Event test</title>
		<script src="include/jquery/js/jQuery.js"></script>
		<script src="include/jquery/js/jquery-ui.min.js"></script>
	</head>
	<body>
		<div id="sse"></div>
		<script type="text/javascript">
			var tournament = <?=$tournament?>;
			var ring       = <?=$ring?>;
			$.widget( "freescore.test", {
				options: { autoShow: true },
				_create: function() {
					var o           = this.options;
					var e           = this.options.elements = {};
					var widget      = this.element;
					var html        = { div : $( "<div />" ) };
				},
				_init: function( ) {
					var e = this.options.elements;
					var o = this.options;

					function refresh( update ) {
						var ssevent = JSON.parse( update.data );
						console.log( ssevent );
					};

					e.source = new EventSource( '/cgi-bin/freescore/forms/grassroots/update?tournament=' + tournament.db + '&ring=' + ring );
					e.source.addEventListener( 'message', refresh, false );
				}
			});

			$( "#sse" ).test();
		</script>
	</body>
</html>
	

