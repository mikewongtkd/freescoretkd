<?php
	$host = "freescore.net";
	$tournament = json_encode( [ 
		"name" => "FreeScore Test Data",
		"db" => "test", 
		"rings" => [ "count" => 4, "start" => 1, "enable" => [ 1, 2, 3, 4 ], "width" => 2, "height" => 2, "formation" => "rows" ]
	]);
?>
